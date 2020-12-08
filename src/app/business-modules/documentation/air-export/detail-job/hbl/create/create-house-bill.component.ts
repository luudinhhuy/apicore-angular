import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';


import * as fromShareBussiness from './../../../../../share-business/store';
import { AirExportHBLFormCreateComponent } from '../components/form-create-house-bill-air-export/form-create-house-bill-air-export.component';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { catchError, finalize, takeUntil, map, tap, mergeMap } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { HouseBill, DIM } from '@models';
import { AbstractControl } from '@angular/forms';
import { ShareBusinessImportHouseBillDetailComponent } from '@share-bussiness';

import { AirExportHBLAttachListComponent } from '../components/attach-list/attach-list-house-bill-air-export.component';
import { getDimensionVolumesState, getDetailHBlState, GetDetailHBLSuccessAction } from './../../../../../share-business/store';
import { SystemConstants } from 'src/constants/system.const';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import _merge from 'lodash/merge';

import isUUID from 'validator/lib/isUUID';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-create-hbl-air-export',
    templateUrl: './create-house-bill.component.html',
})
export class AirExportCreateHBLComponent extends AppForm implements OnInit {

    @ViewChild(AirExportHBLFormCreateComponent, { static: true }) formCreateHBLComponent: AirExportHBLFormCreateComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmPopup: ConfirmPopupComponent;
    @ViewChild('confirmSaveExistedHbl', { static: false }) confirmExistedHbl: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(AirExportHBLAttachListComponent, { static: false }) attachListComponent: AirExportHBLAttachListComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent, { static: false }) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;

    jobId: string;
    selectedHbl: any = {}; // TODO model.
    allowAdd: boolean = false;
    isImport: boolean = false;

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
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit() {
        this._activedRoute.params
            .subscribe((param: Params) => {
                if (isUUID(param.jobId)) {
                    this.jobId = param.jobId;
                    this.generateHblNo(CommonEnum.TransactionTypeEnum.AirExport);
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                    this.getDetailShipmentPermission();
                } else {
                    this.gotoList();
                }
            });
    }



    generateHblNo(transactionType: number) {
        this._documentationRepo.generateHBLNo(transactionType)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: any) => {
                    this.formCreateHBLComponent.hwbno.setValue(res.hblNo);
                }
            );
    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHbldate: !!form.issueHbldate && !!form.issueHbldate.startDate ? formatDate(form.issueHbldate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,

            originBlnumber: !!form.originBlnumber && !!form.originBlnumber.length ? +form.originBlnumber[0].id : null,
            freightPayment: !!form.freightPayment && !!form.freightPayment.length ? form.freightPayment[0].id : null,
            hbltype: !!form.hbltype && !!form.hbltype.length ? form.hbltype[0].id : null,
            currencyId: !!form.currencyId && !!form.currencyId.length ? form.currencyId[0].id : null,
            wtorValpayment: !!form.wtorValpayment && !!form.wtorValpayment.length ? form.wtorValpayment[0].id : null,
            otherPayment: !!form.otherPayment && !!form.otherPayment.length ? form.otherPayment[0].id : null,

            customerId: form.customer,
            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            pol: form.pol,
            pod: form.pod,
            forwardingAgentId: form.forwardingAgent,

            cbm: this.formCreateHBLComponent.totalCBM,
            hw: this.formCreateHBLComponent.totalHeightWeight,
            attachList: this.attachListComponent.attachList,
            dimensionDetails: form.dimensionDetails,
            hwConstant: this.formCreateHBLComponent.hwconstant,
            min: form.min,
        };

        const houseBill = new HouseBill(_merge(form, formData));
        return houseBill;
    }

    saveHBL() {
        this.confirmPopup.hide();
        this.formCreateHBLComponent.isSubmitted = true;
        if (this.isImport) {
            this._documentationRepo.generateHBLNo(CommonEnum.TransactionTypeEnum.AirExport)
                .pipe(
                    mergeMap((res: any) => {
                        if (this.formCreateHBLComponent.hwbno.value == null || this.formCreateHBLComponent.hwbno.value == "") {
                            this.formCreateHBLComponent.hwbno.setValue(res.hblNo);
            }
                        if (!this.checkValidateForm()) {
                            this.infoPopup.show();
                            return null;
        }
                        return forkJoin([this._documentationRepo.checkExistedHawbNo(this.formCreateHBLComponent.hwbno.value, this.jobId, null)]);
                    }
                    )).subscribe(result => {
                        if (result[0]) {
                            this.confirmExistedHbl.show();
                        } else {
                            const houseBill: HouseBill = this.getDataForm();
                            this.setData(houseBill);
                            this.createHbl(houseBill);
                        }
                    }
                    );
        }
        else {
            if (!this.checkValidateForm()) {
                this.infoPopup.show();
                return;
            }
            this._documentationRepo.checkExistedHawbNo(this.formCreateHBLComponent.hwbno.value, this.jobId, null)
                .pipe(
                    catchError(this.catchError),
                )
                .subscribe(
                    (res: any) => {
                        if (res) {
                            this.confirmExistedHbl.show();
                        } else {
            const houseBill: HouseBill = this.getDataForm();
                            this.setData(houseBill);
                            this.createHbl(houseBill);
                        }
                    }
                );
        }

    }

    setData(houseBill: HouseBill) {
            houseBill.jobId = this.jobId;
            houseBill.otherCharges = this.formCreateHBLComponent.otherCharges;
            houseBill.otherCharges.forEach(c => {
                c.jobId = this.jobId;
                c.hblId = SystemConstants.EMPTY_GUID;
            });
    }

    confirmSaveData() {
        this.confirmExistedHbl.hide();
        const houseBill: HouseBill = this.getDataForm();
        this.setData(houseBill);
            this.createHbl(houseBill);
    }

    checkValidateForm() {
        let valid: boolean = true;

        [this.formCreateHBLComponent.hbltype,
        this.formCreateHBLComponent.otherPayment,
        this.formCreateHBLComponent.originBlnumber,
        this.formCreateHBLComponent.currencyId,
        this.formCreateHBLComponent.freightPayment,
        this.formCreateHBLComponent.wtorValpayment].forEach((control: AbstractControl) => this.setError(control));

        if (!this.formCreateHBLComponent.formCreate.valid
            || (!!this.formCreateHBLComponent.etd.value && !this.formCreateHBLComponent.etd.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }

    createHbl(houseBill: HouseBill, hbId?: string) {
        this._progressRef.start();
        this._documentationRepo.createHousebill(houseBill)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        if (!res.data) {
                            this.gotoList();
                        } else {
                            if (!!hbId) {
                                this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${hbId}/separate`]);
                            }
                            else {
                                this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${res.data}`]);
                            }
                        }
                    }
                }
            );

    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Export';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
    }

    onImport(selectedData: any) {
        this.selectedHbl = selectedData;
        this._store.dispatch(new GetDetailHBLSuccessAction(this.selectedHbl));
        this._store.dispatch(new fromShareBussiness.GetDetailHBLAction(this.selectedHbl.id));
            if (!!this.selectedHbl) {
                this._store.select(getDimensionVolumesState)
                    .pipe(
                        takeUntil(this.ngUnsubscribe),
                        map((dims: DIM[]) => dims.map(d => new DIM(d))),
                        tap(
                            (dims: DIM[]) => {
                                this.formCreateHBLComponent.dims = dims;
                            }
                        ),
                        mergeMap(
                            () => this._store.select(getDetailHBlState)
                        )
                    )
                    .subscribe(
                        (hbl: HouseBill) => {
                            if (!!hbl && hbl.id !== SystemConstants.EMPTY_GUID) {
                                this.isImport = true;
                                this.formCreateHBLComponent.totalCBM = hbl.cbm;
                                this.formCreateHBLComponent.totalHeightWeight = hbl.hw;
                                this.formCreateHBLComponent.jobId = hbl.jobId;
                                this.formCreateHBLComponent.hblId = hbl.id;
                                this.formCreateHBLComponent.hwconstant = hbl.hwConstant;
                                this.formCreateHBLComponent.updateFormValue(hbl);
                                this.formCreateHBLComponent.hwbno.setValue(null);
                            }

                        }
                    );
            }

    }


    gotoList() {
        this._router.navigate([`home/documentation/air-export/${this.jobId}/hbl`]);
    }

    getDetailShipmentPermission() {
        this._store.select<any>(fromShareBussiness.getTransactionDetailCsTransactionPermissionState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.allowAdd = res.allowUpdate;
                    }
                },
            );
    }


}
