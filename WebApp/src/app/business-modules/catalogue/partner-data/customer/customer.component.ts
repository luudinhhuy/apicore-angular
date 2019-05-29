import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { ColumnSetting } from 'src/app/shared/models/layout/column-setting.model';
import { PARTNERDATACOLUMNSETTING } from '../partner-data.columns';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { PaginationComponent } from 'src/app/shared/common/pagination/pagination.component';
import { BaseService } from 'src/services-base/base.service';
import { API_MENU } from 'src/constants/api-menu.const';
import { SortService } from 'src/app/shared/services/sort.service';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { ExportExcel } from 'src/app/shared/models/layout/exportExcel.models';
import { SystemConstants } from 'src/constants/system.const';
import * as lodash from 'lodash';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  customers: any;
  pager: PagerSetting = PAGINGSETTING;
  partnerDataSettings: ColumnSetting[] = PARTNERDATACOLUMNSETTING;
  criteria: any = { partnerGroup: PartnerGroupEnum.CUSTOMER };
  @ViewChild(PaginationComponent,{static:false}) child; 
  @Output() deleteConfirm = new EventEmitter<Partner>();
  @Output() detail = new EventEmitter<any>();
  constructor(private baseService: BaseService,
    private excelService: ExcelService,
    private api_menu: API_MENU,
    private sortService: SortService) { }

  ngOnInit() {
  }
  getPartnerData(pager: PagerSetting, criteria?: any): any {
    this.baseService.spinnerShow();
    if(criteria != undefined){
      this.criteria = criteria;
    }
    this.baseService.post(this.api_menu.Catalogue.PartnerData.customerPaging+"?page=" + pager.currentPage + "&size=" + pager.pageSize, this.criteria).subscribe((response: any) => {
      this.baseService.spinnerHide();
      this.customers = response.data;
      console.log(this.customers);
      this.pager.totalItems = response.totalItems;
      return this.pager.totalItems;
    },err=>{
      this.baseService.spinnerHide();
      this.baseService.handleError(err);
    });
  }
  showConfirmDelete(item) {
    this.deleteConfirm.emit(item);
  }
  showDetail(item){
    this.detail.emit(item);
  }

  async exportCustomers(){
    var customers = await this.baseService.postAsync(this.api_menu.Catalogue.PartnerData.query,this.criteria);
    if (localStorage.getItem(SystemConstants.CURRENT_LANGUAGE) === SystemConstants.LANGUAGES.ENGLISH_API){
      customers = lodash.map(customers,function(cus,index){
        return [
          index+1,
          cus['id'],
          cus['partnerNameEn'],
          cus['shortName'],
          cus['addressEn'],
          cus['taxCode'],
          cus['tel'],
          cus['fax'],
          cus['userCreatedName'],
          cus['datetimeModified'],
          (cus['inactive']===true)?SystemConstants.STATUS_BY_LANG.INACTIVE.ENGLISH : SystemConstants.STATUS_BY_LANG.ACTIVE.ENGLISH
        ]
      });
    }
    if (localStorage.getItem(SystemConstants.CURRENT_LANGUAGE) === SystemConstants.LANGUAGES.VIETNAM_API){
      customers = lodash.map(customers,function(cus,index){
        return [
          index+1,
          cus['id'],
          cus['partnerNameVn'],
          cus['shortName'],
          cus['addressVn'],
          cus['taxCode'],
          cus['tel'],
          cus['fax'],
          cus['userCreatedName'],
          cus['datetimeModified'],
          (cus['inactive']===true)?SystemConstants.STATUS_BY_LANG.INACTIVE.VIETNAM : SystemConstants.STATUS_BY_LANG.ACTIVE.VIETNAM
        ]
      });
    }
    

    const exportModel: ExportExcel = new ExportExcel();
    exportModel.title = "Partner Data - Customers";
    exportModel.sheetName = "Customers"
    const currrently_user = localStorage.getItem('currently_userName');
    exportModel.author = currrently_user;
    exportModel.header = [
      { name: "No.", width: 10 },
      { name: "Partner ID", width: 20 },
      { name: "Full Name", width: 60 },
      { name: "Short Name", width: 20 },
      { name: "Billing Address", width: 60 },
      { name: "Tax Code", width: 20 },
      { name: "Tel", width: 30 },
      { name: "Fax", width: 30 },
      { name: "Creator", width: 30 },
      { name: "Modify", width: 30 },
      { name: "Inactive", width: 20 }
    ]
    exportModel.data = customers;
    exportModel.fileName = "Partner Data - Customers";
    this.excelService.generateExcel(exportModel);
  }

  isDesc = true;
  sortKey: string = "id";
  sort(property){
    this.isDesc = !this.isDesc;
    this.sortKey = property;
    this.customers.forEach(element => {
      element.catPartnerModels = this.sortService.sort(element.catPartnerModels, property, this.isDesc)
    });
  }
}
