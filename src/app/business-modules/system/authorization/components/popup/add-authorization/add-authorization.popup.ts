import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl, Validators } from "@angular/forms";
import { SystemRepo, CatalogueRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";
import { catchError, distinctUntilChanged, map } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { ConfirmPopupComponent } from "@common";
import { Authorization } from "@models";
@Component({
    selector: 'add-authorization-popup',
    templateUrl: './add-authorization.popup.html'
})

export class AuthorizationAddPopupComponent extends PopupBase {
    @Output() onRequestAuthorization: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('confirmUpdatePopup', { static: false }) confirmUpdatePopup: ConfirmPopupComponent;
    @ViewChild('confirmCancelPopup', { static: false }) confirmCancelPopup: ConfirmPopupComponent;

    formAuthorization: FormGroup;
    authorization: Authorization = new Authorization();
    authorizationToUpdate: Authorization = new Authorization();

    isSubmited: boolean = false;
    action: string = 'create';

    authorizationName: AbstractControl;
    personInCharge: AbstractControl;
    authorizedPerson: AbstractControl;
    authorizationService: AbstractControl;
    effectiveDate: AbstractControl;
    expirationDate: AbstractControl;
    authorizationNote: AbstractControl;
    authorizationActive: AbstractControl;

    personInChargeList: any[] = [];
    personInChargeActive: any[] = [];
    authorizedPersonList: any[] = [];
    authorizedPersonActive: any[] = [];
    serviceList: any[] = [];
    activeServices: any = [];

    minDateExpired: any = null;
    minDateEffective: any = null;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService, ) {
        super();
    }

    ngOnInit() {
        this.getService();
        this.getUsers();
        this.initForm();
    }

    initForm() {
        this.formAuthorization = this._fb.group({
            authorizationName: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(50)
                ])],
            personInCharge: [],
            authorizedPerson: [null, Validators.required],
            authorizationService: [null, Validators.required],
            effectiveDate: [null, Validators.required],
            expirationDate: [null],
            authorizationNote: [''],
            authorizationActive: []
        });

        this.authorizationName = this.formAuthorization.controls['authorizationName'];
        this.personInCharge = this.formAuthorization.controls['personInCharge'];
        this.authorizedPerson = this.formAuthorization.controls['authorizedPerson'];
        this.authorizationService = this.formAuthorization.controls['authorizationService'];
        this.effectiveDate = this.formAuthorization.controls['effectiveDate'];
        this.expirationDate = this.formAuthorization.controls['expirationDate'];
        this.authorizationNote = this.formAuthorization.controls['authorizationNote'];
        this.authorizationActive = this.formAuthorization.controls['authorizationActive'];

        this.formAuthorization.get("effectiveDate").valueChanges
            .pipe(
                distinctUntilChanged((prev, curr) => prev.endDate === curr.endDate && prev.startDate === curr.startDate),
                map((data: any) => data.startDate)
            )
            .subscribe((value: any) => {
                this.minDateExpired = this.createMoment(value); // * Update MinDate -> ExpiredDate.
            });
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
                    this.personInChargeList = data.map(x => ({ "text": x.username, "id": x.id }));
                    this.authorizedPersonList = data.map(x => ({ "text": x.username, "id": x.id }));
                },
            );
    }

    saveAuthorization() {
        [this.personInCharge].forEach((control: AbstractControl) => this.setError(control));
        this.isSubmited = true;
        if (this.formAuthorization.valid) {
            const serviceCode = this.authorizedPerson.value ? (this.authorizedPerson.value.length > 0 ? this.authorizationService.value.map((item: any) => item.id).toString().replace(/(?:,)/g, ';') : '') : '';
            const _authorization: Authorization = {
                id: this.authorization.id,
                userId: this.personInChargeActive[0].id,
                assignTo: this.authorizedPerson.value ? (this.authorizedPerson.value.length > 0 ? this.authorizedPerson.value[0].id : '') : '',
                name: this.authorizationName.value,
                services: serviceCode,
                description: this.authorizationNote.value,
                startDate: this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                endDate: this.expirationDate.value ? (this.expirationDate.value.startDate !== null ? formatDate(this.expirationDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                userCreated: this.authorization.userCreated,
                datetimeCreated: this.authorization.datetimeCreated,
                userModified: this.authorization.userModified,
                datetimeModified: this.authorization.datetimeModified,
                active: this.authorizationActive.value,
                inactiveOn: this.authorization.inactiveOn,
                servicesName: this.authorization.servicesName,
                userNameAssign: '',
                userNameAssignTo: ''
            };
            this.authorizationToUpdate = _authorization;
            if (this.action === "create") {
                this._systemRepo.addNewAuthorization(_authorization)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestAuthorization.emit();
                                this.closeAuthorization();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            } else {
                this.confirmUpdatePopup.show();
            }
        }
    }

    onUpdateAuthorization() {
        this.confirmUpdatePopup.hide();
        this._systemRepo.updateAuthorization(this.authorizationToUpdate)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onRequestAuthorization.emit();
                        this.closeAuthorization();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onCancelAuthorization() {
        this.confirmCancelPopup.hide();
        this.closeAuthorization();
    }

    getDetail() {
        const indexPIC = this.personInChargeList.findIndex(x => x.id == this.authorization.userId);
        if (indexPIC > -1) {
            this.personInChargeActive = [this.personInChargeList[indexPIC]];
        }

        const indexAP = this.authorizedPersonList.findIndex(x => x.id == this.authorization.assignTo);
        if (indexAP > -1) {
            this.authorizedPersonActive = [this.authorizedPersonList[indexAP]];
        }

        this.formAuthorization.setValue({
            authorizationName: this.authorization.name,
            personInCharge: this.personInChargeActive,
            authorizedPerson: this.authorizedPersonActive,
            authorizationService: this.activeServices,
            effectiveDate: !!this.authorization.startDate ? { startDate: new Date(this.authorization.startDate) } : null,
            expirationDate: !!this.authorization.endDate ? { startDate: new Date(this.authorization.endDate) } : null,
            authorizationNote: this.authorization.description,
            authorizationActive: this.authorization.active
        });
    }

    getCurrentActiveService(ChargeService: any) {
        this.getService();
        const listService = ChargeService.split(";");
        const activeServiceList: any = [];
        listService.forEach(item => {
            const element = this.serviceList.find(x => x.id === item);
            if (element !== undefined) {
                const activeService = element;
                activeServiceList.push(activeService);
            }
        });
        return activeServiceList;
    }

    closePopup() {
        this.confirmCancelPopup.show();
    }

    closeAuthorization() {
        this.hide();
        this.isSubmited = false;
        this.authorization = new Authorization();
        this.formAuthorization.reset();
        this.minDateExpired = null;
        this.minDateEffective = null;
        //this.formAuthorization.updateValueAndValidity();
    }
}