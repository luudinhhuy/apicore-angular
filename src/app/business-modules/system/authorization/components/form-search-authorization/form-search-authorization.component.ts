import { Component, Output, EventEmitter } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { SystemRepo, CatalogueRepo } from '@repositories';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'authorization-form-search',
    templateUrl: './form-search-authorization.component.html'
})

export class AuthorizationFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ISearchAuthorization> = new EventEmitter<ISearchAuthorization>();

    formSearch: FormGroup;
    service: AbstractControl;
    effectiveDate: AbstractControl;
    personInCharge: AbstractControl;
    expirationDate: AbstractControl;
    authorizedPerson: AbstractControl;
    status: AbstractControl;

    statusList: any[] = [];
    statusActive: any[] = [];
    personInChargeList: any[] = [];
    authorizedPersonList: any[] = [];
    serviceList: any[] = [];

    constructor(
        private _fb: FormBuilder,
        private _systemRepo: SystemRepo,
        private _catalogueRepo: CatalogueRepo,
    ) {
        super();
        this.requestSearch = this.onSubmit;
    }

    ngOnInit() {
        this.initDataInform();
        this.initForm();
    }

    initForm() {
        this.formSearch = this._fb.group({
            service: [],
            effectiveDate: [],
            personInCharge: [],
            expirationDate: [],
            authorizedPerson: [],
            status: [this.statusActive]
        });
        this.service = this.formSearch.controls['service'];
        this.effectiveDate = this.formSearch.controls['effectiveDate'];
        this.personInCharge = this.formSearch.controls['personInCharge'];
        this.expirationDate = this.formSearch.controls['expirationDate'];
        this.authorizedPerson = this.formSearch.controls['authorizedPerson'];
        this.status = this.formSearch.controls['status'];
    }

    initDataInform() {
        this.getService();
        this.getUsers();
        this.getStatus();
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.serviceList = res.map(x => ({ "text": x.displayName, "id": x.value }));
                    }
                },
            );
    }

    getUsers() {
        this._systemRepo.getSystemUsers({ active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    this.personInChargeList = data.map(x => ({ "text": x.username, "id": x.username }));
                    this.authorizedPersonList = data.map(x => ({ "text": x.username, "id": x.username }));
                },
            );
    }

    getStatus() {
        this.statusList = [
            { "text": 'Active', "id": 'active' },
            { "text": 'Inactive', "id": 'inactive' }
        ];
        //Default value: Active
        this.statusActive = [this.statusList[0]];
    }

    onSubmit() {
        const body: ISearchAuthorization = {
            all: '',
            service: this.service.value ? (this.service.value.length > 0 ? this.service.value[0].id : '') : '',
            userId: this.personInCharge.value ? (this.personInCharge.value.length > 0 ? this.personInCharge.value[0].id : '') : '',
            assignTo: this.authorizedPerson.value ? (this.authorizedPerson.value.length > 0 ? this.authorizedPerson.value[0].id : '') : '',
            startDate: this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            endDate: this.expirationDate.value ? (this.expirationDate.value.startDate !== null ? formatDate(this.expirationDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            active: this.status.value ? (this.status.value[0].id === 'active' ? true : false) : null
        };
        this.onSearch.emit(body);
    }

    search() {
        this.onSubmit();
    }

    reset() {
        this.formSearch.reset();
        this.initDataInform();
        this.onSearch.emit(<any>{});
        this.statusActive = [this.statusList[0]];
        this.status.setValue(this.statusActive);
    }
}

interface ISearchAuthorization {
    all: '';
    service: string;
    userId: string;
    assignTo: string;
    startDate: string;
    endDate: string;
    active: boolean;
}