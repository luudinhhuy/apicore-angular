import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { DocumentationRepo } from 'src/app/shared/repositories';
import { ReportPreviewComponent, SubHeaderComponent } from 'src/app/shared/common';
import { ConfirmPopupComponent, InfoPopupComponent, Permission403PopupComponent } from 'src/app/shared/common/popup';
import { DIM, CsTransaction } from '@models';
import { AirImportCreateJobComponent } from '../create-job/create-job-air-import.component';

import { combineLatest, of, forkJoin } from 'rxjs';
import { tap, map, switchMap, catchError, takeUntil, skip, finalize } from 'rxjs/operators';

import * as fromShareBussiness from '../../../share-business/store';
import isUUID from 'validator/lib/isUUID';

type TAB = 'SHIPMENT' | 'CDNOTE' | 'ASSIGNMENT' | 'HBL';

@Component({
    selector: 'app-detail-job-air-import',
    templateUrl: './detail-job-air-import.component.html'
})

export class AirImportDetailJobComponent extends AirImportCreateJobComponent implements OnInit {

    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;
    @ViewChild('confirmDeleteJob', { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild("duplicateconfirmTemplate", { static: false }) confirmDuplicatePopup: ConfirmPopupComponent;
    @ViewChild("confirmLockShipment", { static: false }) confirmLockPopup: ConfirmPopupComponent;
    @ViewChild(SubHeaderComponent, { static: false }) headerComponent: SubHeaderComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(Permission403PopupComponent, { static: false }) permissionPopup: Permission403PopupComponent;

    jobId: string;
    selectedTab: TAB | string = 'SHIPMENT';
    action: any = {};
    ACTION: CommonType.ACTION_FORM | string = 'UPDATE';

    shipmentDetail: CsTransaction;
    dataReport: any = null;

    dimensionDetails: DIM[];

    constructor(
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _cd: ChangeDetectorRef,
        protected _activedRoute: ActivatedRoute,
        private _documentRepo: DocumentationRepo,
        private _ngProgressService: NgProgress


    ) {
        super(_toastService, _documenRepo, _router, _store, _cd);
        this._progressRef = this._ngProgressService.ref();

    }


    ngAfterViewInit() {
        combineLatest([
            this._activedRoute.params,
            this._activedRoute.queryParams
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            tap((param: any) => {
                this.selectedTab = !!param.tab ? param.tab.toUpperCase() : 'SHIPMENT';
                this.jobId = !!param.jobId ? param.jobId : '';
                if (param.action) {
                    this.ACTION = param.action.toUpperCase();
                } else {
                    this.ACTION = null;
                }

                this._cd.detectChanges();
            }),
            switchMap(() => of(this.jobId)),
        ).subscribe(
            (jobId: string) => {
                if (isUUID(jobId)) {
                    this._store.dispatch(new fromShareBussiness.TransactionGetProfitAction(jobId));
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(jobId));
                    this._store.dispatch(new fromShareBussiness.GetDimensionAction(jobId));

                    this.getDetailShipment();
                } else {
                    this.gotoList();
                }
            }
        );
    }

    getDetailShipment() {
        this._store.select<any>(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipmentDetail = res;
                        this.formCreateComponent.isUpdate = true;
                        // * reset field duplicate
                        if (this.ACTION === "COPY") {
                            this.formCreateComponent.getUserLogged();
                            this.headerComponent.resetBreadcrumb("Create Job");
                        }
                    }
                },
            );
    }

    onSaveJob() {
        this.formCreateComponent.isSubmitted = true;
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }
        const modelAdd = this.onSubmitData();
        modelAdd.dimensionDetails = this.formCreateComponent.dimensionDetails;

        for (const item of modelAdd.dimensionDetails) {
            item.mblId = this.shipmentDetail.id;
        }
        //  * Update field
        modelAdd.id = this.jobId;
        modelAdd.branchId = this.shipmentDetail.branchId;
        modelAdd.transactionType = this.shipmentDetail.transactionType;
        modelAdd.jobNo = this.shipmentDetail.jobNo;
        modelAdd.datetimeCreated = this.shipmentDetail.datetimeCreated;
        modelAdd.userCreated = this.shipmentDetail.userCreated;
        modelAdd.currentStatus = this.shipmentDetail.currentStatus;

        if (this.ACTION === 'COPY') {
            this.duplicateJob(modelAdd);
        } else {
            this.saveJob(modelAdd);
        }
    }

    duplicateJob(body: any) {
        this._documenRepo.importCSTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success("Duplicate data successfully");
                        this.jobId = res.data.id;
                        this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                        // * get detail & container list.
                        this._router.navigate([`home/documentation/air-import/${this.jobId}`], { queryParams: Object.assign({}, { tab: 'SHIPMENT' }) });
                        this.ACTION = 'SHIPMENT';
                        this.formCreateComponent.formGroup.controls['jobId'].setValue(this.jobId);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    saveJob(body: any) {
        this._progressRef.start();
        this._documenRepo.updateCSTransaction(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * get detail.
                        this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'hbl':
                this._router.navigate([`home/documentation/air-import/${this.jobId}/hbl`]);
                break;
            case 'shipment':
                this._router.navigate([`home/documentation/air-import/${this.jobId}`], { queryParams: Object.assign({}, { tab: 'SHIPMENT' }, this.action) });
                break;
            case 'cdNote':
                this._router.navigate([`home/documentation/air-import/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`home/documentation/air-import/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'files':
                this._router.navigate([`home/documentation/air-import/${this.jobId}`], { queryParams: { tab: 'FILES' } });
                break;
        }
    }

    previewPLsheet(currency: string, ) {
        const hblid = "00000000-0000-0000-0000-000000000000";
        this._documenRepo.previewSIFPLsheet(this.jobId, hblid, currency)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        setTimeout(() => {
                            this.previewPopup.frm.nativeElement.submit();
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    prepareDeleteJob() {
        this._documentRepo.checkPermissionAllowDeleteShipment(this.jobId)
            .subscribe((value: boolean) => {
                if (value) {
                    this.deleteJob();
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    deleteJob() {
        this._progressRef.start();
        this._documenRepo.checkMasterBillAllowToDelete(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.confirmDeleteJobPopup.show();
                    } else {
                        this.canNotDeleteJobPopup.show();
                    }
                },
            );
    }

    onDeleteJob() {
        this._progressRef.start();
        this._documentRepo.deleteMasterBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeleteJobPopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {

                        this._toastService.success(respone.message, 'Delete Success !');

                        this.gotoList();
                    }
                },
            );
    }

    showDuplicateConfirm() {
        this.confirmDuplicatePopup.show();
    }

    duplicateConfirm() {
        this.action = { action: 'copy' };
        this._router.navigate([`home/documentation/air-import/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, this.action)
        });
        this.confirmDuplicatePopup.hide();
    }

    lockShipment() {
        this.confirmLockPopup.show();
    }

    onLockShipment() {
        this.confirmLockPopup.hide();

        const modelAdd = this.onSubmitData();

        //  * Update field
        modelAdd.id = this.jobId;
        modelAdd.branchId = this.shipmentDetail.branchId;
        modelAdd.transactionType = this.shipmentDetail.transactionType;
        modelAdd.jobNo = this.shipmentDetail.jobNo;
        modelAdd.datetimeCreated = this.shipmentDetail.datetimeCreated;
        modelAdd.userCreated = this.shipmentDetail.userCreated;
        modelAdd.isLocked = true;
        modelAdd.currentStatus = this.shipmentDetail.currentStatus;

        this.saveJob(modelAdd);
    }

    onSyncHBL() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }
        const modelAdd = this.onSubmitData();
        modelAdd.dimensionDetails = this.formCreateComponent.dimensionDetails;

        for (const item of modelAdd.dimensionDetails) {
            item.mblId = this.shipmentDetail.id;
        }

        //  * Update field
        modelAdd.id = this.jobId;
        modelAdd.branchId = this.shipmentDetail.branchId;
        modelAdd.transactionType = this.shipmentDetail.transactionType;
        modelAdd.jobNo = this.shipmentDetail.jobNo;
        modelAdd.datetimeCreated = this.shipmentDetail.datetimeCreated;
        modelAdd.userCreated = this.shipmentDetail.userCreated;
        modelAdd.currentStatus = this.shipmentDetail.currentStatus;

        const bodySyncData: DocumentationInterface.IDataSyncHBL = {
            flightVesselName: modelAdd.flightVesselName,
            flightDate: modelAdd.flightDate,
            etd: modelAdd.etd,
            eta: modelAdd.eta,
            pol: modelAdd.pol,
            pod: modelAdd.pod,
            agentId: modelAdd.agentId,
            issuedBy: modelAdd.issuedBy,
            warehouseId: modelAdd.warehouseId,
            route: modelAdd.route
        };

        this._progressRef.start();
        forkJoin([
            this._documenRepo.updateCSTransaction(modelAdd),
            this._documentRepo.syncHBL(this.jobId, bodySyncData)
        ]).pipe(
            catchError(this.catchError),
            finalize(() => {
                this._progressRef.complete();
            })
        ).subscribe(
            (respone: CommonInterface.IResult[] = []) => {
                respone.forEach(r => {
                    if (r[0].status) {
                        this._toastService.success(r[0].message);
                    } else {
                        this._toastService.error(r[0].message);
                    }
                });
            },
        );
    }
}
