import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { ShareBussinessContainerListPopupComponent, IShareBussinessState } from '@share-bussiness';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { OpsTransaction, Customer, PortIndex, Warehouse, User, Commodity } from '@models';
import { Observable } from 'rxjs';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { Store } from '@ngrx/store';
import { catchError, finalize, map } from 'rxjs/operators';
import { getCataloguePortState, getCatalogueCarrierState, getCatalogueAgentState, GetCataloguePortAction, GetCatalogueCarrierAction, GetCatalogueAgentAction, getCatalogueWarehouseState, GetCatalogueWarehouseAction, getCatalogueCommodityGroupState, getCatalogueCommodityState } from '@store';
import { CommonEnum } from '@enums';
import { FormValidators } from '@validators';

@Component({
    selector: 'job-mangement-form-edit',
    templateUrl: './form-edit.component.html'
})
export class JobManagementFormEditComponent extends AppForm implements OnInit {
    @ViewChild(ShareBussinessContainerListPopupComponent, { static: false }) containerPopup: ShareBussinessContainerListPopupComponent;

    opsTransaction: OpsTransaction = null;

    formEdit: FormGroup;
    jobNo: AbstractControl;
    hwbno: AbstractControl;
    mblno: AbstractControl;
    serviceDate: AbstractControl;
    finishDate: AbstractControl;
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
    warehouseId: AbstractControl;
    invoiceNo: AbstractControl;
    salemansId: AbstractControl;
    fieldOpsId: AbstractControl;
    clearanceLocation: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    sumGrossWeight: AbstractControl;
    sumNetWeight: AbstractControl;
    sumContainers: AbstractControl;
    sumPackages: AbstractControl;
    sumCbm: AbstractControl;
    containerDescription: AbstractControl;
    packageTypeId: AbstractControl;

    productServices: CommonInterface.INg2Select[];
    serviceModes: CommonInterface.INg2Select[];
    shipmentModes: CommonInterface.INg2Select[];
    customers: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    carries: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    warehouses: Observable<Warehouse[]>;
    salesmans: Observable<User[]>;
    commodityGroups: CommonInterface.INg2Select[];
    packageTypes: any[];

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
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
        { field: 'nameEn', label: 'Warehouse Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];
    displayFieldSalesman: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameEn', label: 'Full Name' }
    ];

    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IShareBussinessState>,
        private _systemRepo: SystemRepo) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port }));
        this._store.dispatch(new GetCatalogueCarrierAction());
        this._store.dispatch(new GetCatalogueAgentAction());
        this._store.dispatch(new GetCatalogueWarehouseAction({ placeType: CommonEnum.PlaceTypeEnum.Warehouse }));

        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER);
        this.salesmans = this._systemRepo.getSystemUsers();
        this.ports = this._store.select(getCataloguePortState);
        this.carries = this._store.select(getCatalogueCarrierState);
        this.agents = this._store.select(getCatalogueAgentState);
        this.warehouses = this._store.select(getCatalogueWarehouseState);


        this.getListPackageTypes();
        this.getCommodityGroup();
        this.initForm();
    }
    setFormValue() {
        this.formEdit.patchValue({
            jobNo: this.opsTransaction.jobNo,
            hwbno: this.opsTransaction.hwbno,
            mblno: this.opsTransaction.mblno,
            flightVessel: this.opsTransaction.flightVessel,
            purchaseOrderNo: this.opsTransaction.purchaseOrderNo,
            serviceDate: !!this.opsTransaction.serviceDate ? { startDate: new Date(this.opsTransaction.serviceDate), endDate: new Date(this.opsTransaction.serviceDate) } : null,
            finishDate: !!this.opsTransaction.finishDate ? { startDate: new Date(this.opsTransaction.finishDate), endDate: new Date(this.opsTransaction.finishDate) } : null,
            customerId: this.opsTransaction.customerId,
            pol: this.opsTransaction.pol,
            pod: this.opsTransaction.pod,
            supplierId: this.opsTransaction.supplierId,
            agentId: this.opsTransaction.agentId,
            salemansId: this.opsTransaction.salemanId,
            warehouseId: this.opsTransaction.warehouseId,
            invoiceNo: this.opsTransaction.invoiceNo,
            fieldOpsId: this.opsTransaction.fieldOpsId,
            billingOpsId: this.opsTransaction.billingOpsId,
            clearanceLocation: this.opsTransaction.clearanceLocation,
            shipper: this.opsTransaction.shipper,
            consignee: this.opsTransaction.consignee,
            sumGrossWeight: this.opsTransaction.sumGrossWeight,
            sumNetWeight: this.opsTransaction.sumNetWeight,
            sumContainers: this.opsTransaction.sumContainers,
            sumPackages: this.opsTransaction.sumPackages,
            sumCbm: this.opsTransaction.sumCbm,
            containerDescription: this.opsTransaction.containerDescription,
        });
    }

    getCommodityGroup() {
        this._store.select(getCatalogueCommodityGroupState)
            .subscribe(
                ((data: any) => {
                    this.commodityGroups = this.utility.prepareNg2SelectData(data, 'id', 'groupNameEn');
                })
            );
    }

    getListPackageTypes() {
        this._catalogueRepo.getUnit({ unitType: 'package' })
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; })
            )
            .subscribe(
                (res: any) => {
                    this.packageTypes = this.utility.prepareNg2SelectData(res, 'id', 'unitNameEn');
                },
            );
    }
    initForm() {
        this.formEdit = this._fb.group({
            jobNo: [null, Validators.required],
            hwbno: [null, Validators.required],
            mblno: [null, Validators.required],
            flightVessel: [],
            purchaseOrderNo: [],

            serviceDate: [null, Validators.required],
            finishDate: [null],

            productService: [],
            serviceMode: [],
            shipmentMode: [],
            commodityGroupId: [],

            customerId: [null, Validators.required],
            pol: [],
            pod: [],
            supplierId: [],
            agentId: [],
            salemansId: [],
            warehouseId: [],
            invoiceNo: [null],
            fieldOpsId: [null],
            billingOpsId: [null, Validators.required],
            clearanceLocation: [null],
            shipper: [null],
            consignee: [null],
            sumGrossWeight: [null],
            sumNetWeight: [null],
            sumContainers: [null],
            sumPackages: [null],
            sumCbm: [null],
            containerDescription: [null],
            packageTypeId: [null]
        }, { validator: FormValidators.comparePort });
        this.jobNo = this.formEdit.controls['jobNo'];
        this.serviceDate = this.formEdit.controls['serviceDate'];
        this.finishDate = this.formEdit.controls['finishDate'];
        this.productService = this.formEdit.controls['productService'];
        this.serviceMode = this.formEdit.controls['serviceMode'];
        this.shipmentMode = this.formEdit.controls['shipmentMode'];
        this.hwbno = this.formEdit.controls['hwbno'];
        this.mblno = this.formEdit.controls['mblno'];
        this.customerId = this.formEdit.controls['customerId'];
        this.pol = this.formEdit.controls['pol'];
        this.pod = this.formEdit.controls['pod'];
        this.supplierId = this.formEdit.controls['supplierId'];
        this.flightVessel = this.formEdit.controls['flightVessel'];
        this.warehouseId = this.formEdit.controls['warehouseId'];
        this.agentId = this.formEdit.controls['agentId'];
        this.invoiceNo = this.formEdit.controls['invoiceNo'];
        this.purchaseOrderNo = this.formEdit.controls['purchaseOrderNo'];
        this.salemansId = this.formEdit.controls['salemansId'];
        this.fieldOpsId = this.formEdit.controls['fieldOpsId'];
        this.billingOpsId = this.formEdit.controls['billingOpsId'];
        this.clearanceLocation = this.formEdit.controls['clearanceLocation'];
        this.shipper = this.formEdit.controls['shipper'];
        this.consignee = this.formEdit.controls['consignee'];
        this.sumGrossWeight = this.formEdit.controls['sumGrossWeight'];
        this.sumNetWeight = this.formEdit.controls['sumNetWeight'];
        this.sumContainers = this.formEdit.controls['sumContainers'];
        this.sumPackages = this.formEdit.controls['sumPackages'];
        this.sumCbm = this.formEdit.controls['sumCbm'];
        this.containerDescription = this.formEdit.controls['containerDescription'];
        this.packageTypeId = this.formEdit.controls['packageTypeId'];
        this.commodityGroupId = this.formEdit.controls['commodityGroupId'];
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
                        this.salemansId.setValue(customer.salePersonId);
                    }
                });
                break;
            case 'warehouse':
                this.warehouseId.setValue(data.id);
                break;
            case 'salesman':
                this.salemansId.setValue(data.id);
                break;
            case 'fieldOps':
                this.fieldOpsId.setValue(data.id);
                break;
            case 'billingOps':
                this.billingOpsId.setValue(data.id);
                break;
            case 'clearance':
                this.clearanceLocation.setValue(data.id);
                break;
            default:
                break;
        }
    }
    showListContainer() {
        this.containerPopup.mblid = this.opsTransaction.id;
        this.containerPopup.show();
    }

}
