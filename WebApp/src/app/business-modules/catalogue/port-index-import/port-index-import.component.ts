import { Component, OnInit, ViewChild } from '@angular/core';
import { API_MENU } from 'src/constants/api-menu.const';
import { PagingService } from 'src/app/shared/services/paging-service';
import { SortService } from 'src/app/shared/services/sort.service';
import { BaseService } from 'src/app/shared/services/base.service';
import { PaginationComponent } from 'src/app/shared/common/pagination/pagination.component';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { SystemConstants } from 'src/constants/system.const';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { language } from 'src/languages/language.en';
import { NgProgressComponent } from '@ngx-progressbar/core';
declare var $: any;

@Component({
  selector: 'app-port-index-import',
  templateUrl: './port-index-import.component.html',
  styleUrls: ['./port-index-import.component.scss']
})
export class PortIndexImportComponent implements OnInit {
  data: any[];
  pagedItems: any[] = [];
  inValidItems: any[] = [];
  totalValidRows: number = 0;
  totalRows: number = 0;
  isShowInvalid: boolean = true;
  pager: PagerSetting = PAGINGSETTING;
  inProgress: boolean = false;
  @ViewChild('form', { static: false }) form: any;
  @ViewChild(PaginationComponent, { static: false }) child: any;
  @ViewChild(NgProgressComponent, { static: false }) progressBar: NgProgressComponent;

  constructor(
    private pagingService: PagingService,
    private baseService: BaseService,
    private api_menu: API_MENU,
    private sortService: SortService) { }

  ngOnInit() {
    this.pager.totalItems = 0;
  }
  chooseFile(file: Event) {
    if (file.target['files'] == null) return;
    this.progressBar.start();
    this.baseService.uploadfile(this.api_menu.Catalogue.CatPlace.uploadExel + "?type=" + PlaceTypeEnum.Port, file.target['files'], "uploadedFile")
      .subscribe((response: any) => {
        this.data = response.data;
        this.pager.totalItems = this.data.length;
        this.totalValidRows = response.totalValidRows;
        this.totalRows = this.data.length;
        this.pagingData(this.data);
        this.progressBar.complete();
      }, err => {
        this.progressBar.complete();
        this.baseService.handleError(err);
      });
  }

  pagingData(data: any[]) {
    this.pager = this.pagingService.getPager(this.pager.totalItems, this.pager.currentPage, this.pager.pageSize);
    this.pager.numberPageDisplay = SystemConstants.OPTIONS_NUMBERPAGES_DISPLAY;
    this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
    this.pagedItems = data.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  async import() {
    if (this.data == null) return;
    if (this.totalRows - this.totalValidRows > 0) {
      $('#upload-alert-modal').modal('show');
    }
    else {
      let data = this.data.filter(x => x.isValid);
      var response = await this.baseService.postAsync(this.api_menu.Catalogue.CatPlace.import, data);
      if (response) {
        this.baseService.successToast(language.NOTIFI_MESS.IMPORT_SUCCESS);
        this.inProgress = false;
        this.pager.totalItems = 0;
        this.reset();
      }
    }
  }

  isDesc = true;
  sortKey: string;
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
    }
    else {
      this.inValidItems = this.data.filter(x => !x.isValid);
      this.pager.totalItems = this.inValidItems.length;
    }
    this.child.setPage(this.pager.currentPage);
  }
  reset() {
    this.data = null;
    this.pagedItems = null;
    $("#inputFile").val('');
    this.pager.totalItems = 0;
  }
  async setPage(pager: PagerSetting) {
    this.pager.currentPage = pager.currentPage;
    this.pager.pageSize = pager.pageSize;
    this.pager.totalPages = pager.totalPages;
    if (this.isShowInvalid) {
      this.pager = this.pagingService.getPager(this.data.length, this.pager.currentPage, this.pager.pageSize, this.pager.numberPageDisplay);
      this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
      this.pagedItems = this.data.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
    else {
      this.pager = this.pagingService.getPager(this.inValidItems.length, this.pager.currentPage, this.pager.pageSize, this.pager.numberPageDisplay);
      this.pager.numberToShow = SystemConstants.ITEMS_PER_PAGE;
      this.pagedItems = this.inValidItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
    }
  }


  async downloadSample() {
    await this.baseService.downloadfile(this.api_menu.Catalogue.CatPlace.downloadExcel + "?type=" + PlaceTypeEnum.Port, 'PortIndexImportTemplate.xlsx');
  }

}
