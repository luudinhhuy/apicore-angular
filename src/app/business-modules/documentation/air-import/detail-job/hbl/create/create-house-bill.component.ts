import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { HouseBill, DeliveryOrder } from '@models';

import * as fromShareBussiness from './../../../../../share-business/store';
import { catchError, finalize, skip, takeUntil, mergeMap } from 'rxjs/operators';
import { AirImportHBLFormCreateComponent } from '../components/form-create-house-bill-air-import/form-create-house-bill-air-import.component';
import { ShareBusinessDeliveryOrderComponent, ShareBusinessImportHouseBillDetailComponent, ShareBusinessArrivalNoteAirComponent } from '@share-bussiness';
import { HBLArrivalNote } from 'src/app/shared/models/document/arrival-note-hbl';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { forkJoin } from 'rxjs';
import _merge from 'lodash/merge';
import isUUID from 'validator/lib/isUUID';

@Component({
    selector: 'app-create-hbl-air-import',
    templateUrl: './create-house-bill.component.html',
})
export class AirImportCreateHBLComponent extends AppForm implements OnInit {
    @ViewChild(AirImportHBLFormCreateComponent, { static: false }) formCreateHBLComponent: AirImportHBLFormCreateComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmPopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessArrivalNoteAirComponent, { static: true }) arrivalNoteComponent: ShareBusinessArrivalNoteAirComponent;
    @ViewChild(ShareBusinessDeliveryOrderComponent, { static: true }) deliveryComponent: ShareBusinessDeliveryOrderComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent, { static: false }) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild('confirmSaveExistedHbl', { static: false }) confirmExistedHbl: ConfirmPopupComponent;

    jobId: string;
    hblDetail: any = {};
    selectedHbl: any = {};
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
                    this.generateHblNo(CommonEnum.TransactionTypeEnum.AirImport);
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                    this.getDetailShipment();
                    this.getDetailShipmentPermission();
                } else {
                    this.gotoList();
                }
            });
    }

    ngAfterViewInit() {
        this._cd.detectChanges();
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
                        setTimeout(() => {
                            const objArrival = {
                                arrivalNo: this.hblDetail.jobNo + "-A01",
                                arrivalFirstNotice: new Date()
                            };
                            this.arrivalNoteComponent.hblArrivalNote = new HBLArrivalNote(objArrival);

                            const objDelivery = {
                                deliveryOrderNo: this.hblDetail.jobNo + "-A01",
                                deliveryOrderPrintedDate: { startDate: new Date(), endDate: new Date() }
                            };
                            this.deliveryComponent.deliveryOrder = new DeliveryOrder(objDelivery);
                        }, 500);

                    }
                },
            );
    }

    onImport(selectedData: any) {
        this.isImport = true;
        this.selectedHbl = selectedData;
        this.selectedHbl.hwbno = null;
        this.formCreateHBLComponent.updateFormValue(this.selectedHbl);
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


    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Import';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            mawb: form.mawb,
            customerId: form.customer,
            saleManId: form.saleManId,
            shipperId: form.shipperId,
            consigneeId: form.consigneeId,
            notifyPartyId: form.notifyId,
            notifyPartyDescription: form.notifyDescription,
            hwbno: form.hawb,
            hbltype: !!form.hbltype && !!form.hbltype.length ? form.hbltype[0].id : null,
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            arrivalDate: !!form.arrivalDate && !!form.arrivalDate.startDate ? formatDate(form.arrivalDate.startDate, 'yyyy-MM-dd', 'en') : null,
            forwardingAgentId: form.forwardingAgentId,
            pol: form.pol,
            pod: form.pod,
            warehouseNotice: form.warehouseNotice,
            route: form.route,
            flightNo: form.flightNo,
            flightDate: !!form.flightDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightNoOrigin: form.flightNoOrigin,
            flightDateOrigin: !!form.flightDateOrigin && form.flightDateOrigin.startDate !== undefined ? formatDate(form.flightDateOrigin.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHBLDate: !!form.issueHBLDate ? formatDate(form.issueHBLDate.startDate, 'yyyy-MM-dd', 'en') : null,
            packageType: !!form.packageType && !!form.packageType.length ? form.packageType[0].id : null,
            freightPayment: !!form.freightPayment && !!form.freightPayment.length ? form.freightPayment[0].id : null,
            packageQty: form.packageQty,
            grossWeight: form.gw,
            chargeWeight: form.chargeWeight,
            poInvoiceNo: form.poinvoiceNo,
            goodsDeliveryDescription: form.desOfGoods,
            finalPOD: form.finalPod,
            desOfGoods: form.descriptionOfGood
        };

        const houseBill = new HouseBill(_merge(form, formData));
        return houseBill;
    }

    saveHBL() {
        this.confirmPopup.hide();
        this.formCreateHBLComponent.isSubmitted = true;
        if (!this.checkValidateForm() || !this.arrivalNoteComponent.checkValidate() || !this.deliveryComponent.deliveryOrder.deliveryOrderNo) {
                this.arrivalNoteComponent.isSubmitted = true;
                this.deliveryComponent.isSubmitted = true;
                this.infoPopup.show();
                return;
            }
        else {
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
                            houseBill.jobId = this.jobId;
                            this.createHbl(houseBill);
                        }
                    }
                );
            }
    }

    confirmSaveData() {
        this.confirmExistedHbl.hide();
        const houseBill: HouseBill = this.getDataForm();
        houseBill.jobId = this.jobId;
        this.createHbl(houseBill);
    }


    checkValidateForm() {
        let valid: boolean = true;
        this.setError(this.formCreateHBLComponent.freightPayment);
        this.setError(this.formCreateHBLComponent.packageType);
        this.setError(this.formCreateHBLComponent.hbltype);

        if (!this.formCreateHBLComponent.formCreate.valid) {
            valid = false;
        }
        return valid;
    }

    createHbl(houseBill: HouseBill) {
        if (this.formCreateHBLComponent.formCreate.valid) {
            this._progressRef.start();
            this._documentationRepo.createHousebill(houseBill)
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
                    this.gotoList();
                });
        }
    }


    gotoList() {
        this._router.navigate([`home/documentation/air-import/${this.jobId}/hbl`]);
    }

}
