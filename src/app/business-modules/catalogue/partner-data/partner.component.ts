import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnSetting } from 'src/app/shared/models/layout/column-setting.model';
import { PARTNERDATACOLUMNSETTING } from './partner-data.columns';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';

import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { Router } from '@angular/router';
import { SystemConstants } from 'src/constants/system.const';
import { ButtonType } from 'src/app/shared/enums/type-button.enum';
import { ButtonModalSetting } from 'src/app/shared/models/layout/button-modal-setting.model';
import { PartnerListComponent } from './components/partner-list/partner-list.component';
import { NgProgress } from '@ngx-progressbar/core';
import { AppList } from 'src/app/app.list';
import { ExportRepo, CatalogueRepo } from '@repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';

type PARTNERDATA_TAB = 'allTab' | 'Customer' | 'Agent' | 'Carrier' | 'Consginee' | 'Shipper';


enum PartnerDataTab {
    ALL = 'allTab',
    CUSTOMER = 'Customer',
    AGENT = 'Agent',
    CARRIER = 'Carrier',
    CONSIGNEE = 'Consignee',
    SHIPPER = 'Shipper'
}



@Component({
    selector: 'app-partner',
    templateUrl: './partner.component.html'
})
export class PartnerComponent extends AppList implements OnInit {
    @ViewChild(PartnerListComponent, { static: false }) allPartnerComponent: PartnerListComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: any;
    @ViewChild(Permission403PopupComponent, { static: false }) info403Popup: Permission403PopupComponent;

    pager: PagerSetting = PAGINGSETTING;
    partnerDataSettings: ColumnSetting[] = PARTNERDATACOLUMNSETTING;
    configSearch: any = {
        settingFields: this.partnerDataSettings.filter(x => x.allowSearch === true).map(x => ({ "fieldName": x.primaryKey, "displayName": x.header })),
        typeSearch: TypeSearch.intab
    };

    criteria: any = { partnerGroup: PartnerGroupEnum.CUSTOMER };
    partner: Partner;
    tabName = {
        customerTab: "customerTab",
        agentTab: "agentTab",
        carrierTab: "carrierTab",
        consigneeTab: "consigneeTab",
        shipperTab: "shipperTab",
        allTab: "allTab"
    };
    addButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.add
    };
    importButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.import
    };
    exportButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.export
    };
    activeTab: string = this.tabName.allTab;

    selectedTab: PARTNERDATA_TAB = PartnerDataTab.ALL; // Default tab.

    allowDelete: boolean = false;

    constructor(private router: Router,
        private _ngProgressService: NgProgress,
        private _exportRepo: ExportRepo,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this.tabSelect(this.activeTab);
    }
    resetSearch(event) {
        this.onSearch(event);
    }
    onSearch(event) {
        if (event.field === "All") {
            this.criteria.all = event.searchString;
        } else {
            const currentTab = this.criteria.partnerGroup;
            this.criteria = {};
            this.criteria.partnerGroup = currentTab;
            if (event.field === "id") {
                this.criteria.id = event.searchString;
            }
            if (event.field === "shortName") {
                this.criteria.shortName = event.searchString;
            }
            if (event.field === "addressVn") {
                this.criteria.addressVn = event.searchString;
            }
            if (event.field === "taxCode") {
                this.criteria.taxCode = event.searchString;
            }
            if (event.field === "tel") {
                this.criteria.tel = event.searchString;
            }
            if (event.field === "fax") {
                this.criteria.fax = event.searchString;
            }
            if (event.field === "userCreatedName") {
                this.criteria.userCreated = event.searchString;
            }
        }

        this.allPartnerComponent.dataSearch = this.criteria;
        this.allPartnerComponent.page = 1;
        this.allPartnerComponent.getPartners();
    }
    tabSelect(tabName) {
        this.pager.currentPage = 1;
        this.pager.pageSize = SystemConstants.OPTIONS_PAGE_SIZE;
        this.activeTab = tabName;

        if (tabName === this.tabName.customerTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CUSTOMER;
        }
        if (tabName === this.tabName.agentTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.AGENT;
        }
        if (tabName === this.tabName.carrierTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CARRIER;
        }
        if (tabName === this.tabName.consigneeTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.CONSIGNEE;
        }
        if (tabName === this.tabName.shipperTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.SHIPPER;
        }
        if (tabName === this.tabName.allTab) {
            this.criteria.partnerGroup = PartnerGroupEnum.ALL;
        }
    }

    showConfirmDelete(event) {
        this.partner = event;
        this._catalogueRepo.checkDeletePartnerPermission(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.confirmDeletePopup.show();
                    } else {
                        this.info403Popup.show();
                    }
                }
            );

    }

    showDetail(event) {
        this.partner = event;
        this._catalogueRepo.checkViewDetailPartnerPermission(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.router.navigate([`/home/catalogue/partner-data/detail/${this.partner.id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    onDelete() {
        this._catalogueRepo.checkDeletePartnerPermission(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (!res) {
                        this.info403Popup.show();
                        this.confirmDeletePopup.hide();
                        return;
                    } else {
                        this.confirmDeletePopup.hide();
                        this._progressRef.start();
                        this._catalogueRepo.deletePartner(this.partner.id)
                            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                            .subscribe(
                                (res: CommonInterface.IResult) => {
                                    if (res.status) {
                                        this._toastService.success(res.message);

                                        this.allPartnerComponent.dataSearch = this.criteria;
                                        this.allPartnerComponent.getPartners();
                                        this.confirmDeletePopup.hide();
                                    } else {
                                        this._toastService.error(res.message);
                                    }
                                }
                            );

                    }
                },
            );
    }

    addPartner() {
        this.router.navigate(["/home/catalogue/partner-data/add"], { queryParams: { partnerType: this.criteria.partnerGroup } });
    }

    export() {
        this._progressRef.start();
        this._exportRepo.exportPartner(this.criteria)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'partner.xlsx');
                }
            );
    }
}
