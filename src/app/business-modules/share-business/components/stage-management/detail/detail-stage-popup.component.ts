import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from "@angular/core";
import { FormBuilder, FormGroup, AbstractControl, Validators } from "@angular/forms";

import { PopupBase } from "src/app/popup.base";
import { SystemRepo, OperationRepo } from "src/app/shared/repositories";
import { User, Stage } from "src/app/shared/models";

import { takeUntil, catchError, finalize } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { formatDate } from "@angular/common";

@Component({
    selector: "detail-stage-popup",
    templateUrl: "./detail-stage-popup.component.html",
    styleUrls: ['./detail-stage-popup.component.scss']
})
export class ShareBusinessStageManagementDetailComponent extends PopupBase implements OnInit, OnChanges {

    @Input() data: Stage = null;
    @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();

    form: FormGroup;
    stageName: AbstractControl;
    processTime: AbstractControl;
    description: AbstractControl;
    comment: AbstractControl;
    departmentName: AbstractControl;

    deadLineDate: AbstractControl;

    statusStage: Array<any> = [
        {
            id: "InSchedule",
            text: "In Schedule"
        },
        {
            id: "Processing",
            text: "Processing"
        },

        {
            id: "Done",
            text: "Done"
        },
        {
            id: "Overdued",
            text: "Overdued"
        },
        {
            id: "Pending",
            text: "Pending"
        },
        {
            id: "Deleted",
            text: "Deleted"
        }
    ];
    statusStageActive: any[] = [this.statusStage[0]];

    systemUsers: User[] = [];
    selectedMainPersonInCharge: IPersonInCharge = null;
    selectedRealPersonInCharge: IPersonInCharge = null;


    // config for combo gird
    configComboGrid: any = {
        placeholder: 'Please select',
        displayFields: [
            { field: 'username', label: 'UserName' },
            { field: 'employeeNameEn', label: 'FullName' },
        ],
        source: this.systemUsers,
        selectedDisplayFields: ['username'],
    };

    isSummited: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _operationRepo: OperationRepo,
        private _toaster: ToastrService,
        private _systemRepo: SystemRepo
    ) {
        super();
        this.initForm();
    }

    ngOnChanges() {
        if (!!this.data) {
            this.statusStage = [
                {
                    id: "InSchedule",
                    text: "In Schedule"
                },
                {
                    id: "Processing",
                    text: "Processing"
                },
                {
                    id: "Warning",
                    text: "Warning"
                },
                {
                    id: "Done",
                    text: "Done"
                },
                {
                    id: "Overdued",
                    text: "Overdued"
                },
                {
                    id: "Pending",
                    text: "Pending"
                },
                {
                    id: "Deleted",
                    text: "Deleted"
                }
            ];
            this.statusStageActive = [this.statusStage[0]];

            this.initFormUpdate();
        }
    }

    ngOnInit() {
        this.getListSystemUser();
    }

    initForm() {
        this.form = this._fb.group({
            'stageName': [{ value: '', disabled: true }, Validators.compose([
                Validators.required,
            ])],
            'processTime': [, Validators.compose([
                Validators.min(1)
            ])],
            'departmentName': [{ value: '', disabled: true }, Validators.compose([
                Validators.required,
            ])],
            'description': [''],
            'comment': [''],
            'deadLineDate': [{
                startDate: null,
                endDate: null
            }],
        });
        this.stageName = this.form.controls['stageName'];
        this.processTime = this.form.controls['processTime'];
        this.description = this.form.controls['description'];
        this.comment = this.form.controls['comment'];
        this.departmentName = this.form.controls['departmentName'];
        this.deadLineDate = this.form.controls['deadLineDate'];

    }

    initFormUpdate() {
        this.form.setValue({
            stageName: this.data.stageNameEN,
            comment: this.data.comment || '',
            departmentName: this.data.departmentName,
            description: this.data.description || '',
            processTime: this.data.processTime,
            deadLineDate: !!this.data.deadline ? { startDate: new Date(this.data.deadline), endDate: new Date(this.data.deadline) } : null
        });

        this.selectedMainPersonInCharge = Object.assign({}, { field: 'id', value: this.data.mainPersonInCharge });
        this.selectedRealPersonInCharge = Object.assign({}, { field: 'id', value: this.data.realPersonInCharge });

        if (!!this.data.status) {
            this.statusStageActive = this.statusStage.filter((item: any) => item.id.trim() === this.data.status.trim());
        } else {
            this.statusStageActive = [this.statusStage[0]];
        }
    }

    selected($event: any): void {
        this.statusStageActive[0].id = $event.id;
        this.statusStageActive[0].text = $event.text;
    }

    onSelectMainPersonIncharge($event: User) {
        this.selectedMainPersonInCharge.value = $event.username;
    }

    onSelectRealPersonIncharge($event: User) {
        this.selectedRealPersonInCharge.value = $event.username;
    }

    onSubmit(form: FormGroup) {
        this.isSummited = true;
        if (form.invalid) {
            return;
        }
        if ((this.statusStageActive[0].id === 'Pending' || this.statusStageActive[0].id === "Deleted") && !form.value.comment) {
            return;
        }
        if (!this.selectedMainPersonInCharge.value) {
            return;
        } else {
            const body = {
                id: this.data.id,
                jobId: this.data.jobId,
                stageId: this.data.stageId,
                name: this.data.name,
                orderNumberProcessed: this.data.orderNumberProcessed,
                mainPersonInCharge: this.selectedMainPersonInCharge.value || "admin",
                realPersonInCharge: this.selectedRealPersonInCharge.value,
                processTime: form.value.processTime,
                comment: form.value.comment,
                description: form.value.description,
                deadline: !!form.value.deadLineDate.startDate ? formatDate(form.value.deadLineDate.startDate, 'yyyy-MM-ddTHH:mm', 'en') : null,
                status: this.statusStageActive[0].id || this.statusStage[0].id
            };
            this._operationRepo.updateStageToJob(body).pipe(
                takeUntil(this.ngUnsubscribe),
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (res: any) => {
                    if (!res.status) {
                        this._toaster.error(res.message, '', { positionClass: 'toast-bottom-right' });
                    } else {
                        this.onSuccess.emit();
                        this._toaster.success(res.message, '', { positionClass: 'toast-bottom-right' });
                        this.hide();
                    }
                },
                // error
                (errs: any) => {
                },
                // complete
                () => {
                    this.isSummited = false;
                }
            );
        }

    }

    getListSystemUser() {
        this._systemRepo.getListSystemUser().pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
            finalize(() => { }),
        ).subscribe(
            (res: any[]) => {
                if (!res) {
                } else {
                    this.systemUsers = res.map((item: any) => new User(item));
                    Object.assign(this.configComboGrid, { source: this.systemUsers });
                }
            },
            // error
            (errs: any) => {
            },
            // complete
            () => { }
        )
    }

    onCancel() {
        this.isSummited = false;
        this.hide();
    }
}


interface IPersonInCharge {
    field: string;
    value: string;
}
