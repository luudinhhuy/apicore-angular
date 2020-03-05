import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';

import { AppList } from 'src/app/app.list';
import { getParamsRouterState } from 'src/app/store';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { CsTransactionDetail, HouseBill, CsTransaction } from 'src/app/shared/models';
import { ConfirmPopupComponent, Permission403PopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';

import { catchError, finalize, takeUntil, take, skip } from 'rxjs/operators';

import * as fromShareBussiness from '../../../../share-business/store';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'app-air-export-hbl',
    templateUrl: './air-export-hbl.component.html'
})

export class AirExportHBLComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeleteHBLPopup: ConfirmPopupComponent;
    @ViewChild('confirmDeleteJob', { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;
    @ViewChild(Permission403PopupComponent, { static: false }) info403Popup: Permission403PopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteJobPopup: InfoPopupComponent;

    jobId: string;
    headers: CommonInterface.IHeaderTable[];
    houseBills: HouseBill[] = [];
    shipmentDetail: CsTransaction;

    selectedHbl: CsTransactionDetail;
    selectedIndexHBL: number = -1;

    selectedTabSurcharge: string = 'BUY';

    dataReport: any = null;

    totalCBM: number;
    totalGW: number;
    totalCW: number;

    spinnerSurcharge: string = 'spinnerSurcharge';

    constructor(
        private _router: Router,
        private _store: Store<fromShareBussiness.IShareBussinessState>,
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress,
        private _spinner: NgxSpinnerService
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this._store.select(getParamsRouterState)
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe((param: Params) => {
                if (param.jobId) {
                    this.jobId = param.jobId;

                    this._store.dispatch(new fromShareBussiness.GetListHBLAction({ jobId: this.jobId }));
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                    this.getDetailShipment();
                    this.getHouseBills(this.jobId);
                }
            });

        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'SaleMan', field: 'saleManName', sortable: true },
            { title: 'Departure', field: 'finalDestinationPlace', sortable: true },
            { title: 'Destination', field: 'finalDestinationPlace', sortable: true },
            { title: 'Package', field: 'packages', sortable: true },
            { title: 'C.W', field: 'cw', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true }
        ];

        this.isLocked = this._store.select(fromShareBussiness.getTransactionLocked);
        this.isLoading = this._store.select(fromShareBussiness.getHBLLoadingState);

        this._store.select(fromShareBussiness.getSurchargeLoadingState).subscribe(
            (loading: boolean) => {
                if (loading) {
                    this._spinner.show(this.spinnerSurcharge);
                } else {
                    this._spinner.hide(this.spinnerSurcharge);
                }
            }
        );
    }

    getHouseBills(id: string) {
        this._store.select(fromShareBussiness.getHBLSState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbls: any[]) => {
                    this.houseBills = hbls;
                    if (!!this.houseBills.length) {
                        this.totalGW = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.gw, 0);
                        this.totalCBM = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.cbm, 0);
                        this.totalCW = this.houseBills.reduce((acc: number, curr: HouseBill) => acc += curr.cw, 0);

                        this.selectHBL(this.houseBills[0]);
                    } else {
                        this.selectedHbl = null;
                    }
                }
            );
    }

    getDetailShipment() {
        this._store.select<any>(fromShareBussiness.getTransactionDetailCsTransactionState)
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipmentDetail = res;
                    }
                },
            );
    }

    showDeletePopup(hbl: CsTransactionDetail, event: Event, index: number) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();

        this.confirmDeleteHBLPopup.show();
        this.selectedIndexHBL = index;
        this.selectedHbl = hbl;

    }

    onDeleteHbl() {
        this.confirmDeleteHBLPopup.hide();
        this.deleteHbl(this.selectedHbl.id);
    }

    deleteHbl(id: string) {
        this._progressRef.start();
        this._documentRepo.deleteHbl(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        if (this.selectedIndexHBL > -1) {
                            this.houseBills = [...this.houseBills.slice(0, this.selectedIndexHBL), ...this.houseBills.slice(this.selectedIndexHBL + 1)];
                            if (!!this.houseBills.length) {
                                this.selectHBL(this.houseBills[0]);
                            }
                        }
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    prepareDeleteJob() {
        this._documentRepo.checkPermissionAllowDeleteShipment(this.jobId)
            .subscribe((value: boolean) => {
                if (value) {
                    this.deleteJob();
                } else {
                    this.info403Popup.show();
                }
            });
    }

    deleteJob() {
        this._progressRef.start();
        this._documentRepo.checkMasterBillAllowToDelete(this.jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.confirmDeleteJobPopup.show();
                    } else {
                        this.canNotDeleteJobPopup.show();
                    }
                },
            );
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

    gotoList() {
        this._router.navigate(["home/documentation/air-export"]);
    }

    gotoCreate() {
        this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/new`]);
    }

    gotoDetail(id: string) {
        this._documentRepo.checkDetailShippmentPermission(this.shipmentDetail.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    selectHBL(hbl: HouseBill) {
        if (!this.selectedHbl || !!this.selectedHbl && this.selectedHbl.id !== hbl.id) {
            this.selectedHbl = new CsTransactionDetail(hbl);

            // * Get container, Job detail, Surcharge with hbl id, JobId.
            this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction(hbl));
            this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ hblid: hbl.id }));
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


    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'files':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'FILES' } });
                break;
        }
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


    duplicateConfirm() {
        this._router.navigate([`home/documentation/air-export/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }
}
