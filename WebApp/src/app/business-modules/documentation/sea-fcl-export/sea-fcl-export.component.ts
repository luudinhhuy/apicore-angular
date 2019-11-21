import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';

import { SortService } from 'src/app/shared/services/sort.service';
import { InfoPopupComponent, ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { AppList } from 'src/app/app.list';
import { SeaFCLExportLoadAction } from './store/actions/sea-fcl-export.action';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { CsTransactionDetail } from 'src/app/shared/models';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { catchError, finalize } from 'rxjs/operators';

import * as fromStore from './store';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-sea-fcl-export',
    templateUrl: './sea-fcl-export.component.html',
})
export class SeaFCLExportComponent extends AppList {

    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;

    headers: CommonInterface.IHeaderTable[];
    headersHBL: CommonInterface.IHeaderTable[];

    shipments: any[] = [];
    houseBills: CsTransactionDetail[] = [];

    itemToDelete: any = null;

    constructor(
        private router: Router,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _ngProgessService: NgProgress,
        private _store: Store<fromStore.ISeaFCLExport>
    ) {
        super();

        this._progressRef = this._ngProgessService.ref();

        this.requestList = this.requestSearchShipment;
        this.requestSort = this.sortShipment;

        this.isLoading = <any>this._store.select(fromStore.getSeaFCLShipmentLoading);

        this.dataSearch = {
            transactionType: CommonEnum.TransactionTypeEnum.SeaFCLExport,
            fromDate: this.ranges['This Month'][0],
            toDate: this.ranges['This Month'][1],
        };

    }

    ngOnInit() {
        this.headers = [
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'MBL No', field: 'mawb', sortable: true },
            { title: 'ETD', field: 'etd', sortable: true },
            { title: 'ETA', field: 'eta', sortable: true },
            { title: 'Supplier', field: 'supplierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'POL', field: 'polName', sortable: true },
            { title: 'POD', field: 'podName', sortable: true },
            { title: 'Total Cont', field: 'sumCont', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
            { title: 'Creator', field: 'userCreated', sortable: true },
            { title: 'Created Date', field: 'datetimeCreated', sortable: true },
            { title: 'Modified Date', field: 'datetimeModified', sortable: true },
        ];
        this.headersHBL = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Sale Man', field: 'saleManName', sortable: true },
            { title: 'Notify Party', field: 'notifyParty', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Containers', field: 'containers', sortable: true },
            { title: 'Packages', field: 'packages', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true },
        ];

        this.requestSearchShipment();
        this.getShipments();
    }


    getShipments() {
        this._store.select(fromStore.getSeaFCLExportShipment)
            .subscribe(
                (res: CommonInterface.IResponsePaging | any) => {
                    this.shipments = res.data || [];
                    this.totalItems = res.totalItems;
                    console.log(this.shipments);
                }
            );
    }

    sortShipment(sortField: string) {
        this.shipments = this._sortService.sort(this.shipments, sortField, this.order);
    }

    sortHBL(sortField: string, order: boolean) {
        this.houseBills = this._sortService.sort(this.houseBills, sortField, order);
    }

    getListHouseBill(jobId: any, index: number) {
        if (!!this.shipments[index].houseBillList && !!this.shipments[index].houseBillList.length) {
            this.houseBills = this.shipments[index].houseBillList || [];
        } else {
            this._progressRef.start();
            this._documentRepo.getListHouseBillOfJob({ jobId: jobId })
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: any) => {
                        this.houseBills = res || [];
                        console.log(this.houseBills);

                        this.shipments[index].houseBillList = res;
                    }
                );

        }
    }

    showDetail(item: { id: any; }) {
        this.router.navigate(["/home/documentation/sea-fcl-export-create/", { id: item.id }]);
    }

    onSearchShipment($event: any) {
        this.dataSearch = $event;
        this.requestSearchShipment();
    }

    requestSearchShipment() {
        this._store.dispatch(new SeaFCLExportLoadAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
    }

    confirmDelete(item: { id: string; }) {
        this.itemToDelete = item;
        this._progressRef.start();
        this._documentRepo.checkMasterBillAllowToDelete(item.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (respone: boolean) => {
                    if (respone === true) {
                        this.confirmDeletePopup.show();
                    } else {
                        this.infoPopup.show();
                    }
                }
            );
    }

    deleteJob() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();

        this._documentRepo.checkMasterBillAllowToDelete(this.itemToDelete.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        this._store.dispatch(new SeaFCLExportLoadAction({ page: this.page, size: this.pageSize, dataSearch: this.dataSearch }));
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}
