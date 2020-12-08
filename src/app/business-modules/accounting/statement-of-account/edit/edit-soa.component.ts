import { Component, ViewChild } from '@angular/core';
import { StatementOfAccountAddChargeComponent } from '../components/poup/add-charge/add-charge.popup';
import { AccountingRepo, CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { SOA, SOASearchCharge, Charge } from 'src/app/shared/models';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AppList } from 'src/app/app.list';
import { SortService, DataService } from 'src/app/shared/services';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { NgProgress } from '@ngx-progressbar/core';
@Component({
    selector: 'app-statement-of-account-edit',
    templateUrl: './edit-soa.component.html',
})
export class StatementOfAccountEditComponent extends AppList {
    @ViewChild(StatementOfAccountAddChargeComponent, { static: false }) addChargePopup: StatementOfAccountAddChargeComponent;

    currencyList: any[];
    selectedCurrency: any = null;

    selectedRange: any;

    soa: SOA = new SOA();
    soaNO: string = '';
    currencyLocal: string = '';

    headers: CommonInterface.IHeaderTable[] = [];
    isCheckAllCharge: boolean = false;

    dataSearch: SOASearchCharge;

    charges: Charge[] = [];
    configCharge: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _activedRoute: ActivatedRoute,
        private _sysRepo: CatalogueRepo,
        private _sortService: SortService,
        private _router: Router,
        private _dataService: DataService,
        private _progressService: NgProgress,

    ) {
        super();
        this.requestSort = this.sortChargeList;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'JobID', field: 'jobId', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'Debit', field: 'debit', sortable: true },
            { title: 'Credit', field: 'credit', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Services Date', field: 'serviceDate', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];
        this._activedRoute.queryParams.subscribe((params: any) => {
            if (!!params.no && !!params.currency) {
                this.soaNO = params.no;
                this.currencyLocal = params.currency;
                this.getCurrency();
                this.getListCharge();
                this.getDetailSOA(this.soaNO, this.currencyLocal);
            }
        });
    }

    addCharge() {
        this.addChargePopup.show();
    }

    getDetailSOA(soaNO: string, currency: string) {
        this._progressRef.start();
        this._accoutingRepo.getDetaiLSOA(soaNO, currency)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            ).subscribe(
                (dataSoa: any) => {
                    this.soa = new SOA(dataSoa);

                    // * make all chargeshipment was selected
                    for (const item of this.soa.chargeShipments) {
                        item.isSelected = this.isCheckAllCharge;
                    }

                    // * update currency
                    this.selectedCurrency = !!this.soa.currency ? this.currencyList.filter((currencyItem: any) => currencyItem.id === this.soa.currency.trim())[0] : this.currencyList[0];

                    // * update range Date
                    this.selectedRange = { startDate: new Date(this.soa.soaformDate), endDate: new Date(this.soa.soatoDate) };

                    // * Update dataSearch for Add More Charge.
                    const datSearchMoreCharge: SOASearchCharge = {
                        currency: this.soa.currency,
                        currencyLocal: 'VND', // TODO get currency local from user,
                        customerID: this.soa.customer,
                        dateType: this.soa.dateType,
                        toDate: this.soa.soatoDate,
                        fromDate: this.soa.soaformDate,
                        type: this.soa.type,
                        isOBH: this.soa.obh,
                        inSoa: false,
                        strCharges: this.soa.surchargeIds,
                        strCreators: this.soa.creatorShipment,
                        serviceTypeId: this.soa.serviceTypeId,
                        chargeShipments: this.soa.chargeShipments,
                        note: this.soa.note,
                        commodityGroupId: this.soa.commodityGroupId,
                        strServices: this.soa.serviceTypeId.replace(new RegExp(";", 'g'), ","),
                        jobIds: [],
                        hbls: [],
                        mbls:[]
                    };
                    this.dataSearch = new SOASearchCharge(datSearchMoreCharge);
                },
            );
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.currencyList = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY);
        } else {
            this._sysRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCurrency: any) => {
                        this.currencyList = dataCurrency;
                    },
                );
        }
    }

    getListCharge() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE)) {

            this.getDataCharge(this._dataService.getDataByKey(SystemConstants.CSTORAGE.CHARGE));
        } else {
            this._sysRepo.getListCharge()
                .pipe(catchError(this.catchError))
                .subscribe((dataCharge: any) => {
                    this.getDataCharge(dataCharge);
                },
                );
        }
    }

    getDataCharge(data: any) {
        this.charges = data;
        this.charges.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));

        this.configCharge.dataSource = data || [];
        this.configCharge.displayFields = [
            { field: 'code', label: 'Charge Code' },
            { field: 'chargeNameEn', label: 'Charge Name EN ' },
        ];
        this.configCharge.selectedDisplayFields = ['code'];
    }

    sortChargeList(sortField?: string, order?: boolean) {
        this.soa.chargeShipments = this._sortService.sort(this.soa.chargeShipments, sortField, order);
    }

    onChangeCheckBoxCharge($event: Event) {
        this.isCheckAllCharge = this.soa.chargeShipments.every((item: any) => item.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.soa.chargeShipments) {
            charge.isSelected = this.isCheckAllCharge;
        }
    }

    removeCharge() {
        this.soa.chargeShipments = this.soa.chargeShipments.filter((item: any) => !item.isSelected);
        this.dataSearch.chargeShipments = this.soa.chargeShipments;
    }

    back() {
        this._router.navigate(['home/accounting/statement-of-account']);
    }

    onUpdateMoreSOA(data: any) {
        this.soa.chargeShipments = data.chargeShipments;
        this.dataSearch.chargeShipments = this.soa.chargeShipments;
        this.isCheckAllCharge = false;
    }

    updateSOA() {
        /*
        * endDate must >= soaToDate
                    * and 
        * startDate must <= soaFromDate
        */
        // if (!(moment(this.soa.soaformDate).isSameOrAfter(moment(this.selectedRange.startDate), 'day') && moment(this.selectedRange.endDate).isSameOrAfter(moment(this.soa.soatoDate), 'day'))) {
        //     this._toastService.warning(`Range date invalid `, '', { positionClass: 'toast-bottom-right' });
        //     return;
        // }
        if ((new Date(this.selectedRange.startDate).getDate() > new Date(this.soa.soaformDate).getDate()) || new Date(this.selectedRange.endDate).getDate() < new Date(this.soa.soatoDate).getDate()) {
            this._toastService.warning(`Range date invalid `);
            return;
        }
        if (!this.soa.chargeShipments.length) {
            this._toastService.warning(`SOA Don't have any charges in this period, Please check it again! `);
            return;
        } else {
            const body = {
                surcharges: this.soa.chargeShipments.map((item: any) => ({
                    surchargeId: item.id,
                    type: item.type
                })),
                id: this.soa.id,
                soano: this.soaNO,
                soaformDate: !!this.selectedRange.startDate ? formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en') : null,
                soatoDate: !!this.selectedRange.endDate ? formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en') : null,
                currency: this.selectedCurrency.id,
                status: this.soa.status,
                note: this.soa.note,
                userCreated: this.soa.userCreated,
                userModified: this.soa.userModified,
                datetimeCreated: this.soa.datetimeCreated,
                datetimeModified: this.soa.datetimeModified,
                serviceTypeId: this.soa.serviceTypeId,
                dateType: this.soa.dateType,
                type: this.soa.type,
                obh: this.soa.obh,
                creatorShipment: this.soa.creatorShipment,
                customer: this.soa.customer,
                commodityGroupId: this.soa.commodityGroupId
            };
            this._progressRef.start();
            this._accoutingRepo.updateSOA(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`SOA ${res.data.soano} is successfull`, 'Update Success');

                            // * get detail again
                            this.getDetailSOA(this.soaNO, this.currencyLocal);

                            // * init checkbox all
                            this.isCheckAllCharge = false;
                        }
                    },
                );
        }
    }

    addMoreCharge() {
        this.addChargePopup.searchInfo = this.dataSearch;
        this.addChargePopup.getListShipmentAndCDNote(this.dataSearch);

        this.addChargePopup.charges = this.charges;
        this.addChargePopup.configCharge = this.configCharge;

        this.addChargePopup.show();
    }
}
