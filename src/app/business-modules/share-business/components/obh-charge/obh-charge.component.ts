import { Component } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { ShareBussinessBuyingChargeComponent } from '../buying-charge/buying-charge.component';
import { CatalogueRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { SortService, DataService } from 'src/app/shared/services';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { takeUntil, catchError, finalize, skip } from 'rxjs/operators';
import { CsShipmentSurcharge, Partner, Charge } from 'src/app/shared/models';

import * as fromStore from './../../store';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemConstants } from 'src/constants/system.const';

@Component({
    selector: 'obh-charge',
    templateUrl: './obh-charge.component.html',
    styleUrls: ['./../buying-charge/buying-charge.component.scss']
})

export class ShareBussinessOBHChargeComponent extends ShareBussinessBuyingChargeComponent {

    TYPE: any = CommonEnum.SurchargeTypeEnum.OBH;

    constructor(
        protected _catalogueRepo: CatalogueRepo,
        protected _store: Store<fromStore.IShareBussinessState>,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _sortService: SortService,
        protected _ngProgressService: NgProgress,
        protected _spinner: NgxSpinnerService,
        protected _dataService: DataService

    ) {
        super(
            _catalogueRepo,
            _store,
            _documentRepo,
            _toastService,
            _sortService,
            _ngProgressService,
            _spinner,
            _dataService);
        this._progressRef = this._ngProgressService.ref();
    }

    getPartner() {
        this._dataService.currentMessage.pipe(
            skip(1),
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            (data: any = []) => {
                this.listPartner = data[SystemConstants.CSTORAGE.PARTNER] || [];
            });
    }

    getCurrency() {
        this._dataService.currentMessage.pipe(
            skip(1),
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            (data: any = []) => {
                this.listCurrency = data[SystemConstants.CSTORAGE.CURRENCY] || [];
            });
    }

    getUnits() {
        this._dataService.currentMessage.pipe(
            skip(1),
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            (data: any = []) => {
                this.listUnits = data[SystemConstants.CSTORAGE.UNIT] || [];
            });
    }

    getSurcharge() {
        this._store.select(fromStore.getOBHSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    this.charges = buyings;
                }
            );
    }

    configHeader() {
        this.headers = [
            { title: 'Receiver', field: 'payerName', required: true, sortable: true, width: 150 },
            { title: 'Payer', field: 'receiverName', required: true, sortable: true, width: 150 },
            { title: 'Charge', field: 'chargeId', required: true, sortable: true, width: 250 },
            { title: 'Quantity', field: 'quantity', required: true, sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', required: true, sortable: true },
            { title: 'Unit Price', field: 'unitPrice', required: true, sortable: true },
            { title: 'Currency', field: 'currencyId', required: true, sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total', field: 'total', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Series No', field: 'seriesNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'SOA', field: 'soano', sortable: true },
            { title: 'Credit/Debit Note', field: 'cdno', sortable: true },
            { title: 'Settle Payment', field: 'settlementCode', sortable: true },
            { title: 'Exchange Rate Date', field: 'exchangeDate', sortable: true },
            { title: 'Final Exchange Rate', field: 'finalExchangeRate', sortable: true },
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Voucher ID Date', field: 'voucherIddate', sortable: true },
            { title: 'Voucher IDRE', field: 'voucherIdre', sortable: true },
            { title: 'Voucher IDRE Date', field: 'voucherIdredate', sortable: true },
        ];
    }

    getCharge() {
        this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceTypeId, type: CommonEnum.CHARGE_TYPE.OBH }).subscribe(
            (charges: Charge[]) => {
                this.listCharges = charges;
            }
        );
    }

    selectPartnerTypes(partnerType: CommonInterface.IValueDisplay, chargeItem: CsShipmentSurcharge, type: string) {
        chargeItem.objectBePaid = null;
        switch (type) {
            case 'receiver':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        chargeItem.receiverName = this.hbl.customerName;
                        if (!chargeItem.receiverName) {
                            chargeItem.receiverName = this.listPartner.find(p => p.id === this.hbl.customerId).partnerNameEn;
                        }
                        chargeItem.paymentObjectId = this.hbl.customerId;
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        chargeItem.receiverName = this.shipment.supplierName;
                        chargeItem.paymentObjectId = this.shipment.coloaderId;
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        chargeItem.receiverName = this.shipment.agentName;
                        chargeItem.paymentObjectId = this.shipment.agentId;
                        break;
                    default:
                        break;
                }
                break;
            case 'payer':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        chargeItem.payerName = this.hbl.customerName;
                        if (!chargeItem.payerName) {
                            chargeItem.payerName = this.listPartner.find(p => p.id === this.hbl.customerId).partnerNameEn;
                        }
                        chargeItem.payerId = this.hbl.customerId;
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        chargeItem.payerName = this.shipment.supplierName;
                        chargeItem.payerId = this.shipment.coloaderId;
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        chargeItem.payerName = this.shipment.agentName;
                        chargeItem.payerId = this.shipment.agentId;
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    onSelectPayerReceiver(partnerData: Partner, chargeItem: CsShipmentSurcharge, type: string) {
        chargeItem.objectBePaid = null;
        switch (type) {
            case 'receiver':
                if (!!partnerData) {
                    chargeItem.receiverName = partnerData.shortName;
                    chargeItem.paymentObjectId = partnerData.id;
                }
                break;
            case 'payer':
                if (!!partnerData) {
                    chargeItem.payerName = partnerData.shortName;
                    chargeItem.payerId = partnerData.id;
                }
                break;
            default:
                break;
        }
    }

    saveOBHSurCharge() {
        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }
        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }
        if (!this.checkDuplicate()) {
            return;
        }

        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.OBH);

        this._progressRef.start();
        this._documentRepo.addShipmentSurcharges(this.charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this.getProfit();
                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.OBH);

                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.charges) {
            if (
                !charge.paymentObjectId
                || !charge.payerId
                || !charge.unitId
                || !charge.chargeId
                || !charge.chargeCode
                || !charge.receiverName
                || !charge.payerName
                || charge.unitPrice === null
                || charge.quantity === null
                || charge.unitPrice < 0
                || charge.quantity < 0
                || charge.vatrate > 100
                || charge.paymentObjectId === charge.payerId
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }
}
