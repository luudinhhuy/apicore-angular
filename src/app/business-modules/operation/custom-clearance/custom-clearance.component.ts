import { Component, ViewChild } from '@angular/core';
import { SortService } from 'src/app/shared/services/sort.service';
import { ToastrService } from 'ngx-toastr';
import { OpsTransaction } from 'src/app/shared/models/document/OpsTransaction.model';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { catchError, map, finalize, takeUntil } from 'rxjs/operators';
import { CustomDeclaration } from 'src/app/shared/models';
import { AppList } from 'src/app/app.list';
import { OperationRepo, DocumentationRepo, CatalogueRepo, ExportRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, Permission403PopupComponent } from 'src/app/shared/common/popup';
import _map from 'lodash/map';
import { NgProgress } from '@ngx-progressbar/core';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { Router } from '@angular/router';
import { IAppState, getMenuUserPermissionState } from '@store';
import { Store } from '@ngrx/store';

@Component({
    selector: 'app-custom-clearance',
    templateUrl: './custom-clearance.component.html',
    styleUrls: ['./custom-clearance.component.scss']
})
export class CustomClearanceComponent extends AppList {
    @ViewChild('confirmConvertPopup', { static: false }) confirmConvertPopup: ConfirmPopupComponent;
    @ViewChild('confirmDeletePopup', { static: false }) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(Permission403PopupComponent, { static: false }) canNotAllowActionPopup: Permission403PopupComponent;
    listCustomDeclaration: CustomDeclaration[] = [];
    searchObject: any = {};
    listCustomer: any = [];
    listPort: any = [];
    listUnit: any = [];
    menuPermission: SystemInterface.IUserPermission;

    headers: CommonInterface.IHeaderTable[];
    constructor(
        private _store: Store<IAppState>,
        private _sortService: SortService,
        private _toastrService: ToastrService,
        private _operationRepo: OperationRepo,
        private _ngProgressService: NgProgress,
        private _documentRepo: DocumentationRepo,
        private _catalogueRepo: CatalogueRepo,
        private _exportRepo: ExportRepo,
        private _router: Router,
    ) {
        super();
        this.requestList = this.getListCustomsDeclaration;
        this.requestSort = this.sortCD;
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this._store.select(getMenuUserPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: SystemInterface.IUserPermission) => {
                    if (res !== null && res !== undefined) {
                        this.menuPermission = res;
                    }
                }
            );
        this.headers = [
            { title: 'Clearance No', field: 'clearanceNo', sortable: true },
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Clearance Location', field: 'gatewayName', sortable: true },
            { title: 'Partner Name', field: 'customerName', sortable: true },
            { title: 'Import Country', field: 'importCountryName', sortable: true },
            { title: 'Export Country', field: 'exportCountryName', sortable: true },
            { title: 'Job ID', field: 'jobNo', sortable: true },
            { title: 'Clearance Date', field: 'clearanceDate', sortable: true },
            { title: 'creator', field: 'userCreatedName', sortable: true },
            { title: 'Status', field: 'jobNo', sortable: true },
        ];
        this.getListCustomsDeclaration();
        this.getListCustomer();
        this.getListPort();
        this.getListUnit();
    }

    getListCustomer() {
        this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.CUSTOMER })
            .subscribe((res: any) => { this.listCustomer = res; });
    }

    getListPort() {
        this._catalogueRepo.getListPort({ placeType: PlaceTypeEnum.Port })
            .subscribe((res: any) => { this.listPort = res; });
    }

    getListUnit() {
        this._catalogueRepo.getUnit({ unitType: 'Package' })
            .subscribe((res: any) => { this.listUnit = res; });
    }

    getListCustomsDeclaration(dataSearch?: any) {
        this.isLoading = true;
        this._progressRef.start();
        const body = dataSearch || {};
        this._operationRepo.getListCustomDeclaration(this.page, this.pageSize, body)
            .pipe(
                catchError(this.catchError),
                map((data: any) => {
                    return {
                        data: data.data.map((item: any) => new CustomDeclaration(item)),
                        totalItems: data.totalItems,
                    };
                }),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); })
            )
            .subscribe(
                (res: any) => {
                    this.listCustomDeclaration = res.data;
                    this.totalItems = res.totalItems;
                },
            );
    }

    sortCD(sort: string): void {
        if (!!sort) {
            if (!!this.listCustomDeclaration.length) {
                this.listCustomDeclaration = this._sortService.sort(this.listCustomDeclaration, this.sort, this.order);
            }
        }
    }
    showDetail(id) {
        this._operationRepo.checkViewDetailPermission(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate(['/home/operation/custom-clearance/detail', id]);
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }
    getDataFromEcus() {
        this._progressRef.start();
        this._operationRepo.importCustomClearanceFromEcus()
            .pipe(catchError(this.catchError),
                finalize(() => { this.isLoading = false; this._progressRef.complete(); }))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    this._toastrService.success(res.message, '');
                    this.getListCustomsDeclaration();
                },
                (errors: any) => { },
                () => { }
            );
    }

    confirmConvert() {
        if (this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo).length > 0) {
            const clearancesToConvert = this.mapClearancesToJobs();
            if (clearancesToConvert.filter(x => x.opsTransaction === null).length > 0) {
                return;
            } else {
                this._documentRepo.checkAllowConvertJob(clearancesToConvert)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => this._progressRef.complete())
                    ).subscribe(
                        (res: any) => {
                            if (res.status) {
                                this.confirmConvertPopup.show();
                            } else {
                                this.canNotAllowActionPopup.show();
                            }
                        },
                    );

            }
        } else {
            // this._toastrService.warning('Custom clearance was not selected');

            this.canNotAllowActionPopup.show();
        }
    }

    deleteClearance() {
        const customCheckedArray: CustomDeclaration[] = this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo) || [];
        if (this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo).length > 0) {
            this._operationRepo.checkDeletePermission(customCheckedArray)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                ).subscribe(
                    (res: any) => {
                        if (res.success) {
                            this.confirmDeletePopup.show();
                        } else {
                            // this._toastrService.error(res.message);
                            this.canNotAllowActionPopup.show();
                        }
                    },
                );
            // this.confirmDeletePopup.show();
        } else {

            this.canNotAllowActionPopup.show();
            // this._toastrService.warning(`You haven't selected any custom clearance yet. Please select one or more custom no to delete!`);
        }
    }

    onConfirmDelete() {
        this._progressRef.start();
        this.confirmDeletePopup.hide();
        const customCheckedArray: CustomDeclaration[] = this.listCustomDeclaration.filter(i => i.isSelected && !i.jobNo) || [];
        this._operationRepo.deleteMultipleClearance(customCheckedArray || [])
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    // this._toastrService.success(res.message, '');
                    if (res.status) {
                        this.getListCustomsDeclaration();
                    } else {
                        this.canNotAllowActionPopup.show();
                    }
                },
            );
    }

    onComfirmConvertToJobs() {
        this.confirmConvertPopup.hide();
        const clearancesToConverts = this.mapClearancesToJobs();
        const clearanceNulls = clearancesToConverts.filter(x => x.opsTransaction == null);
        if (clearanceNulls.length === 0) {
            this._progressRef.start();
            this._documentRepo.convertExistedClearanceToJob(clearancesToConverts)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { this._progressRef.complete(); })
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastrService.success('Convert Success');
                            this.getListCustomsDeclaration();
                        }
                    },
                );
        }
    }

    checkUncheckAll() {
        for (const clearance of this.listCustomDeclaration) {
            clearance.isSelected = this.isCheckAll;
        }
    }

    onChangeAction() {
        this.isCheckAll = this.listCustomDeclaration.every((item: CustomDeclaration) => item.isSelected);
    }

    messageConvertError: string = '';
    mapClearancesToJobs() {
        const clearancesToConvert = [];
        const customCheckedArray: any[] = this.listCustomDeclaration.filter((item: CustomDeclaration) => item.isSelected && !item.jobNo);
        for (let i = 0; i < customCheckedArray.length; i++) {
            const clearance: CustomDeclaration = customCheckedArray[i];
            let shipment = new OpsTransaction();
            let index = this.listCustomer.findIndex(x => x.taxCode.trim() === clearance.partnerTaxCode.trim());
            if (index !== -1) {
                const customer = this.listCustomer[index];
                shipment.customerId = customer.id;
                shipment.salemanId = customer.salePersonId;
                shipment.serviceMode = clearance.type;
                index = this.listPort.findIndex(x => x.code === clearance.gateway);
                if (index > -1) {
                    if (clearance.type === "Export") {
                        shipment.pol = this.listPort[index].id;
                        shipment.clearanceLocation = shipment.pol;
                    }
                    if (clearance.type === "Import") {
                        shipment.pod = this.listPort[index].id;
                        shipment.clearanceLocation = shipment.pod;
                    }
                }
                if (clearance.serviceType === "Sea") {
                    if (clearance.cargoType === "FCL") {
                        shipment.productService = "SeaFCL";
                    }
                    if (clearance.cargoType === "LCL") {
                        shipment.productService = "SeaLCL";
                    }
                } else {
                    shipment.productService = clearance.serviceType;
                }
                shipment.shipmentMode = "External";
                shipment.mblno = clearance.mblid;
                shipment.hwbno = clearance.hblid;
                shipment.serviceDate = clearance.clearanceDate;
                shipment.sumGrossWeight = clearance.grossWeight;
                shipment.sumNetWeight = clearance.netWeight;
                shipment.sumCbm = clearance.cbm;
                const claim = localStorage.getItem('id_token_claims_obj');
                const currenctUser = JSON.parse(claim)["id"];
                shipment.billingOpsId = currenctUser;
                index = this.listUnit.findIndex(x => x.code === clearance.unitCode);
                if (index > -1) {
                    shipment.packageTypeId = this.listUnit[index].id;
                }
            } else {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có customer để tạo job mới <br />`;
                shipment = null;
            }
            if (clearance.mblid == null) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có MBL/MAWB để tạo job mới <br />`;
                shipment = null;
            }
            if (clearance.hblid == null) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có HBL/HAWB để tạo job mới <br />`;
                shipment = null;
            }
            if (clearance.clearanceDate == null) {
                this.messageConvertError = this.messageConvertError + clearance.clearanceNo + ` Không có clearance date để tạo job mới <br />`;
                shipment = null;
            }
            clearancesToConvert.push({ opsTransaction: shipment, customsDeclaration: clearance });
        }
        this._toastrService.error(this.messageConvertError, '', { enableHtml: true });
        return clearancesToConvert;
    }

    export() {
        this._exportRepo.exportCustomClearance(this.searchObject)
            .subscribe(
                (response: ArrayBuffer) => {
                    this.downLoadFile(response, "application/ms-excel", 'CustomClearance.xlsx');
                },
                (errors: any) => {
                },
                () => { }
            );
    }

    gotoCreateCD() {
        this._router.navigate(["home/operation/custom-clearance/new"]);
    }

    import() {
        this._router.navigate(["home/operation/custom-clearance/import"]);

    }


}



