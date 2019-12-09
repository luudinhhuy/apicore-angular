import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { AppList } from 'src/app/app.list';
import { CsTransactionDetail } from 'src/app/shared/models/document/csTransactionDetail';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { SortService } from 'src/app/shared/services';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { Container } from 'src/app/shared/models/document/container.model';
import { CsShipmentSurcharge, HouseBill } from 'src/app/shared/models';
import { ReportPreviewComponent } from 'src/app/shared/common';

import * as fromShareBussiness from './../../../../share-business/store';

import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-sea-fcl-import-hbl',
    templateUrl: './sea-fcl-import-hbl.component.html',
})
export class SeaFCLImportHBLComponent extends AppList {
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild('confirmDeleteJob', { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;

    jobId: string = '';
    headers: CommonInterface.IHeaderTable[];
    houseBill: HouseBill[] = [];

    containers: Observable<Container[]>;
    selectedShipment: any; // TODO model.
    selectedHbl: HouseBill;

    charges: CsShipmentSurcharge[] = new Array<CsShipmentSurcharge>();

    selectedTabSurcharge: string = 'BUY';
    dataReport: any = null;

    totalCBM: number;
    totalGW: number;

    constructor(
        private _router: Router,
        private _sortService: SortService,
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress,
        private _store: Store<fromShareBussiness.ITransactionState>,
        private cdr: ChangeDetectorRef,
        private _activedRoute: ActivatedRoute
    ) {
        super();
        this.requestSort = this.sortLocal;
        this._progressRef = this._progressService.ref();

    }

    ngOnInit(): void {
        this._activedRoute.params
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((param: Params) => {
                if (param.jobId) {
                    this.jobId = param.jobId;
                    this._store.dispatch(new fromShareBussiness.GetListHBLAction({ jobId: this.jobId }));
                    this.getHourseBill(this.jobId);
                }
            });

        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'SaleMan', field: 'saleManName', sortable: true },
            { title: 'Notify Party', field: 'notifyParty', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Containers', field: 'containers', sortable: true },
            { title: 'Package', field: 'packages', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true }
        ];

        this.containers = this._store.select(fromShareBussiness.getHBLContainersState);
        this.selectedShipment = this._store.select(fromShareBussiness.getTransactionDetailCsTransactionState);
    }

    ngAfterViewInit() {
        this.cdr.detectChanges();
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
        }
    }

    sortLocal(sort: string): void {
        this.houseBill = this._sortService.sort(this.houseBill, sort, this.order);
    }

    gotoCreateHouseBill() {
        this._router.navigate([`/home/documentation/sea-fcl-import/${this.jobId}/hbl/new`]);
    }

    showDeletePopup(hbl: HouseBill, event: Event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        this.confirmDeletePopup.show();
        this.selectedHbl = hbl;
    }

    deleteHbl(id: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._documentRepo.deleteHbl(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getHourseBill(this.jobId);
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    onDeleteHbl() {
        this.confirmDeletePopup.hide();
        this.deleteHbl(this.selectedHbl.id);
    }

    getHourseBill(id: string) {
        this._store.select(fromShareBussiness.getHBLSState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbls: any[]) => {
                    this.houseBill = hbls;
                    if (!!this.houseBill.length) {
                        this.totalGW = this.houseBill.reduce((acc: number, curr: HouseBill) => acc += curr.gw, 0);
                        this.totalCBM = this.houseBill.reduce((acc: number, curr: HouseBill) => acc += curr.cbm, 0);
                        this.selectHBL(this.houseBill[0]);
                    } else {
                        this.selectedHbl = null;
                    }
                }
            );
    }

    selectHBL(hbl: HouseBill) {
        this.selectedHbl = new HouseBill(hbl);

        // * Get container, Job detail, Surcharge with hbl id, JobId.
        this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction(hbl));
        this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ hblid: hbl.id }));
        this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(hbl.jobId));
        this._store.dispatch(new fromShareBussiness.GetProfitHBLAction(this.selectedHbl.id));

        switch (this.selectedTabSurcharge) {
            case 'BUY':
                this._store.dispatch(new fromShareBussiness.GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                break;
            case 'SELL':
                this._store.dispatch(new fromShareBussiness.GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                break;
            case 'OBH':
                this._store.dispatch(new fromShareBussiness.GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                break;
            default:
                break;
        }
    }

    onSelectTabSurcharge(tabName: string) {
        this.selectedTabSurcharge = tabName;

        if (!!this.selectedHbl) {
            switch (this.selectedTabSurcharge) {
                case 'BUY':
                    this._store.dispatch(new fromShareBussiness.GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                    break;
                case 'SELL':
                    this._store.dispatch(new fromShareBussiness.GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                    break;
                case 'OBH':
                    this._store.dispatch(new fromShareBussiness.GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                    break;
                default:
                    break;
            }
        }
    }

    duplicateConfirm() {
        this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }

    gotoList() {
        this._router.navigate(["home/documentation/sea-fcl-import"]);
    }

    deleteJob() {
        this.confirmDeleteJobPopup.show();
    }

    onDeleteJob() {
        this._progressRef.start();
        this._documentRepo.deleteMasterBill(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeleteJobPopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');

                        this.gotoList();
                    }
                },
            );
    }

    previewPLsheet(currency: string) {
        this._documentRepo.previewSIFPLsheet(this.jobId, currency)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        setTimeout(() => {
                            this.previewPopup.frm.nativeElement.submit();
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }
}
