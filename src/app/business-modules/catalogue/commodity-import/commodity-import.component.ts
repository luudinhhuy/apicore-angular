import { Component, OnInit, ViewChild } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { SystemConstants } from 'src/constants/system.const';
import { PagingService, SortService } from 'src/app/shared/services';
import { AppPage } from 'src/app/app.base';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { finalize, catchError } from 'rxjs/operators';
import { InfoPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';

@Component({
	selector: 'app-commodity-import',
	templateUrl: './commodity-import.component.html'
})

export class CommodityImportComponent extends AppPage implements OnInit {
	@ViewChild(InfoPopupComponent, { static: false }) importAlert: InfoPopupComponent;
	data: any[];
	pagedItems: any[] = [];
	inValidItems: any[] = [];
	totalValidRows: number = 0;
	totalRows: number = 0;
	isShowInvalid: boolean = true;
	pager: PagerSetting = PAGINGSETTING;
	isDesc = true;
	sortKey: string;

	constructor(private ngProgress: NgProgress,
		private pagingService: PagingService,
		private sortService: SortService,
		private _progressService: NgProgress,
		private catalogueRepo: CatalogueRepo,
		private _toastService: ToastrService) {
		super();
		this._progressRef = this._progressService.ref();
	}
	ngOnInit() {
		this.pager.totalItems = 0;
	}
	chooseFile(file: Event) {
		this.pager.totalItems = 0;
		if (file.target['files'] == null) { return; }
		this._progressRef.start();
		this.catalogueRepo.upLoadCommodityFile(file.target['files'])
			.pipe(
				finalize(() => {
					this._progressRef.complete();
				})
			)
			.subscribe((response: any) => {
				this.data = response.data;
				this.pager.currentPage = 1;
				this.pager.totalItems = this.data.length;
				this.totalValidRows = response.totalValidRows;
				this.totalRows = this.data.length;
				this.pagingData(this.data);
			}, () => {
			});
	}

	pagingData(data: any[]) {
		this.pager = this.pagingService.getPager(this.pager.totalItems, this.pager.currentPage, this.pager.pageSize);
		this.pager.numberPageDisplay = SystemConstants.OPTIONS_NUMBERPAGES_DISPLAY;
		this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
		this.pagedItems = data.slice(this.pager.startIndex, this.pager.endIndex + 1);
	}
	sort(property: string) {
		this.isDesc = !this.isDesc;
		this.sortKey = property;
		this.pagedItems = this.sortService.sort(this.pagedItems, property, this.isDesc);
	}

	hideInvalid() {
		if (this.data == null) return;
		this.isShowInvalid = !this.isShowInvalid;
		this.sortKey = '';
		if (this.isShowInvalid) {
			this.pager.totalItems = this.data.length;
			this.pagingData(this.data);
		} else {
			this.inValidItems = this.data.filter(x => !x.isValid);
			this.pagingData(this.inValidItems);
			this.pager.totalItems = this.inValidItems.length;
		}
	}


	async import(element) {
		if (this.data == null) { return; }
		if (this.totalRows - this.totalValidRows > 0) {
			this.importAlert.show();
		} else {
			const data = this.data.filter(x => x.isValid);
			this._progressRef.start();
			this.catalogueRepo.importCommodity(data)
				.pipe(
					finalize(() => {
						this._progressRef.complete();
					})
				)
				.subscribe(
					(res) => {
						if (res.success) {
							this._toastService.success('Import commodity successful');
							this.pager.totalItems = 0;
							this.reset(element);
						} else {
							this._toastService.error(res.message);
						}
					}
				);
		}
	}


	reset(element) {
		this.data = null;
		this.pagedItems = null;
		element.value = "";
		this.pager.totalItems = 0;
	}

	async downloadSample() {
		this.catalogueRepo.downloadCommodityExcel()
			.pipe(catchError(this.catchError))
			.subscribe(
				(res: any) => {
					this.downLoadFile(res, "application/ms-excel", "CommodityTemplate.xlsx");
				},
			);
	}
	selectPageSize() {
		this.pager.currentPage = 1;
		if (this.isShowInvalid) {
			this.pager.totalItems = this.data.length;
			this.pagingData(this.data);

		} else {
			this.inValidItems = this.data.filter(x => !x.isValid);
			this.pagingData(this.inValidItems);
			this.pager.totalItems = this.inValidItems.length;
		}
	}
	pageChanged(event: any): void {
		if (this.pager.currentPage !== event.page || this.pager.pageSize !== event.itemsPerPage) {
			this.pager.currentPage = event.page;
			this.pager.pageSize = event.itemsPerPage;

			this.pagingData(this.data);
		}
	}
}
