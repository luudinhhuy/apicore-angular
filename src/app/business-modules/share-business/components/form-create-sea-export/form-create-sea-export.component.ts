import { Component, OnInit } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Params } from '@angular/router';

import { AppForm } from 'src/app/app.form';
import { Customer } from 'src/app/shared/models/catalogue/customer.model';
import { DocumentationRepo, SystemRepo } from 'src/app/shared/repositories';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { PortIndex } from 'src/app/shared/models/catalogue/port-index.model';
import { User, CsTransactionDetail } from 'src/app/shared/models';

import { takeUntil, skip, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

import * as fromShare from './../../../share-business/store';
import { GetCatalogueAgentAction, GetCatalogueCarrierAction, getCatalogueCarrierState, getCatalogueAgentState, GetCataloguePortAction, getCataloguePortState, getCatalogueCarrierLoadingState, getCatalogueAgentLoadingState, getCataloguePortLoadingState } from '@store';
import { SystemConstants } from 'src/constants/system.const';
import { FormValidators } from '@validators';

@Component({
    selector: 'form-create-sea-export',
    templateUrl: './form-create-sea-export.component.html'
})

export class ShareBussinessFormCreateSeaExportComponent extends AppForm implements OnInit {

    formGroup: FormGroup;
    etd: AbstractControl;
    eta: AbstractControl;
    mawb: AbstractControl;
    mbltype: AbstractControl;
    shipmentType: AbstractControl;
    typeOfService: AbstractControl;
    personalIncharge: AbstractControl;
    term: AbstractControl;
    serviceDate: AbstractControl;

    coloader: AbstractControl; // Supplier/Vendor(Coloader).
    pol: AbstractControl;
    pod: AbstractControl;
    agent: AbstractControl;
    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    listUsers: Observable<User[]>;


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

    serviceTypes: CommonInterface.INg2Select[] = [];

    ladingTypes: CommonInterface.INg2Select[] = [
        { id: 'Copy', text: 'Copy' },
        { id: 'Original', text: 'Original' },
        { id: 'Sea Waybill', text: 'Sea Waybill' },
        { id: 'Surrendered', text: 'Surrendered' },
    ];
    shipmentTypes: CommonInterface.INg2Select[] = [
        { id: 'Freehand', text: 'Freehand' },
        { id: 'Nominated', text: 'Nominated' }
    ];
    termTypes: CommonInterface.INg2Select[] = [
        { id: "Collect", text: "Collect" },
        { id: "Prepaid", text: "Prepaid" }
    ];

    userLogged: User;
    isLoadingPort: Observable<boolean>;
    isLoadingAgent: Observable<boolean>;
    isLoadingCarrier: Observable<boolean>;

    constructor(
        private _documentRepo: DocumentationRepo,
        private _fb: FormBuilder,
        private _store: Store<fromShare.IShareBussinessState>,
        private _route: ActivatedRoute,
        private _systemRepo: SystemRepo

    ) {
        super();
    }

    ngOnInit() {
        this.initForm();

        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueCarrierAction(CommonEnum.PartnerGroupEnum.CARRIER));
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));

        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.ports = this._store.select(getCataloguePortState);
        this.listUsers = this._systemRepo.getListSystemUser();

        this.isLoadingPort = this._store.select(getCataloguePortLoadingState);
        this.isLoadingAgent = this._store.select(getCatalogueAgentLoadingState);
        this.isLoadingCarrier = this._store.select(getCatalogueCarrierLoadingState);


        this.getUserLogged();
        this.getServices();

        // * Subscribe state to update form.
        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), skip(1))
            .subscribe(
                (res: CsTransactionDetail | any) => {
                    if (!!res) {
                        try {

                            this._route.queryParams.subscribe((param: Params) => {
                                if (param.action === 'copy') {
                                    res.jobNo = null;
                                    res.etd = null;
                                    res.mawb = null;
                                    res.eta = null;
                                }
                            });
                            this.formGroup.setValue({
                                jobID: res.jobNo,
                                etd: !!res.etd ? { startDate: new Date(res.etd), endDate: new Date(res.etd) } : null,
                                eta: !!res.eta ? { startDate: new Date(res.eta), endDate: new Date(res.eta) } : null,
                                serviceDate: !!res.serviceDate ? { startDate: new Date(res.serviceDate), endDate: new Date(res.serviceDate) } : null,


                                mbltype: !!res.mbltype ? [this.ladingTypes.find(type => type.id === res.mbltype)] : null,
                                typeOfService: !!res.typeOfService ? [{ id: res.typeOfService, text: res.typeOfService }] : null,
                                term: !!res.shipmentType ? [this.termTypes.find(type => type.id === res.paymentTerm)] : null,
                                shipmentType: !!res.shipmentType ? [this.shipmentTypes.find(type => type.id === res.shipmentType)] : null,

                                coloader: res.coloaderId,
                                bookingNo: res.bookingNo,
                                pol: res.pol,
                                pod: res.pod,
                                agent: res.agentId,
                                flightVesselName: res.flightVesselName,
                                voyNo: res.voyNo,
                                mawb: res.mawb,

                                personalIncharge: res.personIncharge,
                                notes: res.notes,
                                pono: res.pono
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            );
    }

    initForm() {
        this.formGroup = this._fb.group({
            jobID: [{ value: null, disabled: true }], // * disabled

            etd: [null, Validators.required], // * Date
            eta: [], // * Date
            serviceDate: [],

            mawb: [],
            voyNo: [],
            flightVesselName: [],
            pono: [],
            notes: [],
            term: [[this.termTypes[1]]],
            bookingNo: [],

            coloader: [null, Validators.required],
            pol: [null, Validators.required],
            pod: [],
            agent: [],

            mbltype: [], // * select
            shipmentType: [[this.shipmentTypes[0]]], // * select
            typeOfService: [], // * select
            personalIncharge: [],  // * select
        }, { validator: [FormValidators.comparePort, FormValidators.compareETA_ETD] });

        this.etd = this.formGroup.controls["etd"];
        this.eta = this.formGroup.controls["eta"];
        this.mawb = this.formGroup.controls["mawb"];
        this.mbltype = this.formGroup.controls["mbltype"];
        this.shipmentType = this.formGroup.controls["shipmentType"];
        this.typeOfService = this.formGroup.controls["typeOfService"];
        this.term = this.formGroup.controls["term"];
        this.personalIncharge = this.formGroup.controls["personalIncharge"];
        this.serviceDate = this.formGroup.controls["serviceDate"];


        this.coloader = this.formGroup.controls["coloader"];
        this.pol = this.formGroup.controls["pol"];
        this.pod = this.formGroup.controls["pod"];
        this.agent = this.formGroup.controls["agent"];

        this.formGroup.controls['etd'].valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((value: { startDate: any, endDate: any }) => {
                if (!!value.startDate) {

                    this.isSubmitted = false;
                    // this.resetFormControl(this.formGroup.controls["eta"]);
                    // * serviceDate hadn't value

                    if (!this.formGroup.controls["serviceDate"].value || !this.formGroup.controls["serviceDate"].value.startDate) {
                        this.formGroup.controls["serviceDate"].setValue(value);
                    }
                } else {
                    this.formGroup.controls["serviceDate"].setValue(null);
                }
            });
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.personalIncharge.setValue(this.userLogged.id);
        this.personalIncharge.disable();
    }

    getServices() {
        this._documentRepo.getShipmentDataCommon().subscribe(
            (commonData: any) => {
                this.serviceTypes = this.utility.prepareNg2SelectData(commonData.serviceTypes, 'value', 'displayName');
            }
        );
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'supplier':
                this.coloader.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'agent':
                this.agent.setValue(data.id);
                break;
            default:
                break;
        }
    }
}



