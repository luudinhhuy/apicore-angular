import { AppList } from "src/app/app.list";
import { Component, ChangeDetectorRef, ViewChild } from "@angular/core";
import { SortService } from "src/app/shared/services";
import { ToastrService } from "ngx-toastr";
import { CommodityGroup } from "src/app/shared/models/catalogue/commonity-group.model";
import { COMMODITYGROUPCOLUMNSETTING } from "../../commonity-group.column";
import { ColumnSetting } from "src/app/shared/models/layout/column-setting.model";
import { TypeSearch } from "src/app/shared/enums/type-search.enum";
import { CatalogueRepo, ExportRepo } from "src/app/shared/repositories";
import { NgProgress } from "@ngx-progressbar/core";
import { catchError, finalize, map } from "rxjs/operators";
import { CommodityGroupAddPopupComponent } from "../form-create-commodity-group/form-create-commodity-group.popup";
import { ConfirmPopupComponent } from "src/app/shared/common/popup";

@Component({
    selector: 'commodity-group-list',
    templateUrl: './list-commodity-group.component.html',
})

export class CommodityGroupListComponent extends AppList {
    @ViewChild(CommodityGroupAddPopupComponent, { static: false }) commodityGroupAddPopupComponent: CommodityGroupAddPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;

    commodityGroups: CommodityGroup[] = [];
    commodityGroup: CommodityGroup;
    commodityGroupSettings: ColumnSetting[] = COMMODITYGROUPCOLUMNSETTING;
    configSearchGroup: any = {
        settingFields: this.commodityGroupSettings.filter(x => x.allowSearch == true).map(x => ({ "fieldName": x.primaryKey, "displayName": x.header })),
        typeSearch: TypeSearch.intab,
        searchString: ''
    };
    //dataSearch: any = {};
    headerCommodityGroup: CommonInterface.IHeaderTable[];

    constructor(
        private catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _exportRepo: ExportRepo,
        private _cd: ChangeDetectorRef,
        private _ngProgessSerice: NgProgress,
        private _sortService: SortService,
    ) {
        super();
        this._progressRef = this._ngProgessSerice.ref();
        this.requestList = this.getGroupCommodities;
        this.requestSort = this.sortCommodityGroup;
    }

    ngOnInit() {
        this.headerCommodityGroup = [
            { title: 'Id', sortable: true, field: 'id' },
            { title: 'Name(EN)', sortable: true, field: 'groupNameEn' },
            { title: 'Name(Local)', sortable: true, field: 'groupNameVn' },
            { title: 'Status', sortable: true, field: 'active' },
        ];
        this.getGroupCommodities();
    }

    ngAfterViewInit() {
        this._cd.detectChanges();
    }

    getGroupCommodities() {
        this._progressRef.start();
        this.catalogueRepo.getCommodityGroupPaging(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new CommodityGroup(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.commodityGroups = res.data;
                },
            );
    }

    openPopupAddCommodityGroup() {
        this.commodityGroupAddPopupComponent.action = 'create';
        this.commodityGroupAddPopupComponent.show();
    }

    showDetailCommodityGroup(commodityGroup) {
        this.catalogueRepo.getDetailCommodityGroup(commodityGroup.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res.id !== 0) {
                        var _commodityGroup = new CommodityGroup(res);
                        this.commodityGroupAddPopupComponent.action = "update"
                        this.commodityGroupAddPopupComponent.commodityGroup = _commodityGroup;
                        this.commodityGroupAddPopupComponent.getDetail();
                        this.commodityGroupAddPopupComponent.show();
                    } else {
                        this._toastService.error("Not found data");
                    }
                },
            );
    }

    onSearch(event: { field: string, searchString: string, displayName: string }) {
        this.dataSearch = {};
        this.dataSearch[event.field] = event.searchString;
        this.page = 1;
        this.getGroupCommodities();
    }

    resetSearch(event) {
        this.dataSearch = {};
        this.getGroupCommodities();
    }

    showConfirmDelete(data: any) {
        this.commodityGroup = data;
        this.confirmDeletePopup.show();
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this.deleteGroupCommodity();
    }

    deleteGroupCommodity() {
        this.catalogueRepo.deleteCommodityGroup(this.commodityGroup.id)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this.getGroupCommodities();
                    } else {
                        this._toastService.error(res.message || 'Có lỗi xảy ra', '');
                    }
                },
            );
    }

    onRequestCommodityGroup() {
        this.getGroupCommodities();
    }

    sortCommodityGroup(sortData: CommonInterface.ISortData): void {
        this.commodityGroups = this._sortService.sort(this.commodityGroups, sortData.sortField, sortData.order);
    }

    exportComGroup() {
        this._exportRepo.exportCommodityGroup(this.dataSearch)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, "application/ms-excel", "CommodityGroup.xlsx");
                },
            );
    }
}