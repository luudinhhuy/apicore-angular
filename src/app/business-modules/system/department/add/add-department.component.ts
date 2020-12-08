import { Component } from '@angular/core';
import { SystemRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Department } from 'src/app/shared/models/system/department';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'app-department-new',
    templateUrl: './add-department.component.html'
})

export class DepartmentAddNewComponent extends AppForm {
    formAdd: FormGroup;
    departmentCode: AbstractControl;
    nameEn: AbstractControl;
    nameLocal: AbstractControl;
    nameAbbr: AbstractControl;
    office: AbstractControl;
    status: AbstractControl;
    officeList: any[] = [];
    departmentType: AbstractControl;
    departmentTypeList: any[] = [];
    departmentTypeActive: any[] = [];

    isValidForm: boolean = false;
    isSubmited: boolean = false;

    constructor(
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _fb: FormBuilder,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initDataInform();
        this.initForm();
    }

    initForm() {
        this.formAdd = this._fb.group({
            departmentCode: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(50)
                ])
            ],
            nameEn: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            nameLocal: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            nameAbbr: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            office: ['',
                Validators.compose([
                    Validators.required
                ])
            ],
            status: [],
            departmentType: [this.departmentTypeActive]
        });

        this.departmentCode = this.formAdd.controls['departmentCode'];
        this.nameEn = this.formAdd.controls['nameEn'];
        this.nameLocal = this.formAdd.controls['nameLocal'];
        this.nameAbbr = this.formAdd.controls['nameAbbr'];
        this.office = this.formAdd.controls['office'];
        this.status = this.formAdd.controls['status'];
        this.departmentType = this.formAdd.controls['departmentType'];

        this.status.setValue(true);
    }

    initDataInform() {
        this.getOffices();
        this.getDeptTypes();
    }

    saveDepartment() {
        [this.departmentType].forEach((control: AbstractControl) => this.setError(control));
        this.isSubmited = true;
        if (this.formAdd.valid) {
            const dept: Department = {
                id: 0,
                code: this.departmentCode.value,
                deptName: this.nameLocal.value,
                deptNameEn: this.nameEn.value,
                deptNameAbbr: this.nameAbbr.value,
                branchId: this.office.value[0].id,
                officeName: this.office.value[0].text,
                companyName: '',
                deptType: this.departmentTypeActive[0].id,
                userCreated: '',
                datetimeCreated: '',
                userModified: '',
                datetimeModified: '',
                active: this.status.value,
                inactiveOn: '',
                companyId: null,
                userNameCreated: '',
                userNameModified: ''
            };
            console.log(dept);
            this._progressRef.start();
            // Add new Department
            this._systemRepo.addNewDepartment(dept)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this._router.navigate([`home/system/department/${res.data.id}`]);
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        }
    }

    getOffices() {
        this._systemRepo.getAllOffice()
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (data: any) => {
                    this.officeList = data.map((item: any) => ({ "id": item.id, "text": item.shortName }));
                },
            );
    }

    getDeptTypes() {
        this._systemRepo.getListDeptType()
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (data: any) => {
                    this.departmentTypeList = data.map((item: any) => ({ id: item.value, text: item.displayName }));
                    this.departmentTypeActive = [this.departmentTypeList[1]];
                },
            );
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'deptType':
                this.departmentTypeActive = [];
                this.departmentTypeActive.push(data);
                this.departmentType.setValue(this.departmentTypeActive);
                break;
            default:
                break;
        }
    }

    back() {
        this._router.navigate(['home/system/department']);
    }

}


