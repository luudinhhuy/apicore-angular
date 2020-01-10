import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { AccountingRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { SortService, BaseService } from 'src/app/shared/services';
import { NgProgress } from '@ngx-progressbar/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, } from 'rxjs/operators';
import { User, SettlementPayment } from 'src/app/shared/models';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ReportPreviewComponent } from 'src/app/shared/common';

@Component({
    selector: 'app-settlement-payment',
    templateUrl: './settlement-payment.component.html',
})
export class SettlementPaymentComponent extends AppList {

    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;

    headers: CommonInterface.IHeaderTable[];
    settlements: SettlementPayment[] = [];
    selectedSettlement: SettlementPayment;

    dataSearch: any = {};

    customClearances: any[] = [];
    headerCustomClearance: CommonInterface.IHeaderTable[];

    userLogged: User;
    dataReport: any = null;

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _baseService: BaseService,
        private _router: Router
    ) {
        super();
        this._progressRef = this._progressService.ref();

        this.requestList = this.getListSettlePayment;
        this.requestSort = this.sortSettlementPayment;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Settlement No', field: 'settlementNo', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'chargeCurrency', sortable: true },
            { title: 'Requester', field: 'requester', sortable: true },
            { title: 'Request Date', field: 'requestDate', sortable: true },
            { title: 'Status Approval', field: 'statusApproval', sortable: true },
            { title: 'Payment method', field: 'paymentMethod', sortable: true },
            { title: 'Description', field: 'note', sortable: true },
        ];

        this.headerCustomClearance = [
            { title: 'JobID', field: 'jobId', sortable: true },
            { title: 'MBL', field: 'mbl', sortable: true },
            { title: 'HBL', field: 'hbl', sortable: true },
            { title: 'Amount', field: 'amount', sortable: true },
            { title: 'Currency', field: 'chargeCurrency', sortable: true }
        ];
        this.getUserLogged();
        this.getListSettlePayment();

    }

    showSurcharge(settlementNo: string, indexsSettle: number) {
        if (!!this.settlements[indexsSettle].settleRequests.length) {
            this.customClearances = this.settlements[indexsSettle].settleRequests;
        } else {
            this._progressRef.start();
            this._accoutingRepo.getShipmentOfSettlements(settlementNo)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                ).subscribe(
                    (res: any[]) => {
                        if (!!res) {
                            this.customClearances = res;
                            this.settlements[indexsSettle].settleRequests = res;
                        }
                    },
                );
        }

    }

    getUserLogged() {
        this.userLogged = this._baseService.getUserLogin() || 'admin';
    }


    onSearchSettlement(data: any) {
        this.dataSearch = data;
        this.getListSettlePayment(this.dataSearch);
    }


    sortByCustomClearance(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.customClearances = this._sortService.sort(this.customClearances, sortData.sortField, sortData.order);
        }
    }

    getListSettlePayment(dataSearch?: any) {
        this.isLoading = true;
        this._progressRef.start();
        this._accoutingRepo.getListSettlementPayment(this.page, this.pageSize, Object.assign({}, dataSearch, { requester: this.userLogged.id }))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new SettlementPayment(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.settlements = res.data;
                },
            );
    }

    showDeletePopup(settlement: SettlementPayment) {
        this.selectedSettlement = settlement;
        this.confirmDeletePopup.show();
    }

    onDeleteSettlemenPayment() {
        this.confirmDeletePopup.hide();
        this.deleteSettlement(this.selectedSettlement.settlementNo);
    }

    deleteSettlement(settlementNo: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._accoutingRepo.deleteSettlement(settlementNo)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getListSettlePayment();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    sortSettlementPayment(sort: string): void {
        this.settlements = this._sortService.sort(this.settlements, sort, this.order);
    }

    gotoDetailSettlement(settlement: SettlementPayment) {
        switch (settlement.statusApproval) {
            case 'New':
            case 'Denied':
                this._router.navigate([`home/accounting/settlement-payment/${settlement.id}`]);
                break;
            default:
                this._router.navigate([`home/accounting/settlement-payment/${settlement.id}/approve`]);
                break;
        }

    }

    printSettlement(settlementNo: string) {
        this._accoutingRepo.previewSettlementPayment(settlementNo)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (res != null) {
                        this.dataReport = res;
                        setTimeout(() => {
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }




}
