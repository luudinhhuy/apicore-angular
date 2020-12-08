import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { AppList } from 'src/app/app.list';
import { AccountingRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { StatementOfAccountAddChargeComponent } from '../components/poup/add-charge/add-charge.popup';
import { ToastrService } from 'ngx-toastr';
import { SOASearchCharge } from 'src/app/shared/models';
import _includes from 'lodash/includes';
import _uniq from 'lodash/uniq';
import { StatementOfAccountFormCreateComponent } from '../components/form-create-soa/form-create-soa.component';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'app-statement-of-account-new',
    templateUrl: './add-new-soa.component.html',
    styleUrls: ['./add-new-soa.component.scss'],
})
export class StatementOfAccountAddnewComponent extends AppList {

    @ViewChild(StatementOfAccountAddChargeComponent, { static: false }) addChargePopup: StatementOfAccountAddChargeComponent;
    @ViewChild(StatementOfAccountFormCreateComponent, { static: false }) formCreate: StatementOfAccountFormCreateComponent;


    dataSearch: SOASearchCharge = new SOASearchCharge();

    listCharges: any[] = [];
    headers: CommonInterface.IHeaderTable[];

    totalShipment: number = 0;
    totalCharge: number = 0;

    isCollapsed: boolean = true;
    isCheckAllCharge: boolean = false;

    dataCharge: any = null;

    constructor(
        private _sortService: SortService,
        private _accountRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
    ) {
        super();
        this.requestSort = this.sortLocal;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'chargeName', sortable: true },
            { title: 'JobID', field: 'jobId', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'Custom No', field: 'customNo', sortable: true },
            { title: 'Debit', field: 'debit', sortable: true },
            { title: 'Credit', field: 'credit', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'Invoice No', field: 'invoiceNo', sortable: true },
            { title: 'C/D Note', field: 'cdNote', sortable: true },
            { title: 'Services Date', field: 'serviceDate', sortable: true },
            { title: 'Note', field: 'note', sortable: true },
        ];
    }

    addMoreCharge() {
        this.formCreate.isApplied = true;
        if (this.formCreate.isApplied && !this.formCreate.selectedRangeDate.startDate || !this.formCreate.selectedPartner.value) {
            return;
        } else {
            this.addChargePopup.searchInfo = this.dataSearch;
            this.addChargePopup.getListShipmentAndCDNote(this.formCreate.dataSearch);

            this.addChargePopup.charges = this.formCreate.charges;
            this.addChargePopup.configCharge = this.formCreate.configCharge;

            this.addChargePopup.commodityGroup = this.formCreate.commodityGroup;
            this.addChargePopup.commodity = this.formCreate.commodity;

            this.addChargePopup.show({ backdrop: 'static' });
        }
    }

    sortLocal(sortField?: string, order?: boolean) {
        this.listCharges = this._sortService.sort(this.listCharges, sortField, order);
    }

    onChangeCheckBoxCharge($event: Event) {
        this.isCheckAllCharge = this.listCharges.every((item: any) => item.isSelected);
    }

    checkUncheckAllCharge() {
        for (const charge of this.listCharges) {
            charge.isSelected = this.isCheckAllCharge;
        }
    }

    onCreateSOA() {
        if (!this.listCharges.length) {
            this._toastService.warning(`SOA Don't have any charges in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
            return;
        } else {
            const body = {
                surcharges: this.listCharges.map((item: any) => ({
                    surchargeId: item.id,
                    type: item.type
                })),
                soaformDate: this.dataSearch.fromDate,
                soatoDate: this.dataSearch.toDate,
                currency: this.dataSearch.currency,
                note: this.dataSearch.note,
                dateType: this.dataSearch.dateType,
                serviceTypeId: !!this.formCreate.selectedService.length ? this.formCreate.mapServiceId(this.formCreate.selectedService[0].id) : this.formCreate.mapServiceId('All'),
                customer: this.dataSearch.customerID,
                type: this.dataSearch.type,
                obh: this.dataSearch.isOBH,
                creatorShipment: this.dataSearch.strCreators,
                commodityGroupId: this.dataSearch.commodityGroupId
            };
            this._progressRef.start();
            this._accountRepo.createSOA(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                )
                .subscribe(
                    (res: any) => {
                        if (res.status) {
                            this._toastService.success(res.message, '', { positionClass: 'toast-bottom-right' });
                            //  * go to detail page
                            this._router.navigate(['home/accounting/statement-of-account/detail'], { queryParams: { no: res.data.soano, currency: 'VND' } });

                        } else {
                            this._toastService.error(res, '', { positionClass: 'toast-bottom-right' });
                        }
                    },
                );
        }
    }

    updateDataSearch(key: string, data: any) {
        this.dataSearch[key] = data;
    }

    searchChargeWithDataSearch(dataSearch: any) {
        this.isLoading = true;
        this.dataSearch = dataSearch;
        this._accountRepo.getListChargeShipment(dataSearch)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; })
            )
            .subscribe(
                (res: any) => {
                    this.dataCharge = res;
                    this.listCharges = res.chargeShipments || [];
                    this.totalCharge = res.totalCharge;
                    this.totalShipment = res.totalShipment;

                    this.updateDataSearch('chargeShipments', this.listCharges);
                },
            );
    }

    removeCharge() {
        this.listCharges = this.listCharges.filter((charge: any) => !charge.isSelected);
        this.dataSearch.chargeShipments = this.listCharges;
    }

    onUpdateMoreSOA(data: any) {
        // this.formCreate.commondity = data.commodityGroupId;
        this.dataCharge = data;
        this.listCharges = data.chargeShipments || [];
        this.dataSearch.chargeShipments = this.listCharges;

        this.totalCharge = data.totalCharge;
        this.totalShipment = data.shipment;
    }
}




