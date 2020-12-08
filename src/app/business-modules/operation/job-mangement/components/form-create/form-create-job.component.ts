import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { CatalogueRepo, DocumentationRepo, SystemRepo } from '@repositories';
import { Customer, PortIndex, User } from '@models';
import { IShareBussinessState } from '@share-bussiness';
import { GetCataloguePortAction, getCataloguePortState, GetCatalogueCarrierAction, GetCatalogueAgentAction, getCatalogueCarrierState, getCatalogueAgentState, GetCatalogueCommodityGroupAction, getCatalogueCommodityGroupState } from '@store';
import { CommonEnum } from '@enums';

import { AppForm } from 'src/app/app.form';
import { map, share, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { FormValidators } from '@validators';

@Component({
    selector: 'job-mangement-form-create',
    templateUrl: './form-create-job.component.html'
})

export class JobManagementFormCreateComponent extends AppForm implements OnInit {
    formCreate: FormGroup;

    hwbno: AbstractControl;
    mblno: AbstractControl;
    serviceDate: AbstractControl;
    productService: AbstractControl;
    serviceMode: AbstractControl;
    shipmentMode: AbstractControl;
    customerId: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    supplierId: AbstractControl;
    flightVessel: AbstractControl;
    agentId: AbstractControl;
    purchaseOrderNo: AbstractControl;
    billingOpsId: AbstractControl;
    commodityGroupId: AbstractControl;

    productServices: Observable<CommonInterface.INg2Select[]>;
    serviceModes: Observable<CommonInterface.INg2Select[]>;
    shipmentModes: Observable<CommonInterface.INg2Select[]>;
    commodityGroups: Observable<CommonInterface.INg2Select[]>;

    customers: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    users: Observable<User[]>;
    salemansId: string = null;

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];
    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'shortName', label: 'Name Abbr' },
        { field: 'partnerNameEn', label: 'Name EN' },
        { field: 'taxCode', label: 'Tax Code' },
    ];

    commonData$: any;
    userLogged: User;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _documentRepo: DocumentationRepo,
        private _systemRepo: SystemRepo,
        private _store: Store<IShareBussinessState>,
        private _fb: FormBuilder
    ) {
        super();
    }

    ngOnInit() {
        this.getCommonData();
        this.getUser();

        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port }));
        this._store.dispatch(new GetCatalogueCarrierAction());
        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueCommodityGroupAction());

        this.ports = this._store.select(getCataloguePortState);
        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.commodityGroups = <any>this._store.select(getCatalogueCommodityGroupState)
            .pipe(
                map((data: any) => this.utility.prepareNg2SelectData(data, 'id', 'groupNameEn'))
            );

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);

        this.initForm();
    }

    getUser() {
        this.users = this._systemRepo.getListSystemUser();
        this.userLogged = JSON.parse(localStorage.getItem('id_token_claims_obj'));
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'supplier':
                this.supplierId.setValue(data.id);
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
            case 'customer':
                this.customerId.setValue(data.id);
                const customerArray = this.customers.toPromise().then(res => {
                    const customer: Customer = res.find(x => x.id === data.id);
                    if (!!customer) {
                        this.salemansId = customer.salePersonId;
                    }
                });
                break;
            default:
                break;
        }
    }

    getCommonData() {
        this.commonData$ = this._documentRepo.getOPSShipmentCommonData().pipe(share(), takeUntil(this.ngUnsubscribe));
        this.productServices = this.commonData$.pipe(
            map((data: any) => this.utility.prepareNg2SelectData(data.productServices, 'value', 'displayName'))
        );
        this.serviceModes = this.commonData$.pipe(
            map((data: any) => this.utility.prepareNg2SelectData(data.serviceModes, 'value', 'displayName'))
        );
        this.shipmentModes = this.commonData$.pipe(
            map((data: any) => this.utility.prepareNg2SelectData(data.shipmentModes, 'value', 'displayName'))
        );
    }

    initForm() {
        this.formCreate = this._fb.group({
            hwbno: [null, Validators.required],
            mblno: [null, Validators.required],
            flightVessel: [],
            purchaseOrderNo: [],

            serviceDate: [null, Validators.required],

            productService: [],
            serviceMode: [],
            shipmentMode: [],
            commodityGroupId: [],

            customerId: [null, Validators.required],
            pol: [],
            pod: [],
            supplierId: [],
            agentId: [],
            billingOpsId: [null, Validators.required],
        }, { validator: FormValidators.comparePort });

        this.hwbno = this.formCreate.controls['hwbno'];
        this.mblno = this.formCreate.controls['mblno'];
        this.serviceDate = this.formCreate.controls['serviceDate'];
        this.productService = this.formCreate.controls['productService'];
        this.serviceMode = this.formCreate.controls['serviceMode'];
        this.shipmentMode = this.formCreate.controls['shipmentMode'];
        this.commodityGroupId = this.formCreate.controls['commodityGroupId'];
        this.customerId = this.formCreate.controls['customerId'];
        this.pol = this.formCreate.controls['pol'];
        this.pod = this.formCreate.controls['pod'];
        this.supplierId = this.formCreate.controls['supplierId'];
        this.agentId = this.formCreate.controls['agentId'];
        this.billingOpsId = this.formCreate.controls['billingOpsId'];

        if (!!this.userLogged) {
            this.billingOpsId.setValue(this.userLogged.id);
        }

    }

}
