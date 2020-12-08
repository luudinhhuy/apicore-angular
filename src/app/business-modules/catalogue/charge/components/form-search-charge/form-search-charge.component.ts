import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';

@Component({
  selector: 'form-search-charge',
  templateUrl: './form-search-charge.component.html'
})
export class FormSearchChargeComponent extends AppForm implements OnInit {
  @Output() onSearch: EventEmitter<ISearchGroup> = new EventEmitter<ISearchGroup>();
  configSearch: any;

  constructor() {
    super();
    this.requestSearch = this.searchData;
    this.requestReset = this.onReset;
  }

  ngOnInit() {
    this.configSearch = {
      typeSearch: 'outtab',
      settingFields: <CommonInterface.IValueDisplay[]>[
        { displayName: 'Code', fieldName: 'code' },
        { displayName: 'Name EN', fieldName: 'chargeNameEn' },
        { displayName: 'Name Local', fieldName: 'chargeNameVn' },
        { displayName: 'Type', fieldName: 'type' }
      ]
    };
  }
  searchData(searchObject: ISearchObject) {
    const searchData: ISearchGroup = {
      type: searchObject.field,
      keyword: searchObject.searchString
    };

    this.onSearch.emit(searchData);
    console.log(searchData);
  }

  onReset(data: any) {
    this.onSearch.emit(data);
  }
}
interface ISearchGroup {
  type: string;
  keyword: string;
}

interface ISearchObject extends CommonInterface.IValueDisplay {
  searchString: string;
  field: string;
}