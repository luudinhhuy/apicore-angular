import { AppList } from "src/app/app.list";
import { SortService } from "@services";
import { HouseBill, CsTransactionDetail, CsTransaction } from "@models";
import { getHBLSState, IShareBussinessState, GetDetailHBLSuccessAction, GetContainersHBLAction, GetProfitHBLAction, GetBuyingSurchargeAction, GetSellingSurchargeAction, GetOBHSurchargeAction, GetListHBLAction, TransactionGetDetailAction, getTransactionLocked, getHBLLoadingState, getSurchargeLoadingState, getTransactionDetailCsTransactionState, GetContainerAction } from "../../store";
import { Store } from "@ngrx/store";
import { takeUntil, take, catchError, finalize } from "rxjs/operators";
import { getParamsRouterState } from "@store";
import { Params } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { NgProgress } from "@ngx-progressbar/core";
import { ViewChild } from "@angular/core";
import { ConfirmPopupComponent, Permission403PopupComponent, InfoPopupComponent, ReportPreviewComponent } from "@common";
import { ToastrService } from "ngx-toastr";
import { DocumentationRepo } from "@repositories";
import isUUID from 'validator/lib/isUUID';

export abstract class AppShareHBLBase extends AppList {
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeleteHBLPopup: ConfirmPopupComponent;
    @ViewChild('confirmDeleteJob', { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent, { static: false }) info403Popup: Permission403PopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;

    houseBills: HouseBill[] = [];

    totalCBM: number;
    totalGW: number;
    totalCW: number;

    selectedHbl: CsTransactionDetail;
    selectedTabSurcharge: string = 'BUY';
    selectedIndexHBL: number = -1;

    shipmentDetail: CsTransaction;

    jobId: string = '';
    spinnerSurcharge: string = 'spinnerSurcharge';

    serviceType: CommonType.SERVICE_TYPE = 'sea';

    constructor(
        protected _sortService: SortService,
        protected _store: Store<IShareBussinessState>,
        protected _spinner: NgxSpinnerService,
        protected _progressService: NgProgress,
        protected _toastService: ToastrService,
        protected _documentRepo: DocumentationRepo

    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {
        this._store.select(getParamsRouterState)
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe((param: Params) => {
                if (param.jobId && isUUID(param.jobId)) {
                    this.jobId = param.jobId;

                    this._store.dispatch(new GetListHBLAction({ jobId: this.jobId }));
                    this._store.dispatch(new TransactionGetDetailAction(this.jobId));

                    this.getDetailShipment();
                    this.getHouseBills(this.jobId);
                } else {
                    this.gotoList();
                }
            });

        this.configHBL();

        this.isLocked = this._store.select(getTransactionLocked);
        this.isLoading = this._store.select(getHBLLoadingState);

        this._store.select(getSurchargeLoadingState).subscribe(
            (loading: boolean) => {
                if (loading) {
                    this._spinner.show(this.spinnerSurcharge);
                } else {
                    this._spinner.hide(this.spinnerSurcharge);
                }
            }
        );
    }

    configHBL() {
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
    }

    sortLocal(sort: string): void {
        this.houseBills = this._sortService.sort(this.houseBills, sort, this.order);
    }

    getHouseBills(id: string) {
        this._store.select(getHBLSState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbls: any[]) => {
                    this.houseBills = hbls || [];
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
        this._store.select<any>(getTransactionDetailCsTransactionState)
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

    selectHBL(hbl: HouseBill) {
        if (!this.selectedHbl || !!this.selectedHbl && this.selectedHbl.id !== hbl.id) {
            this.selectedHbl = new CsTransactionDetail(hbl);

            // * Get container, Job detail, Surcharge with hbl id, JobId.
            this._store.dispatch(new GetDetailHBLSuccessAction(hbl));
            this._store.dispatch(new GetContainersHBLAction({ hblid: hbl.id }));
            if (this.serviceType === 'sea') {
                this._store.dispatch(new GetContainerAction({ mblid: this.jobId }));
            }
            this._store.dispatch(new GetProfitHBLAction(this.selectedHbl.id));

            switch (this.selectedTabSurcharge) {
                case 'BUY':
                    this._store.dispatch(new GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                    break;
                case 'SELL':
                    this._store.dispatch(new GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                    break;
                case 'OBH':
                    this._store.dispatch(new GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                    break;
                default:
                    break;
            }
        }
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

    onSelectTabSurcharge(tabName: string) {
        this.selectedTabSurcharge = tabName;

        if (!!this.selectedHbl) {
            switch (this.selectedTabSurcharge) {
                case 'BUY':
                    this._store.dispatch(new GetBuyingSurchargeAction({ type: 'BUY', hblId: this.selectedHbl.id }));
                    break;
                case 'SELL':
                    this._store.dispatch(new GetSellingSurchargeAction({ type: 'SELL', hblId: this.selectedHbl.id }));
                    break;
                case 'OBH':
                    this._store.dispatch(new GetOBHSurchargeAction({ type: 'OBH', hblId: this.selectedHbl.id }));
                    break;
                default:
                    break;
            }
        }
    }

    previewPLsheet(currency: string) {
        let hblid = "00000000-0000-0000-0000-000000000000";
        if (!!this.selectedHbl) {
            hblid = this.selectedHbl.id;
        }
        this._documentRepo.previewSIFPLsheet(this.jobId, hblid, currency)
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

    gotoList() { }

    gotoCreate() { }

    gotoDetail(id: string) { }

    onSelectTab(tabName: string) { }

    duplicateConfirm() { }

}

