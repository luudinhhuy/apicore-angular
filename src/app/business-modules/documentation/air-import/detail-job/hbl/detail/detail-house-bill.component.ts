import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CsTransactionDetail, HouseBill } from '@models';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { ReportPreviewComponent } from '@common';
import { ShareBusinessDeliveryOrderComponent, ShareBusinessArrivalNoteAirComponent, getDetailHBlPermissionState } from '@share-bussiness';

import { AirImportCreateHBLComponent } from '../create/create-house-bill.component';
import { Crystal } from 'src/app/shared/models/report/crystal.model';

import * as fromShareBussiness from './../../../../../share-business/store';
import { skip, catchError, takeUntil, finalize } from 'rxjs/operators';

import isUUID from 'validator/lib/isUUID';
import { ChargeConstants } from 'src/constants/charge.const';

enum HBL_TAB {
    DETAIL = 'DETAIL',
    ARRIVAL = 'ARRIVAL',
    AUTHORIZE = 'AUTHORIZE'

}
@Component({
    selector: 'app-detail-hbl-air-import',
    templateUrl: './detail-house-bill.component.html',
})
export class AirImportDetailHBLComponent extends AirImportCreateHBLComponent implements OnInit {
    @ViewChild(ReportPreviewComponent, { static: false }) reportPopup: ReportPreviewComponent;
    @ViewChild(ShareBusinessArrivalNoteAirComponent, { static: false }) arrivalNoteComponent: ShareBusinessArrivalNoteAirComponent;
    @ViewChild(ShareBusinessDeliveryOrderComponent, { static: false }) deliveryComponent: ShareBusinessDeliveryOrderComponent;
    hblId: string;

    hblDetail: any;

    dataReport: Crystal;

    selectedTab: string = HBL_TAB.DETAIL;
    isClickSubMenu: boolean = false;
    allowUpdate: boolean = false;

    constructor(
        protected _progressService: NgProgress,
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _cd: ChangeDetectorRef

    ) {
        super(
            _progressService,
            _activedRoute,
            _store,
            _documentationRepo,
            _toastService,
            _actionStoreSubject,
            _router,
            _cd
        );
    }

    ngOnInit() {
        this._activedRoute.params.subscribe((param: Params) => {
            if (param.hblId && isUUID(param.hblId)) {
                this.hblId = param.hblId;
                this.jobId = param.jobId;
                this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                this._store.select(getDetailHBlPermissionState)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (res: any) => {
                        if (!!res) {
                            this.allowUpdate = res.allowUpdate;
                        }
                    }
                );
                this.getDetailHbl();

            } else {
                this.gotoList();
            }
        });

        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);
      
    }

    getDetailHbl() {
        this._store.select(fromShareBussiness.getDetailHBlState)
            .pipe(
                skip(1),
                catchError(this.catchError),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: CsTransactionDetail) => {
                    if (!!res) {
                        this.hblDetail = res;
                    }
                },
            );
    }

    onSaveHBLDetail() {
        switch (this.selectedTab) {
            case HBL_TAB.DETAIL:
                this.saveHBL();
                break;

            // * Update Arrival Note.    
            case HBL_TAB.ARRIVAL: {
                this.confirmPopup.hide();
                this.arrivalNoteComponent.isSubmitted = true;
                if (!this.arrivalNoteComponent.checkValidate()) {
                    return;
                } else if (!!this.arrivalNoteComponent.hblArrivalNote.arrivalNo) {
                    this.arrivalNoteComponent.saveArrivalNote();
                } else {
                    return;
                }
                break;
            }
            // * Update Delivery Order.
            case HBL_TAB.AUTHORIZE: {
                this.confirmPopup.hide();
                this.deliveryComponent.isSubmitted = true;
                if (!!this.deliveryComponent.deliveryOrder.deliveryOrderNo) {
                    this.deliveryComponent.saveDeliveryOrder();
                } else {
                    return;
                }
                break;
            }
            default:
                break;
        }
    }


    saveHBL() {
        this.confirmPopup.hide();
        this.formCreateHBLComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }
        else {
            this._documentationRepo.checkExistedHawbNo(this.formCreateHBLComponent.hwbno.value, this.jobId, this.hblId)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: any) => {
                    if (res) {
                        this.confirmExistedHbl.show();
                    } else {
                        const modelUpdate = this.getDataForm();
                        this.setDataToUpdate(modelUpdate);
                        this.updateHbl(modelUpdate);
                    }
                }
            );
        }
    }

    confirmUpdateData() {
        this.confirmExistedHbl.hide();
        const modelUpdate = this.getDataForm();
        this.setDataToUpdate(modelUpdate);
        this.updateHbl(modelUpdate);
    }

    setDataToUpdate(modelUpdate: HouseBill) {
        modelUpdate.id = this.hblId;
        modelUpdate.jobId = this.jobId;
        modelUpdate.arrivalFirstNotice = this.hblDetail.arrivalFirstNotice;
        modelUpdate.arrivalFooter = this.hblDetail.arrivalFooter;
        modelUpdate.arrivalHeader = this.hblDetail.arrivalHeader;
        modelUpdate.arrivalNo = this.hblDetail.arrivalNo;
        modelUpdate.arrivalSecondNotice = this.hblDetail.arrivalSecondNotice;
        modelUpdate.deliveryOrderNo = this.hblDetail.deliveryOrderNo;
        modelUpdate.deliveryOrderPrintedDate = this.hblDetail.deliveryOrderPrintedDate;
        modelUpdate.dofooter = this.hblDetail.dofooter;
        modelUpdate.dosentTo1 = this.hblDetail.dosentTo1;
        modelUpdate.dosentTo2 = this.hblDetail.dosentTo2;
        modelUpdate.subAbbr = this.hblDetail.subAbbr;
        modelUpdate.transactionType = ChargeConstants.AI_CODE;
        modelUpdate.userCreated = this.hblDetail.userCreated;
    }

    updateHbl(body: any) {
        this._progressRef.start();
        this._documentationRepo.updateHbl(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        // this._router.navigate([`/home/documentation/air-import/${this.jobId}/hbl`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    preview(reportType: string) {
        this._documentationRepo.previewSeaHBLOfLanding(this.hblId, reportType)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport.dataSource.length > 0) {
                        setTimeout(() => {
                            this.reportPopup.frm.nativeElement.submit();
                            this.reportPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    onSelectTab(tabName: HBL_TAB | string) {
        this.selectedTab = tabName;
    }

    previewArrivalNotice(_currency: string) {
        this._documentationRepo.previewArrivalNoticeAir({ hblId: this.hblId, currency: _currency })
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport.dataSource.length > 0) {
                        setTimeout(() => {
                            this.reportPopup.frm.nativeElement.submit();
                            this.reportPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data charge to display preview');
                    }
                },
            );
    }

    onPreview(type: string) {
        this.isClickSubMenu = false;
        if (type === 'ARRIVAL_ORIGINAL' || type === 'ARRIVAL_VND') {
            const _currency = type === 'ARRIVAL_VND' ? 'VND' : 'ORIGINAL';
            this.previewArrivalNotice(_currency);
        }
        if (type === 'PROOF_OF_DELIVERY') {
            this.previewProofOfDelivery();
        }
        if (type === 'DOCUMENT_RELEASE_FORM') {
            this.previewAirDocumentRelease();
        }
        if (type === 'AUTHORIZE_LETTER1') {
            this.previewAuthorizeLetter1();
        }
        if (type === 'AUTHORIZE_LETTER2') {
            this.previewAuthorizeLetter2();
        }
    }
    previewAuthorizeLetter2() {
        this._documentationRepo.previewAirImportAuthorizeLetter1(this.hblId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.reportPopup.frm.nativeElement.submit();
                        this.reportPopup.show();
                    }, 1000);

                },
            );
    }
    previewAuthorizeLetter1() {
        this._documentationRepo.previewAirImportAuthorizeLetter2(this.hblId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.reportPopup.frm.nativeElement.submit();
                        this.reportPopup.show();
                    }, 1000);

                },
            );
    }

    previewProofOfDelivery() {
        this._documentationRepo.previewAirProofofDelivery(this.hblId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.reportPopup.frm.nativeElement.submit();
                        this.reportPopup.show();
                    }, 1000);

                },
            );
    }

    previewAirDocumentRelease() {
        this._documentationRepo.previewAirDocumentRelease(this.hblId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.reportPopup.frm.nativeElement.submit();
                        this.reportPopup.show();
                    }, 1000);

                },
            );
    }
}
