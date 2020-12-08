import { Component, OnInit } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { OperationRepo, CatalogueRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { PortIndex, Commodity, CountryModel, Unit, Customer } from '@models';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

@Component({
    selector: 'custom-clearance-form-add',
    templateUrl: './form-add-custom-clearance.component.html',
})
export class CustomClearanceFormAddComponent extends AppForm implements OnInit {

    formGroup: FormGroup;
    clearanceNo: AbstractControl;
    partnerTaxCode: AbstractControl;
    clearanceDate: AbstractControl;
    serviceType: AbstractControl;
    gateway: AbstractControl;
    type: AbstractControl;
    route: AbstractControl;
    cargoType: AbstractControl;
    exportCountryCode: AbstractControl;
    importCountryCode: AbstractControl;
    commodityCode: AbstractControl;
    unitCode: AbstractControl;

    serviceTypes: CommonInterface.INg2Select[];
    typeClearance: CommonInterface.INg2Select[];
    routeClearance: CommonInterface.INg2Select[];
    cargoTypes: CommonInterface.INg2Select[];

    listPort: Observable<PortIndex[]>;
    listCommodity: Observable<Commodity[]>;
    listCountry: Observable<CountryModel[]>;
    listUnit: Observable<Unit[]>;
    listCustomer: Observable<Customer[]>;
    listCustomers: Customer[] = [];

    displayFieldCustomer: CommonInterface.IComboGridDisplayField[] = [
        { 'field': 'shortName', 'label': 'Name ABBR' },
        { 'field': 'partnerNameEn', 'label': 'Name EN' },
        { 'field': 'taxCode', 'label': 'Tax Code' }
    ];
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { 'field': 'code', 'label': 'Port Code' },
        { 'field': 'nameEn', 'label': 'Port Name (EN)' },
        { 'field': 'countryNameEN', 'label': 'Country Name (EN)' }
    ];


    constructor(
        private _fb: FormBuilder,
        private _operationRepo: OperationRepo,
        private _catalogueRepo: CatalogueRepo
    ) {
        super();
    }

    ngOnInit(): void {
        this.initForm();

        this.getClearanceType();
        this.listCustomer = this._catalogueRepo.getListPartner(null, null, { partnerGroup: CommonEnum.PartnerGroupEnum.CUSTOMER }).pipe(share());
        this.listPort = this._catalogueRepo.getListPort({ placeType: CommonEnum.PlaceTypeEnum.Port });
        this.listCountry = this._catalogueRepo.getListAllCountry();
        this.listCommodity = this._catalogueRepo.getCommondity({ active: true });
        this.listUnit = this._catalogueRepo.getUnit({ unitType: 'Package' });

        this.listCustomer.subscribe(
            (customer: Customer[]) => {
                this.listCustomers = customer;
            }
        )
    }

    initForm() {
        this.formGroup = this._fb.group({
            clearanceNo: [],
            hblid: [],
            mblid: [],
            grossWeight: [],
            netWeight: [],
            cbm: [],
            qtyCont: [],
            pcs: [],
            partnerTaxCode: [],
            clearanceDate: [],

            serviceType: [],
            gateway: [],
            type: [],
            route: [],
            cargoType: [],
            exportCountryCode: [],
            importCountryCode: [],
            commodityCode: [],
            unitCode: []
        });

        this.clearanceNo = this.formGroup.controls["clearanceNo"];
        this.partnerTaxCode = this.formGroup.controls["partnerTaxCode"];
        this.clearanceDate = this.formGroup.controls["clearanceDate"];
        this.serviceType = this.formGroup.controls["serviceType"];
        this.gateway = this.formGroup.controls["gateway"];
        this.type = this.formGroup.controls["type"];
        this.route = this.formGroup.controls["route"];
        this.cargoType = this.formGroup.controls["cargoType"];
        this.exportCountryCode = this.formGroup.controls["exportCountryCode"];
        this.importCountryCode = this.formGroup.controls["importCountryCode"];
        this.unitCode = this.formGroup.controls["unitCode"];
        this.commodityCode = this.formGroup.controls["commodityCode"];
    }

    getClearanceType() {
        this._operationRepo.getClearanceType()
            .subscribe(
                (res: {
                    serviceTypes: CommonInterface.IValueDisplay[],
                    types: CommonInterface.IValueDisplay[],
                    routes: CommonInterface.IValueDisplay[],
                    cargoTypes: CommonInterface.IValueDisplay[]
                }) => {
                    this.serviceTypes = res.serviceTypes.map(x => ({ "text": x.displayName, "id": x.value }));
                    this.typeClearance = res.types.map(x => ({ "text": x.displayName, "id": x.value }));
                    this.routeClearance = res.routes.map(x => ({ "text": x.displayName, "id": x.value }));
                    this.cargoTypes = res.cargoTypes.map(x => ({ "text": x.displayName, "id": x.value }));
                }
            );
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.partnerTaxCode.setValue(data.taxCode);
                break;
            case 'port':
                this.gateway.setValue(data.id);
                break;
            case 'country-export':
                this.exportCountryCode.setValue(data.id);
                break;
            case 'country-import':
                this.importCountryCode.setValue(data.id);
                break;
            case 'commodity':
                this.commodityCode.setValue(data.id);
                break;
            case 'unit':
                this.unitCode.setValue(data.id);
                break;
            default:
                break;
        }
    }
}
