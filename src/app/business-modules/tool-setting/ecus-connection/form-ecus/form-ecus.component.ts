import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { SystemRepo, OperationRepo } from '@repositories';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { EcusConnection } from 'src/app/shared/models/tool-setting/ecus-connection';

import merge from 'lodash/merge';

@Component({
    selector: 'form-ecus-popup',
    templateUrl: './form-ecus.component.html',
})
export class EcusConnectionFormPopupComponent extends PopupBase implements OnInit {
    @Output() onUpdate: EventEmitter<boolean> = new EventEmitter<boolean>();

    formGroup: FormGroup;
    userId: AbstractControl;
    name: AbstractControl;
    serverName: AbstractControl;
    dbname: AbstractControl;
    dbusername: AbstractControl;
    dbpassword: AbstractControl;
    note: AbstractControl;

    Users: CommonInterface.INg2Select[] = [];

    datetimeCreated: string;
    userCreatedName: string;
    datetimeModified: string;
    userModifiedName: string;

    userCreated: string;

    title: string = 'Add new Ecus';

    isAllowUpdate: boolean = true;

    constructor(
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
        private _toast: ToastrService,
        private _operationRepo: OperationRepo
    ) {
        super();
    }

    ngOnInit(): void {
        this.getListUsers();
        this.initForm();
    }

    initForm() {
        this.formGroup = this._fb.group({
            id: [0],
            name: [null, Validators.compose([
                Validators.required,
                Validators.maxLength(250)
            ])],
            userId: [null, Validators.compose([
                Validators.required
            ])],
            serverName: [null, Validators.compose([
                Validators.required,
                Validators.maxLength(250)
            ])],
            dbname: [null, Validators.compose([
                Validators.required,
                Validators.maxLength(250)
            ])],
            dbusername: [null, Validators.compose([
                Validators.required,
                Validators.maxLength(100)
            ])],
            dbpassword: [null, Validators.compose([
                Validators.maxLength(100)
            ])],
            note: [],
            active: [true],

        });

        this.userId = this.formGroup.controls['userId'];
        this.name = this.formGroup.controls['name'];
        this.userId = this.formGroup.controls['userId'];
        this.serverName = this.formGroup.controls['serverName'];
        this.dbname = this.formGroup.controls['dbname'];
        this.dbusername = this.formGroup.controls['dbusername'];
        this.dbpassword = this.formGroup.controls['dbpassword'];
        this.note = this.formGroup.controls['note'];
    }

    getListUsers() {
        this._systemRepo.getSystemUsers().subscribe((data: any) => {
            this.Users = this.utility.prepareNg2SelectData(data, 'id', 'username');
        });
    }

    onSaveEcus() {
        this.isSubmitted = true;
        const valueForm = this.formGroup.getRawValue();
        const ecusUserId = !!valueForm.userId && !!valueForm.userId.length ? valueForm.userId[0].id : null;

        const ecus: EcusConnection = new EcusConnection(merge(valueForm, Object.assign({}, { userId: ecusUserId })));
        if (this.formGroup.invalid) { return; }
        if (!this.isShowUpdate) {
            ecus.id = 0;
            this._operationRepo.addNewEcus(ecus)
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toast.success(res.message);
                            this.isSubmitted = false;
                            this.onUpdate.emit(true);
                            this.hide();
                            return;
                        }
                        this._toast.error(res.message);
                    });
        } else {
            ecus.userCreated = this.userCreated;
            ecus.datetimeCreated = this.datetimeCreated;

            this._operationRepo.updateEcus(ecus).subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toast.success(res.message);
                        this.isSubmitted = false;
                        this.onUpdate.emit(true);
                        this.hide();
                        return;
                    }
                    this._toast.error(res.message);
                });
        }

    }

}
