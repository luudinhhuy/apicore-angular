import { Component, OnInit, ViewChild } from '@angular/core';
import moment from 'moment/moment';
import { BaseService } from 'src/app/shared/services/base.service';
import { API_MENU } from 'src/constants/api-menu.const';
import { CatLogViewer } from 'src/app/shared/models/tool-setting/catalogue';
import { SelectComponent } from 'ng2-select';
import { ToastrService } from 'ngx-toastr';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { SortService } from 'src/app/shared/services/sort.service';

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.scss']
})
export class LogViewerComponent implements OnInit {
  categories: any[];
  logs: CatLogViewer[];
  criteria: any = {
    tableType: null,
    query: null
  };
  pager: PagerSetting = PAGINGSETTING;
  @ViewChild('categorySelect',{static:false}) public categorySelect: SelectComponent;

  constructor( private api_menu: API_MENU,
    private toastr: ToastrService,
    private baseService: BaseService,
    private sortService: SortService) {
    this.keepCalendarOpeningWithRange = true;
    this.selectedRange = {startDate: moment().startOf('month'), endDate: moment().endOf('month')};
  }

  ngOnInit() {
    this.getCategories();
    this.selectedRange.endDate = this.maxDate;
    console.log(this.selectedRange);
  }
  getCategories(){
    
    this.baseService.get(this.api_menu.ToolSetting.CatalogueLogViewer.getCategory).subscribe((responses: any) =>{
      if(responses != null){
        this.categories = responses.map(x=>({"text":x.name,"id":x.id}));
        console.log(this.categories);
      }else{
        this.categories = [];
      }
    });
  }
  resetSearch(){
    this.criteria = {
      tableType: null,
      query: null,
      fromDate: this.selectedRange.startDate,
      toDate: this.selectedRange.toDate
    };
    this.categorySelect.active = [];
    this.logs = [];
    this.pager.currentPage = 1;
    this.pager.totalItems = 0;
  }
  search(){
    console.log(this.criteria);
    this.criteria.fromDate = this.selectedRange.startDate;
    this.criteria.toDate = this.selectedRange.endDate;
    if(this.criteria.tableType != null){
      this.getLogViewers();
    }
    else{
      this.toastr.warning("Please choose a table type to search");
    }
  }
  setPage(pager) { 
    this.pager.currentPage = pager.currentPage; 
    this.pager.totalPages = pager.totalPages;
    this.pager.pageSize = pager.pageSize
    this.getLogViewers();
  }
 async getLogViewers(){
    let responses = await this.baseService.postAsync(this.api_menu.ToolSetting.CatalogueLogViewer.paging+ "?page=" + (this.pager.currentPage -1) + "&size=" + this.pager.pageSize, this.criteria, false, true);
    this.logs = responses.data;
    this.pager.totalItems = responses.totalItems;
    console.log(this.logs);
  }
  isDesc = true;
  sortKey: string = "code";
  sort(property){
    this.isDesc = !this.isDesc;
    console.log(this.logs);
    this.sortKey = property;
    this.logs = this.sortService.sort(this.logs, property, this.isDesc);
  }
  /**
   * Daterange picker
   */
  selectedRange: any;
  keepCalendarOpeningWithRange: true;
  maxDate: moment.Moment = moment();
  ranges: any = {
    Today: [moment(), moment()],
    Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [
      moment()
        .subtract(1, 'month')
        .startOf('month'),
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ]
  };

  defaultHistory() {
    this.selectedRange = {startDate: moment().startOf('month'), endDate: moment().endOf('month')};
    this.criteria.fromDate = this.selectedRange.startDate;
    this.criteria.toDate = this.selectedRange.endDate;
  }

  /**
   * ng2-select
   */
  public items: Array<string> = ['Partner Data', 'Exchange Rate', 'Commidity'];
  private value: any = {};
  private _disabledV: string = '0';
  public disabled: boolean = false;
  
  private get disabledV():string {
    return this._disabledV;
  }
 
  private set disabledV(value:string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }
 
  public selected(value:any):void {
    this.criteria.tableType = value.id;
    console.log('Selected value is: ', value);
    console.log(this.criteria.tableType);
  }
 
  public removed(value:any):void {
    this.logs = [];
    this.pager.totalItems = 0;
    this.pager.currentPage = 1;
    console.log('Removed value is: ', value);
  }
 
  public typed(value:any):void {
    console.log('New search input: ', value);
  }
 
  public refreshValue(value:any):void {
    this.value = value;
  }

}
