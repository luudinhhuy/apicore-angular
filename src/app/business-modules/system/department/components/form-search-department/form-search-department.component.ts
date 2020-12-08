import { Component, Output, EventEmitter} from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';

@Component({
    selector: 'department-form-search',
    templateUrl: './form-search-department.component.html'
})

export class DepartmentFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchDepartment> = new EventEmitter<ISearchDepartment>();    

    formSearch: FormGroup;
    fieldSearchs: CommonInterface.ICommonTitleValue[] = [];
    selectedTitleFilter: string;
    selectedValueFilter: string;
    searchKey: AbstractControl ;
    constructor(
        private _fb: FormBuilder,
    ) {
        super();
        this.requestSearch = this.onSubmit;
    }

    ngOnInit() {
        this.initForm();
        this.initDataInform();
    }

    initForm() {
        this.formSearch = this._fb.group({
            searchKey: [],            
        });

        this.searchKey = this.formSearch.controls['searchKey'];
        
    }

    initDataInform() {
        this.fieldSearchs = this.getFieldSearch();
        this.selectedTitleFilter = this.fieldSearchs[0].title;
        this.selectedValueFilter = this.fieldSearchs[0].value;
    }

    onSubmit() {
        const body: ISearchDepartment = {
            type: this.selectedValueFilter,
            keyword: this.searchKey.value,            
        };
        this.onSearch.emit(body);
    }

    getFieldSearch(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'All', value: 'All' },
            { title: 'Department Code', value: 'Code' },
            { title: 'Name EN', value: 'DeptName' },
            { title: 'Name Local', value: 'DeptNameEn' },
            { title: 'Name Abbr', value: 'DeptNameAbbr' },
            { title: 'Office', value: 'OfficeName' },
        ];
    }

    search() {
        this.onSubmit();
    }

    reset() {
        this.initDataInform();
        this.resetFormControl(this.searchKey);
        this.onSearch.emit(<any>{});
    }
}

interface ISearchDepartment {
    type: string;
    keyword: string;
}