import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { formatDate } from '@angular/common';

import { AppForm } from 'src/app/app.form';
import { InfoPopupComponent, ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { Container } from 'src/app/shared/models/document/container.model';
import { SystemConstants } from 'src/constants/system.const';
import {
    ShareBusinessImportHouseBillDetailComponent,
    ShareBussinessHBLGoodSummaryFCLComponent,
    ShareBusinessFormCreateHouseBillExportComponent
} from 'src/app/business-modules/share-business';

import { catchError, finalize, takeUntil } from 'rxjs/operators';

import * as fromShareBussiness from './../../../../../share-business/store';
import isUUID from 'validator/lib/isUUID';
import groupBy from 'lodash/groupBy';

@Component({
    selector: 'app-create-hbl-fcl-export',
    templateUrl: './create-house-bill.component.html'
})

export class SeaFCLExportCreateHBLComponent extends AppForm {

    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmPopup: ConfirmPopupComponent;
    @ViewChild(ShareBusinessFormCreateHouseBillExportComponent, { static: false }) formCreateHBLComponent: ShareBusinessFormCreateHouseBillExportComponent;
    @ViewChild(ShareBussinessHBLGoodSummaryFCLComponent, { static: false }) goodSummaryComponent: ShareBussinessHBLGoodSummaryFCLComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent, { static: false }) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;

    jobId: string;
    containers: Container[] = [];
    allowAdd: boolean = false;

    selectedHbl: any = {}; // TODO model.

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

        this._actionStoreSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromShareBussiness.ContainerAction) => {
                    if (action.type === fromShareBussiness.ContainerActionTypes.SAVE_CONTAINER) {
                        this.containers = action.payload;

                        // * reset mblid in container.
                        if (!!this.containers) {
                            this.containers.forEach(c => {
                                c.mblid = SystemConstants.EMPTY_GUID;
                            });
                        }

                        console.log(this.containers);
                        // * Update field inword with container data.
                        if (!this.formCreateHBLComponent.isUpdate) {
                            this.formCreateHBLComponent.formCreate.controls["inWord"].setValue(this.updateInwordField(this.containers));
                        }
                    }
                });
    }

    ngOnInit() {
        this._activedRoute.params
            .subscribe((param: Params) => {
                if (param.jobId && isUUID(param.jobId)) {
                    this.jobId = param.jobId;
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                    // * Get default containers from masterbill.
                    this._store.dispatch(new fromShareBussiness.GetContainerAction({ mblid: this.jobId }));
                    this.getDetailShipmentPermission();
                } else {
                    this.gotoList();
                }
            });
    }

    ngAfterViewInit() {
        this.importHouseBillPopup.typeFCL = 'Export';
        this.goodSummaryComponent.initContainer();
        this.goodSummaryComponent.containerPopup.isAdd = true;
        this.formCreateHBLComponent.type = 'SFE';
        this._cd.detectChanges();
    }

    showCreatepoup() {
        this.confirmPopup.show();
    }

    onSaveHBL() {
        this.confirmPopup.hide();
        this.formCreateHBLComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.getDataForm();

        this.createHbl(modelAdd);
    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            id: SystemConstants.EMPTY_GUID,
            jobId: this.jobId,
            sailingDate: !!form.sailingDate && !!form.sailingDate.startDate ? formatDate(form.sailingDate.startDate, 'yyyy-MM-dd', 'en') : null,
            closingDate: !!form.closingDate && !!form.closingDate.startDate ? formatDate(form.closingDate.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHbldate: !!form.issueHbldate && !!form.issueHbldate.startDate ? formatDate(form.issueHbldate.startDate, 'yyyy-MM-dd', 'en') : null,

            mawb: form.mawb,
            shipperDescription: form.shipperDescription,
            consigneeDescription: form.consigneeDescription,
            notifyPartyDescription: form.notifyPartyDescription,
            hwbno: form.hwbno,
            customsBookingNo: form.bookingNo,
            localVoyNo: form.localVoyNo,
            oceanVoyNo: form.oceanVoyNo,
            pickupPlace: form.placeReceipt,
            deliveryPlace: form.placeDelivery,
            finalDestinationPlace: form.finalDestinationPlace,
            placeFreightPay: form.placeFreightPay,
            issueHblplace: form.issueHblplace,
            referenceNo: form.referenceNo,
            exportReferenceNo: form.exportReferenceNo,
            goodsDeliveryDescription: form.goodsDeliveryDescription,
            forwardingAgentDescription: form.forwardingAgentDescription,
            purchaseOrderNo: form.purchaseOrderNo || null,
            shippingMark: form.shippingMark,
            inWord: form.inWord,
            onBoardStatus: form.onBoardStatus,

            serviceType: !!form.serviceType && !!form.serviceType.length ? form.serviceType[0].id : null,
            originBlnumber: !!form.originBlnumber && !!form.originBlnumber.length ? form.originBlnumber[0].id : null,
            moveType: !!form.moveType && !!form.moveType.length ? form.moveType[0].id : null,
            freightPayment: !!form.freightPayment && !!form.freightPayment.length ? form.freightPayment[0].id : null,
            hbltype: !!form.hbltype && !!form.hbltype.length ? form.hbltype[0].id : null,

            customerId: form.customer,
            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            notifyPartyId: form.notifyParty,
            originCountryId: form.country,
            pol: form.pol,
            pod: form.pod,
            forwardingAgentId: form.forwardingAgent,
            goodsDeliveryId: form.goodsDelivery,

            // * containers summary
            csMawbcontainers: this.containers,
            commodity: this.goodSummaryComponent.commodities,
            packageContainer: this.goodSummaryComponent.containerDetail,
            desOfGoods: this.goodSummaryComponent.description,
            cbm: this.goodSummaryComponent.totalCBM,
            grossWeight: this.goodSummaryComponent.grossWeight,
            netWeight: this.goodSummaryComponent.netWeight,
            packageQty: this.goodSummaryComponent.packageQty,
            packageType: +this.goodSummaryComponent.selectedPackage,
            contSealNo: this.goodSummaryComponent.containerDescription,

        };

        return formData;
    }

    onImport(selectedData: any) {
        this.selectedHbl = selectedData;
        if (!!this.selectedHbl) {
            this.formCreateHBLComponent.onUpdateDataToImport(this.selectedHbl);
        }
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Export';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();

    }

    checkValidateForm() {
        let valid: boolean = true;

        this.setError(this.formCreateHBLComponent.serviceType);
        this.setError(this.formCreateHBLComponent.moveType);
        this.setError(this.formCreateHBLComponent.originBlnumber);

        if (!this.formCreateHBLComponent.formCreate.valid) {
            valid = false;
        }
        return valid;
    }

    createHbl(body: any) {
        this._progressRef.start();
        this._documentationRepo.createHousebill(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.gotoList();
                    } else {
                    }
                }
            );
    }

    updateInwordField(containers: Container[]): string {
        let containerDetail = '';

        const contObject = (containers || []).map((container: Container) => ({
            contType: container.containerTypeId,
            contName: container.description || '',
            quantity: container.quantity,
            isPartContainer: container.isPartOfContainer || false
        }));
        // const contData = [];
        // for (const keyName of Object.keys(groupBy(contObject, 'contName'))) {
        //     contData.push({
        //         contName: keyName,
        //         quantity: groupBy(contObject, 'contName')[keyName].map(i => i.quantity).reduce((a: any, b: any) => a += b),
        //     });
        // }

        for (const item of contObject) {
            if (item.isPartContainer) {
                containerDetail += "A Part Of ";
            }
            containerDetail += this.handleStringCont(item);
        }
        containerDetail = containerDetail.trim().replace(/\&$/, "");
        containerDetail += " Container Onlys.THC/CSC AND OTHER SURCHARGES AT DESTINATION ARE FOR RECEIVER'S ACCOUNT. ";

        return containerDetail || '';
    }

    handleStringCont(contOb: { contName: string, quantity: number }) {
        return this.utility.convertNumberToWords(contOb.quantity) + '' + contOb.contName + ' & ';
    }

    gotoList() {
        this._router.navigate([`home/documentation/sea-fcl-export/${this.jobId}/hbl`]);
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
