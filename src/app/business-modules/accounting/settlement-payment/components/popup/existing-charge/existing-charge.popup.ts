import { Component, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SystemConstants } from 'src/constants/system.const';
import { catchError, finalize } from 'rxjs/operators';
import { DataService, SortService } from 'src/app/shared/services';
import { AccountingRepo, DocumentationRepo, CatalogueRepo } from 'src/app/shared/repositories';
import { ButtonModalSetting } from 'src/app/shared/models/layout/button-modal-setting.model';
import { ButtonType } from 'src/app/shared/enums/type-button.enum';
import { Surcharge } from 'src/app/shared/models';
import { ToastrService } from 'ngx-toastr';
import { ShareAccountingInputShipmentPopupComponent } from 'src/app/business-modules/accounting/components/input-shipment/input-shipment.popup';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'existing-charge-popup',
    templateUrl: './existing-charge.popup.html'
})

export class SettlementExistingChargePopupComponent extends PopupBase {
    @Output() onRequest: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild(ShareAccountingInputShipmentPopupComponent, { static: false }) inputShipmentPopupComponent: ShareAccountingInputShipmentPopupComponent;

    headers: CommonInterface.IHeaderTable[];

    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    selectedPartner: Partial<CommonInterface.IComboGridData> = {};
    selectedPartnerData: any;

    configShipment: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };
    selectedShipment: Partial<CommonInterface.IComboGridData> = {};
    selectedShipmentData: OperationInteface.IShipment;

    services: any[] = [];
    initService: any[] = [];
    selectedServices: any[] = [];

    charges: Surcharge[] = [];
    selectedCharge: Surcharge[] = [];

    resetButtonSetting: ButtonModalSetting = {
        buttonAttribute: Object.assign(this.cancelButtonSetting.buttonAttribute, { titleButton: 'reset', icon: 'la la-refresh' }),
        typeButton: ButtonType.reset,
    };

    shipmentInput: OperationInteface.IInputShipment;
    isLoadingShipmentGrid: boolean = false;
    isLoadingPartnerGrid: boolean = false;

    numberOfShipment: number = 0;
    constructor(
        private _dataService: DataService,
        private _catalogue: CatalogueRepo,
        private _catalogueRepo: CatalogueRepo,
        private _accoutingRepo: AccountingRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'Qty', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unitName', sortable: true },
            { title: 'Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Amount', field: 'total', sortable: true },
            { title: 'Settlement No', field: 'settlementCode', sortable: true },
        ];

        this.getPartner();
        this.getProductService();
    }

    getPartner() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER)) {
            this.getPartnerData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.PARTNER));
        } else {
            this.isLoadingShipmentGrid = true;
            this._catalogue.getListPartner(null, null, { active: true })
                .pipe(catchError(this.catchError), finalize(() => {
                    this.isLoadingShipmentGrid = false;
                }))
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
            { field: 'shortName', label: 'Name' },
            { field: 'partnerNameEn', label: 'Customer Name' },
        ];
        this.configPartner.selectedDisplayFields = ['shortName'];
    }

    getProductService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: CommonInterface.IValueDisplay[]) => {
                    this.initService = data;
                    this.services = (data || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));
                    this.selectedServices = this.services;

                    this.getShipment(null, this.selectedServices.map((service: { id: string, text: string }) => service.id));
                }
            );
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.selectedPartner = { field: 'id', value: data.partnerNameEn };
                this.selectedPartnerData = data;

                // this.resetShipment();
                this.selectedShipment = {};
                this.selectedShipmentData = null;
                this.getShipment(this.selectedPartnerData.id, this.selectedServices.map((service: { id: string, text: string }) => service.id));
                break;
            case 'service':
                this.selectedServices = [];
                this.selectedServices.push(...data);
                this.charges = [];

                if (!!this.selectedPartner.value && !!this.selectedPartnerData) {
                    this.resetShipment();
                    this.getShipment(this.selectedPartnerData.id, this.selectedServices.map((service: { id: string, text: string }) => service.id));
                }

                break;
            case 'shipment':
                this.selectedShipment = { field: 'jobId', value: data.hbl };
                this.selectedShipmentData = data;
                break;
            default:
                break;
        }
    }

    onRemoveDataFormInfo(type: string) {
        switch (type) {
            case 'partner':
                this.selectedPartner = {};
                this.selectedPartnerData = null;
                this.resetShipment();
                break;
            case 'shipment':
                this.selectedShipment = {};
                this.selectedShipmentData = null;
                break;
            default:
                break;
        }
    }


    getShipment(partnerId: string, service: string[]) {
        this.isLoadingShipmentGrid = true;
        this._documentRepo.getShipmentByPartnerOrService(partnerId, service)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoadingShipmentGrid = false;
            }))
            .subscribe(
                (res: any) => {
                    this.configShipment.dataSource.length = 0;
                    this.configShipment.dataSource = [...this.configShipment.dataSource, ...cloneDeep(res)];
                    this.configShipment.displayFields = [
                        { field: 'jobId', label: 'Job No' },
                        { field: 'mbl', label: 'MBL' },
                        { field: 'hbl', label: 'HBL' },
                    ];
                    this.configShipment.selectedDisplayFields = ['jobId', `mbl`, 'hbl'];

                    // * IF PARTNER HAS ONLY ONE SHIPMENT => SELECT THAT SHIPMENT AS WELL.
                    if (this.configShipment.dataSource.length === 1) {
                        this.selectedShipment = { field: 'jobId', value: this.configShipment.dataSource[0].jobId };
                        this.selectedShipmentData = this.configShipment.dataSource[0];
                    }

                    this.isCheckAll = false;
                }
            );
    }

    searchCharge() {
        if (!this.selectedPartnerData || (!this.selectedShipmentData && !this.shipmentInput)) {
            return;
        } else {
            this.isLoading = true;
            this.isCheckAll = false;

            let _jobIds = [];
            let _hbls = [];
            let _mbls = [];
            _jobIds = this.mapShipment("JOBID");
            _hbls = this.mapShipment("HBL");
            _mbls = this.mapShipment("MBL");
            if (this.selectedShipmentData) {
                _jobIds.push(this.selectedShipmentData.jobId);
                _hbls.push(this.selectedShipmentData.hbl);
                _mbls.push(this.selectedShipmentData.mbl);
            }
            const body = {
                partnerId: this.selectedPartnerData.id,
                jobIds: _jobIds,
                hbls: _hbls,
                mbls: _mbls
            };
            this._accoutingRepo.getExistingCharge(body)
                .pipe(catchError(this.catchError), finalize(() => this.isLoading = false))
                .subscribe(
                    (res: any) => {
                        this.charges = res;
                    }
                );
        }
    }

    mapShipment(type: string) {
        let _shipment = [];
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

    reset() {
        this.resetShipment();
        this.resetPartner();
        this.isCheckAll = false;

        this.charges = [];
        this.selectedServices = (this.initService || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));

        this.numberOfShipment = 0;
        this.resetFormShipmentInput();
    }

    onChangeCheckBoxCharge() {
        this.isCheckAll = this.charges.every((item: Surcharge) => item.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.charges) {
            charge.isSelected = this.isCheckAll;
        }
    }

    resetShipment() {
        this.selectedShipment = {};
        this.selectedShipmentData = null;
        this.configShipment = {
            ...this.configShipment,
            dataSource: [],
        };
        this._cd.detectChanges();
    }

    resetPartner() {
        this.selectedPartnerData = null;
        this.selectedPartner = {};
    }

    sortSurcharge(dataSort: any) {
        this.charges = this._sortService.sort(this.charges, dataSort.sortField, dataSort.order);
    }

    closePopup() {
        this.charges = [];
        this.selectedServices = (this.initService || []).map((item: CommonInterface.IValueDisplay) => ({ id: item.value, text: item.displayName }));
        this.isCheckAll = false;

        this.resetShipment();
        this.resetPartner();
        this.hide();

        this.resetFormShipmentInput();
    }

    submit() {
        this.selectedCharge = this.charges
            .filter((charge: Surcharge) => charge.isSelected && !charge.settlementCode)
            .map((surcharge: Surcharge) => new Surcharge(surcharge));

        if (!this.selectedCharge.length) {
            this._toastService.warning(`Don't have any charges in this period, Please check it again! `);
            return;
        } else {
            this.onRequest.emit(this.selectedCharge);
            this.hide();
        }
    }

    openInputShipment() {
        this.inputShipmentPopupComponent.show();
    }

    onShipmentList(data: any) {
        this.shipmentInput = data;
        if (data) {
            this.numberOfShipment = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).length;
            this.resetShipment();
        } else {
            this.numberOfShipment = 0;
        }
    }

    resetFormShipmentInput() {
        this.inputShipmentPopupComponent.shipmentSearch = '';
        this.shipmentInput = null;
        this.inputShipmentPopupComponent.selectedShipmentType = "JOBID";
    }
}

