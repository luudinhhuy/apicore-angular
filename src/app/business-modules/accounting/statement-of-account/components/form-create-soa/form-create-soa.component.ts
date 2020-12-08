import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { Charge, SOASearchCharge, User } from 'src/app/shared/models';
import { SystemConstants } from 'src/constants/system.const';
import { catchError } from 'rxjs/operators';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { formatDate } from '@angular/common';
import _includes from 'lodash/includes';
import _uniq from 'lodash/uniq';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { DataService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { ShareAccountingInputShipmentPopupComponent } from '../../../components/input-shipment/input-shipment.popup';

@Component({
    selector: 'soa-form-create',
    templateUrl: './form-create-soa.component.html'
})

export class StatementOfAccountFormCreateComponent extends AppPage {
    @Output() onApply: EventEmitter<any> = new EventEmitter<any>();
    @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(ShareAccountingInputShipmentPopupComponent, { static: false }) inputShipmentPopupComponent: ShareAccountingInputShipmentPopupComponent;

    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    charges: Charge[] = [];
    configCharge: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    selectedRangeDate: any = null;

    selectedPartner: any = {};
    selectedCharge: any = {};
    selectedCharges: any[] = []; // for multiple select

    dateModes: any[] = [];
    selectedDateMode: any = null;

    types: any = [];
    selectedType: any = null;

    obhs: any = [];
    selectedObh: any = null;

    currencyList: any[] = [];
    selectedCurrency: any = null;

    users: any = [];
    selectedUser: any = [];

    services: any[] = [];
    selectedService: any[] = [];

    note: string = '';

    dataSearch: SOASearchCharge = new SOASearchCharge();

    isApplied: boolean = false;

    commodityGroup: any[] = [];
    commodity: any = null;

    shipmentInput: OperationInteface.IInputShipment;

    numberOfShipment: number = 0;
    constructor(
        private _toastService: ToastrService,
        private _dataService: DataService,
        private _catalogueRepo: CatalogueRepo,
        private _sysRepo: SystemRepo
    ) {
        super();
    }

    ngOnInit() {
        this.initBasicData();
        this.getPartner();
        this.getCurrency();
        this.getUser();
        this.getCharge();
        this.getService();
        this.getCommondity();
    }

    getCommondity() {
        this._catalogueRepo.getCommodityGroup({})
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.commodityGroup = res || [];
                },
                (errors: any) => { },
                () => { },
            );
    }

    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.getPartnerData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER));
        } else {
            this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.ALL, active: true })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataPartner: any) => {
                        this.getPartnerData(dataPartner);
                    },
                );

        }
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
        this.configPartner.displayFields = [
            { field: 'taxCode', label: 'Taxcode' },
            { field: 'shortName', label: 'Name' },
            { field: 'partnerNameEn', label: 'Customer Name' },
        ];
        this.configPartner.selectedDisplayFields = ['partnerNameEn'];
    }

    getCurrencyData(data: any) {
        this.currencyList = (data).map((item: any) => ({ id: item.id, text: item.id }));
        this.selectedCurrency = this.currencyList.filter((curr) => curr.id === "VND")[0];
        this.updateDataSearch('currency', this.selectedCurrency.id);
        this.updateDataSearch('currencyLocal', 'VND');
    }

    getCurrencyUser(data: any) {
        this.users = (data || []).map((item: User) => ({ id: item.id, text: item.username }));

        const userLogged: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.selectedUser = [this.users.filter((i: CommonInterface.INg2Select) => i.text.toLowerCase() === userLogged.userName.toLowerCase())[0]];

        this.updateDataSearch('strCreators', this.selectedUser.map((item: any) => item.id).toString());
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {

                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        this.services.unshift({ id: 'All', text: 'All' });

                        this.selectedService = [this.services[0]];
                    } else {
                        this.handleError(null, (data) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                },
            );
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.getCurrencyData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY));
        } else {
            this._catalogueRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataCurrency: any) => {
                        this.getCurrencyData(dataCurrency);
                    },
                );
        }
    }

    getUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.getCurrencyUser(this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER));
        } else {
            this._sysRepo.getListSystemUser()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataUser: any) => {
                        this.getCurrencyUser(dataUser);
                    },
                );
        }
    }

    getCharge() {
        this._catalogueRepo.getListCharge()
            .pipe(catchError(this.catchError))
            .subscribe((data) => {
                this.charges = data;
                this.charges.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));

                this.configCharge.dataSource = data || [];
                this.configCharge.displayFields = [
                    { field: 'code', label: 'Charge Code' },
                    { field: 'chargeNameEn', label: 'Charge Name EN ' },
                ];
                this.configCharge.selectedDisplayFields = ['code'];

                this._dataService.setData(SystemConstants.CSTORAGE.CHARGE, data || []);
            },
            );
    }

    initBasicData() {
        this.dateModes = [
            { title: 'Created Date', value: 'CreatedDate' },
            { title: 'Service Date', value: 'ServiceDate' },
            { title: 'Invoice Issued Date', value: 'InvoiceIssuedDate' },
        ];
        this.selectedDateMode = this.dateModes[0];

        this.types = [
            { title: 'All', value: 'All' },
            { title: 'Debit', value: 'Debit' },
            { title: 'Credit', value: 'Credit' },
        ];
        this.selectedType = this.types[0];

        this.obhs = [
            { title: 'Yes', value: true },
            { title: 'No', value: false }
        ];
        this.selectedObh = this.obhs[1];
        this.updateDataSearch('isOBH', this.selectedObh.value);
        this.updateDataSearch('dateType', this.selectedDateMode.value);
        this.updateDataSearch('type', this.selectedType.value);
    }

    updateDataSearch(key: string, data: any) {
        this.dataSearch[key] = data;
        this.onChange.emit({ key: key, data: data });
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type.toLowerCase()) {
            case 'partner':
                this.selectedPartner = { field: data.partnerNameEn, value: data.id };
                this.updateDataSearch('customerID', this.selectedPartner.value);
                break;
            case 'date-mode':
                this.selectedDateMode = data;
                this.updateDataSearch('dateType', this.selectedDateMode.value);
                break;
            case 'type':
                this.selectedType = data;
                this.updateDataSearch('type', this.selectedType.value);
                break;
            case 'obh':
                this.selectedObh = data;
                this.updateDataSearch('isOBH', this.selectedObh.value);
                break;
            case 'currency':
                this.selectedCurrency = data;
                this.updateDataSearch('currency', this.selectedCurrency.id);
                break;
            case 'service':
                // * reset selected charges & dataSource.
                this.selectedCharges = [];
                this.configCharge.dataSource = this.charges;

                if (data.id === 'All') {
                    this.selectedService = [];
                    this.selectedService.push({ id: 'All', text: "All" });

                    this.configCharge.dataSource = this.charges;
                    this.updateDataSearch('serviceTypeId', "");

                } else {
                    this.selectedService.push(data);
                    this.detectServiceWithAllOption(data);

                    // ? filter charge when add service
                    this.configCharge.dataSource = this.filterChargeWithService(this.configCharge.dataSource, this.selectedService.map((service: any) => service.id));
                    this.configCharge.dataSource.push(new Charge({ code: 'All', id: 'All', chargeNameEn: 'All' }));

                    this.updateDataSearch('serviceTypeId', this.selectedService.map((service: any) => service.id));
                }

                break;
            case 'user':
                this.selectedUser = [];
                this.selectedUser.push(...data);
                this.updateDataSearch('strCreators', this.selectedUser.map((item: any) => item.id).toString());
                break;
            case 'charge':
                if (data.id === 'All') {
                    this.selectedCharges = [];
                    this.selectedCharges.push({ id: 'All', code: 'All', chargeNameEn: 'All' });
                } else {
                    this.selectedCharges.push(data);
                    this.selectedCharges = [...new Set(this.selectedCharges)];

                    this.detectChargeWithAllOption(data);
                }
                break;
            default:
                break;
        }
    }

    onRemoveService(data: any) {
        this.selectedService.splice(this.selectedService.findIndex((item: any) => item.id === data.id), 1);
        this.detectServiceWithAllOption();

        // * filter charge when delete service
        this.configCharge.dataSource = this.filterChargeWithService(this.configCharge.dataSource, this.selectedService.map((service: any) => service.id));

    }

    onRemoveUser(data: any) {
        this.selectedUser.splice(this.selectedUser.findIndex((item: any) => item.id === data.id), 1);
    }

    onRemoveCharge(index: number = 0) {
        this.selectedCharges.splice(index, 1);
    }

    detectServiceWithAllOption(data?: any) {
        if (!this.selectedService.every((value: any) => value.id !== 'All')) {
            this.selectedService.splice(this.selectedService.findIndex((item: any) => item.id === 'All'), 1);

            this.selectedService = [];
            this.selectedService.push(data);
        }
    }

    detectChargeWithAllOption(data?: any) {
        if (!this.selectedCharges.every((value: any) => value.id !== 'All')) {
            this.selectedCharges.splice(this.selectedCharges.findIndex((item: any) => item.id === 'All'), 1);

            this.selectedCharges = [];
            this.selectedCharges.push(data);
        }
    }

    onApplySearchCharge() {
        this.isApplied = true;
        if (this.isApplied && !this.selectedRangeDate.startDate || !this.selectedPartner.value) {
            return;
        } else {
            const body = {
                currencyLocal: 'VND', // Todo: get currency local follow location or login info
                currency: this.selectedCurrency.id,
                customerID: this.selectedPartner.value || '',
                dateType: this.selectedDateMode.value,
                fromDate: formatDate(this.selectedRangeDate.startDate, 'yyyy-MM-dd', 'en'),
                toDate: formatDate(this.selectedRangeDate.endDate, 'yyyy-MM-dd', 'en'),
                type: this.selectedType.value,
                isOBH: this.selectedObh.value,
                strCreators: this.selectedUser.map((item: any) => item.id).toString(),
                strCharges: this.selectedCharges.map((item: any) => item.code).toString(),
                note: this.note,
                serviceTypeId: !!this.selectedService.length ? this.mapServiceId(this.selectedService[0].id) : this.mapServiceId('All'),
                commodityGroupId: !!this.commodity ? this.commodity.id : null,
                strServices: this.selectedService[0].id === 'All' ? '' : this.selectedService.map(service => service.id).toString(),
                jobIds: this.mapShipment("JOBID"),
                hbls: this.mapShipment("HBL"),
                mbls: this.mapShipment("MBL"),
            };
            this.dataSearch = new SOASearchCharge(body);
            this.onApply.emit(this.dataSearch);
        }
    }

    onChangeRangeDate(rangeDate: any) {
        if (!!rangeDate.startDate) {
            this.updateDataSearch('fromDate', formatDate(rangeDate.startDate, 'yyyy-MM-dd', 'en'));
        }
        if (!!rangeDate.endDate) {
            this.updateDataSearch('toDate', formatDate(rangeDate.endDate, 'yyyy-MM-dd', 'en'));
        }
    }

    onChangeNote(note: string) {
        this.dataSearch.note = note;
        this.updateDataSearch('note', note);
    }

    filterChargeWithService(charges: any[], keys: any[]) {
        const result: any[] = [];
        for (const charge of charges) {
            if (charge.hasOwnProperty('serviceTypeId')) {
                if (typeof (charge.serviceTypeId) !== 'object') {
                    charge.serviceTypeId = charge.serviceTypeId.split(";").filter((i: string) => Boolean(i));
                }
            }
            for (const key of charge.serviceTypeId) {
                if (_includes(keys, key)) {
                    result.push(charge);
                }
            }
        }
        return _uniq(result);
    }


    mapServiceId(service: any = 'All') {
        let serviceTypeId = '';
        if (!!service) {
            if (service === 'All') {
                this.services = this.services.filter(service => service.id !== 'All');
                serviceTypeId = this.services.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            } else {
                serviceTypeId = this.selectedService.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            }
        } else {
            this.services.shift(); // * remove item with value 'All'
            serviceTypeId = this.services.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
        }

        return serviceTypeId;
    }

    openInputShipment() {
        this.inputShipmentPopupComponent.show();
    }

    onShipmentList(data: any) {
        this.shipmentInput = data;
        if (data) {
            this.numberOfShipment = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).length;
        } else {
            this.numberOfShipment = 0;
        }
    }

    mapShipment(type: string) {
        var _shipment = [];
        if (this.shipmentInput) {
            if (this.shipmentInput.keyword.length > 0) {
                const _keyword = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim());
                if (this.shipmentInput.type === type) {
                    _shipment = _keyword;
                }
            }
        }
        return _shipment;
    }
}
