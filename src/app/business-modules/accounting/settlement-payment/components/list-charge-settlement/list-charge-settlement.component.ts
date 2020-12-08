import { Component, ViewChild, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { SettlementExistingChargePopupComponent } from '../popup/existing-charge/existing-charge.popup';
import { SettlementFormChargePopupComponent } from '../popup/form-charge/form-charge.popup';
import { Surcharge, Currency, Partner } from 'src/app/shared/models';
import { BehaviorSubject } from 'rxjs';
import { SettlementPaymentManagementPopupComponent } from '../popup/payment-management/payment-management.popup';
import { SettlementTableSurchargeComponent } from '../table-surcharge/table-surcharge.component';
import { SettlementShipmentItemComponent } from '../shipment-item/shipment-item.component';
import { SortService } from 'src/app/shared/services';
import { ToastrService } from 'ngx-toastr';
import { SettlementFormCopyPopupComponent } from '../popup/copy-settlement/copy-settlement.popup';
import { SettlementTableListChargePopupComponent } from '../popup/table-list-charge/table-list-charge.component';

import _includes from 'lodash/includes';
import _cloneDeep from 'lodash/cloneDeep';
import cloneDeep from 'lodash/cloneDeep';
import { CommonEnum } from '@enums';
@Component({
    selector: 'settle-payment-list-charge',
    templateUrl: './list-charge-settlement.component.html',
})

export class SettlementListChargeComponent extends AppList {
    @Output() onChangeType: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(SettlementExistingChargePopupComponent, { static: true }) existingChargePopup: SettlementExistingChargePopupComponent;
    @ViewChild(SettlementFormChargePopupComponent, { static: false }) formChargePopup: SettlementFormChargePopupComponent;
    @ViewChild(SettlementPaymentManagementPopupComponent, { static: false }) paymentManagementPopup: SettlementPaymentManagementPopupComponent;
    @ViewChild(SettlementFormCopyPopupComponent, { static: false }) copyChargePopup: SettlementFormCopyPopupComponent;
    @ViewChild(SettlementTableListChargePopupComponent, { static: true }) tableListChargePopup: SettlementTableListChargePopupComponent;


    @ViewChildren('tableSurcharge') tableSurchargeComponent: QueryList<SettlementTableSurchargeComponent>;
    @ViewChildren('headingShipmentGroup') headingShipmentGroup: QueryList<SettlementShipmentItemComponent>;

    groupShipments: any[] = [];
    headers: CommonInterface.IHeaderTable[];

    surcharges: Surcharge[] = [];
    selectedSurcharge: Surcharge = new Surcharge();
    selectedIndexSurcharge: number;

    stateFormCharge: string = 'create';

    openAllCharge: BehaviorSubject<boolean> = new BehaviorSubject(false);
    settlementCode: string = '';

    TYPE: string = 'LIST';
    STATE: string = 'WRITE';  // * list'state READ/WRITE

    isShowButtonCopyCharge: boolean = false;

    constructor(
        private _sortService: SortService,
        private _toastService: ToastrService,
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'JobId - HBL - MBL', field: 'jobId', sortable: true, width: 200 },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'Qty', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unitName', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currencyId', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: 'Amount', field: 'total', sortable: true },
            { title: 'Payer', field: 'payer', sortable: true },
            { title: 'OBH Partner', field: 'obhPartnerName', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'Series No', field: 'seriesNo', sortable: true },
            { title: 'Inv Date', field: 'invoiceDate', sortable: true },
            { title: 'Custom No', field: 'clearanceNo', sortable: true },
            { title: 'Cont No', field: 'contNo', sortable: true },
            { title: 'Note', field: 'notes', sortable: true },
        ];
        this.selectedSurcharge = this.surcharges[0];
    }

    showExistingCharge() {
        this.existingChargePopup.show();
    }

    showCreateCharge() {
        // this.formChargePopup.settlementCode = this.settlementCode;
        // this.stateFormCharge = 'create';
        // this.formChargePopup.action = 'create';
        // this.formChargePopup.show();
        this.tableListChargePopup.isSubmitted = false;
        this.tableListChargePopup.isUpdate = false;
        this.tableListChargePopup.formGroup.reset();
        this.tableListChargePopup.initTableListCharge();
        this.tableListChargePopup.show();
    }

    onRequestSurcharge(surcharge: any) {
        // this.surcharges.push(surcharge);
        this.surcharges = [...this.surcharges, ...surcharge];
        this.TYPE = 'LIST'; // * SWITCH UI TO LIST
    }

    onUpdateSurchargeFromTableChargeList(charges: Surcharge[]) {
        if (charges.length === 1) {
            const indexChargeUpdating: number = this.surcharges.findIndex(item => item.hblid === charges[0].hblid);
            if (indexChargeUpdating !== -1) {
                this.surcharges[indexChargeUpdating] = charges[0];
                this.surcharges = [...this.surcharges];
            }
        } else {
            for (const i of charges) {
                const indexChargeUpdating: number = this.surcharges.findIndex(item => item.hblid === i.hblid && item.id === i.id);
                if (indexChargeUpdating !== -1) {
                    this.updateSurchargeWithIndex(indexChargeUpdating, i);
                } else {
                    this.surcharges = [...this.surcharges, i];
                }
            }
        }
    }

    updateSurchargeWithIndex(index: number, surcharge: Surcharge) {
        this.surcharges[index] = surcharge;
        this.surcharges = [...this.surcharges];
    }

    onUpdateRequestSurcharge(surcharge: any) {
        this.TYPE = 'LIST'; // * SWITCH UI TO LIST
        this.surcharges[this.selectedIndexSurcharge] = surcharge;
        this.surcharges = [...this.surcharges];

        if (this.formChargePopup.isContinue) {
            // * Update next charge.
            this.openSurchargeDetail(this.surcharges[this.selectedIndexSurcharge + 1], this.selectedIndexSurcharge + 1, 'update');
        }
    }

    openSurchargeDetail(surcharge: Surcharge, index?: number, action?: string) {
        if (this.STATE !== 'WRITE') {
            return;
        } else {
            // * CHECK SURCHARGE IS FROM SHIPMENT.
            if (!surcharge || surcharge.isFromShipment) {
                return;
            } else if (this.TYPE === 'LIST') {
                this.selectedIndexSurcharge = index;
            } else {
                const indexSurcharge: number = this.surcharges.findIndex(item => item.id === surcharge.id);
                if (indexSurcharge !== - 1) {
                    this.selectedIndexSurcharge = indexSurcharge;
                }
            }
            this.selectedSurcharge = surcharge;
            this.stateFormCharge = 'update';

            this.formChargePopup.action = action;
            this.formChargePopup.settlementCode = this.selectedSurcharge.settlementCode;
            this.formChargePopup.initFormUpdate(this.selectedSurcharge);
            this.formChargePopup.calculateTotalAmount();

            this.formChargePopup.show();
        }
    }

    changeCurrency(currency: string) {
        // this.formChargePopup.currency.setValue(currency.id);
        this.tableListChargePopup.currencyId = currency || 'VND';
    }

    returnShipmet(item: any) {
        return item.shipment.jobId;
    }

    onClickHeadingShipment(data: any): boolean {
        // * prevent collapse/expand within accordion-heading
        data.event.stopPropagation();
        data.event.preventDefault();

        this.paymentManagementPopup.getDataPaymentManagement(data.data.jobId, data.data.hbl, data.data.mbl);
        setTimeout(() => {
            this.paymentManagementPopup.show();
        }, 500);
        return false;
    }

    // * Handle checkbox from heading
    onCheckBoxShipmentItemInGroupShipment(isCheck: boolean, indexShipmentItem: number): any {
        const tableChargeChildComponent: SettlementTableSurchargeComponent[] = this.tableSurchargeComponent.toArray();
        tableChargeChildComponent[indexShipmentItem].isCheckAll = isCheck;
        tableChargeChildComponent[indexShipmentItem].checkUncheckAllCharge();

        this.groupShipments[indexShipmentItem].isSelected = true;
    }

    // * Handle checkbox from listCharge in group.
    onChangeCheckBoxSurChargeListInGroupShipment(isCheckAll: boolean, indexShipmentItem: number) {
        const headingShipmentComponent: SettlementShipmentItemComponent[] = this.headingShipmentGroup.toArray();
        headingShipmentComponent[indexShipmentItem].isCheckAll = isCheckAll;
    }

    deleteShipmentItem() {
        if (this.TYPE === 'GROUP') {
            this.surcharges = [];
            const lastGroupShipment: any[] = this.groupShipments.filter((groupItem: any) => !groupItem.isSelected);

            for (const groupShipment of this.groupShipments) {
                groupShipment.chargeSettlements = this.returnChargeFromShipment(groupShipment);
            }

            // * UPDATE SURCHARGE LIST.
            for (const groupShipmentItem of lastGroupShipment) {
                this.surcharges.push(...groupShipmentItem.chargeSettlements);
            }

            // * UPDATE GROUP SHIPMENT LIST
            this.groupShipments = this.groupShipments.filter((groupItem: any) => groupItem.chargeSettlements.length);
        } else {
            const surchargeSelected: Surcharge[] = this.surcharges.filter((surcharge: Surcharge) => surcharge.isSelected);

            if (!!surchargeSelected.length) {
                this.surcharges = this.surcharges.filter((surcharge: Surcharge) => !surcharge.isSelected);
            } else {
                this._toastService.warning(`Don't have any charges in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
                return;
            }
        }
        const headingShipmentComponent: SettlementShipmentItemComponent[] = this.headingShipmentGroup.toArray();

        // * Reset check all in heading shipment group.
        for (const item of headingShipmentComponent) {
            item.isCheckAll = false;
        }
    }

    returnChargeFromShipment(groupShipment: any) {
        return groupShipment.chargeSettlements.filter((surcharge: Surcharge) => !surcharge.isSelected);
    }

    sortSurcharge(sortData: any) {
        this.surcharges = this._sortService.sort(this.surcharges, sortData.sortField, sortData.order);
    }

    checkUncheckAllCharge() {
        for (const charge of this.surcharges) {
            charge.isSelected = this.isCheckAll;
        }
    }

    onChangeCheckBoxCharge() {
        this.isCheckAll = this.surcharges.every((item: Surcharge) => item.isSelected);
    }

    showPaymentManagement(surcharge: Surcharge) {
        this.paymentManagementPopup.getDataPaymentManagement(surcharge.jobId, surcharge.hbl, surcharge.mbl);
        setTimeout(() => {
            this.paymentManagementPopup.show();
        }, 500);
    }

    openCopySurcharge(surcharge: Surcharge) {
        this.formChargePopup.selectedSurcharge = surcharge;
        this.openSurchargeDetail(surcharge, null, 'copy');
    }

    switchToGroup() {
        if (this.TYPE === 'GROUP') {
            this.TYPE = 'LIST';
        } else if (this.STATE !== 'READ') {
            this.onChangeType.emit();
        } else {
            this.TYPE = 'GROUP';
        }

        this.selectedIndexSurcharge = null;
    }

    showCopyCharge() {
        this.copyChargePopup.show();
    }

    updateChargeWithJob(charge: Surcharge, index?: number) {
        if (this.STATE !== 'WRITE') { return; }
        this.selectedIndexSurcharge = index;
        if (!charge || charge.isFromShipment) {
            return;
        }
        const shipment = this.tableListChargePopup.shipments.find(s => s.jobId === charge.jobId && s.hbl === charge.hbl && s.mbl === charge.mbl);
        if (!!shipment) {
            this.tableListChargePopup.selectedShipment = shipment;

            // * Filter charge with hblID.
            const surcharges: Surcharge[] = this.surcharges.filter((surcharge: Surcharge) => surcharge.hblid === charge.hblid);
            if (!!surcharges.length) {
                this.tableListChargePopup.charges = cloneDeep(surcharges);

                this.tableListChargePopup.charges.forEach(item => {

                    if (item.type.toLowerCase() === CommonEnum.CHARGE_TYPE.OBH.toLowerCase()) {
                        // get partner theo payerId.
                        const partner: Partner = this.tableListChargePopup.listPartner.find(p => p.id === item.payerId);
                        if (!!partner) {
                            // swap để map field cho chage obh
                            item.payer = partner.shortName;
                            item.obhId = item.paymentObjectId;
                            item.paymentObjectId = item.payerId;
                        }
                    } else {
                        // get partner theo paymentObjectId.
                        const partner: Partner = this.tableListChargePopup.listPartner.find(p => p.id === item.paymentObjectId);
                        if (!!partner) {
                            item.payer = partner.shortName;
                        }
                    }

                    if (!!item.invoiceDate && typeof item.invoiceDate === 'string') {
                        item.invoiceDate = { startDate: new Date(item.invoiceDate), endDate: new Date(item.invoiceDate) };
                    }
                });

                // * Update value form.
                this.tableListChargePopup.formGroup.patchValue({
                    shipment: shipment.hblid,
                    advanceNo: surcharges[0].advanceNo
                });

                this.tableListChargePopup.isUpdate = true;
                this.tableListChargePopup.show();
            }

        }
    }
}


