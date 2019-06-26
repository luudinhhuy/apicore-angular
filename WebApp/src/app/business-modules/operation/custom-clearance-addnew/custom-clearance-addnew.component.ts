import { Component, OnInit } from '@angular/core';
import moment from 'moment/moment';
import { BaseService } from 'src/services-base/base.service';
import { API_MENU } from 'src/constants/api-menu.const';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CustomClearance } from 'src/app/shared/models/tool-setting/custom-clearance.model';
import {Location} from '@angular/common';

@Component({
    selector: 'app-custom-clearance-addnew',
    templateUrl: './custom-clearance-addnew.component.html',
    styleUrls: ['./custom-clearance-addnew.component.scss']
})
export class CustomClearanceAddnewComponent implements OnInit {   
    customDeclaration: CustomClearance = new CustomClearance();
    listCustomer: any = [];
    listPort: any = [];
    listCountry: any = [];
    listCommodity: any = [];
    listUnit: any = [];

    constructor(private baseServices: BaseService,
        private api_menu: API_MENU,
        private route: ActivatedRoute, private _location: Location) {
        this.keepCalendarOpeningWithRange = true;
        this.selectedDate = Date.now();
        this.selectedRange = { startDate: moment().startOf('month'), endDate: moment().endOf('month') };
    }

    async ngOnInit() {
        //this.customDeclaration.clearanceDate = {startDate: moment(), endDate: moment()};
        
        this.getClearanceType();
        await this.getListCustomer();
        await this.getListPort();
        this.getListCountry();
        await this.getListUnit();
        await this.getListCommodity();
    }

    async addCustomClearance(formAdd: NgForm){
        if (this.strCustomerCurrent == '' || this.strPortCurrent == '') return;
        if (this.serviceTypeCurrent[0] != 'Air' && this.serviceTypeCurrent[0] != 'Express') {
            if (this.cargoTypeCurrent.length == 0) return;
        }
        if (formAdd.form.status != "INVALID") {
            this.customDeclaration.partnerTaxCode = this.strCustomerCurrent;
            this.customDeclaration.clearanceDate = moment(this.customDeclaration.clearanceDate.endDate._d).format('YYYY-MM-DD');
            this.customDeclaration.serviceType = this.serviceTypeCurrent[0];
            this.customDeclaration.gateway = this.strPortCurrent;
            this.customDeclaration.type = this.typeClearanceCurrent[0];
            this.customDeclaration.route = this.routeClearanceCurrent[0];
            this.customDeclaration.cargoType = (this.serviceTypeCurrent[0] == 'Air' || this.serviceTypeCurrent[0] == 'Express') ? null : this.cargoTypeCurrent[0];
            this.customDeclaration.exportCountryCode = this.strCountryExportCurrent;
            this.customDeclaration.importCountryCode = this.strCountryImportCurrent;
            this.customDeclaration.commodityCode = this.strCommodityCurrent;
            this.customDeclaration.unitCode = this.strUnitCurrent;
            console.log(this.customDeclaration);

            const respone = await this.baseServices.postAsync(this.api_menu.ToolSetting.CustomClearance.add, this.customDeclaration, true, true);
            //console.log(respone);
            
            this._location.back();

            //Reset lại clearanceDate
            //this.customDeclaration.clearanceDate = { startDate: moment(this.customDeclaration.clearanceDate), endDate: moment(this.customDeclaration.clearanceDate)};
        }
    }
    
    async getListCustomer() {
        //partnerGroup = 3 ~ Customer
        const res = await this.baseServices.postAsync(this.api_menu.Catalogue.PartnerData.query, { partnerGroup: 3 }, true, true);
        this.listCustomer = res;
    }

    getClearanceType() {
        this.baseServices.get(this.api_menu.ToolSetting.CustomClearance.getClearanceTypes).subscribe((res: any) => {
            this.serviceTypes = res.serviceTypes.map(x => ({ "text": x.displayName, "id": x.value }));
            this.typeClearance = res.types.map(x => ({ "text": x.displayName, "id": x.value }));
            this.routeClearance = res.routes.map(x => ({ "text": x.displayName, "id": x.value }));
            this.cargoTypes = res.cargoTypes.map(x => ({ "text": x.displayName, "id": x.value }));
        });
    }

    async getListPort() {
        //placeType = 8 ~ Port
        const res = await this.baseServices.postAsync(this.api_menu.Catalogue.CatPlace.query, { placeType: 8 }, true, true);
        this.listPort = res;
    }

    getListCountry() {
        this.baseServices.get(this.api_menu.Catalogue.Country.getAll).subscribe((res: any) => {
            this.listCountry = res;
        });
    }

    async getListCommodity() {
        const res = await this.baseServices.postAsync(this.api_menu.Catalogue.Commodity.query, {}, true, true);
        this.listCommodity = res;
    }

    async getListUnit() {
        //unitType = Package
        const res = await this.baseServices.postAsync(this.api_menu.Catalogue.Unit.getAllByQuery, { unitType: 'Package' }, true, true);
        this.listUnit = res;
    }

    /**
      * Daterange picker
      */
    selectedRange: any;
    selectedDate: any;
    keepCalendarOpeningWithRange: true;
    maxDate: moment.Moment = moment();
    ranges: any = {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
            moment()
                .subtract(1, 'month')
                .startOf('month'),
            moment()
                .subtract(1, 'month')
                .endOf('month')
        ]
    };

    /**
  * ng2-select
  */
    serviceTypes: any = [];
    typeClearance: any = [];
    routeClearance: any = [];
    cargoTypes: any = [];
    
    strCustomerCurrent: any = '';
    strPortCurrent: any = '';
    strCountryImportCurrent: any = '';
    strCountryExportCurrent: any = '';
    strCommodityCurrent: any = '';
    strUnitCurrent: any = '';

    serviceTypeCurrent: any = [];
    typeClearanceCurrent: any = [];
    routeClearanceCurrent: any = [];
    cargoTypeCurrent: any = [];

    private value: any = {};
    private _disabledV: string = '0';
    public disabled: boolean = false;

    private get disabledV(): string {
        return this._disabledV;
    }

    private set disabledV(value: string) {
        this._disabledV = value;
        this.disabled = this._disabledV === '1';
    }

    public selected(value: any): void {
        console.log('Selected value is: ', value);
    }

    public removed(value: any): void {
        console.log('Removed value is: ', value);
    }

    public typed(value: any): void {
        console.log('New search input: ', value);
    }

    public refreshValue(value: any): void {
        this.value = value;
    }

    public selectedServiceType(value: any): void {
        //console.log('ServiceType: ', value);
        this.serviceTypeCurrent = [value.id];
        if (this.serviceTypeCurrent[0] == 'Air' || this.serviceTypeCurrent[0] == 'Express') {
            this.cargoTypeCurrent = [];
        }
    }

    public selectedTypeClearance(value: any): void {
        //console.log('TypeClearance: ', value);
        this.typeClearanceCurrent = [value.id];
    }

    public selectedRouteClearance(value: any): void {
        //console.log('RouteClearance: ', value);
        this.routeClearanceCurrent = [value.id];
    }

    public selectedCargoType(value: any): void {
        //console.log('CargoType: ', value);
        this.cargoTypeCurrent = [value.id];
    }

    public removedServiceType(value: any): void {
        this.serviceTypeCurrent = [];
    }

    public removedTypeClearance(value: any): void {
        this.typeClearanceCurrent = [];
    }

    public removedRouteClearance(value: any): void {
        this.routeClearanceCurrent = [];
    }

    public removedCargoType(value: any): void {
        this.cargoTypeCurrent = [];
    }
}
