import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-options',
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.scss']
})
export class SearchOptionsComponent implements OnInit {
  @Input() configSearch : any;
  @Output() search = new EventEmitter<any>();
  settingFields: any [];
  searchObject: any = {
    field: "",
    fieldDisplayName: "",
    searchString: ""
  };

  constructor() { }

  ngOnInit() {
    this.getSettings(this.configSearch);
  }
  getSettings(configSearch: any): any {
    this.settingFields = this.configSearch.settingFields;
    this.searchObject.field = configSearch.selectedFilter;
    this.searchObject.fieldDisplayName = configSearch.selectedFilter;
  }
  searchTypeChange(field, event) {
    this.searchObject.field = field.primaryKey;
    this.searchObject.fieldDisplayName = field.header;
    this.setActiveStyle(event);
  }
  setActiveStyle(event: any): any {
    var id_element = document.getElementById(event.target.id);
    if($(id_element).hasClass("active")==false){      
      $(id_element).siblings().removeClass('active');
      id_element.classList.add("active");
    }
  }
  searchClick(){
    this.search.emit(this.searchObject);
  }
}
