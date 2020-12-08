import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CustomClearance } from 'src/app/shared/models/tool-setting/custom-clearance.model';
import { Location, formatDate } from '@angular/common';
import { OpsTransaction } from 'src/app/shared/models/document/OpsTransaction.model';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'src/app/shared/services/sort.service';
import { CatalogueRepo, OperationRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { AppPage } from 'src/app/app.base';
import { CommonEnum } from '@enums';

@Component({
    selector: 'app-custom-clearance-addnew',
    templateUrl: './custom-clearance-addnew.component.html',
    styleUrls: ['./custom-clearance-addnew.component.scss']
})
export class CustomClearanceAddnewComponent extends AppPage implements OnInit {

    constructor(private _location: Location,
        private cdr: ChangeDetectorRef,
        private sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _operationRepo: OperationRepo,
        private _documentation: DocumentationRepo,
        private toastr: ToastrService
    ) {
        super();
        this.keepCalendarOpeningWithRange = true;
        this.selectedDate = Date.now();
        this.selectedRange = { startDate: this.createMoment().startOf('month'), endDate: this.createMoment().endOf('month') };
    }


    customDeclaration: CustomClearance = new CustomClearance();
    listCustomer: any = [];
    listPort: any = [];
    listCountry: any = [];
    listCommodity: any = [];
    listUnit: any = [];
    isConvertJob: boolean = false;

    selectedRange: any;
    selectedDate: any;
    keepCalendarOpeningWithRange: true;

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


    public disabled: boolean = false;
    isSubmitted: boolean = false;

    ngOnInit() {
        this.getClearanceType();
        this.getListCustomer();
        this.getListPort();
        this.getListCountry();
        this.getListUnit();
        this.getListCommodity();
    }

    async addCustomClearance(formAdd: NgForm) {
        this.isSubmitted = true;

        if (this.strCustomerCurrent === '' || this.strPortCurrent === '') { return; }
        if (this.serviceTypeCurrent[0] !== 'Air' && this.serviceTypeCurrent[0] !== 'Express') {
            if (this.cargoTypeCurrent.length === 0) { return; }
        }

        const pattern = /^[a-zA-Z0-9./_-\s]*$/;

        if (!this.customDeclaration.clearanceNo.match(pattern)) {
            this.toastr.warning("Clearance No - Not allowed to enter special characters. Except for characters ./_- and space", '', { positionClass: 'toast-bottom-right', closeButton: true, timeOut: 5000 });
            return;
        }

        if (this.customDeclaration.hblid != null && !this.customDeclaration.hblid.toString().match(pattern)) {
            this.toastr.warning("HBL - Not allowed to enter special characters. Except for characters ./_- and space", '', { positionClass: 'toast-bottom-right', closeButton: true, timeOut: 5000 });
            return;
        }

        if (this.customDeclaration.mblid != null && !this.customDeclaration.mblid.toString().match(pattern)) {
            this.toastr.warning("MBL - Not allowed to enter special characters. Except for characters ./_- and space", '', { positionClass: 'toast-bottom-right', closeButton: true, timeOut: 5000 });
            return;
        }

        if (formAdd.form.status != "INVALID" && this.customDeclaration.clearanceDate.endDate != null) {
            this.cdr.detach();
            this.customDeclaration.partnerTaxCode = this.strCustomerCurrent;
            this.customDeclaration.clearanceDate = formatDate(this.customDeclaration.clearanceDate.startDate, 'yyyy-MM-dd', 'en');
            this.customDeclaration.serviceType = this.serviceTypeCurrent[0];
            this.customDeclaration.gateway = this.strPortCurrent;
            this.customDeclaration.type = this.typeClearanceCurrent[0];
            this.customDeclaration.route = this.routeClearanceCurrent[0];
            this.customDeclaration.cargoType = (this.serviceTypeCurrent[0] == 'Air' || this.serviceTypeCurrent[0] === 'Express') ? null : this.cargoTypeCurrent[0];
            this.customDeclaration.exportCountryCode = this.strCountryExportCurrent;
            this.customDeclaration.importCountryCode = this.strCountryImportCurrent;
            this.customDeclaration.commodityCode = this.strCommodityCurrent;
            this.customDeclaration.unitCode = this.strUnitCurrent;

            const respone = await this._operationRepo.addCustomDeclaration(this.customDeclaration).toPromise();
            if (respone['status'] === true) {
                this.toastr.success(respone['message']);
                this._location.back();
            } else {
                this.customDeclaration.clearanceDate = { startDate: new Date(this.customDeclaration.clearanceDate), endDate: new Date(this.customDeclaration.clearanceDate) };
            }
        }
    }

    convertClearanceToShipment(formAdd: NgForm) {
        this.isSubmitted = true;

        if (this.strCustomerCurrent === '' || this.strPortCurrent === '' || this.typeClearanceCurrent.length === 0
            || this.customDeclaration.hblid == null || this.customDeclaration.hblid === ''
            || this.customDeclaration.mblid == null || this.customDeclaration.mblid === '') { return; }
        if (this.serviceTypeCurrent[0] !== 'Air' && this.serviceTypeCurrent[0] !== 'Express') {
            if (this.cargoTypeCurrent.length === 0) { return; }
        }
        if (formAdd.form.status !== "INVALID" && this.customDeclaration.clearanceDate.endDate != null) {
            this.cdr.detach();
            this.customDeclaration.partnerTaxCode = this.strCustomerCurrent;
            this.customDeclaration.serviceType = this.serviceTypeCurrent[0];
            this.customDeclaration.gateway = this.strPortCurrent;
            this.customDeclaration.type = this.typeClearanceCurrent[0];
            this.customDeclaration.route = this.routeClearanceCurrent[0];
            this.customDeclaration.cargoType = (this.serviceTypeCurrent[0] === 'Air' || this.serviceTypeCurrent[0] === 'Express') ? null : this.cargoTypeCurrent[0];
            this.customDeclaration.exportCountryCode = this.strCountryExportCurrent;
            this.customDeclaration.importCountryCode = this.strCountryImportCurrent;
            this.customDeclaration.commodityCode = this.strCommodityCurrent;
            this.customDeclaration.unitCode = this.strUnitCurrent;

            const shipment = this.mapClearanceToShipment();
            this.customDeclaration.clearanceDate = formatDate(this.customDeclaration.clearanceDate.startDate, 'yyyy-MM-dd', 'en');
            this._documentation.convertClearanceToJob({ opsTransaction: shipment, customsDeclaration: this.customDeclaration }).subscribe(
                (response: any) => {
                    if (response.status) {
                        this.isConvertJob = false;
                        this._location.back();
                    } else {
                        this.isConvertJob = true;
                        this.customDeclaration.clearanceDate = { startDate: new Date(this.customDeclaration.clearanceDate), endDate: new Date(this.customDeclaration.clearanceDate) };
                    }
                });
        }
    }

    mapClearanceToShipment() {
        let shipment = new OpsTransaction();
        let index = this.listCustomer.findIndex(x => x.taxCode === this.customDeclaration.partnerTaxCode);
        if (index > -1) {
            const customer = this.listCustomer[index];
            shipment.customerId = customer.id;
            shipment.salemanId = customer.salePersonId;
            shipment.serviceMode = this.customDeclaration.type;
            index = this.listPort.findIndex(x => x.code === this.customDeclaration.gateway);
            if (index > -1) {
                if (this.customDeclaration.type === "Export") {
                    shipment.pol = this.listPort[index].id;
                    shipment.clearanceLocation = shipment.pol;
                }
                if (this.customDeclaration.type === "Import") {
                    shipment.pod = this.listPort[index].id;
                    shipment.clearanceLocation = shipment.pod;
                }
            }
            if (this.customDeclaration.serviceType === "Sea") {
                if (this.customDeclaration.cargoType === "FCL") {
                    shipment.productService = "SeaFCL";
                }
                if (this.customDeclaration.cargoType === "LCL") {
                    shipment.productService = "SeaLCL";
                }
            } else {
                shipment.productService = this.customDeclaration.serviceType;
            }
            shipment.shipmentMode = "External";
            shipment.mblno = this.customDeclaration.mblid;
            shipment.hwbno = this.customDeclaration.hblid;
            shipment.serviceDate = formatDate(this.customDeclaration.clearanceDate.startDate, 'yyy-MM-dd', 'en');
            shipment.sumGrossWeight = this.customDeclaration.grossWeight;
            shipment.sumNetWeight = this.customDeclaration.netWeight;
            shipment.sumCbm = this.customDeclaration.cbm;
            shipment.shipper = this.customDeclaration.shipper;
            shipment.consignee = this.customDeclaration.consignee;
            const claim = localStorage.getItem('id_token_claims_obj');
            const currenctUser = JSON.parse(claim)["id"];
            shipment.billingOpsId = currenctUser;
            index = this.listUnit.findIndex(x => x.code === this.customDeclaration.unitCode);
            if (index > -1) {
                shipment.packageTypeId = this.listUnit[index].id;
            }
        } else {
            this.toastr.error("Không có customer để tạo job mới");
            shipment = null;
        }
        if (this.customDeclaration.clearanceDate == null) {
            this.toastr.error("Không có clearance date để tạo job mới");
            shipment = null;
        }
        return shipment;
    }

    getListCustomer() {
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.CUSTOMER })
            .subscribe((res: any) => { this.listCustomer = res; });
    }

    getClearanceType() {
        this._operationRepo.getClearanceType()
            .subscribe(
                (res: any) => {
                    this.serviceTypes = this.utility.prepareNg2SelectData(res.serviceTypes, 'value', 'displayName');
                    this.typeClearance = this.utility.prepareNg2SelectData(res.types, 'value', 'displayName');
                    this.routeClearance = this.utility.prepareNg2SelectData(res.routes, 'value', 'displayName');
                    this.cargoTypes = this.utility.prepareNg2SelectData(res.cargoTypes, 'value', 'displayName');
                }
            );
    }

    getListPort() {
        this._catalogueRepo.getListPort({ placeType: PlaceTypeEnum.Port })
            .subscribe((res: any) => { this.listPort = res; });
    }

    getListCountry() {
        this._catalogueRepo.getListAllCountry()
            .subscribe((res: any) => { this.listCountry = res; });
    }

    getListCommodity() {
        this._catalogueRepo.getCommondity({})
            .subscribe((res: any) => { this.listCommodity = res; });
    }

    getListUnit() {
        this._catalogueRepo.getUnit({ unitType: CommonEnum.UnitType.PACKAGE })
            .subscribe((res: any) => {
                this.listUnit = res;
                const datasort = this.sortService.sort(res, 'code', true);
                this.strUnitCurrent = datasort != null ? datasort[0].code : '';
            });
    }

    public selectedServiceType(value: any): void {
        this.serviceTypeCurrent = [value.id];
        if (this.serviceTypeCurrent[0] == 'Air' || this.serviceTypeCurrent[0] === 'Express') {
            this.cargoTypeCurrent = [];
        }
    }

    public selectedTypeClearance(value: any): void {
        this.typeClearanceCurrent = [value.id];
    }

    public selectedRouteClearance(value: any): void {
        this.routeClearanceCurrent = [value.id];
    }

    public selectedCargoType(value: any): void {
        this.cargoTypeCurrent = [value.id];
    }

    public removedServiceType(): void {
        this.serviceTypeCurrent = [];
    }

    public removedTypeClearance(): void {
        this.typeClearanceCurrent = [];
    }

    public removedRouteClearance(): void {
        this.routeClearanceCurrent = [];
    }

    public removedCargoType(): void {
        this.cargoTypeCurrent = [];
    }
}
