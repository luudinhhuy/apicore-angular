import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo, ExportRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';

import { AirExportCreateHBLComponent } from '../create/create-house-bill.component';
import { Crystal, CsTransactionDetail, HouseBill } from '@models';
import { ReportPreviewComponent } from '@common';
import * as fromShareBussiness from '@share-bussiness';

import { catchError, finalize, takeUntil, skip } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';
import { getDetailHBlPermissionState } from '@share-bussiness';
import { SystemConstants } from 'src/constants/system.const';
import { ChargeConstants } from 'src/constants/charge.const';
import { InputBookingNotePopupComponent } from '../components/input-booking-note/input-booking-note.popup';


@Component({
    selector: 'app-detail-hbl-air-export',
    templateUrl: './detail-house-bill.component.html',
})
export class AirExportDetailHBLComponent extends AirExportCreateHBLComponent implements OnInit {
    @ViewChild(ReportPreviewComponent, { static: false }) reportPopup: ReportPreviewComponent;
    @ViewChild(InputBookingNotePopupComponent, { static: false }) inputBookingNotePopupComponent: InputBookingNotePopupComponent;


    hblId: string;
    hblDetail: CsTransactionDetail;

    dataReport: Crystal;

    allowUpdate: boolean = false;

    constructor(
        protected _progressService: NgProgress,
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _cd: ChangeDetectorRef,
        protected _exportRepo: ExportRepo,
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
            if (isUUID(param.hblId)) {
                this.hblId = param.hblId;
                this.jobId = param.jobId;

                this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                this._store.dispatch(new fromShareBussiness.GetDimensionHBLAction(this.hblId));
                this._store.dispatch(new fromShareBussiness.GetHBLOtherChargeAction(this.hblId));

                this.getDetailHbl();
            } else {
                this.gotoList();
            }
        });

        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);
        this._store.select(getDetailHBlPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.allowUpdate = res.allowUpdate;
                    }
                }
            );
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
        modelUpdate.otherCharges = this.formCreateHBLComponent.otherCharges;

        modelUpdate.otherCharges.forEach(c => {
            c.jobId = this.jobId;
            c.hblId = this.hblId;
        });

        modelUpdate.id = this.hblId;
        modelUpdate.jobId = this.jobId;
        modelUpdate.transactionType = ChargeConstants.AI_CODE;
        modelUpdate.userCreated = this.hblDetail.userCreated;

        for (const dim of modelUpdate.dimensionDetails) {
            dim.hblId = this.hblId;
            // dim.mblId = this.jobId;
        }
    }

    updateHbl(body: any, isSeparate?: boolean) {
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
                        // if (!isSeparate) {
                        //     // this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl`]);
                        // } else {
                        //     // this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${this.hblId}`]);
                        // }
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    preview(reportType: string, separateId?: string) {
        const id = !separateId ? this.hblId : separateId;
        this._documentationRepo.previewHouseAirwayBillLastest(id, reportType)
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

    previewAttachList() {
        this._documentationRepo.previewAirAttachList(this.hblId)
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

    exportNeutralHawb() {
        const userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this._progressRef.start();
        this._exportRepo.exportHawbAirwayBill(this.hblId, userLogged.officeId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    if (response.byteLength > 0) {
                        this.downLoadFile(response, "application/ms-excel", 'Air Export - NEUTRAL HAWB.xlsx');
                    } else {
                        this._toastService.warning('There is no neutral hawb data to print', '');
                    }
                },
            );
    }

    gotoSeparate() {
        this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${this.hblId}/separate`]);
    }

    openInputBookingNote(reportType: string) {
        this.inputBookingNotePopupComponent.reportType = reportType;
        this.inputBookingNotePopupComponent.hblId = this.hblId;
        this.inputBookingNotePopupComponent.show();
    }
}
