import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { CustomDeclaration, Surcharge, Partner, Unit } from '@models';
import { CatalogueRepo, DocumentationRepo, OperationRepo, AccountingRepo } from '@repositories';
import { CommonEnum } from '@enums';

import { PopupBase } from 'src/app/popup.base';

import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { FormGroup, AbstractControl, FormBuilder, FormControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { ToastrService } from 'ngx-toastr';
import cloneDeep from 'lodash/cloneDeep';
import { Store } from '@ngrx/store';
import { IAppState, GetCatalogueUnitAction, getCatalogueUnitState } from '@store';


@Component({
    selector: 'table-list-charge-popup',
    templateUrl: './table-list-charge.component.html',
    styleUrls: ['./table-list-charge.component.scss']
})

export class SettlementTableListChargePopupComponent extends PopupBase implements OnInit {

    @Output() onChange: EventEmitter<Surcharge[]> = new EventEmitter<Surcharge[]>();
    @Output() onUpdate: EventEmitter<Surcharge[]> = new EventEmitter<Surcharge[]>();

    headers: CommonInterface.IHeaderTable[];
    headerPartner: CommonInterface.IHeaderTable[] = [];
    partnerType: CommonInterface.IValueDisplay[];

    listCharges: any[];

    listUnits: Observable<Unit[]>;
    shipments: OperationInteface.IShipment[];
    cds: CustomDeclaration[] = [];
    advs: IAdvanceShipment[] = [];
    listPartner: Partner[] = [];

    selectedShipment: OperationInteface.IShipment;
    selectedCD: CustomDeclaration;
    selectedAdvance: IAdvanceShipment;

    configChargeDisplayFields: CommonInterface.IComboGridDisplayField[];
    configShipmentDisplayFields: CommonInterface.IComboGridDisplayField[];
    configAdvanceDisplayFields: CommonInterface.IComboGridDisplayField[];
    configCustomDisplayFields: CommonInterface.IComboGridDisplayField[];

    formGroup: FormGroup;
    shipment: AbstractControl;
    customNo: AbstractControl;
    advanceNo: AbstractControl;

    serviceTypeId: string; // * service id for get charge catalogue.
    currencyId: string = 'VND'; // * Currency from form create.
    settlementCode: string = null; // * Settlement Code current if update, === null if create.

    charges: Surcharge[] = [];

    isUpdate: boolean = false;
    isDuplicateChargeCode: boolean = false;
    isDuplicateInvoice: boolean = false;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _documentRepo: DocumentationRepo,
        private _operationRepo: OperationRepo,
        private _accountingRepo: AccountingRepo,
        private _fb: FormBuilder,
        private _toastService: ToastrService,
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Name', field: 'chargeNameEn', sortable: true, required: true, width: 250 },
            { title: 'Payer', field: 'payerName', sortable: true, required: true, width: 250 },
            { title: 'Qty', field: 'quantity', sortable: true, required: true },
            { title: 'Unit', field: 'unitId', sortable: true, required: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true, required: true },
            { title: 'Currency', field: 'currencyId', sortable: true, required: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Total Amount', field: 'amount', sortable: true },
            { title: 'OBH Partner', field: 'partnerName', sortable: true, required: false, width: 250 },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Serie No', field: 'serieNo', sortable: true },
            { title: 'Invoice Date', field: 'invoiceDate', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
        ];

        this.configChargeDisplayFields = [
            { field: 'chargeNameEn', label: 'Name' },
            { field: 'unitPrice', label: 'Unit Price' },
            { field: 'unit', label: 'Unit' },
            { field: 'code', label: 'Code' },
        ];

        this.configShipmentDisplayFields = [
            { field: 'jobId', label: 'JobID' },
            { field: 'mbl', label: 'MBL' },
            { field: 'hbl', label: 'HBL' },
        ];

        this.configAdvanceDisplayFields = [
            { field: 'advanceNo', label: 'Advance No' },
            { field: 'amount', label: 'Amount' },
            { field: 'requestCurrency', label: 'Currency' },
            { field: 'requestDate', label: 'Request Date' },
        ];

        this.configCustomDisplayFields = [
            { field: 'clearanceNo', label: 'Custom No' },
            { field: 'jobNo', label: 'JobID' },
        ];

        this.partnerType = [
            { displayName: 'Customer', value: CommonEnum.PartnerGroupEnum.CUSTOMER, fieldName: 'CUSTOMER' },
            { displayName: 'Carrier', value: CommonEnum.PartnerGroupEnum.CARRIER, fieldName: 'CARRIER' },
            { displayName: 'Agent', value: CommonEnum.PartnerGroupEnum.AGENT, fieldName: 'AGENT' },
        ];

        this.headerPartner = [
            { title: 'Name', field: 'partnerNameEn' },
            { title: 'Partner Code', field: 'taxCode' },
        ];

        this._store.dispatch(new GetCatalogueUnitAction());

        this.getMasterCharges();
        this.getShipmentCommonData();
        this.getCustomDecleration();
        // this.getAdvances();
        this.initForm();
        this.getPartner();
        this.getUnits();
    }

    initForm() {
        this.formGroup = this._fb.group({
            shipment: [],
            customNo: [],
            advanceNo: []
        });

        this.shipment = this.formGroup.controls['shipment'];
        this.customNo = this.formGroup.controls['customNo'];
        this.advanceNo = this.formGroup.controls['advanceNo'];
    }

    getShipmentCommonData() {
        this._documentRepo.getShipmentNotLocked().pipe(catchError(this.catchError))
            .subscribe(
                (res: OperationInteface.IShipment[]) => {
                    this.shipments = res;
                }
            );
    }

    getCustomDecleration() {
        this.cds = this._operationRepo.getCustomsShipmentNotLocked()
            .pipe(
                catchError(this.catchError)
            );
    }

    getAdvances(jobNo: string) {
        this._accountingRepo.getAdvanceOfShipment(jobNo)
            .pipe(
                catchError(this.catchError),
                map((res: IAdvanceShipment[]) => {
                    res.forEach((item: IAdvanceShipment) => {
                        item.requestDate = formatDate(item.requestDate, 'dd/MM/yyyy', 'en');
                    });
                    return res;
                })
            ).subscribe(
                (res: any[] = []) => {
                    this.advs = cloneDeep(res);
                    if (!this.advanceNo.value) {
                        const advance: IAdvanceShipment = this.advs.find(i => i.jobId === this.selectedShipment.jobId);
                        if (!!advance) {
                            this.advanceNo.setValue(advance.advanceNo);
                            this.selectedAdvance = advance;
                        }
                    }
                }
            );
    }

    getPartner() {
        this._catalogueRepo.getListPartner(null, null, { active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (partners: Partner[]) => {
                    this.listPartner = partners;
                }
            );
    }

    getUnits() {
        this.listUnits = this._store.select(getCatalogueUnitState);
    }

    getMasterCharges(serviceTypeId: string = null) {
        forkJoin([
            this._catalogueRepo.getListCharge(null, null, { active: true, type: CommonEnum.CHARGE_TYPE.CREDIT, serviceTypeId: serviceTypeId }),
            this._catalogueRepo.getListCharge(null, null, { active: true, type: CommonEnum.CHARGE_TYPE.OBH, serviceTypeId: serviceTypeId }),
        ]).pipe(
            map(([chargeCredit, chargeOBH]) => {
                return [...chargeCredit, ...chargeOBH];
            })
        ).subscribe(
            (res: any[]) => {
                this.listCharges = res;
            }
        );
    }

    onSelectDataFormInfo(data: OperationInteface.IShipment | IAdvanceShipment | any, type: string) {
        this.isSubmitted = false;

        switch (type) {
            case 'shipment':
                this.serviceTypeId = data.service;
                this.selectedShipment = data;

                this.shipment.setValue(this.selectedShipment.hblid);
                this.getMasterCharges(this.serviceTypeId);

                this.advanceNo.reset();
                this.advs.length = 0;
                this.getAdvances(this.selectedShipment.jobId);
                // * FINDING ITEM ADVANCE BELONG TO SELECTED SHIPMENT.


                // * check list charge current => Has charge exist after master charge changed.
                this.charges.forEach((charge: Surcharge) => {
                    if (!this.checkExistCharge(charge.chargeId, this.listCharges)) {
                        charge.chargeId = null;
                    }
                });
                break;
            case 'cd':
                this.selectedCD = data;
                if (!this.shipment.value) {

                    this.shipment.setValue(data.jobNo);
                    this.getMasterCharges(this.serviceTypeId);
                }
                this.customNo.setValue(data.clearanceNo);
                break;
            case 'advanceNo':
                this.selectedAdvance = data;

                this.advanceNo.setValue(data.advanceNo);

                if (!!this.charges.length) {
                    this.charges.forEach(c => c.advanceNo = this.selectedAdvance.advanceNo);
                }

                break;
            default:
                break;
        }
    }

    checkExistCharge(chargeId: string, charges: Surcharge[] = []) {
        if (!charges.length) {
            return false;
        }
        return charges.some((charge: Surcharge) => (charge.chargeId === chargeId));
    }

    onSelectDataTableInfo(data: any, chargeItem: Surcharge, type: string) {
        this.isSubmitted = false;
        [this.isDuplicateChargeCode, this.isDuplicateInvoice] = [false, false];

        switch (type) {
            case 'charge':
                chargeItem.chargeCode = data.code;
                chargeItem.chargeName = data.chargeNameEn;
                chargeItem.chargeId = data.id;
                chargeItem.type = this.updateChargeType(data.type);
                // * Unit, Unit Price had value
                if (!chargeItem.unitId || chargeItem.unitPrice == null) {
                    this.listUnits.pipe(
                        switchMap((units: Unit[]) => of(units.find(u => u.id === data.unitId))),
                    ).subscribe(
                        (unit: Unit) => {
                            chargeItem.unitId = unit.id;
                            chargeItem.unitPrice = data.unitPrice;
                            chargeItem.unitName = unit.unitNameEn;
                        }
                    );
                }

                // * Detect charge type
                if ((data.type || '').toLowerCase() !== CommonEnum.CHARGE_TYPE.OBH.toLowerCase()) {
                    chargeItem.obhPartnerName = null;
                } else {
                    this.headers = [...this.headers];
                    this.headers[8].required = true;
                }
                break;
            case 'payer':
                chargeItem.payer = data.shortName;
                chargeItem.objectBePaid = 'OTHER';
                chargeItem.paymentObjectId = data.id;
                chargeItem.payerId = null;
                chargeItem.obhPartnerName = '';
                break;
            case 'obh':
                chargeItem.obhPartnerName = data.shortName;
                chargeItem.obhId = data.id;
                chargeItem.objectBePaid = null;
                chargeItem.payerId = chargeItem.paymentObjectId;
                break;
            default:
                break;
        }
    }

    onSelectPartnerType(partnerType: CommonInterface.IValueDisplay, chargeItem: Surcharge, type: string, ) {
        let partner: Partner;
        switch (type) {
            case 'partner-type':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        partner = this.getPartnerById(this.selectedShipment.customerId);
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        partner = this.getPartnerById(this.selectedShipment.carrierId);
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        partner = this.getPartnerById(this.selectedShipment.agentId);
                        break;
                    default:
                        break;
                }
                if (!!partner) {
                    chargeItem.paymentObjectId = partner.id;
                    chargeItem.payer = partner.shortName;
                }
                break;
            case 'obh-type':
                switch (partnerType.value) {
                    case CommonEnum.PartnerGroupEnum.CUSTOMER:
                        partner = this.getPartnerById(this.selectedShipment.customerId);
                        break;
                    case CommonEnum.PartnerGroupEnum.CARRIER:
                        partner = this.getPartnerById(this.selectedShipment.carrierId);
                        break;
                    case CommonEnum.PartnerGroupEnum.AGENT:
                        partner = this.getPartnerById(this.selectedShipment.agentId);
                        break;
                    default:
                        break;
                }
                if (!!partner) {
                    chargeItem.obhId = partner.id;
                    chargeItem.obhPartnerName = partner.shortName;
                }
                break;
        }
    }

    addCharge() {
        this.isSubmitted = false;
        this.charges.push(new Surcharge({
            currencyId: this.currencyId,
            id: SystemConstants.EMPTY_GUID,
            hblid: this.selectedShipment.hblid,
            isFromShipment: false,
            jobId: this.selectedShipment.jobId,
            mbl: this.selectedShipment.mbl,
            hbl: this.selectedShipment.hbl,
            settlementCode: this.settlementCode,
            invoiceDate: null,
            clearanceNo: !!this.selectedCD ? this.selectedCD.clearanceNo : null,
            chargeId: null,
            unitId: null,
            advanceNo: !!this.selectedAdvance ? this.selectedAdvance.advanceNo : null,
            jobNo: this.selectedShipment.jobId,
            mblno: this.selectedShipment.mbl,
            hblno: this.selectedShipment.hbl,
        }));
    }

    duplicateCharge(index: number) {
        this.isSubmitted = false;

        const newCharge = cloneDeep(this.charges[index]);

        newCharge.currencyId = this.currencyId;
        newCharge.id = SystemConstants.EMPTY_GUID;
        newCharge.hblid = this.selectedShipment.hblid;
        newCharge.isFromShipment = false;
        newCharge.jobId = this.selectedShipment.jobId;
        newCharge.mbl = this.selectedShipment.mbl;
        newCharge.hbl = this.selectedShipment.hbl;
        newCharge.advanceNo = !!this.selectedAdvance ? this.selectedAdvance.advanceNo : null;
        newCharge.clearanceNo = !!this.selectedCD ? this.selectedCD.clearanceNo : null;
        newCharge.settlementCode = this.settlementCode;
        if (!newCharge.invoiceDate || !newCharge.invoiceDate.startDate) {
            newCharge.invoiceDate = null;
        }

        this.charges.push(new Surcharge(newCharge));
        // this.charges = [...this.charges, new Surcharge(newCharge)];
    }

    deleteCharge(index: number) {
        this.isSubmitted = false;
        this.charges.splice(index, 1);
    }

    saveChargeList() {
        this.isSubmitted = true;

        if (!this.charges.length) {
            this._toastService.warning("Please add charge");
            return;
        }

        if (!this.checkValidate()) {
            return;
        }

        if (!this.checkDuplicate()) {
            return;
        }

        const listChargesToSave = cloneDeep(this.charges);
        for (const charge of listChargesToSave) {

            if (charge.type === CommonEnum.CHARGE_TYPE.OBH) {
                // swap để map field cho chage obh
                charge.payerId = charge.paymentObjectId;
                charge.paymentObjectId = charge.obhId;
            }
            const date = charge.invoiceDate;
            if (typeof date !== 'string') {
                if (!!date && !!date.startDate) {
                    charge.invoiceDate = new Date(date.startDate);
                } else {
                    charge.invoiceDate = null;
                }
            }
        }

        if (this.isUpdate) {
            this.onUpdate.emit(listChargesToSave);
        } else {
            this.onChange.emit(listChargesToSave);
        }
        this.hide();
    }

    calculateTotal(vat: number, quantity: number, unitPrice: number, chargeItem: Surcharge) {
        this.isSubmitted = false;
        chargeItem.total = this.utility.calculateTotalAmountWithVat(vat, quantity, unitPrice);
    }

    getPartnerById(id: string) {
        const partner: Partner = this.listPartner.find((p: Partner) => p.id === id);
        return partner || null;
    }

    initTableListCharge() {
        this.charges = [];
    }

    checkValidate() {
        let valid: boolean = true;
        for (const charge of this.charges) {
            if (
                !charge.paymentObjectId
                || !charge.chargeId
                || charge.quantity === null
                || !charge.unitId
                || charge.unitPrice === null
                || charge.quantity < 0
                || charge.unitPrice < 0
                || charge.vatrate > 100
                || charge.type.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase() && !charge.obhId
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    checkDuplicate() {
        let valid: boolean = true;
        if (this.utility.checkDuplicateInObject("chargeId", this.charges) && this.utility.checkDuplicateInObject("invoiceNo", this.charges)) {
            this.isDuplicateChargeCode = true;
            this.isDuplicateInvoice = true;
            valid = false;
            this._toastService.warning("The Charge code and InvoiceNo is duplicated");
            return;
        } else {
            valid = true;
            this.isDuplicateChargeCode = false;
            this.isDuplicateInvoice = false;
        }
        return valid;
    }

    resetFormControl(control: FormControl | AbstractControl) {
        if (!!control && control instanceof FormControl) {
            control.setValue(null);
            control.markAsUntouched({ onlySelf: true });
            control.markAsPristine({ onlySelf: true });
        }
    }

    updateChargeType(type: string) {
        switch (type) {
            case CommonEnum.CHARGE_TYPE.CREDIT:
                return CommonEnum.SurchargeTypeEnum.BUYING_RATE;
            case CommonEnum.CHARGE_TYPE.DEBIT:
                return CommonEnum.SurchargeTypeEnum.SELLING_RATE;
            default:
                return CommonEnum.SurchargeTypeEnum.OBH;
        }
    }

}

interface IAdvanceShipment {
    id: string;
    requestDate: string;
    jobId: string;
    hbl: string;
    mbl: string;
    amount: number;
    requestCurrency: string;
    advanceNo: string;
}


