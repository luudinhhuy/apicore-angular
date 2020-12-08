import { Component, Output, EventEmitter } from '@angular/core';
import { User, Currency } from 'src/app/shared/models';
import { DataService } from 'src/app/shared/services';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { AppForm } from 'src/app/app.form';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { SystemConstants } from 'src/constants/system.const';
import { Observable } from 'rxjs';

@Component({
    selector: 'adv-payment-form-create',
    templateUrl: './form-create-advance-payment.component.html'
})

export class AdvancePaymentFormCreateComponent extends AppForm {

    @Output() onChangeCurrency: EventEmitter<any> = new EventEmitter<any>();

    methods: CommonInterface.ICommonTitleValue[];
    currencyList: Currency[] = [];
    userLogged: User;
    users: Observable<User[]>;

    formCreate: FormGroup;
    advanceNo: AbstractControl;
    requester: AbstractControl;
    requestDate: AbstractControl;
    paymentMethod: AbstractControl;
    department: AbstractControl;
    deadLine: AbstractControl;
    note: AbstractControl;
    currency: AbstractControl;


    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        private _systemRepo: SystemRepo
    ) {
        super();

    }

    ngOnInit() {
        this.initForm();
        this.initBasicData();
        this.getUserLogged();
        this.getCurrency();
    }

    ngOnChanges() {
    }

    initForm() {
        this.formCreate = this._fb.group({
            advanceNo: [{ value: null, disabled: true }],
            requester: [{ value: null, disabled: true }],
            department: [],
            requestDate: [{
                startDate: new Date(),
                endDate: new Date(),
            }],
            deadLine: [{
                startDate: new Date(new Date().setDate(new Date().getDate() + 9)),
                endDate: new Date(new Date().setDate(new Date().getDate() + 9)),
            }],
            paymentMethod: [],
            note: [],
            currency: []
        });

        this.advanceNo = this.formCreate.controls['advanceNo'];
        this.requester = this.formCreate.controls['requester'];
        this.requestDate = this.formCreate.controls['requestDate'];
        this.deadLine = this.formCreate.controls['deadLine'];
        this.currency = this.formCreate.controls['currency'];
        this.note = this.formCreate.controls['note'];
        this.department = this.formCreate.controls['department'];
        this.paymentMethod = this.formCreate.controls['paymentMethod'];

        this.requestDate.valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                map((data: any) => data.startDate)
            )
            .subscribe((value: any) => {
                this.minDate = value;
                setTimeout(() => {
                    this.deadLine.setValue({
                        startDate: new Date(new Date(value).setDate(new Date(value).getDate() + 9)),
                        endDate: new Date(new Date(value).setDate(new Date(value).getDate() + 9))
                    });
                }, 100);
            });
    }

    onUpdateRequestDate(value: { startDate: any; endDate: any }) {
        this.minDate = value.startDate;
        this.deadLine.setValue({
            startDate: new Date(new Date(value.startDate).setDate(new Date(value.startDate).getDate() + 9)),
            endDate: new Date(new Date(value.endDate).setDate(new Date(value.endDate).getDate() + 9)),
        });
    }

    initBasicData() {
        this.methods = this.getMethod();
        this.paymentMethod.setValue(this.methods[0]);

    }


    getMethod(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Cash', value: 'Cash' },
            { title: 'Bank Transfer', value: 'Bank' },
        ];
    }

    getUserLogged() {
        this.users = this._systemRepo.getListSystemUser();
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.requester.setValue(this.userLogged.id);
    }

    getCurrency() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY)) {
            this.currencyList = this._dataService.getDataByKey(SystemConstants.CSTORAGE.CURRENCY) || [];
            this.currency.setValue(this.currencyList.filter((item: Currency) => item.id === 'VND')[0].id);
        } else {
            this._catalogueRepo.getListCurrency()
                .pipe(catchError(this.catchError))
                .subscribe(
                    (data: any) => {
                        this.currencyList = data || [];
                        this.currency.setValue(this.currencyList.filter((item: Currency) => item.id === 'VND')[0].id);
                    },
                );
        }
    }

    changeCurrency(currency: string) {
        if (!!currency) {
            this.onChangeCurrency.emit(currency);
        }
    }

}
