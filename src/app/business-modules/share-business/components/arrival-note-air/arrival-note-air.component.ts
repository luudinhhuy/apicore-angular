import { Component, OnInit, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { ArrivalFreightCharge, User, Charge, Unit, Currency, CsTransactionDetail } from '@models';
import { ConfirmPopupComponent } from '@common';
import { HBLArrivalNote } from 'src/app/shared/models/document/arrival-note-hbl';
import { Observable } from 'rxjs';
import { Container } from '@angular/compiler/src/i18n/i18n_ast';
import { CatalogueRepo, DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { Store } from '@ngrx/store';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { catchError, takeUntil, switchMap, finalize, tap } from 'rxjs/operators';
import { SystemConstants } from 'src/constants/system.const';
import { CommonEnum } from '@enums';
import { ChargeConstants } from 'src/constants/charge.const';
import { getDetailHBlState, getTransactionLocked, GetDetailHBLAction } from '../../store';
import { IArrivalFreightChargeDefault, IArrivalDefault } from '../hbl/arrival-note/arrival-note.component';

@Component({
    selector: 'arrival-note-air',
    templateUrl: './arrival-note-air.component.html',
    styleUrls: ['./arrival-note-air.component.scss']
})
export class ShareBusinessArrivalNoteAirComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;

    hblArrivalNote: HBLArrivalNote = new HBLArrivalNote();

    headers: CommonInterface.IHeaderTable[];

    userLogged: User = new User();
    hbl: CsTransactionDetail;

    listCharges: Charge[] = [];
    listUnits: Observable<Unit[]>;
    listCurrency: Observable<Currency[]>;

    headerCharge: CommonInterface.IHeaderTable[];
    quantityTypes: CommonInterface.IValueDisplay[];

    defaultExchangeRate: number;
    selectedIndexFreightCharge: number = -1;

    isSubmitted: boolean = false;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<any>,
        private _documentRepo: DocumentationRepo,
        private _sortService: SortService,
        private _ngProgress: NgProgress,
        private _toastService: ToastrService
    ) {
        super();

        this._progressRef = this._ngProgress.ref();

        this.requestSort = this.sortFreightCharge;

        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }


    ngOnInit() {
        this.configData();
        this.getCharge();
        this.getCurrency();
        this.getUnit();

        // * Get default exchange rate.
        this.getExchangeRate('USD', formatDate(new Date(), 'yyyy-MM-dd', 'en')).then(
            (exchangeRate: IExchangeRate) => {
                if (!!exchangeRate) {
                    this.defaultExchangeRate = exchangeRate.rate;
                }
            }
        );

        this._store.select(getDetailHBlState)
            .pipe(
                catchError(this.catchError),
                takeUntil(this.ngUnsubscribe),
                tap((res: any) => {
                    this.hbl = res;
                    this.hblArrivalNote.hblid = res.id || SystemConstants.EMPTY_GUID;
                    // this.containersHBL = res.csMawbcontainers || []; // * Get container from HBL detail.
                }),
                switchMap(() => this._documentRepo.getArrivalInfo(this.hblArrivalNote.hblid, CommonEnum.TransactionTypeEnum.SeaFCLImport)) // * Get arrival info.
            )
            .subscribe(
                (res: HBLArrivalNote) => {
                    if (!!res) {
                        if (!!res.hblid && res.arrivalNo !== null) {
                            this.hblArrivalNote = res;
                            this.hblArrivalNote.arrivalFirstNotice = !!res.arrivalFirstNotice ? { startDate: new Date(res.arrivalFirstNotice), endDate: new Date(res.arrivalSecondNotice) } : { startDate: new Date(), endDate: new Date() };
                            this.hblArrivalNote.arrivalSecondNotice = !!res.arrivalSecondNotice ? { startDate: new Date(res.arrivalSecondNotice), endDate: new Date(res.arrivalSecondNotice) } : null;
                        }
                    }
                }
            );

        this.isLocked = this._store.select(getTransactionLocked);
    }

    configData() {
        this.headers = [
            { title: 'Charge', field: 'chargeId', sortable: true, width: 250 },
            { title: 'Quantity', field: 'quantity', sortable: true, width: 150 },
            { title: 'Unit', field: 'unitId', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total Amount', field: 'total', sortable: true },
            { title: 'Exchange Rate', field: 'exchangeRate', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
            { title: 'Show', field: 'isShow', sortable: true },
            { title: 'Full', field: 'isFull', sortable: true },
            { title: 'Tick', field: 'isTick', sortable: true },
        ];

        this.quantityTypes = [
            { displayName: 'G.W', value: CommonEnum.QUANTITY_TYPE.GW },
            { displayName: 'C.W', value: CommonEnum.QUANTITY_TYPE.CW },
            { displayName: 'CBM', value: CommonEnum.QUANTITY_TYPE.CBM },
            { displayName: 'P.K', value: CommonEnum.QUANTITY_TYPE.PACKAGE },
            { displayName: 'H.W', value: CommonEnum.QUANTITY_TYPE.HW },
        ];

        this.headerCharge = [
            { title: 'Name', field: 'chargeNameEn' },
            { title: 'Unit Price', field: 'unitPrice' },
            { title: 'Unit', field: 'unitId' },
            { title: 'Code', field: 'code' },
        ];
    }

    addCharge() {
        const newCharge: ArrivalFreightCharge = new ArrivalFreightCharge();
        newCharge.currencyId = "USD";

        // * Update field.
        newCharge.exchangeRate = this.defaultExchangeRate;
        newCharge.hblid = this.hblArrivalNote.hblid;

        this.hblArrivalNote.csArrivalFrieghtCharges.push(newCharge);
    }

    deleteFreightCharge(index: number, chargeItem: ArrivalFreightCharge) {
        this.selectedIndexFreightCharge = index;

        // * detect => Has Freight charge saved ?
        if (chargeItem.id === SystemConstants.EMPTY_GUID) {
            this.hblArrivalNote.csArrivalFrieghtCharges.splice(index, 1);
        } else {
            this.confirmDeletePopup.show();
        }
    }

    sortFreightCharge() {
        this.hblArrivalNote.csArrivalFrieghtCharges = this._sortService.sort(this.hblArrivalNote.csArrivalFrieghtCharges, this.sort, this.order);
    }

    onDeleteFreightCharge() {
        this.confirmDeletePopup.hide();
        this.hblArrivalNote.csArrivalFrieghtCharges.splice(this.selectedIndexFreightCharge, 1);
    }

    duplicateFreightCharge(indexFreightCharge: number) {
        const newCharge: ArrivalFreightCharge = new ArrivalFreightCharge(this.hblArrivalNote.csArrivalFrieghtCharges[indexFreightCharge]);
        this.hblArrivalNote.csArrivalFrieghtCharges.push(newCharge);
    }

    getCharge() {
        this._catalogueRepo.getCharges({ active: true, serviceTypeId: ChargeConstants.SFI_CODE, type: CommonEnum.CHARGE_TYPE.DEBIT })
            .pipe(catchError(this.catchError))
            .subscribe(
                (charges: Charge[]) => {
                    this.listCharges = charges;
                }
            );
    }

    getCurrency() {
        this.listCurrency = this._catalogueRepo.getCurrencyBy({ active: true })
            .pipe(catchError(this.catchError));
    }

    getUnit() {
        this.listUnits = this._catalogueRepo.getUnit({ active: true })
            .pipe(catchError(this.catchError));
    }

    async getExchangeRate(currency: any, date: string) {
        try {
            this._progressRef.start();
            const exchangeRate: IExchangeRate = await this._catalogueRepo.convertExchangeRate(date, currency).toPromise();
            if (!!exchangeRate) {
                return exchangeRate;
            }
        } catch (error) {

        } finally {
            this._progressRef.complete();
        }
    }

    onChangeCurrency(currencyId: any, charge: ArrivalFreightCharge) {
        this.getExchangeRate(currencyId, formatDate(new Date(), 'yyyy-MM-dd', 'en')).then(
            (exchangeRate: IExchangeRate) => {
                if (!!exchangeRate) {
                    charge.exchangeRate = exchangeRate.rate;
                } else {
                    charge.exchangeRate = 0;
                }
            }
        );
    }

    validateFirst_SecondNotice(firstNote: any, secondNote: any) {
        if (!firstNote || !secondNote) {
            return false;
        }
        if (!secondNote.startDate) {
            return false;
        }
        const _firstNote = new Date(firstNote.startDate).getTime();
        const _secondNote = new Date(secondNote.startDate).getTime();
        return (_secondNote < _firstNote) ? true : false;
    }

    validateEta_FirstNotice(eta: any, firstNote: any) {
        if (!eta || !firstNote) {
            return false;
        }
        const _eta = new Date(eta).getTime();
        const _firstNote = new Date(firstNote.startDate).getTime();
        return (_firstNote < _eta) ? true : false;
    }

    saveArrivalNote() {
        this.isSubmitted = true;
        const dateNotice = {
            arrivalFirstNotice: !!this.hblArrivalNote.arrivalFirstNotice && !!this.hblArrivalNote.arrivalFirstNotice.startDate ? formatDate(this.hblArrivalNote.arrivalFirstNotice.startDate, 'yyyy-MM-dd', 'en') : null,
            arrivalSecondNotice: !!this.hblArrivalNote.arrivalSecondNotice && <any>!!this.hblArrivalNote.arrivalSecondNotice.startDate ? formatDate(this.hblArrivalNote.arrivalSecondNotice.startDate, 'yyyy-MM-dd', 'en') : null,
        };
        const isCheckFN_SN = this.validateFirst_SecondNotice(this.hblArrivalNote.arrivalFirstNotice, this.hblArrivalNote.arrivalSecondNotice);
        const isCheckETA_FN = this.validateEta_FirstNotice(this.hbl.eta, this.hblArrivalNote.arrivalFirstNotice);
        if (!isCheckFN_SN && !isCheckETA_FN) {
            this._progressRef.start();
            this._documentRepo.updateArrivalInfo(Object.assign({}, this.hblArrivalNote, dateNotice))
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);

                            // * Dispatch for detail HBL to update HBL state.
                            this._store.dispatch(new GetDetailHBLAction(this.hblArrivalNote.hblid));
                        }
                    }
                );
        } else {
            if (isCheckFN_SN) {
                this._toastService.error('The Second Notice date must be equal to or after the First Notice date');
            }
            if (isCheckETA_FN) {
                this._toastService.error('The First Notice date must be equal to or after the Eta');
            }
        }
    }

    setDefaultHeadeFooter() {
        const body: IArrivalDefault = {
            transactionType: CommonEnum.TransactionTypeEnum.SeaFCLImport,
            userDefault: this.userLogged.id,
            arrivalFooter: this.hblArrivalNote.arrivalFooter,
            arrivalHeader: this.hblArrivalNote.arrivalHeader
        };

        this._progressRef.start();

        this._documentRepo.setArrivalHeaderFooterDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    setDefaultFreightCharge() {
        const body: IArrivalFreightChargeDefault = {
            userDefault: this.userLogged.id,
            transactionType: CommonEnum.TransactionTypeEnum.SeaFCLImport,
            csArrivalFrieghtChargeDefaults: this.hblArrivalNote.csArrivalFrieghtCharges
        };

        this._progressRef.start();

        this._documentRepo.setArrivalFreightChargeDefault(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onChangeQuantity(quantity: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, quantity, chargeItem.unitPrice);
    }

    onChangeVat(vat: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(vat, chargeItem.quantity, chargeItem.unitPrice);
    }

    onChangeUnitPrice(unitPrice: number, chargeItem: ArrivalFreightCharge) {
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, chargeItem.quantity, unitPrice);
    }

    onChangeQuantityType(type: string, chargeItem: ArrivalFreightCharge) {
        switch (type) {
            case CommonEnum.QUANTITY_TYPE.GW:
                // chargeItem.quantity = this.calculateContainer(this.containersHBL, CommonEnum.QUANTITY_TYPE.GW);
                chargeItem.quantity = this.hbl.grossWeight;
                break;
            case CommonEnum.QUANTITY_TYPE.NW:
                // chargeItem.quantity = this.calculateContainer(this.containersHBL, CommonEnum.QUANTITY_TYPE.NW);
                chargeItem.quantity = this.hbl.netWeight;

                break;
            case CommonEnum.QUANTITY_TYPE.CBM:
                // chargeItem.quantity = this.calculateContainer(this.containersHBL, CommonEnum.QUANTITY_TYPE.CBM);
                chargeItem.quantity = this.hbl.cbm;
                break;
            default:
                break;
        }

        // * Update quantityType, total.
        chargeItem.quantityType = type;
        chargeItem.total = this.utility.calculateTotalAmountWithVat(chargeItem.vatrate, chargeItem.quantity, chargeItem.unitPrice);
    }

    onSelectCharge(data: Charge, chargeItem: ArrivalFreightCharge | any) {
        chargeItem.chargeId = data.id;
        chargeItem.description = data.chargeNameEn;

        chargeItem.unitId = data.unitId;
        chargeItem.unitPrice = data.unitPrice;

        // * Hide combogrid.
        chargeItem.isShowCharge = false;

    }

    calculateContainer(containers: Container[], key: string): number {
        let total: number = 0;
        total = containers.reduce((acc: any, curr: Container) => acc += curr[key], 0);
        return total;
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.hblArrivalNote.csArrivalFrieghtCharges) {
            if (
                !charge.chargeId
                || charge.unitPrice < 0
                || charge.vatrate > 100
            ) {
                valid = false;
                break;
            }
        }

        return valid;
    }
}

interface IExchangeRate {
    id: number;
    currencyFromID: string;
    rate: number;
    currencyToID: string;
}

