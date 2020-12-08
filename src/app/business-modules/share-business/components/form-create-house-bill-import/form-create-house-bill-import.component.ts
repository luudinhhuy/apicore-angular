import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { CatalogueRepo, DocumentationRepo, SystemRepo } from 'src/app/shared/repositories';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { AppForm } from 'src/app/app.form';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';

import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, takeUntil, catchError } from 'rxjs/operators';

import * as fromShare from './../../store';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { User, CsTransactionDetail, PortIndex } from 'src/app/shared/models';
import { getCataloguePortState, getCataloguePortLoadingState, GetCataloguePortAction } from '@store';

@Component({
    selector: 'form-create-house-bill-import',
    templateUrl: './form-create-house-bill-import.component.html'
})
export class ShareBusinessFormCreateHouseBillImportComponent extends AppForm {
    formGroup: FormGroup;
    customer: AbstractControl;
    saleMan: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    notifyParty: AbstractControl;
    alsoNotifyParty: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    supplier: AbstractControl;
    placeOfIssues: AbstractControl;
    mtBill: AbstractControl;
    hwbno: AbstractControl;
    hbltype: AbstractControl;
    servicetype: AbstractControl;
    etd: AbstractControl;
    eta: AbstractControl;
    pickupPlace: AbstractControl;
    finalDestinationPlace: AbstractControl;
    localVessel: AbstractControl;
    localVoyNo: AbstractControl;
    oceanVessel: AbstractControl;
    documentDate: AbstractControl;
    documentNo: AbstractControl;
    etawarehouse: AbstractControl;
    // warehouseNotice: AbstractControl;
    inWord: AbstractControl;

    shippingMark: AbstractControl;
    remark: AbstractControl;
    issueHBLDate: AbstractControl;
    originBLNumber: AbstractControl;
    referenceNo: AbstractControl;
    consigneeDescription: AbstractControl;
    shipperDescription: AbstractControl;
    notifyPartyDescription: AbstractControl;
    alsonotifyPartyDescription: AbstractControl;
    term$ = new BehaviorSubject<string>('');
    isShowSaleMan: boolean = false;
    isShowConsignee: boolean = false;
    oceanVoyNo: AbstractControl;
    configCustomer: CommonInterface.IComboGirdConfig | any = {};
    configSaleman: CommonInterface.IComboGirdConfig | any = {};
    configShipper: CommonInterface.IComboGirdConfig | any = {};
    configConsignee: CommonInterface.IComboGirdConfig | any = {};
    configNotifyParty: CommonInterface.IComboGirdConfig | any = {};
    configAlsoNotifyParty: CommonInterface.IComboGirdConfig | any = {};
    configSupplier: CommonInterface.IComboGirdConfig | any = {};
    configPlaceOfIssued: CommonInterface.IComboGirdConfig | any = {};
    configPartner: CommonInterface.IComboGirdConfig | any = {};
    configPort: CommonInterface.IComboGirdConfig | any = {};
    shipperdescriptionModel: string;
    consigneedescriptionModel: string;
    notifyPartydescriptinModel: string;
    notifyPartyModel: string;
    isSubmited: boolean = false;
    PortChargeLikePortLoading: boolean = false;
    countChangePort: number = 0;
    countChangePartner: number = 0;
    mindateEta: any = null;
    mindateEtaWareHouse: any = null;
    saleMans: any = [];
    headersSaleman: CommonInterface.IHeaderTable[];
    saleManInCustomerFilter: any = {};
    serviceTypesString: string[] = [];
    hbOfladingTypesString: string[] = [];

    hbOfladingTypes: CommonInterface.IValueDisplay[];
    serviceTypes: CommonInterface.IValueDisplay[];
    shipmentDetail: any = {}; // TODO model.
    numberOfOrigins: CommonInterface.ICommonTitleValue[] = [
        { title: 'One(1)', value: 1 },
        { title: 'Two(2)', value: 2 },
        { title: 'Three(3)', value: 3 }

    ];
    isLoading: boolean = false;
    ports: Observable<PortIndex[]>;

    isLoadingPort: Observable<boolean>;
    object: any = { items: [] };
    listSaleMan: any = [];
    type: string = '';
    @Input() isDetail: boolean = false;


    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _documentRepo: DocumentationRepo,
        private _systemRepo: SystemRepo,
        private _spinner: NgxSpinnerService,
        private _dataService: DataService,
        protected _store: Store<fromShare.ITransactionState>,

    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));
        this.getListSaleman();
        this.getCommonData();
        this.headersSaleman = [
            { title: 'User Name', field: 'username' },
        ];
        this.configPartner = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'shortName', label: 'Name ABBR' },
                { field: 'partnerNameEn', label: 'Name EN' },
                { field: 'taxCode', label: 'Tax Code' },

            ],
        }, { selectedDisplayFields: ['shortName'], });

        this.configPort = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'code', label: 'Port Code' },
                { field: 'nameEn', label: 'Port Name' },
                { field: 'countryNameEN', label: 'Country' },
            ],
        }, { selectedDisplayFields: ['nameEn'], });

        this.configSaleman = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'username', label: 'Username' },
            ],
        }, { selectedDisplayFields: ['username'], });

        this.configPlaceOfIssued = Object.assign({}, this.configComoBoGrid, {
            displayFields: [
                { field: 'name_VN', label: 'Name Vn' },
                { field: 'name_EN', label: 'Name ABBR' },
                { field: 'Name EN', label: 'Name EN' },
                { field: 'code', label: 'Code' }
            ],
        }, { selectedDisplayFields: ['name_EN'], });
        this.initForm();
        this.getPorts();
        if (!this.isDetail) {
            this._store.select(fromShare.getTransactionDetailCsTransactionState)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (res: any) => {
                        this.shipmentDetail = res;

                        this.mtBill.setValue(this.shipmentDetail.mawb);
                        this.servicetype.setValue([<CommonInterface.INg2Select>{ id: this.shipmentDetail.typeOfService, text: this.shipmentDetail.typeOfService }]);
                        this.documentDate.setValue({ startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) });
                        this.supplier.setValue(this.shipmentDetail.coloaderId);
                        this.issueHBLDate.setValue(new Date());
                        this.pol.setValue(this.shipmentDetail.pol);
                        this.pod.setValue(this.shipmentDetail.pod);
                        this.localVessel.setValue(this.shipmentDetail.flightVesselName);
                        this.localVoyNo.setValue(this.shipmentDetail.voyNo);

                        if (this.shipmentDetail.eta != null) {

                            this.eta.setValue({ startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) });
                            if (this.shipmentDetail.etd != null) {
                                this.etd.setValue({ startDate: new Date(this.shipmentDetail.etd), endDate: new Date(this.shipmentDetail.etd) });
                                this.mindateEta = this.createMoment(new Date(this.shipmentDetail.etd));

                            }
                            this.eta.setValue({ startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) });
                            this.mindateEtaWareHouse = this.createMoment(new Date(this.shipmentDetail.eta));

                        }
                    }
                );
        }



    }

    getPorts() {
        this.ports = this._store.select(getCataloguePortState).pipe(
            takeUntil(this.ngUnsubscribe)
        );

        this.isLoadingPort = this._store.select(getCataloguePortLoadingState).pipe(
            takeUntil(this.ngUnsubscribe)
        );
    }
    refreshValue(value: any) {
        this.object.items = [value];
    }

    async getCommonData() {
        try {
            if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA)) {
                const commonData = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA);
                this.serviceTypes = commonData.serviceTypes;
                this.hbOfladingTypes = commonData.billOfLadings;
                this.hbOfladingTypesString = this.hbOfladingTypes.map(x => x.displayName);
                this.serviceTypesString = this.serviceTypes.map(a => a.displayName);
            } else {
                this._spinner.show();
                const commonData: any = await this._documentRepo.getShipmentDataCommon().toPromise();
                this.serviceTypes = commonData.serviceTypes;
                this.serviceTypesString = this.serviceTypes.map(a => a.displayName);
                this.hbOfladingTypes = commonData.billOfLadings;
                this.hbOfladingTypesString = this.hbOfladingTypes.map(x => x.displayName);
                this._dataService.setDataService(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA, commonData);
            }
        } catch (error) {
        }
        finally {
            this._spinner.hide();
        }
    }

    initForm() {
        this.formGroup = this._fb.group({
            customer: [null, Validators.required],
            saleMan: [],
            shipper: [],
            consignee: [null, Validators.required],
            notifyParty: [],
            alsoNotifyParty: [],
            pol: [null, Validators.required],
            pod: [null, Validators.required],
            supplier: [],
            placeOfIssues: [],
            masterBill: ['',

                Validators.required
            ],
            hbOfladingNo: ['',

                Validators.required
            ],
            hbOfladingType: [null,
                Validators.required],
            finalDestination: [

            ],
            placeofReceipt: [
            ],
            feederVessel1: [
            ],
            arrivalVessel: [
            ],
            arrivalVoyage: [
            ],

            documentNo: [],
            referenceNo: [],
            // warehousenotice: [],
            inWord: [],
            shippingMark: [],
            documnentDate: [],
            remark: [],
            feederVoyageNo: [
            ],
            numberOfOrigin: [this.numberOfOrigins[0]],
            dateETA: [],
            dateOfIssued: [],
            etd: [],
            eta: ['', Validators.required],
            shipperDescription: [],
            consigneeDescription: [],
            notifyPartyDescription: [],
            alsonotifyPartyDescription: [],
            serviceType: ['',
                Validators.required]

        });
        this.customer = this.formGroup.controls["customer"];
        this.saleMan = this.formGroup.controls["saleMan"];
        this.shipper = this.formGroup.controls["shipper"];
        this.consignee = this.formGroup.controls["consignee"];
        this.notifyParty = this.formGroup.controls['notifyParty'];
        this.alsoNotifyParty = this.formGroup.controls['alsoNotifyParty'];
        this.pol = this.formGroup.controls['pol'];
        this.pod = this.formGroup.controls['pod'];
        this.supplier = this.formGroup.controls['supplier'];
        this.placeOfIssues = this.formGroup.controls['placeOfIssues'];
        this.mtBill = this.formGroup.controls['masterBill'];
        this.hwbno = this.formGroup.controls['hbOfladingNo'];
        this.hbltype = this.formGroup.controls['hbOfladingType'];
        this.servicetype = this.formGroup.controls['serviceType'];
        this.etd = this.formGroup.controls['etd'];
        this.eta = this.formGroup.controls['eta'];
        this.pickupPlace = this.formGroup.controls['placeofReceipt'];
        this.finalDestinationPlace = this.formGroup.controls['finalDestination'];
        this.localVessel = this.formGroup.controls['arrivalVessel'];
        this.localVoyNo = this.formGroup.controls['arrivalVoyage'];
        this.oceanVessel = this.formGroup.controls['feederVessel1'];
        this.oceanVoyNo = this.formGroup.controls['feederVoyageNo'];
        this.documentDate = this.formGroup.controls['documnentDate'];
        this.documentNo = this.formGroup.controls['documentNo'];
        this.etawarehouse = this.formGroup.controls['dateETA'];
        // this.warehouseNotice = this.formGroup.controls['warehousenotice'];
        this.inWord = this.formGroup.controls["inWord"];
        this.shippingMark = this.formGroup.controls['shippingMark'];
        this.remark = this.formGroup.controls['remark'];
        this.issueHBLDate = this.formGroup.controls['dateOfIssued'];
        this.originBLNumber = this.formGroup.controls['numberOfOrigin'];
        this.referenceNo = this.formGroup.controls['referenceNo'];
        this.consigneeDescription = this.formGroup.controls['consigneeDescription'];
        this.shipperDescription = this.formGroup.controls['shipperDescription'];
        this.notifyPartyDescription = this.formGroup.controls['notifyPartyDescription'];
        this.alsonotifyPartyDescription = this.formGroup.controls['alsonotifyPartyDescription'];
        this.etd.valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((value: { startDate: any, endDate: any }) => {
                this.mindateEta = value.startDate; // * Update min date
                this.resetFormControl(this.eta);
            });
        if (this.eta.value !== "") {
            this.eta.valueChanges
                .pipe(
                    distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                    takeUntil(this.ngUnsubscribe)
                )
                .subscribe((value: { startDate: any, endDate: any }) => {
                    if (value != null) {
                        this.mindateEtaWareHouse = value.startDate; // * Update min date
                        this.resetFormControl(this.etawarehouse);
                    }
                });
        }
        this.getListCustomer();
        this.getListShipper();
        this.getListSupplier();
        this.getListProvince();
    }

    onUpdateDataToImport(data: CsTransactionDetail) {
        this.formGroup.patchValue({
            mawb: data.mawb,
            shipperDescription: data.shipperDescription,
            notifyPartyDescription: data.notifyPartyDescription,
            localVessel: data.localVessel,
            localVoyNo: data.localVoyNo,
            oceanVessel: data.oceanVessel,
            oceanVoyNo: data.oceanVoyNo,
            originBlnumber: [<CommonInterface.INg2Select>{ id: data.originBlnumber, text: data.originBlnumber }],
            alsonotifyPartyDescription: data.alsoNotifyPartyDescription,
            customer: data.customerId,
            saleMan: data.saleManId,
            shipper: data.shipperId,
            consignee: data.consigneeId,
            consigneeDescription: data.consigneeDescription,
            notifyParty: data.notifyPartyId,
            pol: data.pol,
            pod: data.pod,
            alsoNotifyParty: data.alsoNotifyPartyId,
            hbltype: [<CommonInterface.INg2Select>{ id: data.hbltype, text: data.hbltype }],
            supplier: data.coloaderId,
            pickupPlace: data.pickupPlace,
            finalDestinationPlace: data.finalDestinationPlace,
            shippingMark: data.shippingMark,
            remark: data.remark,
            inWord: data.inWord,
            serviceType: [<CommonInterface.INg2Select>{ id: data.serviceType, text: data.serviceType }],

        });
    }

    updateDataToForm(res: CsTransactionDetail) {
        this.formGroup.setValue({
            etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null, // * Date;,
            masterBill: res.mawb,
            shipperDescription: res.shipperDescription,
            consigneeDescription: res.consigneeDescription,
            notifyPartyDescription: res.notifyPartyDescription,
            alsonotifyPartyDescription: res.alsoNotifyPartyDescription,
            hbOfladingNo: res.hwbno,
            placeofReceipt: res.pickupPlace,
            eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null, // * Date;
            finalDestination: res.finalDestinationPlace,
            shipper: res.shipperId,
            feederVessel1: res.oceanVoyNo,
            feederVoyageNo: res.oceanVessel,
            arrivalVoyage: res.localVoyNo,
            arrivalVessel: res.localVessel,
            documnentDate: !!res.documentDate ? { startDate: new Date(res.documentDate), endDate: new Date(res.documentDate) } : null,
            documentNo: res.documentNo,
            dateETA: !!res.etawarehouse ? { startDate: new Date(res.etawarehouse), endDate: new Date(res.etawarehouse) } : null, // * Date;
            // warehousenotice: res.warehouseNotice,
            inWord: res.inWord,
            shippingMark: res.shippingMark,
            remark: res.remark,
            dateOfIssued: !!res.issueHbldate ? { startDate: new Date(res.issueHbldate), endDate: new Date(res.issueHbldate) } : null, // * Date;
            referenceNo: res.referenceNo,
            numberOfOrigin: this.numberOfOrigins.filter(i => i.value === res.originBlnumber)[0],
            saleMan: res.saleManId,
            customer: res.customerId,
            consignee: res.consigneeId,
            notifyParty: res.notifyPartyId,
            alsoNotifyParty: res.alsoNotifyPartyId,
            pol: res.pol,
            pod: res.pod,
            supplier: res.coloaderId,
            placeOfIssues: res.issueHblplace,
            serviceType: [<CommonInterface.INg2Select>{ id: res.serviceType, text: res.serviceType }],
            hbOfladingType: [<CommonInterface.INg2Select>{ id: res.hbltype, text: res.hbltype }],
        });

        this.mindateEta = !!this.mindateEta ? this.createMoment(res.etd) : null;
        this.mindateEtaWareHouse = !!res.eta ? this.createMoment(res.eta) : null;
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'saleman':
                this.isShowSaleMan = false;
                this.saleMan.setValue(data.id);
                break;
            case 'Customer':
                this.customer.setValue(data.id);
                if (!this.consignee.value) {
                    this.consignee.setValue(data.id);
                    this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }
                const listSales = this.listSaleMan.filter(x => x.partnerId === data.id);
                this.saleMans.forEach((item: User) => {
                    if (listSales.length > 0) {
                        this.saleMan.setValue(listSales[0].saleManId);
                    } else if (item.id === data.salePersonId) {
                        this.saleMan.setValue(item.id);
                    }
                });
                break;
            case 'Shipper':
                this.shipper.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'Consignee':
                this.consignee.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'NotifyParty':
                this.notifyParty.setValue(data.id);
                this.notifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'AlsoNotifyParty':
                this.alsoNotifyParty.setValue(data.id);
                this.alsonotifyPartyDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'PortOfLoading':
                this.pol.setValue(data.id);

                // * Update default value for sentTo delivery order.
                this._dataService.setDataService("polName", data.warehouseName || "");
                break;
            case 'PortOfDischarge':
                this.pod.setValue(data.id);
                if (this.countChangePort === 0) {
                    this.finalDestinationPlace.setValue(data.nameEn);
                }
                if (this.pol.value !== undefined && this.pod.value !== undefined) {
                    if (this.pol.value === this.pod.value) {
                        this.PortChargeLikePortLoading = true;
                    } else {
                        this.PortChargeLikePortLoading = false;
                    }
                }
                this.countChangePort++;
                break;
            case 'Supplier':
                this.supplier.setValue(data.id);
                break;
            case 'PlaceOfIssued':
                this.placeOfIssues.setValue(data.id);
                break;
        }
    }

    getListCustomer() {
        this.isLoading = true;
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.CUSTOMER })
            .subscribe((res: any) => {
                this.configCustomer.dataSource = res;
                this.getListConsignee();
            });
    }

    getDescription(fullName: string, address: string, tel: string, fax: string) {
        let strDescription: string = '';
        if (!!fullName) {
            strDescription += fullName;
        }
        if (!!address) {
            strDescription = strDescription + "\n" + address;
        }
        if (!!tel) {
            strDescription = strDescription + "\nTel No:" + tel;
        }
        if (!!fax) {
            strDescription = strDescription + "\nFax No:" + fax;
        }
        return strDescription;
    }
    getListShipper() {
        this.isLoading = true;
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.SHIPPER })
            .subscribe((res: any) => { this.configShipper.dataSource = res; this.isLoading = false; });
    }

    getListConsignee() {
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.CONSIGNEE })
            .subscribe((res: any) => {
                this.configConsignee.dataSource = res;
                this.configNotifyParty.dataSource = res;
                this.configAlsoNotifyParty.dataSource = res;
                const result = this.configCustomer.dataSource.concat(this.configConsignee.dataSource).filter(function (value, index, self) {
                    return self.indexOf(value) === index;
                });
                this.configConsignee.dataSource = result;
                this.isLoading = false;

            });
    }

    getListSupplier() {
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.CARRIER })
            .subscribe((res: any) => {
                this.configSupplier.dataSource = res;

            });
    }

    getListProvince() {
        this._catalogueRepo.getAllProvinces().subscribe((res: any) => { this.configPlaceOfIssued.dataSource = res; });
    }

    getListSaleman() {
        this.isLoading = true;
        this._systemRepo.getListSystemUser().subscribe((res: any) => {
            if (!!res) {
                this.saleMans = res;
                this.isLoading = false;
            } else {
                this.saleMans = [];
            }
        });

        this._catalogueRepo.getListSaleManDetail().pipe(catchError(this.catchError))
            .subscribe((res: any) => {
                this.listSaleMan = res || [];
                this.listSaleMan = this.listSaleMan.filter(x => x.service === this.type && x.status === true);
            });
    }
}
