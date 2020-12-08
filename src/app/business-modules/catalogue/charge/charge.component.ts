import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { SortService } from '@services';
import { CatalogueRepo, ExportRepo } from '@repositories';
import { Charge } from '@models';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { AppList } from 'src/app/app.list';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';

import { catchError, finalize, map } from 'rxjs/operators';


@Component({
    selector: 'app-charge',
    templateUrl: './charge.component.html',
})
export class ChargeComponent extends AppList implements OnInit {

    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent, { static: false }) permissionPopup: Permission403PopupComponent;

    ListCharges: Charge[] = [];
    idChargeToDelete: string = "";

    constructor(
        private _progressService: NgProgress,
        private sortService: SortService,
        private _catalogueRepo: CatalogueRepo,
        private _exportRepo: ExportRepo,
        private _toastService: ToastrService,
        private _router: Router,
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchCharge;
        this.requestSort = this.sortCharge;
    }


    ngOnInit() {
        this.headers = [
            { title: 'Code', field: 'code', sortable: true },
            { title: 'Name EN', field: 'chargeNameEn', sortable: true },
            { title: 'Name Local', field: 'chargeNameVn', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Status', field: 'active', sortable: true }
        ];
        this.searchCharge();
    }

    sortCharge(sort: string): void {
        this.ListCharges = this.sortService.sort(this.ListCharges, sort, this.order);
    }

    onSearchCharge(dataSearch: any) {
        this.dataSearch = {};
        if (dataSearch.type === 'All') {
            this.dataSearch.all = dataSearch.keyword;
        } else {
            this.dataSearch.all = null;
            if (dataSearch.type === 'code') {
                this.dataSearch.code = dataSearch.keyword;
            }
            if (dataSearch.type === 'chargeNameEn') {
                this.dataSearch.chargeNameEn = dataSearch.keyword;
            }
            if (dataSearch.type === 'chargeNameVn') {
                this.dataSearch.chargeNameVn = dataSearch.keyword;
            }
            if (dataSearch.type === 'type') {
                this.dataSearch.type = dataSearch.keyword;
            }
        }
        this.searchCharge();
    }

    searchCharge() {
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.getListCharge(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
                map((res: any) => {
                    return {
                        data: res.data != null ? res.data.map((item: any) => new Charge(item)) : [],
                        totalItems: res.totalItems,
                    };
                }),
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems;
                    this.ListCharges = res.data || [];
                },
            );
    }

    prepareDeleteCharge(id: any) {
        this._catalogueRepo.checkAllowDeleteCharge(id)
            .subscribe((value: boolean) => {
                if (value) {
                    this.idChargeToDelete = id;
                    this.confirmDeletePopup.show();
                } else {
                    this.permissionPopup.show();
                }
            });
    }

    onDeleteCharge() {
        this.confirmDeletePopup.hide();
        this.isLoading = true;
        this._progressRef.start();
        this._catalogueRepo.deleteCharge(this.idChargeToDelete)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
            ).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.searchCharge();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    export() {
        this._exportRepo.exportCharge(this.dataSearch)
            .subscribe(
                (response: ArrayBuffer) => {
                    this.downLoadFile(response, "application/ms-excel", 'Charge.xlsx');
                },
            );
    }

    viewDetail(charge: Charge): void {
        this._catalogueRepo.checkAllowGetDetailCharge(charge.id)
            .subscribe((value: boolean) => {
                if (value) {
                    this._router.navigate(["home/catalogue/charge", charge.id]);
                } else {
                    this.permissionPopup.show();
                }
            });
    }
}
