import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';

import { Customer, User, PortIndex, Currency, CsTransaction, DIM, HouseBill } from '@models';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { CommonEnum } from '@enums';

import { AppForm } from 'src/app/app.form';
import { CountryModel } from 'src/app/shared/models/catalogue/country.model';

import { map, tap, takeUntil, catchError, skip, mergeMap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { IShareBussinessState, getTransactionDetailCsTransactionState, getDetailHBlState, getDimensionVolumesState } from 'src/app/business-modules/share-business/store';
import { SystemConstants } from 'src/constants/system.const';
import _isEqual from 'lodash/isEqual';
import _merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
@Component({
    selector: 'air-export-hbl-form-create',
    templateUrl: './form-create-house-bill-air-export.component.html',
    styleUrls: ['./form-create-house-bill-air-export.component.scss']
})
export class AirExportHBLFormCreateComponent extends AppForm implements OnInit {
    @Input() isUpdate: boolean = false;

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

    customers: Observable<Customer[]>;
    saleMans: Observable<User[]>;
    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    countries: Observable<CountryModel[]>;
    ports: Observable<PortIndex[]>;
    agents: Observable<Customer[]>;
    currencies: Observable<CommonInterface.INg2Select[]>;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'partnerNameEn', label: 'Name ABBR' },
        { field: 'partnerNameVn', label: 'Name EN' },
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
        { id: 'Collect', text: 'Collect' }
    ];
    wts: CommonInterface.INg2Select[] = [
        { id: 'PP', text: 'PP' },
        { id: 'CLL', text: 'CLL' }
    ];
    numberOBLs: CommonInterface.INg2Select[] = [
        { id: 0, text: 'Zero (0)' },
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

    AA: string = 'As Arranged';

    dims: DIM[] = []; // * Dimension details.

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _store: Store<IShareBussinessState>
    ) {
        super();
    }

    ngOnInit(): void {
        this.initForm();

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);

        this.ports = this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA });
        this.saleMans = this._systemRepo.getListSystemUser();

        this.currencies = this._catalogueRepo.getCurrencyBy({ active: true }).pipe(
            map((currencies: Currency[]) => this.utility.prepareNg2SelectData(currencies, 'id', 'id')),
            tap((currencies: CommonInterface.INg2Select[]) => {
                // * Set Default.
                this.currencyId.setValue([currencies.find(currency => currency.id === 'USD')]);
            })
        );

        if (this.isUpdate) {
            this._store.select(getDimensionVolumesState)
                .pipe(
                    takeUntil(this.ngUnsubscribe),
                    map((dims: DIM[]) => dims.map(d => new DIM(d))),
                    tap(
                        (dims: DIM[]) => {
                            this.dims = dims;
                        }
                    ),
                    mergeMap(
                        () => this._store.select(getDetailHBlState)
                    )
                )
                .subscribe(
                    (hbl: HouseBill) => {
                        if (!!hbl && hbl.id !== SystemConstants.EMPTY_GUID) {
                            this.totalCBM = hbl.cbm;
                            this.totalHeightWeight = hbl.hw;
                            this.jobId = hbl.jobId;
                            this.hblId = hbl.id;
                            this.hwconstant = hbl.hwConstant;
                            this.updateFormValue(hbl);
                        }

                    }
                );
        } else {
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
                                flightNo: shipment.flightVesselName
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
            issuedBy: [],
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

            // * Combogrid
            customerId: [null, Validators.required],
            saleManId: [null, Validators.required],
            shipperId: [null, Validators.required],
            consigneeId: [null, Validators.required],
            forwardingAgentId: [null, Validators.required],
            pol: [],
            pod: [],

            // * Select
            hbltype: [null, Validators.required],
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
            // dimensionDetails: this._fb.array([])

        });

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
        // this.dimensionDetails = this.formCreate.controls["dimensionDetails"] as FormArray;

        // this.dimensionDetails.valueChanges
        //     .subscribe((dims: DIM[]) => {
        //         this.calculateHWDimension(dims);
        //     });

        this.onWTVALChange();
        this.otherPaymentChange();
        this.onRateChargeChange();
        this.onChargeWeightChange();
    }

    updateFormValue(data: HouseBill) {
        const formValue = {
            issueHbldate: !!data.issueHbldate ? { startDate: new Date(data.issueHbldate), endDate: new Date(data.issueHbldate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : null,

            hbltype: !!data.hbltype ? [(this.billTypes || []).find(type => type.id === data.hbltype)] : null,
            freightPayment: !!data.freightPayment ? [(this.termTypes || []).find(type => type.id === data.freightPayment)] : null,
            originBlnumber: !!data.originBlnumber ? [(this.numberOBLs || []).find(type => type.id === data.originBlnumber)] : null,
            wtorValpayment: !!data.wtorValpayment ? [(this.wts || []).find(type => type.id === data.wtorValpayment)] : null,
            otherPayment: !!data.otherPayment ? [(this.wts || []).find(type => type.id === data.otherPayment)] : null,
            currencyId: !!data.currencyId ? [{ id: data.currencyId, text: data.currencyId }] : null,
            // dimensionDetails: this.dims

        };
        this.formCreate.patchValue(_merge(cloneDeep(data), formValue));
        // this.formCreate.setControl('dimensionDetails', this._fb.array(this.dims || []));
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.customerId.setValue(data.id);

                this.saleMans = this.saleMans.pipe(
                    tap((users: User[]) => {
                        const user: User = users.find((u: User) => u.id === data.salePersonId);
                        if (!!user) {
                            this.saleManId.setValue(user.id);
                        }
                    })
                );
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
        return `${fullName} \n ${address} \n Tel No: ${!!tel ? tel : ''} \n Fax No: ${!!fax ? fax : ''} \n`;
    }

    createDIMItem(): FormGroup {
        return this._fb.group(new DIM({
            mblId: [this.jobId],
            height: [null, Validators.min(0)],
            width: [null, Validators.min(0)],
            length: [null, Validators.min(0)],
            package: [null, Validators.min(0)],
            hblId: [this.hblId]
        }));
    }

    addDIM() {
        this.selectedIndexDIM = -1;
        // (this.formCreate.controls.dimensionDetails as FormArray).push(this.createDIMItem());
        this.dims.push(new DIM({
            mblId: this.jobId,
            hblId: this.hblId
        }));
    }

    deleteDIM(index: number) {
        // (this.formCreate.get('dimensionDetails') as FormArray).removeAt(index);
        this.dims.splice(index, 1);
        this.calculateHWDimension();
    }

    selectDIM(index: number) {
        this.selectedIndexDIM = index;
    }

    updateHeightWeight(dimItem: DIM) {
        dimItem.hw = this.utility.calculateHeightWeight(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwconstant);
        dimItem.cbm = this.utility.calculateCBM(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwconstant);

        this.totalHeightWeight = this.updateTotalHeightWeight();
        this.totalCBM = this.updateCBM();
    }

    calculateHWDimension() {
        if (!!this.dims.length) {
            for (const item of this.dims) {
                this.updateHeightWeight(item);
            }
        } else {
            this.totalCBM = this.totalHeightWeight = 0;
        }
    }

    updateTotalHeightWeight() {
        return +this.dims.reduce((acc: number, curr: DIM) => acc += curr.hw, 0).toFixed(3);
    }

    updateCBM() {
        return +this.dims.reduce((acc: number, curr: DIM) => acc += curr.cbm, 0).toFixed(3);
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
                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["wtcll"].value) {
                                    this.formCreate.controls["wtcll"].setValue(this.AA);
                                    this.formCreate.controls["wtpp"].setValue(null);
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
                                }
                                break;
                            case 'CLL':
                                if (!this.formCreate.controls["dueAgentCll"].value) {
                                    this.formCreate.controls["dueAgentCll"].setValue(this.AA);
                                    this.formCreate.controls["dueAgentPp"].setValue(null);
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
                    this.formCreate.controls['total'].setValue(value * this.formCreate.controls['chargeWeight'].value);
                }
            );
    }

    onChargeWeightChange() {
        this.formCreate.controls['chargeWeight'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    this.formCreate.controls['total'].setValue(value * this.formCreate.controls['rateCharge'].value);
                }
            );
    }

    onChangeMin(value: any) {
        if (value.target.checked) {
            this.formCreate.controls['total'].setValue(this.formCreate.controls['rateCharge'].value);
        }
    }

}
