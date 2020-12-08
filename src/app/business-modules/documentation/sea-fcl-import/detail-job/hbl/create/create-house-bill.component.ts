import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ActionsSubject, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { DocumentationRepo } from 'src/app/shared/repositories';
import { AppForm } from 'src/app/app.form';
import { InfoPopupComponent, ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { Container } from 'src/app/shared/models/document/container.model';
import { SystemConstants } from 'src/constants/system.const';

import { finalize } from 'rxjs/internal/operators/finalize';
import { catchError, takeUntil, mergeMap, skip } from 'rxjs/operators';

import * as fromShareBussiness from './../../../../../share-business/store';

import { HBLArrivalNote } from 'src/app/shared/models/document/arrival-note-hbl';
import { DeliveryOrder } from 'src/app/shared/models';
import { forkJoin } from 'rxjs';
import isUUID from 'validator/lib/isUUID';

import { ShareBusinessArrivalNoteComponent, ShareBusinessDeliveryOrderComponent, ShareBusinessFormCreateHouseBillImportComponent, ShareBusinessImportHouseBillDetailComponent, ShareBussinessHBLGoodSummaryFCLComponent } from 'src/app/business-modules/share-business';
import groupBy from 'lodash/groupBy';
import { DataService } from '@services';
enum HBL_TAB {
    DETAIL = 'DETAIL',
    ARRIVAL = 'ARRIVAL',
    DELIVERY = 'DELIVERY'

}

@Component({
    selector: 'app-create-house-bill',
    templateUrl: './create-house-bill.component.html',
})
export class CreateHouseBillComponent extends AppForm {
    @ViewChild(ShareBusinessFormCreateHouseBillImportComponent, { static: false }) formHouseBill: ShareBusinessFormCreateHouseBillImportComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmCreatePopup: ConfirmPopupComponent;
    @ViewChild(ShareBussinessHBLGoodSummaryFCLComponent, { static: false }) hblGoodSummaryComponent: ShareBussinessHBLGoodSummaryFCLComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent, { static: false }) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild(ShareBusinessArrivalNoteComponent, { static: true, }) arrivalNoteComponent: ShareBusinessArrivalNoteComponent;
    @ViewChild(ShareBusinessDeliveryOrderComponent, { static: true }) deliveryComponent: ShareBusinessDeliveryOrderComponent;

    jobId: string = '';
    shipmentDetail: any = {}; // TODO model.
    selectedHbl: any = {}; // TODO model.
    containers: Container[] = [];
    selectedTab: string = HBL_TAB.DETAIL;
    hblDetail: any = {};
    allowAdd: boolean = false;

    constructor(
        protected _progressService: NgProgress,
        protected _documentationRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _activedRoute: ActivatedRoute,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _store: Store<fromShareBussiness.ITransactionState>,
        protected _cd: ChangeDetectorRef,
        protected _dataService: DataService

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
                        if (!!this.containers) {
                            this.containers.forEach(c => {
                                c.mblid = SystemConstants.EMPTY_GUID;
                            });
                        }
                        if (!this.formHouseBill.isDetail) {
                            // * Update field inword with container data.
                            this.formHouseBill.formGroup.controls["inWord"].setValue(this.updateInwordField(this.containers));
                        }

                    }

                });
    }

    ngOnInit() {
        this._activedRoute.params.subscribe((param: Params) => {
            if (param.jobId && isUUID(param.jobId)) {
                this.jobId = param.jobId;
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                this.getDetailShipmentPermission();
                // * Get default containers from masterbill.
                this._store.dispatch(new fromShareBussiness.GetContainerAction({ mblid: this.jobId }));

                this.getDetailShipment();
            } else {
                this.combackToHBLList();
            }
        });

    }

    onSelectTab(tabName: HBL_TAB | string) {
        this.selectedTab = tabName;
    }

    ngAfterViewInit() {

        this.hblGoodSummaryComponent.initContainer();

        this.hblGoodSummaryComponent.containerPopup.isAdd = true;

        this.hblGoodSummaryComponent.description = "AS PER BILL";
        this.formHouseBill.notifyPartyDescription.setValue("SAM AS CONSIGNEE");

        this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction({}));
        this.formHouseBill.type = 'SFI';

        this._cd.detectChanges();


    }

    getDetailShipment() {
        this._store.select(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (!!res) {
                        this.hblDetail = res;

                        const objArrival = {
                            arrivalNo: this.hblDetail.jobNo + "-A01",
                            arrivalFirstNotice: new Date()
                        };
                        this.arrivalNoteComponent.hblArrivalNote = new HBLArrivalNote(objArrival);

                        const objDelivery = {
                            deliveryOrderNo: this.hblDetail.jobNo + "-D01",
                            deliveryOrderPrintedDate: { startDate: new Date(), endDate: new Date() }
                        };
                        this.deliveryComponent.deliveryOrder = new DeliveryOrder(objDelivery);
                    }
                },
            );
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (this.formHouseBill.pol.value !== undefined && this.formHouseBill.pod.value !== undefined) {
            if (this.formHouseBill.pol.value === this.formHouseBill.pod.value) {
                this.formHouseBill.PortChargeLikePortLoading = true;

            } else {
                this.formHouseBill.PortChargeLikePortLoading = false;
            }
        } else {
            valid = false;
        }
        if (!this.formHouseBill.formGroup.valid) {
            valid = false;
        }
        if (this.formHouseBill.PortChargeLikePortLoading === true || this.formHouseBill.saleMan === null) {
            valid = false;
        }
        return valid;
    }

    oncreate() {
        this.confirmCreatePopup.hide();
        this.formHouseBill.isSubmited = true;
        if (!this.checkValidateForm() || !this.arrivalNoteComponent.checkValidate() || !this.deliveryComponent.deliveryOrder.deliveryOrderNo) {
            this.arrivalNoteComponent.isSubmitted = true;
            this.deliveryComponent.isSubmitted = true;
            this.infoPopup.show();
        } else {
            const body = this.onsubmitData();
            this.createHbl(body);
        }
    }

    onImport(selectedData: any) {
        this.selectedHbl = selectedData;
        if (!!this.selectedHbl) {
            this.formHouseBill.onUpdateDataToImport(this.selectedHbl);
        }
    }

    showCreatePpoup() {
        this.confirmCreatePopup.show();
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.typeFCL = 'Import';
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
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

    combackToHBLList() {
        this._router.navigate([`/home/documentation/sea-fcl-import/${this.jobId}/hbl`]);
    }

    createHbl(body: any) {
        if (this.formHouseBill.formGroup.valid) {
            this._progressRef.start();
            this._documentationRepo.createHousebill(body)
                .pipe(
                    mergeMap((res: any) => {
                        const dateNotice = {
                            arrivalFirstNotice: !!this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice && !!this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice.startDate ? formatDate(this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice.startDate, 'yyyy-MM-dd', 'en') : null,
                            arrivalSecondNotice: !!this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice && <any>!!this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice.startDate ? formatDate(this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice.startDate, 'yyyy-MM-dd', 'en') : null,
                        };
                        this.arrivalNoteComponent.hblArrivalNote.hblid = res.data;
                        const arrival = this._documentationRepo.updateArrivalInfo(Object.assign({}, this.arrivalNoteComponent.hblArrivalNote, dateNotice));
                        const printedDate = {
                            deliveryOrderPrintedDate: !!this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate && !!this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate.startDate ? formatDate(this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate.startDate, 'yyyy-MM-dd', 'en') : null,
                        };
                        this.deliveryComponent.deliveryOrder.hblid = res.data;
                        const delivery = this._documentationRepo.updateDeliveryOrderInfo(Object.assign({}, this.deliveryComponent.deliveryOrder, printedDate));
                        return forkJoin([arrival, delivery]);
                    }),
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                ).subscribe(result => {
                    this._toastService.success(result[0].message, '');
                    this.combackToHBLList();
                }
                );
        }
    }
    onsubmitData() {
        const body: ITransactionDetail = {
            id: SystemConstants.EMPTY_GUID,
            jobId: this.jobId,
            mawb: this.formHouseBill.mtBill.value,
            saleManId: !!this.formHouseBill.saleMan.value ? this.formHouseBill.saleMan.value : null,
            shipperId: !!this.formHouseBill.shipper.value ? this.formHouseBill.shipper.value : null,
            shipperDescription: !!this.formHouseBill.shipperDescription ? this.formHouseBill.shipperDescription.value : null,
            consigneeId: this.formHouseBill.consignee.value,
            consigneeDescription: !!this.formHouseBill.consigneeDescription.value ? this.formHouseBill.consigneeDescription.value : null,
            notifyPartyId: !!this.formHouseBill.notifyParty.value ? this.formHouseBill.notifyParty.value : null,
            notifyPartyDescription: !!this.formHouseBill.notifyPartyDescription.value ? this.formHouseBill.notifyPartyDescription.value : null,
            alsoNotifyPartyId: !!this.formHouseBill.alsoNotifyParty.value ? this.formHouseBill.alsoNotifyParty.value : null,
            alsoNotifyPartyDescription: !!this.formHouseBill.alsonotifyPartyDescription.value ? this.formHouseBill.alsonotifyPartyDescription.value : null,
            hwbno: this.formHouseBill.hwbno.value,
            hbltype: this.formHouseBill.hbltype.value[0].text,
            servicetype: this.formHouseBill.servicetype.value[0].text,
            etd: !!this.formHouseBill.etd.value && this.formHouseBill.etd.value.startDate != null ? formatDate(this.formHouseBill.etd.value.startDate !== undefined ? this.formHouseBill.etd.value.startDate : this.formHouseBill.etd.value, 'yyyy-MM-dd', 'en') : null,
            eta: !!this.formHouseBill.eta.value ? formatDate(this.formHouseBill.eta.value.startDate !== undefined ? this.formHouseBill.eta.value.startDate : this.formHouseBill.eta.value, 'yyyy-MM-dd', 'en') : null,
            pickupPlace: this.formHouseBill.pickupPlace.value,
            pol: this.formHouseBill.pol.value,
            pod: this.formHouseBill.pod.value,
            finalDestinationPlace: this.formHouseBill.finalDestinationPlace.value,
            coloaderId: !!this.formHouseBill.supplier.value ? this.formHouseBill.supplier.value : null,
            localVessel: this.formHouseBill.localVessel.value,
            localVoyNo: this.formHouseBill.localVoyNo.value,
            oceanVessel: this.formHouseBill.oceanVessel.value,
            documentDate: !!this.formHouseBill.documentDate.value && this.formHouseBill.documentDate.value.startDate != null ? formatDate(this.formHouseBill.documentDate.value.startDate !== undefined ? this.formHouseBill.documentDate.value.startDate : this.formHouseBill.documentDate.value, 'yyyy-MM-dd', 'en') : null,
            documentNo: this.formHouseBill.documentNo.value,
            etawarehouse: !!this.formHouseBill.etawarehouse.value && this.formHouseBill.etawarehouse.value.startDate != null ? formatDate(this.formHouseBill.etawarehouse.value.startDate !== undefined ? this.formHouseBill.etawarehouse.value.startDate : this.formHouseBill.etawarehouse.value, 'yyyy-MM-dd', 'en') : null,
            inWord: this.formHouseBill.inWord.value,
            shippingMark: this.formHouseBill.shippingMark.value,
            remark: this.formHouseBill.remark.value,
            issueHBLPlace: !!this.formHouseBill.placeOfIssues.value ? this.formHouseBill.placeOfIssues.value : null,
            issueHBLDate: !!this.formHouseBill.issueHBLDate.value && this.formHouseBill.issueHBLDate.value.startDate != null ? formatDate(this.formHouseBill.issueHBLDate.value.startDate !== undefined ? this.formHouseBill.issueHBLDate.value.startDate : this.formHouseBill.issueHBLDate.value, 'yyyy-MM-dd', 'en') : null,
            originBLNumber: this.formHouseBill.originBLNumber.value.value,
            referenceNo: this.formHouseBill.referenceNo.value,
            customerId: this.formHouseBill.customer.value,
            oceanVoyNo: this.formHouseBill.oceanVoyNo.value,
            csMawbcontainers: this.containers,
            commodity: this.hblGoodSummaryComponent.commodities,
            packageContainer: this.hblGoodSummaryComponent.containerDetail,
            desOfGoods: this.hblGoodSummaryComponent.description,
            cbm: this.hblGoodSummaryComponent.totalCBM,
            grossWeight: this.hblGoodSummaryComponent.grossWeight,
            netWeight: this.hblGoodSummaryComponent.netWeight,
            packageQty: this.hblGoodSummaryComponent.packageQty,
            packageType: +this.hblGoodSummaryComponent.selectedPackage,
            contSealNo: this.hblGoodSummaryComponent.containerDescription,

            arrivalSecondNotice: null,
            arrivalNo: null,
            arrivalHeader: null,
            arrivalFooter: null,
            arrivalFirstNotice: null,
            deliveryOrderNo: null,
            deliveryOrderPrintedDate: null,
            dofooter: null,
            dosentTo1: null,
            dosentTo2: null
        };
        return body;
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

    onSelectTabDO() {
        this.deliveryComponent.deliveryOrder.doheader1 = this._dataService.getDataByKey('polName') || "";
    }
}


export interface ITransactionDetail {
    id: string;
    jobId: string;
    mawb: string;
    saleManId: string;
    oceanVoyNo: string;
    shipperId: string;
    shipperDescription: string;
    consigneeId: string;
    consigneeDescription: string;
    notifyPartyId: string;
    notifyPartyDescription: string;
    alsoNotifyPartyId: string;
    alsoNotifyPartyDescription: string;
    hwbno: string;
    hbltype: string;
    servicetype: string;
    etd: string;
    eta: string;
    pickupPlace: string;
    pol: string;
    pod: string;
    finalDestinationPlace: string;
    coloaderId: string;
    localVessel: string;
    localVoyNo: string;
    oceanVessel: string;
    documentDate: string;
    documentNo: string;
    etawarehouse: string;
    inWord: string;
    shippingMark: string;
    remark: string;
    issueHBLPlace: string;
    issueHBLDate: string;
    originBLNumber: number;
    referenceNo: string;
    customerId: string;
    csMawbcontainers: any[];
    commodity: string;
    packageContainer: string;
    desOfGoods: string;
    cbm: number;
    grossWeight: number;
    netWeight: number;
    arrivalSecondNotice: string;
    arrivalNo: string;
    arrivalHeader: string;
    arrivalFooter: string;
    arrivalFirstNotice: string;
    deliveryOrderNo: string;
    deliveryOrderPrintedDate: string;
    dofooter: string;
    dosentTo1: string;
    dosentTo2: string;
    packageQty: number;
    packageType: number;
    contSealNo: string;

}
