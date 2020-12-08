import { Component, Input } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { ShareBussinessBuyingChargeComponent } from '../buying-charge/buying-charge.component';
import { CatalogueRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { SortService, DataService } from 'src/app/shared/services';
import { CsShipmentSurcharge, Charge, Partner } from 'src/app/shared/models';
import { SystemConstants } from 'src/constants/system.const';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { takeUntil, catchError, finalize, skip } from 'rxjs/operators';

import * as fromStore from './../../store';
import cloneDeep from 'lodash/cloneDeep';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'selling-charge',
    templateUrl: './selling-charge.component.html',
    styleUrls: ['./../buying-charge/buying-charge.component.scss']
})

export class ShareBussinessSellingChargeComponent extends ShareBussinessBuyingChargeComponent {

    @Input() showSyncFreight: boolean = true;
    @Input() showGetCharge: boolean = true;

    TYPE: any = CommonEnum.SurchargeTypeEnum.SELLING_RATE;

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
        super(_catalogueRepo, _store, _documentRepo, _toastService, _sortService, _ngProgressService, _spinner, _dataService);
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
        this._store.select(fromStore.getSellingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    this.charges = buyings;
                }
            );
    }

    configHeader() {
        this.headers = [
            { title: 'Partner Name', field: 'partnerShortName', required: true, sortable: true, width: 150 },
            { title: 'Charge Name', field: 'chargeId', required: true, sortable: true, width: 250 },
            { title: 'Quantity', field: 'quantity', required: true, sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', required: true, sortable: true },
            { title: 'Unit Price', field: 'unitPrice', required: true, sortable: true },
            { title: 'Currency', field: 'currencyId', required: true, sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total', field: 'total', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'SOA', field: 'soano', sortable: true },
            { title: 'Credit/Debit Note', field: 'cdno', sortable: true },
            { title: 'Settle Payment', field: 'settlementCode', sortable: true },
            { title: 'Exchange Rate Date', field: 'exchangeDate', sortable: true },
            { title: 'Final Exchange Rate', field: 'finalExchangeRate', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Voucher ID', field: 'voucherId', sortable: true },
            { title: 'Voucher ID Date', field: 'voucherIddate', sortable: true },
        ];
    }

    getCharge() {
        this._catalogueRepo.getCharges({ active: true, serviceTypeId: this.serviceTypeId, type: CommonEnum.CHARGE_TYPE.DEBIT })
            .subscribe(
                (charges: Charge[]) => {
                    this.listCharges = charges;
                }
            );
    }

    saveSellingSurCharge() {
        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }
        // * Update data 
        this.isSubmitted = true;
        if (!this.checkValidate()) {
            return;
        }

        if (!this.checkDuplicate()) {
            return;
        }

        this.updateSurchargeField(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
        this._progressRef.start();

        this._documentRepo.addShipmentSurcharges(this.charges)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this.getProfit();

                        this.getSurcharges(CommonEnum.SurchargeTypeEnum.SELLING_RATE);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    syncFreightCharge() {
        this._progressRef.start();

        this._documentRepo.getArrivalInfo(this.hbl.id, CommonEnum.TransactionTypeEnum.SeaFCLImport)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        if (!res.csArrivalFrieghtCharges.length) {
                            this._toastService.warning("Not found freight charge");
                        } else {
                            for (const freightCharge of res.csArrivalFrieghtCharges) {
                                const newSurCharge: CsShipmentSurcharge = new CsShipmentSurcharge(freightCharge);
                                newSurCharge.id = SystemConstants.EMPTY_GUID;
                                newSurCharge.exchangeDate = { startDate: new Date(), endDate: new Date() };
                                newSurCharge.invoiceDate = null;

                                // * Default get partner = customer name's hbl.
                                newSurCharge.partnerShortName = this.hbl.customerName;
                                newSurCharge.paymentObjectId = this.hbl.customerId;

                                this._store.dispatch(new fromStore.AddSellingSurchargeAction(newSurCharge));
                            }
                        }

                    }
                }
            );
    }

    syncBuyingCharge() {
        this._store.select(fromStore.getBuyingSurChargeState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (buyings: CsShipmentSurcharge[]) => {
                    if (!buyings.length) {
                        this._toastService.warning("Not found buying charge");
                        return;
                    }

                    const buyingCharges: CsShipmentSurcharge[] = cloneDeep(buyings);
                    // * update debit charge to chargeId
                    buyingCharges.forEach(c => {
                        c.chargeId = c.debitCharge;
                        c.id = SystemConstants.EMPTY_GUID;
                        c.type = CommonEnum.SurchargeTypeEnum.SELLING_RATE;

                        this._store.dispatch(new fromStore.AddSellingSurchargeAction(c));

                    });

                    // this.charges = [...this.charges, ...buyingCharges];
                }
            );
    }


}
