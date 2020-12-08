import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm, AbstractControl } from '@angular/forms';
import { NgProgress } from '@ngx-progressbar/core';
import { Store, ActionsSubject } from '@ngrx/store';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { OpsTransaction } from 'src/app/shared/models/document/OpsTransaction.model';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { PlSheetPopupComponent } from './pl-sheet-popup/pl-sheet.popup';
import { CsTransactionDetail, Container, CsTransaction } from 'src/app/shared/models';
import { DocumentationRepo } from 'src/app/shared/repositories/documentation.repo';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { ShareBussinessSellingChargeComponent, ShareBussinessContainerListPopupComponent } from '../../share-business';

import { catchError, finalize, takeUntil, map } from 'rxjs/operators';

import * as fromShareBussiness from './../../share-business/store';
import _groupBy from 'lodash/groupBy';
import { OPSTransactionGetDetailSuccessAction } from '../store';
import { formatDate } from '@angular/common';
import { CommonEnum } from '@enums';
import { JobManagementFormEditComponent } from './components/form-edit/form-edit.component';
import { AppForm } from 'src/app/app.form';
import { getCatalogueCommodityGroupState, GetCatalogueCommodityGroupAction } from '@store';

@Component({
    selector: 'app-ops-module-billing-job-edit',
    templateUrl: './job-edit.component.html',
})
export class OpsModuleBillingJobEditComponent extends AppForm implements OnInit {
    @ViewChild(PlSheetPopupComponent, { static: false }) plSheetPopup: PlSheetPopupComponent;
    @ViewChild('confirmCancelUpdate', { static: false }) confirmCancelJobPopup: ConfirmPopupComponent;
    @ViewChild('notAllowDelete', { static: false }) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild('confirmDelete', { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild('confirmLockShipment', { static: false }) confirmLockShipmentPopup: ConfirmPopupComponent;
    @ViewChild(ShareBussinessSellingChargeComponent, { static: false }) sellingChargeComponent: ShareBussinessSellingChargeComponent;
    @ViewChild(ShareBussinessContainerListPopupComponent, { static: false }) containerPopup: ShareBussinessContainerListPopupComponent;

    @ViewChild(JobManagementFormEditComponent, { static: false }) editForm: JobManagementFormEditComponent;
    @ViewChild('addOpsForm', { static: false }) formOps: NgForm;
    @ViewChild('notAllowUpdate', { static: false }) infoPoup: InfoPopupComponent;
    opsTransaction: OpsTransaction = null;
    lstMasterContainers: any[];

    tab: string = '';
    tabCharge: string = '';
    jobId: string = '';
    hblid: string = '';

    deleteMessage: string = '';
    commodityGroups = null;

    packageTypes: any[];
    productServices: CommonInterface.INg2Select[];
    serviceModes: CommonInterface.INg2Select[];
    shipmentModes: CommonInterface.INg2Select[];

    constructor(
        private _spinner: NgxSpinnerService,
        private route: ActivatedRoute,
        private router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _ngProgressService: NgProgress,
        private _documentRepo: DocumentationRepo,
        private _router: Router,
        private _toastService: ToastrService,
        private _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _actionStoreSubject: ActionsSubject
    ) {
        super();

        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this.getShipmentCommonData();
        this._store.dispatch(new GetCatalogueCommodityGroupAction());


        this.getListPackageTypes();
        this.route.params.subscribe((params: any) => {
            this.tab = 'job-edit';
            this.tabCharge = 'buying';

            if (!!params && !!params.id) {
                this.jobId = params.id;
                this.getShipmentDetails(params.id);
            }
        });

        this._actionStoreSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromShareBussiness.ContainerAction) => {
                    if (action.type === fromShareBussiness.ContainerActionTypes.SAVE_CONTAINER) {
                        this.lstMasterContainers = action.payload;
                        this.updateData(this.lstMasterContainers);
                    }
                }
            );
    }

    updateData(lstMasterContainers: any[]) {
        let sumCbm = 0;
        let sumPackages = 0;
        let sumContainers = 0;
        let sumNetWeight = 0;
        let sumGrossWeight = 0;
        let containerDescription = '';
        lstMasterContainers.forEach(x => {
            sumCbm = sumCbm + x.cbm;
            sumPackages = sumPackages + x.packageQuantity;
            sumContainers = sumContainers + x.quantity;
            sumNetWeight = sumNetWeight + x.nw;
            sumGrossWeight = sumGrossWeight + x.gw;
        });
        const contData = [];
        for (const item of Object.keys(_groupBy(lstMasterContainers, 'containerTypeName'))) {
            contData.push({
                cont: item,
                quantity: _groupBy(lstMasterContainers, 'containerTypeName')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b)
            });
        }
        for (const item of contData) {
            containerDescription = containerDescription + item.quantity + "x" + item.cont + "; ";
        }
        if (containerDescription.length > 1) {
            containerDescription = containerDescription.substring(0, containerDescription.length - 3);
        }

        this.editForm.formEdit.controls['sumCbm'].setValue(sumCbm);
        this.editForm.formEdit.controls['sumPackages'].setValue(sumPackages);
        this.editForm.formEdit.controls['sumContainers'].setValue(sumContainers);
        this.editForm.formEdit.controls['sumNetWeight'].setValue(sumNetWeight);
        this.editForm.formEdit.controls['sumGrossWeight'].setValue(sumGrossWeight);
        this.editForm.formEdit.controls['containerDescription'].setValue(containerDescription);
    }

    getListContainersOfJob() {
        this._store.dispatch(new fromShareBussiness.GetContainerAction({ mblId: this.jobId }));
        this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ hblid: this.opsTransaction.hblid }));

        this._store.select<any>(fromShareBussiness.getContainerSaveState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (containers: any) => {
                    this.lstMasterContainers = containers || [];
                }
            );
    }

    checkDelete() {
        this._documentRepo.checkShipmentAllowToDelete(this.opsTransaction.id)
            .subscribe(
                (respone: boolean) => {
                    if (respone === true) {
                        this.deleteMessage = `Do you want to delete job No <span class="font-weight-bold">${this.opsTransaction.jobNo}</span>?`;
                        this.confirmDeleteJobPopup.show();
                    } else {
                        this.canNotDeleteJobPopup.show();
                    }
                }
            );
    }

    onDeleteJob() {
        this._documentRepo.deleteShipment(this.opsTransaction.id)
            .subscribe(
                (response: CommonInterface.IResult) => {
                    if (response.status) {
                        this.confirmDeleteJobPopup.hide();
                        this.router.navigate(["/home/operation/job-management"]);
                    }
                }
            );
    }

    onCancelUpdateJob() {
        this._router.navigate(["home/operation/job-management"]);
    }

    confirmCancelJob() {
        this.confirmCancelJobPopup.show();
    }


    saveShipment() {
        this.lstMasterContainers.forEach((c: Container) => {
            c.mblid = this.jobId;
            c.hblid = this.hblid;
        });
        this.opsTransaction.csMawbcontainers = this.lstMasterContainers;
        this.editForm.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPoup.show();
            return;
        }

        this.onSubmitData();
        this.updateShipment();
    }
    checkValidateForm() {
        [this.editForm.commodityGroupId,
        this.editForm.packageTypeId,
        ].forEach((control: AbstractControl) => this.setError(control));

        let valid: boolean = true;
        if (!this.editForm.formEdit.valid
            || (!!this.editForm.serviceDate.value && !this.editForm.serviceDate.value.startDate)
            || this.editForm.sumGrossWeight.value === 0
            || this.editForm.sumNetWeight.value === 0
            || this.editForm.sumCbm.value === 0
            || this.editForm.sumPackages.value === 0
            || this.editForm.sumContainers.value === 0
            || (!!this.editForm.finishDate.value.startDate && this.editForm.serviceDate.value.startDate > this.editForm.finishDate.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }
    onSubmitData() {
        const form: any = this.editForm.formEdit.getRawValue();
        this.opsTransaction.serviceDate = !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null;
        this.opsTransaction.finishDate = !!form.finishDate && !!form.finishDate.startDate ? formatDate(form.finishDate.startDate, 'yyyy-MM-dd', 'en') : null;
        this.opsTransaction.commodityGroupId = !!form.commodity && !!form.commodity.length ? form.commodity.map(i => i.id).toString() : null;
        this.opsTransaction.serviceMode = !!form.serviceMode && !!form.serviceMode.length ? form.serviceMode[0].id : null;
        this.opsTransaction.productService = !!form.productService && !!form.productService.length ? form.productService[0].id : null;
        this.opsTransaction.shipmentMode = !!form.shipmentMode && !!form.shipmentMode.length ? form.shipmentMode[0].id : null;
        this.opsTransaction.hwbno = form.hwbno;
        this.opsTransaction.mblno = form.mblno;
        this.opsTransaction.customerId = form.customerId;
        this.opsTransaction.pol = form.pol;
        this.opsTransaction.pod = form.pod;
        this.opsTransaction.supplierId = form.supplierId;
        this.opsTransaction.flightVessel = form.flightVessel;
        this.opsTransaction.agentId = form.agentId;
        this.opsTransaction.warehouseId = form.warehouseId;
        this.opsTransaction.invoiceNo = form.invoiceNo;
        this.opsTransaction.purchaseOrderNo = form.purchaseOrderNo;
        this.opsTransaction.salemanId = form.salemansId;
        this.opsTransaction.fieldOpsId = form.fieldOpsId;
        this.opsTransaction.billingOpsId = form.billingOpsId;
        this.opsTransaction.clearanceLocation = form.clearanceLocation;
        this.opsTransaction.shipper = form.shipper;
        this.opsTransaction.consignee = form.consignee;
        this.opsTransaction.sumGrossWeight = form.sumGrossWeight;
        this.opsTransaction.sumNetWeight = form.sumNetWeight;
        this.opsTransaction.sumPackages = form.sumPackages;
        this.opsTransaction.sumContainers = form.sumContainers;
        this.opsTransaction.sumCbm = form.sumCbm;
        this.opsTransaction.packageTypeId = !!form.packageTypeId && !!form.packageTypeId.length ? form.packageTypeId[0].id : null;
        this.opsTransaction.commodityGroupId = !!form.commodityGroupId && !!form.commodityGroupId.length ? form.commodityGroupId[0].id : null;
        this.opsTransaction.containerDescription = form.containerDescription;
    }

    updateShipment() {
        this._spinner.show();
        this._documentRepo.updateShipment(this.opsTransaction)
            .pipe(catchError(this.catchError), finalize(() => this._spinner.hide()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getShipmentDetails(this.opsTransaction.id);
                    } else {
                        this._toastService.warning(res.message);
                    }
                }
            );
    }

    lockShipment() {
        this.confirmLockShipmentPopup.show();
    }

    onLockShipment() {
        this.opsTransaction.isLocked = true;
        this.confirmLockShipmentPopup.hide();

        this.updateShipment();
    }

    showListContainer() {
        this.containerPopup.mblid = this.jobId;
        this.containerPopup.show();
    }

    getListPackageTypes() {
        this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE }).toPromise().then(data => {
            this.packageTypes = this.utility.prepareNg2SelectData(data, 'id', 'unitNameEn');
        });
    }
    getShipmentDetails(id: any) {
        this._documentRepo.getDetailShipment(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (response: any) => {
                    this.opsTransaction = new OpsTransaction(response);
                    this.hblid = this.opsTransaction.hblid;
                    if (this.opsTransaction != null) {
                        this.getListContainersOfJob();
                        if (this.opsTransaction != null) {

                            this.editForm.shipmentModes = this.shipmentModes;
                            this.editForm.serviceModes = this.serviceModes;
                            this.editForm.productServices = this.productServices;
                            this.editForm.packageTypes = this.packageTypes;
                            this.getSurCharges(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
                            this.editForm.opsTransaction = this.opsTransaction;
                            const hbl = new CsTransactionDetail(this.opsTransaction);
                            hbl.id = this.opsTransaction.hblid;
                            this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction(hbl));

                            const csTransation: CsTransaction = new CsTransaction(Object.assign({}, response, {
                                grossWeight: this.opsTransaction.sumGrossWeight,
                                netWeight: this.opsTransaction.sumNetWeight,
                                cbm: this.opsTransaction.sumCbm,
                                chargeWeight: this.opsTransaction.sumChargeWeight,
                                packageQty: this.opsTransaction.sumPackages,
                                isLocked: this.opsTransaction.isLocked,
                                customerId: this.opsTransaction.customerId,
                                customerName: this.opsTransaction.customerName,
                                agentName: this.opsTransaction.agentName,
                                supplierName: this.opsTransaction.supplierName,
                            }));

                            this._store.dispatch(new fromShareBussiness.TransactionGetDetailSuccessAction(csTransation));

                            // Tricking Update Transation Apply for isLocked..

                            this._store.dispatch(new OPSTransactionGetDetailSuccessAction(this.opsTransaction));
                            this._store.dispatch(new fromShareBussiness.GetProfitHBLAction(this.opsTransaction.hblid));

                            this._store.dispatch(new fromShareBussiness.GetContainerAction({ mblid: this.jobId }));
                            this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ hblid: this.opsTransaction.hblid }));

                            this.editForm.setFormValue();
                            if (this.editForm.productServices != null) {
                                this.editForm.formEdit.controls['productService'].setValue([this.editForm.productServices.find(type => type.id === this.opsTransaction.productService)]);
                            }
                            if (this.editForm.serviceModes != null) {
                                const serviceMode = this.editForm.serviceModes.find(type => type.id === this.opsTransaction.serviceMode);
                                if (!!serviceMode) { this.editForm.formEdit.controls['serviceMode'].setValue([serviceMode]); }
                            }
                            if (this.editForm.shipmentModes != null) {
                                this.editForm.formEdit.controls['shipmentMode'].setValue([this.editForm.shipmentModes.find(type => type.id === this.opsTransaction.shipmentMode)]);
                            }

                            setTimeout(() => {
                                if (!!this.opsTransaction.commodityGroupId) {
                                    // this.editForm.commodityGroups = this.commodityGroups;
                                    this.editForm.formEdit.controls['commodityGroupId'].setValue([this.editForm.commodityGroups.find(type => type.id === this.opsTransaction.commodityGroupId)]);
                                }
                            }, 500);

                            if (!!this.opsTransaction.packageTypeId && this.editForm.packageTypeId != null) {
                                this.editForm.formEdit.controls['packageTypeId'].setValue([this.editForm.packageTypes.find(type => type.id === this.opsTransaction.packageTypeId)]);
                            }
                        }
                    }
                },
            );
    }

    getShipmentCommonData() {
        this._documentRepo.getOPSShipmentCommonData().toPromise().then((response: any) => {
            this.productServices = this.utility.prepareNg2SelectData(response.productServices, 'value', 'displayName');
            this.serviceModes = this.utility.prepareNg2SelectData(response.serviceModes, 'value', 'displayName');
            this.shipmentModes = this.utility.prepareNg2SelectData(response.shipmentModes, 'value', 'displayName');
        });
        // .pipe(
        //     catchError(this.catchError),
        //     finalize(() => this._progressRef.complete())
        // ).subscribe(
        //     (responses: any) => {
        //         this.editForm.productServices = this.utility.prepareNg2SelectData(responses.productServices, 'value', 'displayName');
        //         this.editForm.serviceModes = this.utility.prepareNg2SelectData(responses.serviceModes, 'value', 'displayName');
        //         this.editForm.shipmentModes = this.utility.prepareNg2SelectData(responses.shipmentModes, 'value', 'displayName');
        //     },
        // );
    }
    getSurCharges(type: 'BUY' | 'SELL' | 'OBH') {
        if (type === CommonEnum.SurchargeTypeEnum.BUYING_RATE) {
            this._store.dispatch(new fromShareBussiness.GetBuyingSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.BUYING_RATE, hblId: this.opsTransaction.hblid }));
        }
        if (type === CommonEnum.SurchargeTypeEnum.SELLING_RATE) {
            this._store.dispatch(new fromShareBussiness.GetSellingSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.SELLING_RATE, hblId: this.opsTransaction.hblid }));
        }
        if (type === CommonEnum.SurchargeTypeEnum.OBH) {
            this._store.dispatch(new fromShareBussiness.GetOBHSurchargeAction({ type: CommonEnum.SurchargeTypeEnum.OBH, hblId: this.opsTransaction.hblid }));
        }
    }

    selectTab(tabName: string) {
        this.tab = tabName;
        if (tabName === 'job-edit') {
            this.getShipmentDetails(this.jobId);
            this.getSurCharges(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
        }
    }

    onOpePLPrint() {
        this.plSheetPopup.show();
    }

    selectTabCharge(tabName: string) {
        this.tabCharge = tabName;
        switch (tabName) {
            case 'buying':
                this.getSurCharges(CommonEnum.SurchargeTypeEnum.BUYING_RATE);
                break;
            case 'selling':
                this.getSurCharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                break;
            case 'obh':
                this.getSurCharges(CommonEnum.SurchargeTypeEnum.OBH);
                break;
            default:
                break;
        }
    }
}
