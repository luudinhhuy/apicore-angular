import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { PagerSetting } from '../../models/layout/pager-setting.model';
import { PagingService } from '../../services/paging-service';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html'
})
export class AppPaginationComponent implements OnInit {
  @Input() config: PagerSetting = {};
  @Output() pagerObject = new EventEmitter<any[]>();
  count = 0;

  selectPageSize() {
    this.pager.totalItems = 0;
    this.pager.setPage(1);
    this.pagerObject.emit(this.pager);
  }

  constructor(private pagerService: PagingService, private cdRef: ChangeDetectorRef) { }

  // pager object
  pager: any = {};
  ngOnInit() {
    //this.setPage(1);
    this.getPages(1);
  }

  sendBackData() {
    this.count += 1;
  }

  getPages(page: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }
    this.pager = this.pagerService.getPager(this.config.totalItems, page, this.config.pageSize, this.config.totalPageBtn);
  }
  setPage(page: number) {
    // if (page < 1 || page > this.pager.totalPages) {
    //   return;
    // }
    // this.pager = this.pagerService.getPager(this.config.totalItems, page, this.config.pageSize,this.config.totalPageBtn);
    this.getPages(page);
    this.pagerObject.emit(this.pager);
  }
}
