import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { DataService } from 'src/app/shared/services';
import { User } from 'src/app/shared/models';
import { SystemRepo } from 'src/app/shared/repositories';
import { SystemConstants } from 'src/constants/system.const';
import { catchError, map } from 'rxjs/operators';
import { formatDate } from '@angular/common';

@Component({
    selector: 'custom-clearance-form-search',
    templateUrl: './form-search-custom-clearance.component.html'
})

export class CustomClearanceFormSearchComponent extends AppForm {

    @Output() onSearch: EventEmitter<any> = new EventEmitter<any>();

    formSearch: FormGroup;
    personalHandle: AbstractControl;
    clearanceNo: AbstractControl;
    clearanceDate: AbstractControl;
    importDate: AbstractControl;
    importStatus: AbstractControl;
    type: AbstractControl;

    status: CommonInterface.ICommonTitleValue[];
    types: CommonInterface.ICommonTitleValue[];

    users: User[] = [];
    userLogged: User;

    constructor(
        private _fb: FormBuilder,
        private _dataService: DataService,
        private _sysRepo: SystemRepo
    ) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.initBasicData();
        this.getUserLogged();
        this.getListUser();
    }

    initForm() {
        this.formSearch = this._fb.group({
            'personalHandle': [],
            'clearanceNo': [],
            'clearanceDate': [
                {
                    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
                    endDate: new Date()
                },
            ],
            'importDate': [],
            'importStatus': [],
            'type': [],
        });

        this.personalHandle = this.formSearch.controls['personalHandle'];
        this.clearanceNo = this.formSearch.controls['clearanceNo'];
        this.clearanceDate = this.formSearch.controls['clearanceDate'];
        this.importDate = this.formSearch.controls['importDate'];
        this.importStatus = this.formSearch.controls['importStatus'];
        this.type = this.formSearch.controls['type'];
    }

    initBasicData() {
        this.status = [
            { title: 'Imported', value: true },
            { title: 'Not imported', value: false },
        ];
        this.importStatus.setValue(this.status[1]);

        this.types = [
            { title: 'Import', value: 'Import' },
            { title: 'Export', value: 'Export' },
        ];
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    getListUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.users = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER) || [];
            this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0]);
        } else {
            this._sysRepo.getListSystemUser()
                .pipe(
                    catchError(this.catchError),
                    map((data: any[]) => data.map((item: any) => new User(item))),
                )
                .subscribe(
                    (data: any) => {
                        this.users = data || [];
                        this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0]);
                    },
                );
        }
    }

    searchCustomClearance() {
        const body: ISearchCustomClearance = {
            clearanceNo: this.clearanceNo.value,
            fromClearanceDate: !!this.clearanceDate.value ? formatDate(this.clearanceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toClearanceDate: !!this.clearanceDate.value ? formatDate(this.clearanceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            imPorted: !!this.importStatus.value ? this.importStatus.value.value : null,
            fromImportDate: !!this.importDate.value ? formatDate(this.importDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            toImportDate: !!this.importDate.value ? formatDate(this.importDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            type: !!this.type.value ? this.type.value.value : null,
            personHandle: this.personalHandle.value.id
        };
        this.onSearch.emit(body);
    }

    resetSearch() {
        this.onSearch.emit({});
        this.personalHandle.setValue(this.users.filter((user: User) => user.id === this.userLogged.id)[0]);
        this.clearanceNo.setValue(null);
        this.clearanceDate.setValue({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate: new Date()
        });
        this.importDate.setValue(null);
        this.type.setValue(null);
        this.importStatus.setValue(this.status[1]);

    }
}

interface ISearchCustomClearance {
    clearanceNo: string;
    fromClearanceDate: string;
    toClearanceDate: string;
    imPorted: boolean;
    fromImportDate: string;
    toImportDate: string;
    type: string;
    personHandle: string;
}

