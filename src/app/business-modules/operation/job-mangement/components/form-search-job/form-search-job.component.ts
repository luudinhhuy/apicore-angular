import { Component, EventEmitter, Output } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { CatalogueRepo, SystemRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { catchError, takeUntil } from 'rxjs/operators';
import { SystemConstants } from 'src/constants/system.const';
import { DataService } from 'src/app/shared/services';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { User } from 'src/app/shared/models';
import { formatDate } from '@angular/common';

@Component({
    selector: 'job-management-form-search',
    templateUrl: './form-search-job.component.html'
})

export class JobManagementFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDataShipment> = new EventEmitter<ISearchDataShipment>();

    filterTypes: CommonInterface.ICommonTitleValue[];
    productServices: CommonInterface.IValueDisplay[] = [];
    serviceModes: CommonInterface.IValueDisplay[] = [];
    shipmentModes: CommonInterface.IValueDisplay[] = [];

    formSearch: FormGroup;
    searchText: AbstractControl;
    filterType: AbstractControl;
    productService: AbstractControl;
    serviceMode: AbstractControl;
    shipmentMode: AbstractControl;
    user: AbstractControl;
    serviceDate: AbstractControl;

    configPartner: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    users: User[] = [];
    selectedPartner: any = {};

    constructor(
        private _documentRepo: DocumentationRepo,
        private _fb: FormBuilder,
        private _dataService: DataService,
        private _sysRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo
    ) {
        super();
    }

    ngOnInit() {
        this.initFormSearch();
        this.getPartner();
        this.getUser();
        this.getCommondata();

        this.filterTypes = [
            { title: 'Job Id', value: 'jobId' },
            { title: 'HBL', value: 'hbl' },
            { title: 'Custom No', value: 'customno' },
            { title: 'MBL', value: 'mbl' },
            { title: 'Credit\/Debit\/Invoice\ No', value: 'code' },



        ];
        this.filterType.setValue(this.filterTypes[0]);
    }

    getCommondata() {
        this._documentRepo.getShipmentCommonData()
            .pipe(
                catchError(this.catchError)
            ).subscribe(
                (response: CommonInterface.ICommonShipmentData) => {
                    this.productServices = response.productServices;
                    this.serviceModes = response.serviceModes;
                    this.shipmentModes = response.shipmentModes;
                },
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

    getUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.users = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER);

        } else {
            this._sysRepo.getListSystemUser()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (dataUser: any) => {
                        this.users = dataUser;
                    },
                );
        }
    }

    getPartnerData(data: any) {
        this.configPartner.dataSource = data;
        this.configPartner.displayFields = [
            { field: 'taxCode', label: 'Taxcode' },
            { field: 'shortName', label: 'Name' },
            { field: 'partnerNameVn', label: 'Customer Name' },
        ];
        this.configPartner.selectedDisplayFields = ['shortName'];
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            'searchText': [],
            'filterType': [],
            'productService': [],
            'serviceMode': [],
            'shipmentMode': [],
            'user': [],
            'serviceDate': [],

        });

        this.searchText = this.formSearch.controls['searchText'];
        this.filterType = this.formSearch.controls['filterType'];
        this.productService = this.formSearch.controls['productService'];
        this.serviceMode = this.formSearch.controls['serviceMode'];
        this.shipmentMode = this.formSearch.controls['shipmentMode'];
        this.user = this.formSearch.controls['user'];
        this.serviceDate = this.formSearch.controls['serviceDate'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'partner':
                this.selectedPartner = { field: data.partnerNameEn, value: data.id };
                break;
            default:
                break;
        }
    }

    searchShipment() {
        const body: ISearchDataShipment = {
            all: null,
            jobNo: this.filterType.value.value === 'jobId' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            hwbno: this.filterType.value.value === 'hbl' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            mblno: this.filterType.value.value === 'mbl' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            clearanceNo: this.filterType.value.value === 'customno' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            creditDebitInvoice: this.filterType.value.value === 'code' ? (this.searchText.value ? this.searchText.value.trim() : '') : null,
            productService: !!this.productService.value ? this.productService.value.value : null,
            serviceMode: !!this.serviceMode.value ? this.serviceMode.value.value : null,
            shipmentMode: !!this.shipmentMode.value ? this.shipmentMode.value.value : null,
            serviceDateFrom: (!!this.serviceDate.value && !!this.serviceDate.value.startDate) ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDateTo: (!!this.serviceDate.value && !!this.serviceDate.value.endDate) ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerId: !!this.selectedPartner.value ? this.selectedPartner.value : null,
            fieldOps: !!this.user.value ? this.user.value.id : null,
        };
        this.onSearch.emit(body);
    }

    resetSearch() {
        this.formSearch.reset();
        this.selectedPartner = {};
        this.filterType.setValue(this.filterTypes[0]);
        //  this.onSearch.emit(<any>{});
        // if(this.searchText.value == ''){
        //     this.onSearch.emit(<any>{});
        // }
    }

    collapsed() {
        this.resetFormControl(this.productService);
        this.resetFormControl(this.serviceMode);
        this.resetFormControl(this.shipmentMode);
        this.resetFormControl(this.user);
        this.resetFormControl(this.serviceDate);
        this.selectedPartner = { field: 'id', value: null };
    }
}



interface ISearchDataShipment {
    all: string;
    jobNo: string;
    hwbno: string;
    productService: string;
    serviceMode: string;
    customerId: string;
    fieldOps: string;
    shipmentMode: string;
    serviceDateFrom: string;
    serviceDateTo: string;
    mblno: string;
    clearanceNo: string;
    creditDebitInvoice: string;
}

