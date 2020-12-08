import { Component, ViewChild } from "@angular/core";
import {
    ConfirmPopupComponent,
    InfoPopupComponent,
    Permission403PopupComponent
} from "src/app/shared/common/popup";
import { AccountingRepo } from "src/app/shared/repositories";
import { catchError, finalize } from "rxjs/operators";
import { AppList } from "src/app/app.list";
import { SOA } from "src/app/shared/models";
import { ToastrService } from "ngx-toastr";
import { SortService } from "src/app/shared/services";
import { NgProgress } from "@ngx-progressbar/core";
import { Router } from "@angular/router";

@Component({
    selector: "app-statement-of-account",
    templateUrl: "./statement-of-account.component.html"
})
export class StatementOfAccountComponent extends AppList {
    @ViewChild(ConfirmPopupComponent, { static: false })
    confirmPopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false })
    infoPopup: InfoPopupComponent;
    @ViewChild(Permission403PopupComponent, { static: false })
    permissionPopup: Permission403PopupComponent;

    headers: CommonInterface.IHeaderTable[];

    SOAs: SOA[] = [];
    selectedSOA: SOA = null;
    messageDelete: string = "";

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _router: Router
    ) {
        super();

        this.requestSort = this.sortLocal;
        this.requestList = this.getSOAs;
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.headers = [
            { title: "SOA No", field: "soano", sortable: true, width: 90 },
            { title: "Partner", field: "partnerName", sortable: true },
            { title: "Shipment", field: "shipment", sortable: true },
            { title: "Credit Amount", field: "creditAmount", sortable: true },
            { title: "Debit Amount", field: "debitAmount", sortable: true },
            { title: "Total Amount", field: "totalAmount", sortable: true },
            { title: "Status", field: "status", sortable: true },
            { title: "Issue Date", field: "datetimeCreated", sortable: true },
            { title: "Issue Person", field: "userCreated", sortable: true },
            {
                title: "Modified Date",
                field: "datetimeModified",
                sortable: true
            }
        ];
        this.getSOAs();
    }

    prepareDeleteSOA(soaItem: SOA) {
        this._accoutingRepo
            .checkAllowDeleteSOA(soaItem.soano)
            .subscribe((value: boolean) => {
                if (value) {
                    this.selectedSOA = new SOA(soaItem);
                    this.messageDelete = `Do you want to delete SOA ${soaItem.soano} ? `;
                    this.confirmPopup.show();
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    onConfirmDeleteSOA() {
        this._progressRef.start();
        this._accoutingRepo
            .deleteSOA(this.selectedSOA.soano)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.confirmPopup.hide();
                    this._progressRef.complete();
                })
            )
            .subscribe((res: any) => {
                this._toastService.success(res.message, "", {
                    positionClass: "toast-bottom-right"
                });

                // * search SOA when success.
                this.getSOAs();
            });
    }

    getSOAs(data: any = {}) {
        this.isLoading = true;
        this._progressRef.start();
        this._accoutingRepo
            .getListSOA(
                this.page,
                this.pageSize,
                Object.assign(data, { CurrencyLocal: "VND" })
            )
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.isLoading = false;
                    this._progressRef.complete();
                })
            )
            .subscribe((res: any) => {
                this.SOAs = (res.data || []).map((item: SOA) => new SOA(item));
                this.totalItems = res.totalItems || 0;
            });
    }

    sortLocal(sort: string): void {
        this.SOAs = this._sortService.sort(this.SOAs, sort, this.order);
    }

    viewDetail(soano: string, currency: string) {
        this._accoutingRepo
            .checkAllowGetDetailSOA(soano)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate([`/home/accounting/statement-of-account/detail/`], {
                        queryParams: { no: soano, currency: currency }
                    });
                } else {
                    this.permissionPopup.show();
                }
            });
    }
}
