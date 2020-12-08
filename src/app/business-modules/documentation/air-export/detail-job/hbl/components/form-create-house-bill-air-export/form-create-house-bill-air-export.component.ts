import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Customer, User, PortIndex, Currency, CsTransaction, DIM, HouseBill, Warehouse, CsOtherCharge } from '@models';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { CommonEnum } from '@enums';

import { AppForm } from 'src/app/app.form';
import { CountryModel } from 'src/app/shared/models/catalogue/country.model';
import { IShareBussinessState, getTransactionDetailCsTransactionState, getDetailHBlState, getDimensionVolumesState, InitShipmentOtherChargeAction } from 'src/app/business-modules/share-business/store';
import { SystemConstants } from 'src/constants/system.const';

import { map, tap, takeUntil, catchError, skip, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { GetCataloguePortAction, getCataloguePortState, getCataloguePortLoadingState, GetCatalogueWarehouseAction, getCatalogueWarehouseState } from '@store';
import { FormValidators } from 'src/app/shared/validators';
import { ShareAirExportOtherChargePopupComponent } from '../../../../share/other-charge/air-export-other-charge.popup';
import { NINE } from '@angular/cdk/keycodes';

@Component({
    selector: 'air-export-hbl-form-create',
    templateUrl: './form-create-house-bill-air-export.component.html',
    styleUrls: ['./form-create-house-bill-air-export.component.scss']
})
export class AirExportHBLFormCreateComponent extends AppForm implements OnInit {
    @Input() isUpdate: boolean = false;
    @ViewChild(ShareAirExportOtherChargePopupComponent, { static: false }) otherChargePopup: ShareAirExportOtherChargePopupComponent;

    formCreate: FormGroup;
    customerId: AbstractControl;
    saleManId: AbstractControl;
    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    forwardingAgentId: AbstractControl;
    hbltype: AbstractControl;
    etd: AbstractControl;
    eta: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    flightDate: AbstractControl;
    freightPayment: AbstractControl;
    currencyId: AbstractControl;
    wtorValpayment: AbstractControl;
    otherPayment: AbstractControl;
    originBlnumber: AbstractControl;
    issueHbldate: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    forwardingAgentDescription: AbstractControl;
    dimensionDetails: FormArray;
    hwbno: AbstractControl;
    mawb: AbstractControl;
    issueHblplace: AbstractControl;
    warehouseId: AbstractControl;

    customers: Observable<Customer[]>;
    saleMans: Observable<User[]>;
    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    countries: Observable<CountryModel[]>;
    ports: Observable<PortIndex[]>;
    agents: Observable<Customer[]>;
    warehouses: Observable<Warehouse[]>;

    currencies: Observable<CommonInterface.INg2Select[]>;


    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    displayFieldsCountry: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Country Code' },
        { field: 'nameEn', label: 'Name EN' },
    ];

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    billTypes: CommonInterface.INg2Select[] = [
        { id: 'Copy', text: 'Copy' },
        { id: 'Original', text: 'Original' },
        { id: 'Surrendered', text: 'Surrendered' },
    ];
    termTypes: CommonInterface.INg2Select[] = [
        { id: 'Prepaid', text: 'Prepaid' },
        { id: 'Collect', text: 'Collect' },
        { id: 'Sea - Air Difference', text: 'Sea - Air Difference' }
    ];
    wts: CommonInterface.INg2Select[] = [
        { id: 'PP', text: 'PP' },
        { id: 'CLL', text: 'CLL' }
    ];
    numberOBLs: CommonInterface.INg2Select[] = [
        { id: '0', text: 'Zero (0)' },
        { id: 1, text: 'One (1)' },
        { id: 2, text: 'Two (2)' },
        { id: 3, text: 'Three (3)' }
    ];

    selectedIndexDIM: number = -1;

    selectedPrepaid: boolean = false;
    selectedCollect: boolean = false;

    jobId: string = SystemConstants.EMPTY_GUID;
    hblId: string = SystemConstants.EMPTY_GUID;

    hwconstant: number = null;
    totalHeightWeight: number = null;
    totalCBM: number = null;

    shipmentDetail: CsTransaction;
    selectedCustomer: Customer;

    AA: string = 'As Arranged';

    dims: DIM[] = []; // * Dimension details.
    otherCharges: CsOtherCharge[] = [];

    isLoadingPort: any;
    isSeparate: boolean = false;
    isCollapsed: boolean = false;
    isUpdateOtherCharge: boolean = false;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _store: Store<IShareBussinessState>
    ) {
        super();
    }

    ngOnInit(): void {
        // this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));
        this._store.dispatch(new GetCatalogueWarehouseAction());

        this.initForm();

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);

        this.ports = this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR });
        this.warehouses = this._store.select(getCatalogueWarehouseState);

        this.saleMans = this._systemRepo.getListSystemUser();

        this.isLoadingPort = this._store.select(getCataloguePortLoadingState);

        this.currencies = this._catalogueRepo.getCurrencyBy({ active: true }).pipe(
            map((currencies: Currency[]) => this.utility.prepareNg2SelectData(currencies, 'id', 'id')),
            tap((currencies: CommonInterface.INg2Select[]) => {
                // * Set Default.
                this.currencyId.setValue([currencies.find(currency => currency.id === 'USD')]);
            })
        );



        if (this.isUpdate) {
            this._store.select(getDetailHBlState)
                .pipe(takeUntil(this.ngUnsubscribe))
                .subscribe(
                    (hbl: HouseBill) => {
                        if (!!hbl && hbl.id && hbl.id !== SystemConstants.EMPTY_GUID) {
                            // this.totalCBM = hbl.cbm;
                            // this.totalHeightWeight = hbl.hw;
                            this.jobId = hbl.jobId;
                            this.hblId = hbl.id;
                            this.hwconstant = hbl.hwConstant;

                            this.updateFormValue(hbl);
                        }
                    });

            this._store.select(getDimensionVolumesState)
                .pipe(
                    takeUntil(this.ngUnsubscribe),
                    map((dims: DIM[]) => dims.map(d => new DIM(d))),
                )
                .subscribe(
                    (dims: DIM[]) => {
                        this.dims = dims;
                        // * Update dimension Form Array.
                        this.formCreate.setControl('dimensionDetails', this.setDimensionDetails(this.dims));

                        this.updateHeightWeight(this.dims);
                        this.formCreate.get('dimensionDetails')
                            .valueChanges
                            .pipe(
                                // debounceTime(500),
                                // distinctUntilChanged(),
                            )
                            .subscribe(changes => {
                                this.updateHeightWeight(changes);
                            });
                    });

        } else {
            const claim = localStorage.getItem(SystemConstants.USER_CLAIMS);
            const currenctUser = JSON.parse(claim)["officeId"];
            this.getDetailOffice(currenctUser);
            // * get detail shipment from store.
            this._store.select(getTransactionDetailCsTransactionState)
                .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1))
                .subscribe(
                    (shipment: CsTransaction) => {
                        // * set default value for controls from shipment detail.
                        if (shipment && shipment.id !== SystemConstants.EMPTY_GUID) {
                            this.shipmentDetail = new CsTransaction(shipment);
                            this.jobId = this.shipmentDetail.id;
                            this.hwconstant = this.shipmentDetail.hwConstant;
                            this.formCreate.patchValue({
                                mawb: shipment.mawb,
                                pod: shipment.pod,
                                pol: shipment.pol,
                                etd: !!shipment.etd ? { startDate: new Date(shipment.etd), endDate: new Date(shipment.etd) } : null,
                                eta: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                                flightDate: !!shipment.flightDate ? { startDate: new Date(shipment.flightDate), endDate: new Date(shipment.flightDate) } : null,
                                flightNo: shipment.flightVesselName,
                                warehouseId: shipment.warehouseId,
                                firstCarrierBy: shipment.flightVesselName
                            });
                        }
                    }
                );
        }
    }

    initForm() {
        this.formCreate = this._fb.group({
            mawb: [null, Validators.required],
            hwbno: [null, Validators.required],
            consigneeDescription: [],
            shipperDescription: [],
            forwardingAgentDescription: [],
            pickupPlace: [],
            firstCarrierBy: [],
            firstCarrierTo: [],
            transitPlaceTo1: [],
            transitPlaceBy1: [],
            transitPlaceTo2: [],
            transitPlaceBy2: [],
            flightNo: [],
            issuranceAmount: [],
            chgs: [],
            dclrca: ['NVD'],
            dclrcus: ['NCV'],
            handingInformation: [],
            notify: [],
            issueHblplace: [],
            wtpp: [],
            valpp: [],
            taxpp: [],
            dueAgentPp: [],
            dueCarrierPp: [],
            totalPp: [],
            wtcll: [],
            valcll: [],
            taxcll: [],
            dueAgentCll: [],
            dueCarrierCll: [],
            totalCll: [],
            shippingMark: [],
            issuedBy: [{ value: null, disabled: true }],
            sci: [],
            currConvertRate: [],
            ccchargeInDrc: [],
            desOfGoods: [],
            otherCharge: [],
            packageQty: [],
            grossWeight: [],
            kgIb: [],
            rclass: [],
            comItemNo: [],
            chargeWeight: [],
            rateCharge: [],
            total: [{ value: null, disabled: true }],
            seaAir: [],
            route: [],
            min: [false],
            showDim: [true],
            // * Combogrid
            customerId: [null, Validators.required],
            saleManId: [null, Validators.required],
            shipperId: [null, Validators.required],
            consigneeId: [],
            forwardingAgentId: [],
            pol: [],
            pod: [],
            warehouseId: [],

            // * Select
            hbltype: [],
            freightPayment: [],
            currencyId: [],
            originBlnumber: [],
            wtorValpayment: [],
            otherPayment: [],

            // * Date
            etd: [],
            eta: [],
            flightDate: [],
            issueHbldate: [{ startDate: new Date(), endDate: new Date() }],

            // * Array
            dimensionDetails: this._fb.array([])

        },
            { validator: FormValidators.compareGW_CW }
        );

        this.hwbno = this.formCreate.controls["hwbno"];
        this.mawb = this.formCreate.controls["mawb"];
        this.customerId = this.formCreate.controls["customerId"];
        this.saleManId = this.formCreate.controls["saleManId"];
        this.shipperId = this.formCreate.controls["shipperId"];
        this.consigneeId = this.formCreate.controls["consigneeId"];
        this.forwardingAgentId = this.formCreate.controls["forwardingAgentId"];
        this.pol = this.formCreate.controls["pol"];
        this.pod = this.formCreate.controls["pod"];
        this.hbltype = this.formCreate.controls["hbltype"];
        this.freightPayment = this.formCreate.controls["freightPayment"];
        this.currencyId = this.formCreate.controls["currencyId"];
        this.originBlnumber = this.formCreate.controls["originBlnumber"];
        this.wtorValpayment = this.formCreate.controls["wtorValpayment"];
        this.otherPayment = this.formCreate.controls["otherPayment"];
        this.etd = this.formCreate.controls["etd"];
        this.eta = this.formCreate.controls["eta"];
        this.flightDate = this.formCreate.controls["flightDate"];
        this.issueHbldate = this.formCreate.controls["issueHbldate"];
        this.shipperDescription = this.formCreate.controls["shipperDescription"];
        this.consigneeDescription = this.formCreate.controls["consigneeDescription"];
        this.forwardingAgentDescription = this.formCreate.controls["forwardingAgentDescription"];
        this.dimensionDetails = <FormArray>this.formCreate.controls["dimensionDetails"];
        this.issueHblplace = this.formCreate.controls["issueHblplace"];
        this.formCreate.get('dimensionDetails')
            .valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
            )
            .subscribe(changes => {
                this.updateHeightWeight(changes);
            });

        this.onWTVALChange();
        this.otherPaymentChange();
        this.onRateChargeChange();
        this.onChargeWeightChange();
        this.onSeaAirChange();
    }

    updateFormValue(data: HouseBill) {
        const formValue = {
            issueHbldate: !!data.issueHbldate ? { startDate: new Date(data.issueHbldate), endDate: new Date(data.issueHbldate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : new Date(),

            hbltype: !!data.hbltype ? [(this.billTypes || []).find(type => type.id === data.hbltype)] : null,
            freightPayment: !!data.freightPayment ? [(this.termTypes || []).find(type => type.id === data.freightPayment)] : null,
            originBlnumber: data.originBlnumber !== null ? [(this.numberOBLs || []).find(type => +type.id === data.originBlnumber)] : null,
            wtorValpayment: !!data.wtorValpayment ? [(this.wts || []).find(type => type.id === data.wtorValpayment)] : null,
            otherPayment: !!data.otherPayment ? [(this.wts || []).find(type => type.id === data.otherPayment)] : null,
            currencyId: !!data.currencyId ? [{ id: data.currencyId, text: data.currencyId }] : null,
            flightNo: !!data.flightNo ? data.flightNo : null,
            dimensionDetails: []

        };
        this.formCreate.patchValue(_merge(_cloneDeep(data), formValue));
    }

    setDimensionDetails(dims: DIM[]): FormArray {
        const formArray: FormArray = new FormArray([]);
        dims.forEach((d: DIM) => {
            formArray.push(this._fb.group(d));
        });
        return formArray;
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.customerId.setValue(data.id);
                this.selectedCustomer = data;

                this._catalogueRepo.getSalemanIdByPartnerId(data.id).subscribe((res: any) => {
                    if (!!res) {
                        this.saleManId.setValue(res);
                    } else {
                        this.saleMans = this.saleMans.pipe(
                            tap((users: User[]) => {
                                const user: User = users.find((u: User) => u.id === data.salePersonId);
                                if (!!user) {
                                    this.saleManId.setValue(user.id);
                                }
                            })
                        );
                    }
                });
                if (!this.shipperId.value) {
                    this.shipperId.setValue(data.id);
                    this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                }
                break;
            case 'shipper':
                this.shipperId.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'consignee':
                this.consigneeId.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'agent':
                this.forwardingAgentId.setValue(data.id);
                this.forwardingAgentDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'sale':
                this.saleManId.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            default:
                break;
        }
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
        // return `${fullName} \n${address} \nTel No: ${!!tel ? tel : ''} \nFax No: ${!!fax ? fax : ''} \n`;
        return strDescription;
    }

    getDetailOffice(id: string) {
        this._systemRepo.getLocationOfficeById(id)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this.issueHblplace.setValue(res.data);
                    }
                },
            );

    }

    createDIMItem(): FormGroup {
        return this._fb.group(new DIM({
            height: [null, Validators.min(0)],
            width: [null, Validators.min(0)],
            length: [null, Validators.min(0)],
            package: [null, Validators.min(0)],
            hblId: [this.hblId],
        }));
    }

    addDIM() {
        this.selectedIndexDIM = -1;
        (this.formCreate.controls.dimensionDetails as FormArray).push(this.createDIMItem());
        // this.dims.push(new DIM({
        //     mblId: this.jobId,
        //     hblId: this.hblId
        // }));
    }

    deleteDIM(index: number) {
        (this.formCreate.get('dimensionDetails') as FormArray).removeAt(index);
        // this.dims.splice(index, 1);
        this.calculateHWDimension(this.formCreate.get('dimensionDetails').value || []);
    }

    selectDIM(index: number) {
        this.selectedIndexDIM = index;
    }

    updateHeightWeight(dims: DIM[] = []) {
        if (!!dims.length) {
            dims.forEach(dimItem => {
                dimItem.hw = this.utility.calculateHeightWeight(dimItem.width || 0, dimItem.height || 0, dimItem.length || 0, dimItem.package || 0, this.hwconstant || 6000);
                dimItem.cbm = this.utility.calculateCBM(dimItem.width || 0, dimItem.height || 0, dimItem.length || 0, dimItem.package || 0, this.hwconstant || 6000);
            });
            this.totalHeightWeight = this.updateTotalHeightWeight(dims);
            this.totalCBM = this.updateCBM(dims);
        }
    }

    calculateHWDimension(dims: DIM[]) {
        if (!!dims.length) {
            // for (const item of dims) {
            this.updateHeightWeight(dims);
            // }
        } else {
            this.totalCBM = this.totalHeightWeight = 0;
        }
    }

    updateTotalHeightWeight(dims: DIM[]) {
        return +dims.reduce((acc: number, curr: DIM) => acc += curr.hw, 0).toFixed(3);
    }

    updateCBM(dims: DIM[]) {
        return +dims.reduce((acc: number, curr: DIM) => acc += curr.cbm, 0).toFixed(3);
    }

    onWTVALChange() {
        this.wtorValpayment.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: CommonInterface.INg2Select[]) => {
                    if (!!value && !!value.length) {
                        switch (value[0].id) {
                            case 'PP':
                                if (!this.formCreate.controls["wtpp"].value) {
                                    this.formCreate.controls["wtpp"].setValue(this.AA);
                                    this.formCreate.controls["wtcll"].setValue(null);

                                    this.formCreate.controls["totalPp"].setValue(this.AA);
                                    this.formCreate.controls["totalCll"].setValue(null);

                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["wtcll"].value) {
                                    this.formCreate.controls["wtcll"].setValue(this.AA);
                                    this.formCreate.controls["wtpp"].setValue(null);

                                    this.formCreate.controls["totalCll"].setValue(this.AA);
                                    this.formCreate.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {

                        this.formCreate.controls["wtpp"].setValue(null);
                        this.formCreate.controls["wtcll"].setValue(null);
                    }
                }
            );
    }

    otherPaymentChange() {
        this.otherPayment.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: CommonInterface.INg2Select[]) => {
                    if (!!value && !!value.length) {
                        switch (value[0].id) {
                            case 'PP':
                                if (!this.formCreate.controls["dueAgentPp"].value) {
                                    this.formCreate.controls["dueAgentPp"].setValue(this.AA);
                                    this.formCreate.controls["dueAgentCll"].setValue(null);

                                    this.formCreate.controls["totalPp"].setValue(this.AA);
                                    this.formCreate.controls["totalCll"].setValue(null);
                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["dueAgentCll"].value) {
                                    this.formCreate.controls["dueAgentCll"].setValue(this.AA);
                                    this.formCreate.controls["dueAgentPp"].setValue(null);

                                    this.formCreate.controls["totalCll"].setValue(this.AA);
                                    this.formCreate.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {
                        this.formCreate.controls["dueAgentPp"].setValue(null);
                        this.formCreate.controls["dueAgentCll"].setValue(null);
                    }
                }
            );
    }

    onRateChargeChange() {
        this.formCreate.controls['rateCharge'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    this.formCreate.controls['total'].setValue(value * this.formCreate.controls['chargeWeight'].value - this.formCreate.controls['seaAir'].value);
                }
            );
    }

    onChargeWeightChange() {
        this.formCreate.controls['chargeWeight'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    this.formCreate.controls['total'].setValue(value * this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
                }
            );
    }

    onSeaAirChange() {
        this.formCreate.controls['seaAir'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    if (!this.formCreate.controls['min'].value) {
                        this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value * this.formCreate.controls['chargeWeight'].value - value);
                    } else {
                        this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
                    }
                }
            );
    }

    onChangeMin(value: any) {
        if (value.target.checked) {
            this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value - this.formCreate.controls['seaAir'].value);
        } else {
            this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value * this.formCreate.controls['chargeWeight'].value - this.formCreate.controls['seaAir'].value);
        }
    }

    showOtherChargePopup() {
        if (!this.isUpdate && !this.isUpdateOtherCharge) {
            this._store.dispatch(new InitShipmentOtherChargeAction([new CsOtherCharge(), new CsOtherCharge(), new CsOtherCharge()]));  // * default = 3
        }
        this.otherChargePopup.show();
    }

    updateOtherCharge(otherCharges: CsOtherCharge[]) {
        this.isUpdateOtherCharge = true;
        let text: string = '';
        otherCharges.forEach((i: CsOtherCharge) => {
            text += `${i.chargeName}: ${i.amount} \n`;
        });

        this.formCreate.controls["otherCharge"].setValue(text);
        this.otherCharges = otherCharges;
    }
}
