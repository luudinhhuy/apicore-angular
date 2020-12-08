import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActivatedRoute, Params } from '@angular/router';

import { CommonEnum } from '@enums';
import { User, Unit, Customer, PortIndex, DIM, CsTransaction, Commodity, Warehouse } from '@models';
import { FormValidators } from '@validators';
import { AppForm } from 'src/app/app.form';
import {
    getCataloguePortLoadingState, getCatalogueCarrierState, getCatalogueCarrierLoadingState, GetCatalogueCarrierAction, getCatalogueAgentState, getCatalogueAgentLoadingState, GetCatalogueAgentAction, GetCatalogueUnitAction, getCatalogueUnitState, GetCatalogueCommodityAction, getCatalogueCommodityState
} from '@store';

import { ShareBusinessDIMVolumePopupComponent } from '../dim-volume/dim-volume.popup';

import * as fromStore from './../../store/index';
import { distinctUntilChanged, takeUntil, skip, share, filter, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SystemConstants } from 'src/constants/system.const';
import { SystemRepo, CatalogueRepo } from '@repositories';
import cloneDeep from 'lodash/cloneDeep';


@Component({
    selector: 'form-create-air',
    templateUrl: './form-create-air.component.html',
    styleUrls: ['./form-create-air.component.scss'],
})

export class ShareBusinessFormCreateAirComponent extends AppForm implements OnInit {

    @Input() type: string = 'import';
    @ViewChild(ShareBusinessDIMVolumePopupComponent, { static: false }) dimVolumePopup: ShareBusinessDIMVolumePopupComponent;

    formGroup: FormGroup;
    etd: AbstractControl;
    eta: AbstractControl;
    mawb: AbstractControl;
    mbltype: AbstractControl;
    shipmentType: AbstractControl;
    personalIncharge: AbstractControl;
    coloaderId: AbstractControl; // * Airline/Coloader
    pol: AbstractControl;
    pod: AbstractControl;
    agentId: AbstractControl;
    warehouseId: AbstractControl;
    paymentTerm: AbstractControl; // * Payment Method
    serviceDate: AbstractControl;
    flightDate: AbstractControl;
    commodity: AbstractControl;
    packageType: AbstractControl;

    shipmentTypes: CommonInterface.INg2Select[] = [
        { id: 'Freehand', text: 'Freehand' },
        { id: 'Nominated', text: 'Nominated' }
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

    carries: Customer[];
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    units: CommonInterface.INg2Select[];
    commodities: CommonInterface.INg2Select[];
    listUsers: Observable<User[]>;
    warehouses: Warehouse[];
    initWarehouses: Warehouse[];
    initCarriers: Customer[];

    displayFieldsSupplier: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name Abbr' },
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

    userLogged: User;
    minDateETA: any;

    dimensionDetails: DIM[] = [];

    shipmentDetail: CsTransaction = new CsTransaction();

    isUpdate: boolean = false;

    isLoadingAgent: Observable<boolean>;
    isLoadingAirline: Observable<boolean>;
    isLoadingPort: Observable<boolean>;
    isUpdateDIM: boolean = false;


    constructor(
        private _fb: FormBuilder,
        private _store: Store<fromStore.IShareBussinessState>,
        private _route: ActivatedRoute,
        private _actionSubject: ActionsSubject,
        private _systemRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo

    ) {
        super();

        this._actionSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromStore.DimensionActions) => {
                    if (action.type === fromStore.DimensionActionTypes.GET_DIMENSION_SUCESS) {
                        this.dimensionDetails = action.payload;
                    }
                }
            );
    }

    ngOnInit() {
        // this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
        this._store.dispatch(new GetCatalogueCarrierAction());
        this._store.dispatch(new GetCatalogueAgentAction({ active: true }));

        this._store.dispatch(new GetCatalogueUnitAction({ active: true }));
        this._store.dispatch(new GetCatalogueCommodityAction({ active: true }));

        this.isLoadingPort = this._store.select(getCataloguePortLoadingState).pipe(
            takeUntil(this.ngUnsubscribe)
        );

        this.isLoadingAirline = this._store.select(getCatalogueCarrierLoadingState).pipe(
            takeUntil(this.ngUnsubscribe)
        );

        this.isLoadingAgent = this._store.select(getCatalogueAgentLoadingState).pipe(
            takeUntil(this.ngUnsubscribe)
        );

        this.listUsers = this._systemRepo.getSystemUsers();
        this.ports = this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR });
        this._catalogueRepo.getPlace({ active: true, placeType: CommonEnum.PlaceTypeEnum.Warehouse }).subscribe(
            (res: Warehouse[]) => {
                if (!!res) {
                    this.warehouses = (res || []).map(w => new Warehouse(w));
                    this.initWarehouses = cloneDeep(this.warehouses);
                }
            }
        );

        this.getUserLogged();
        this.initForm();
        this.getCarriers();
        this.getAgents();
        this.getUnits();
        this.getCommodities();

        this._store.select(fromStore.getTransactionDetailCsTransactionState)
            .pipe(skip(1), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: CsTransaction) => {
                    if (!!res) {
                        this.shipmentDetail = new CsTransaction(res);
                        this.dimVolumePopup.jobId = this.shipmentDetail.id;

                        this._route.queryParams.subscribe((param: Params) => {
                            if (param.action === 'copy') {
                                res.jobNo = null;
                                res.etd = null;
                                res.mawb = null;
                                res.eta = null;
                            }
                        });
                        try {
                            const formData: any = {
                                etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null,
                                eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null,
                                flightDate: !!res.flightDate ? { startDate: new Date(res.flightDate), endDate: new Date(res.flightDate) } : null,
                                serviceDate: !!res.serviceDate ? { startDate: new Date(res.serviceDate), endDate: new Date(res.serviceDate) } : null,

                                mbltype: !!res.mbltype ? [this.billTypes.find(type => type.id === res.mbltype)] : null,
                                paymentTerm: !!res.paymentTerm ? [this.termTypes.find(type => type.id === res.paymentTerm)] : null,
                                shipmentType: !!res.shipmentType ? [this.shipmentTypes.find(type => type.id === res.shipmentType)] : null,

                                pol: res.pol,
                                pod: res.pod,
                                agentId: res.agentId,
                                coloaderId: res.coloaderId,
                                warehouseId: res.warehouseId,

                                mawb: res.mawb,
                                jobNo: res.jobNo,
                                flightVesselName: res.flightVesselName,
                                notes: res.notes,
                                hw: res.hw,
                                cbm: res.cbm,
                                grossWeight: res.grossWeight,
                                chargeWeight: res.chargeWeight,
                                packageQty: res.packageQty,
                                issuedBy: res.issuedBy,
                                route: res.route,
                                personIncharge: res.personIncharge

                                // commodity: 
                            };
                            this.formGroup.patchValue(formData);

                            if (!!res.packageType) {
                                this.formGroup.patchValue({ packageType: [this.units.find(u => u.id === +res.packageType)] });
                            }
                            // if (!!this.formGroup.value.etd) {
                            //     this.minDateETA = this.createMoment(new Date(res.etd));
                            // }

                            // * Update commodity
                            const commodities: CommonInterface.INg2Select[] =
                                (res.commodity || '').split(',').map((i: string) => <CommonInterface.INg2Select>({
                                    id: i,
                                    text: i,
                                }));

                            const commoditiesTemp = [];
                            commodities.forEach((commodity: CommonInterface.INg2Select) => {
                                const dataTempInPackages = (this.commodities || []).find((t: CommonInterface.INg2Select) => t.id === commodity.id);
                                if (!!dataTempInPackages) {
                                    commoditiesTemp.push(dataTempInPackages);
                                }
                            });
                            // * Update Form
                            this.formGroup.patchValue({ commodity: commoditiesTemp });

                        } catch (error) {
                            console.log(error + '');
                        } finally {
                        }
                    }
                }
            );
    }

    getUnits() {
        this._store.select(getCatalogueUnitState).subscribe(
            ((units: Unit[]) => {
                this.units = this.utility.prepareNg2SelectData(units, 'id', 'code');
            }),
        );
    }

    getCommodities() {
        this._store.select(getCatalogueCommodityState)
            .subscribe(
                (commodities: Commodity[]) => {
                    this.commodities = this.utility.prepareNg2SelectData(commodities, 'code', 'commodityNameEn');
                },
            );
    }

    initForm() {
        this.formGroup = this._fb.group({
            jobNo: [{ value: null, disabled: true }],
            personIncharge: [{ value: this.userLogged.id, disabled: true }],
            notes: [],
            mawb: ['', Validators.compose([
                Validators.required,
                Validators.maxLength(15),
                Validators.minLength(11),
            ])],
            flightVesselName: [],
            packageQty: [null, Validators.compose([
                Validators.min(0)
            ])],
            cbm: [null, Validators.compose([
                Validators.min(0)
            ])],
            grossWeight: [null, Validators.compose([
                Validators.min(0)
            ])],
            chargeWeight: [null, Validators.compose([
                Validators.min(0)
            ])],
            hw: [null, Validators.compose([
                Validators.min(0)
            ])],
            issuedBy: [],
            route: [],

            // * Date
            etd: [null, this.type !== 'import' ? Validators.required : null],
            eta: [null, this.type === 'import' ? Validators.required : null],
            serviceDate: [],
            flightDate: [],

            // * select
            mbltype: [],
            shipmentType: [[this.shipmentTypes[0]], Validators.required],
            paymentTerm: [],
            commodity: [],
            packageType: [],

            // * Combogrid.
            agentId: [],
            pol: [null, this.type !== 'import' ? Validators.required : null],
            pod: [null, this.type === 'import' ? Validators.required : null],
            coloaderId: [null, Validators.required],
            warehouseId: [],

        }, { validator: [FormValidators.comparePort, FormValidators.compareETA_ETD] });

        this.mawb = this.formGroup.controls["mawb"];

        this.etd = this.formGroup.controls["etd"];
        this.eta = this.formGroup.controls["eta"];
        this.serviceDate = this.formGroup.controls["serviceDate"];
        this.flightDate = this.formGroup.controls["flightDate"];

        this.mbltype = this.formGroup.controls["mbltype"];
        this.shipmentType = this.formGroup.controls["shipmentType"];
        this.paymentTerm = this.formGroup.controls["paymentTerm"];
        this.commodity = this.formGroup.controls['commodity'];
        this.packageType = this.formGroup.controls['packageType'];

        this.coloaderId = this.formGroup.controls["coloaderId"];
        this.pol = this.formGroup.controls["pol"];
        this.pod = this.formGroup.controls["pod"];
        this.agentId = this.formGroup.controls["agentId"];
        this.warehouseId = this.formGroup.controls["warehouseId"];


        // * Handle etdchange.
        if (this.type !== 'import') {
            this.formGroup.controls['etd'].valueChanges
                .pipe(
                    distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                    takeUntil(this.ngUnsubscribe)
                )
                .subscribe((value: { startDate: any, endDate: any }) => {
                    if (!!value.startDate) {
                        // * serviceDate hadn't value
                        if (!this.formGroup.controls["serviceDate"].value || !this.formGroup.controls["serviceDate"].value.startDate) {
                            this.formGroup.controls["serviceDate"].setValue(value);
                        }
                    }
                });
        } else {
            this.formGroup.controls['eta'].valueChanges
                .pipe(
                    distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                    takeUntil(this.ngUnsubscribe)
                )
                .subscribe((value: { startDate: any, endDate: any }) => {
                    if (!!value.startDate) {
                        // * serviceDate hadn't value
                        if (!this.formGroup.controls["serviceDate"].value || !this.formGroup.controls["serviceDate"].value.startDate) {
                            this.formGroup.controls["serviceDate"].setValue(value);
                        }
                    }
                });
        }

    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    getCarriers() {
        this._store.select(getCatalogueCarrierState).pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(
            (result) => {
                this.carries = result;
                this.initCarriers = cloneDeep(result);
            });
    }

    getAgents() {
        this.agents = this._store.select(getCatalogueAgentState).pipe(
            takeUntil(this.ngUnsubscribe)
        );
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'supplier':
                this.coloaderId.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'agent':
                this.agentId.setValue(data.id);
                break;
            case 'warehouse':
                this.warehouseId.setValue(data.id);
                break;
            default:
                break;
        }
    }

    showDIMVolume() {
        if (!this.isUpdate && !this.isUpdateDIM) {
            this._store.dispatch(new fromStore.InitDimensionAction([new DIM(), new DIM(), new DIM()]));  // * Dimension default = 3
            this.dimVolumePopup.isShowGetFromHAWB = false;
        }
        this.dimVolumePopup.show();
    }

    onUpdateDIM(dims: DIM[]) {
        this.isUpdateDIM = true;
        this.dimensionDetails = dims;
        if (!!this.dimensionDetails.length) {
            const hw: number = this.dimensionDetails.reduce((acc: number, item: DIM) => acc += item.hw, 0);
            this.formGroup.patchValue({ hw });

            if (this.dimVolumePopup.isCBMChecked) {
                this.formGroup.patchValue({ cbm: this.dimVolumePopup.totalCBM });
            }
        } else {
            this.formGroup.patchValue({ hw: null });

        }
    }

    onBlurGetWarehouseFlightNo(data: any) {
        if (!!data.target.value) {
            const flightVesselNo: string = data.target.value.substring(0, 2);
            if (!!flightVesselNo) {
                this._catalogueRepo.getPlace({ active: true, placeType: CommonEnum.PlaceTypeEnum.Warehouse, flightVesselNo: flightVesselNo })
                    .subscribe(
                        (res: Warehouse[]) => {
                            if (res.length > 0) {
                                this.warehouseId.setValue(res[0].id);
                            }
                        }
                    );
            }

        }
    }

    onBlurGetAirline(data: any) {
        const hawb: string = data.target.value.substring(0, 3);
        if (this.mawb.valid && !!hawb) {
            this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.CARRIER, active: true, CoLoaderCode: hawb })
                .subscribe(
                    (res: Customer[]) => {
                        if (!!res && res.length > 0) {

                            this.coloaderId.setValue(res[0].id);
                        }
                    }
                );
        }

    }
}
