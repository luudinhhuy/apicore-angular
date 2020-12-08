import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { Store } from '@ngrx/store';
import { IAppState, getCataloguePortState, GetCataloguePortAction } from '@store';
import { getTransactionLocked, getTransactionPermission, ShareBusinessDIMVolumePopupComponent, GetDimensionAction, GetShipmentOtherChargeAction, getOtherChargeState, getDimensionVolumesState, GetShipmentOtherChargeSuccessAction, GetDimensionSuccessAction, getTransactionDetailCsTransactionState, TransactionGetDetailAction, } from '@share-bussiness';
import { FormGroup, AbstractControl, Validators, FormBuilder, } from '@angular/forms';
import { CommonEnum } from '@enums';
import { CatalogueRepo, DocumentationRepo, ExportRepo } from '@repositories';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Customer, PortIndex, Currency, Warehouse, DIM, CsOtherCharge, AirwayBill, CsTransaction } from '@models';
import { formatDate } from '@angular/common';
import { InfoPopupComponent, } from '@common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { ShareAirExportOtherChargePopupComponent } from '../../share/other-charge/air-export-other-charge.popup';
import { SystemConstants } from 'src/constants/system.const';

import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/clone';
import { Observable, throwError } from 'rxjs';
import { map, tap, takeUntil, catchError, finalize, skip, switchMap } from 'rxjs/operators';
import isUUID from 'validator/lib/isUUID';

@Component({
    selector: 'app-air-export-mawb',
    templateUrl: './air-export-mawb.component.html',
    styleUrls: ['./air-export-mawb.component.scss']
})

export class AirExportMAWBFormComponent extends AppForm implements OnInit {
    @ViewChild(ShareBusinessDIMVolumePopupComponent, { static: false }) dimVolumePopup: ShareBusinessDIMVolumePopupComponent;
    @ViewChild(ShareAirExportOtherChargePopupComponent, { static: false }) otherChargePopup: ShareAirExportOtherChargePopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;

    formMAWB: FormGroup;

    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    forwardingAgentId: AbstractControl;
    eta: AbstractControl;
    etd: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    flightDate: AbstractControl;
    freightPayment: AbstractControl;
    currencyId: AbstractControl;
    wtorValpayment: AbstractControl;
    otherPayment: AbstractControl;
    originBlnumber: AbstractControl;
    issuedDate: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    forwardingAgentDescription: AbstractControl;
    hwbno: AbstractControl;
    mawb: AbstractControl;
    issuedPlace: AbstractControl;
    warehouseId: AbstractControl;
    mblno1: AbstractControl;
    mblno2: AbstractControl;
    mblno3: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name ABBR' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    displayFieldWarehouse: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Code' },
        { field: 'nameEn', label: 'Name EN' },
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

    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    currencies: Observable<CommonInterface.INg2Select[]>;
    warehouses: Warehouse[];

    dimensionDetails: DIM[] = [];
    otherCharges: CsOtherCharge[] = [];

    isLoadingPort: any;
    isUpdateDIM: boolean = false;
    isUpdateOtherCharge: boolean = false;


    selectedPrepaid: boolean = false;
    selectedCollect: boolean = false;

    AA: string = 'As Arranged';
    totalHW: number = 0;
    totalCbm: number = 0;

    jobId: string = '';
    airwaybillId: string = '';

    isUpdate: boolean = false;

    constructor(
        private _store: Store<IAppState>,
        private _catalogueRepo: CatalogueRepo,
        private _fb: FormBuilder,
        private _activedRoute: ActivatedRoute,
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _exportRepo: ExportRepo,

    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.isLocked = this._store.select(getTransactionLocked);
        this.permissionShipments = this._store.select(getTransactionPermission);
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
        this.initForm();

        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.agents = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE, CommonEnum.PartnerGroupEnum.AGENT]);
        this.ports = this._store.select(getCataloguePortState);

        this.currencies = this._catalogueRepo.getCurrencyBy({ active: true }).pipe(
            map((currencies: Currency[]) => this.utility.prepareNg2SelectData(currencies, 'id', 'id')),
            tap((currencies: CommonInterface.INg2Select[]) => {
                // * Set Default.
                this.currencyId.setValue([currencies.find(currency => currency.id === 'USD')]);
            })
        );

        this._catalogueRepo.getPlace({ active: true, placeType: CommonEnum.PlaceTypeEnum.Warehouse }).subscribe(
            (res: Warehouse[]) => {
                if (!!res) {
                    this.warehouses = (res || []).map(w => new Warehouse(w));
                }
            }
        );

        this._activedRoute.params
            .pipe(
                switchMap((params) => {
                    if (params.jobId && isUUID(params.jobId)) {
                        this.jobId = params.jobId;
                        return this._documentationRepo.getAirwayBill(this.jobId);
                    } else {
                        return throwError("Not found jobId");
                    }
                })
            )
            .subscribe(
                (res: AirwayBill) => {
                    console.log(res);
                    if (!!res) {
                        console.log("Update airwaybill");
                        this.airwaybillId = res.id;
                        this.isUpdate = true;
                        this.otherCharges = res.otherCharges;
                        this.dimensionDetails = res.dimensionDetails;

                        this._store.dispatch(new GetShipmentOtherChargeSuccessAction(this.otherCharges));
                        this._store.dispatch(new GetDimensionSuccessAction(this.dimensionDetails));
                        this.updateFormValue(res);

                    } else {
                        this._store.dispatch(new TransactionGetDetailAction(this.jobId));
                        console.log("create airwaybill");
                        this.isUpdate = false;
                        this.updateDefaultValue();
                    }
                },
                (err) => {
                    this._router.navigate([`home/documentation/air-export`]);
                });
    }

    updateDefaultValue() {
        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1))
            .subscribe(
                (shipment: CsTransaction) => {
                    console.log(shipment);
                    if (shipment && shipment.id !== SystemConstants.EMPTY_GUID) {

                        this.formMAWB.patchValue({
                            pod: shipment.pod,
                            pol: shipment.pol,
                            etd: !!shipment.etd ? { startDate: new Date(shipment.etd), endDate: new Date(shipment.etd) } : null,
                            eta: !!shipment.eta ? { startDate: new Date(shipment.eta), endDate: new Date(shipment.eta) } : null,
                            flightDate: !!shipment.flightDate ? { startDate: new Date(shipment.flightDate), endDate: new Date(shipment.flightDate) } : null,
                            flightNo: shipment.flightVesselName,
                            freightPayment: !!shipment.paymentTerm ? [{ id: shipment.paymentTerm, text: shipment.paymentTerm }] : null,
                            route: shipment.route,
                            warehouseId: shipment.warehouseId,
                            issuedBy: shipment.issuedBy,
                            mblno1: shipment.coloaderCode,
                            mblno2: shipment.polCode,
                            mblno3: !!shipment.mawb ? shipment.mawb.slice(-7) : null
                        });
                    }
                });

    }

    updateFormValue(data: AirwayBill) {
        const formValue = {
            issuedDate: !!data.issuedDate ? { startDate: new Date(data.issuedDate), endDate: new Date(data.issuedDate) } : null,
            eta: !!data.eta ? { startDate: new Date(data.eta), endDate: new Date(data.eta) } : null,
            etd: !!data.etd ? { startDate: new Date(data.etd), endDate: new Date(data.etd) } : null,
            flightDate: !!data.flightDate ? { startDate: new Date(data.flightDate), endDate: new Date(data.flightDate) } : null,

            freightPayment: !!data.freightPayment ? [(this.termTypes || []).find(type => type.id === data.freightPayment)] : null,
            originBlnumber: data.originBlnumber !== null ? [(this.numberOBLs || []).find(type => +type.id === data.originBlnumber as any)] : null,
            wtorValpayment: !!data.wtorValpayment ? [(this.wts || []).find(type => type.id === data.wtorValpayment)] : null,
            otherPayment: !!data.otherPayment ? [(this.wts || []).find(type => type.id === data.otherPayment)] : null,
            currencyId: !!data.currencyId ? [{ id: data.currencyId, text: data.currencyId }] : null,
            dimensionDetails: []

        };
        this.formMAWB.patchValue(_merge(_cloneDeep(data), formValue));
    }

    initForm() {
        this.formMAWB = this._fb.group({
            mblno1: [null, Validators.required],
            mblno2: [null, Validators.required],
            mblno3: [null, Validators.required],
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
            issuedPlace: [],
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
            volumeField: [],

            // * Combogrid

            shipperId: [],
            consigneeId: [],
            forwardingAgentId: [],
            pol: [],
            pod: [],
            warehouseId: [],

            // * Select
            freightPayment: [],
            currencyId: [],
            originBlnumber: [],
            wtorValpayment: [],
            otherPayment: [],

            // * Date
            etd: [],
            eta: [],
            flightDate: [],
            issuedDate: [{ startDate: new Date(), endDate: new Date() }],
        });

        this.mblno1 = this.formMAWB.controls["mblno1"];
        this.mblno2 = this.formMAWB.controls["mblno2"];
        this.mblno3 = this.formMAWB.controls["mblno3"];
        this.shipperDescription = this.formMAWB.controls["shipperDescription"];
        this.consigneeDescription = this.formMAWB.controls["consigneeDescription"];
        this.forwardingAgentDescription = this.formMAWB.controls["forwardingAgentDescription"];
        this.shipperId = this.formMAWB.controls["shipperId"];
        this.consigneeId = this.formMAWB.controls["consigneeId"];
        this.forwardingAgentId = this.formMAWB.controls["forwardingAgentId"];
        this.eta = this.formMAWB.controls["eta"];
        this.etd = this.formMAWB.controls["etd"];
        this.pol = this.formMAWB.controls["pol"];
        this.pod = this.formMAWB.controls["pod"];
        this.warehouseId = this.formMAWB.controls["warehouseId"];
        this.freightPayment = this.formMAWB.controls["freightPayment"];
        this.currencyId = this.formMAWB.controls["currencyId"];
        this.originBlnumber = this.formMAWB.controls["originBlnumber"];
        this.wtorValpayment = this.formMAWB.controls["wtorValpayment"];
        this.otherPayment = this.formMAWB.controls["otherPayment"];
        this.etd = this.formMAWB.controls["etd"];
        this.eta = this.formMAWB.controls["eta"];
        this.flightDate = this.formMAWB.controls["flightDate"];
        this.issuedDate = this.formMAWB.controls["issuedDate"];

        this.onWTVALChange();
        this.otherPaymentChange();
        this.onRateChargeChange();
        this.onChargeWeightChange();
        this.onSeaAirChange();
    }

    getDataForm() {
        const form: any = this.formMAWB.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            issuedDate: !!form.issuedDate && !!form.issuedDate.startDate ? formatDate(form.issuedDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,

            originBlnumber: !!form.originBlnumber && !!form.originBlnumber.length ? +form.originBlnumber[0].id : null,
            freightPayment: !!form.freightPayment && !!form.freightPayment.length ? form.freightPayment[0].id : null,
            currencyId: !!form.currencyId && !!form.currencyId.length ? form.currencyId[0].id : null,
            wtorValpayment: !!form.wtorValpayment && !!form.wtorValpayment.length ? form.wtorValpayment[0].id : null,
            otherPayment: !!form.otherPayment && !!form.otherPayment.length ? form.otherPayment[0].id : null,

            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            pol: form.pol,
            pod: form.pod,
            forwardingAgentId: form.forwardingAgent,
            warehouseId: form.warehouseId,

            cbm: this.totalCbm,
            hw: this.totalHW,
            min: form.min
        };

        const houseBill = new AirwayBill(_merge(form, formData));
        return houseBill;
    }

    checkValidateForm() {
        let valid: boolean = true;
        [
            this.otherPayment,
            this.originBlnumber,
            this.currencyId,
            this.freightPayment,
            this.wtorValpayment].forEach((control: AbstractControl) => this.setError(control));

        if (!this.formMAWB.valid
            || (!!this.etd.value && !this.etd.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }

    onSaveMAWB() {
        this.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const airwaybill: AirwayBill = this.getDataForm();
        airwaybill.jobId = this.jobId;

        airwaybill.otherCharges = this.otherCharges;

        airwaybill.otherCharges.forEach((c: CsOtherCharge) => {
            c.jobId = this.jobId;
            c.hblId = SystemConstants.EMPTY_GUID;
        });

        airwaybill.dimensionDetails = this.dimensionDetails;
        airwaybill.dimensionDetails.forEach((d: DIM) => {
            d.airWayBillId = this.airwaybillId || SystemConstants.EMPTY_GUID;
            d.mblId = this.jobId;
        });

        console.log(airwaybill);
        if (!!this.isUpdate) {
            this.saveMAWB(airwaybill);
        } else {
            this.createMAWB(airwaybill);
        }

    }

    saveMAWB(body: AirwayBill) {
        body.id = this.airwaybillId;

        this._progressRef.start();
        this._documentationRepo.updateAirwayBill(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');

                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    createMAWB(body: AirwayBill) {
        body.id = SystemConstants.EMPTY_GUID;

        this._progressRef.start();
        this._documentationRepo.createAirwayBill(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');

                    } else {
                        this._toastService.error(res.message, '');
                    }
                }
            );
    }

    onSelectDataFormInfo(data, key: string) {
        switch (key) {
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
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'warehouse':
                this.warehouseId.setValue(data.id);
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
        return strDescription;
    }

    onWTVALChange() {
        this.wtorValpayment.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: CommonInterface.INg2Select[]) => {
                    if (!!value && !!value.length) {
                        switch (value[0].id) {
                            case 'PP':
                                if (!this.formMAWB.controls["wtpp"].value) {
                                    this.formMAWB.controls["wtpp"].setValue(this.AA);
                                    this.formMAWB.controls["wtcll"].setValue(null);

                                    this.formMAWB.controls["totalPp"].setValue(this.AA);
                                    this.formMAWB.controls["totalCll"].setValue(null);

                                }
                                break;
                            case 'CLL':
                                if (!this.formMAWB.controls["wtcll"].value) {
                                    this.formMAWB.controls["wtcll"].setValue(this.AA);
                                    this.formMAWB.controls["wtpp"].setValue(null);

                                    this.formMAWB.controls["totalCll"].setValue(this.AA);
                                    this.formMAWB.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {

                        this.formMAWB.controls["wtpp"].setValue(null);
                        this.formMAWB.controls["wtcll"].setValue(null);
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
                                if (!this.formMAWB.controls["dueAgentPp"].value) {
                                    this.formMAWB.controls["dueAgentPp"].setValue(this.AA);
                                    this.formMAWB.controls["dueAgentCll"].setValue(null);

                                    this.formMAWB.controls["totalPp"].setValue(this.AA);
                                    this.formMAWB.controls["totalCll"].setValue(null);
                                }
                                break;
                            case 'CLL':
                                if (!this.formMAWB.controls["dueAgentCll"].value) {
                                    this.formMAWB.controls["dueAgentCll"].setValue(this.AA);
                                    this.formMAWB.controls["dueAgentPp"].setValue(null);

                                    this.formMAWB.controls["totalCll"].setValue(this.AA);
                                    this.formMAWB.controls["totalPp"].setValue(null);
                                }
                                break;
                        }
                    } else {
                        this.formMAWB.controls["dueAgentPp"].setValue(null);
                        this.formMAWB.controls["dueAgentCll"].setValue(null);
                    }
                }
            );
    }

    onRateChargeChange() {
        this.formMAWB.controls['rateCharge'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    this.formMAWB.controls['total'].setValue(value * this.formMAWB.controls['chargeWeight'].value - this.formMAWB.controls['seaAir'].value);
                }
            );
    }

    onChargeWeightChange() {
        this.formMAWB.controls['chargeWeight'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    this.formMAWB.controls['total'].setValue(value * this.formMAWB.controls['rateCharge'].value - this.formMAWB.controls['seaAir'].value);
                }
            );
    }

    onSeaAirChange() {
        this.formMAWB.controls['seaAir'].valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (value: number) => {
                    if (!this.formMAWB.controls['min'].value) {
                        this.formMAWB.controls['total'].setValue(this.formMAWB.controls['rateCharge'].value * this.formMAWB.controls['chargeWeight'].value - value);
                    } else {
                        this.formMAWB.controls['total'].setValue(this.formMAWB.controls['rateCharge'].value - this.formMAWB.controls['seaAir'].value);
                    }
                }
            );
    }

    onChangeMin(value: any) {
        if (value.target.checked) {
            this.formMAWB.controls['total'].setValue(this.formMAWB.controls['rateCharge'].value - this.formMAWB.controls['seaAir'].value);
        } else {
            this.formMAWB.controls['total'].setValue(this.formMAWB.controls['rateCharge'].value * this.formMAWB.controls['chargeWeight'].value - this.formMAWB.controls['seaAir'].value);
        }
    }

    showOtherChargePopup() {
        this.otherChargePopup.show();
    }

    showVolumePopup() {
        this.dimVolumePopup.show();
    }

    onUpdateDIM(dims: DIM[]) {
        this.isUpdateDIM = true;
        this.dimensionDetails = dims;
        let volumText: string = '';

        if (!!this.dimensionDetails.length) {
            this.totalHW = this.dimensionDetails.reduce((acc: number, item: DIM) => acc += item.hw, 0);
            this.totalCbm = this.dimensionDetails.reduce((acc: number, item: DIM) => acc += item.cbm, 0);
        }

        this.dimensionDetails.forEach(v => {
            volumText += `${v.length}x${v.width}x${v.height}/${v.package}\n`;
        });


        this.formMAWB.controls["volumeField"].setValue(volumText);
    }

    updateOtherCharge(otherCharges: CsOtherCharge[]) {
        this.isUpdateOtherCharge = true;
        let text: string = '';
        otherCharges.forEach((i: CsOtherCharge) => {
            text += `${i.chargeName}: ${i.amount} \n`;
        });

        this.formMAWB.controls["otherCharge"].setValue(text);
        this.otherCharges = otherCharges;
    }

    exportMawb() {
        this._progressRef.start();
        this._exportRepo.exportMawbAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    if (response.byteLength > 0) {
                        this.downLoadFile(response, "application/ms-excel", 'Air Export - MAWB.xlsx');
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportSCSC() {
        this._progressRef.start();
        this._exportRepo.exportSCSCAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    if (response.byteLength > 0) {
                        this.downLoadFile(response, "application/ms-excel", 'Air Export - SCSC.xlsx');
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }

    exportTCS() {
        this._progressRef.start();
        this._exportRepo.exportTCSAirwayBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    if (response.byteLength > 0) {
                        this.downLoadFile(response, "application/ms-excel", 'Air Export - TCS.xlsx');
                    } else {
                        this._toastService.warning('There is no mawb data to print', '');
                    }
                },
            );
    }
}
