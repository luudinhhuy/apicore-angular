import { Component, ViewChild } from "@angular/core";
import { AbstractControl } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { formatDate } from "@angular/common";
import { NgxSpinnerService } from "ngx-spinner";
import { InfoPopupComponent } from "@common";

import { OpsTransaction } from "src/app/shared/models/document/OpsTransaction.model";
import { DocumentationRepo } from "src/app/shared/repositories";
import { JobManagementFormCreateComponent } from "../components/form-create/form-create-job.component";
import { AppForm } from "src/app/app.form";

import _merge from 'lodash/merge';

import { takeUntil, catchError, finalize } from "rxjs/operators";

@Component({
    selector: "app-job-mangement-create",
    templateUrl: "./create-job.component.html",
})
export class JobManagementCreateJobComponent extends AppForm {

    @ViewChild(JobManagementFormCreateComponent, { static: false }) formCreateComponent: JobManagementFormCreateComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPoup: InfoPopupComponent;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private _toaster: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _router: Router
    ) {
        super();
    }

    ngOnInit() {
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formCreate.getRawValue();
        const formData = {
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,

            commodityGroupId: !!form.commodity && !!form.commodity.length ? form.commodity.map(i => i.id).toString() : null,
            serviceMode: !!form.serviceMode && !!form.serviceMode.length ? form.serviceMode[0].id : null,
            productService: !!form.productService && !!form.productService.length ? form.productService[0].id : null,
            shipmentMode: !!form.shipmentMode && !!form.shipmentMode.length ? form.shipmentMode[0].id : null,

            agentId: form.agentId,
            pol: form.pol,
            pod: form.pod,
            supplierId: form.supplierId,
            customerId: form.customerId
        };
        const opsTransaction: OpsTransaction = new OpsTransaction(Object.assign(_merge(form, formData)));
        opsTransaction.salemanId = this.formCreateComponent.salemansId;
        return opsTransaction;
    }

    checkValidateForm() {
        [this.formCreateComponent.commodityGroupId,
        ].forEach((control: AbstractControl) => this.setError(control));

        let valid: boolean = true;
        if (!this.formCreateComponent.formCreate.valid || (!!this.formCreateComponent.serviceDate.value && !this.formCreateComponent.serviceDate.value.startDate)) {
            valid = false;
        }
        return valid;
    }

    onSave() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPoup.show();
            return;
        }

        const modelAdd: OpsTransaction = this.onSubmitData();
        this.saveJob(modelAdd);
    }

    saveJob(model: OpsTransaction) {
        this._documentRepo.addOPSJob(model).pipe(
            takeUntil(this.ngUnsubscribe),
            catchError(this.catchError),
            finalize(() => { this.spinner.hide(); })
        ).subscribe(
            (res: CommonInterface.IResult) => {
                if (!res.status) {
                    this._toaster.error(res.message);
                } else {
                    this._toaster.success(res.message);
                    this.router.navigate([
                        "/home/operation/job-edit/", res.data
                    ]);
                }
            }
        );
    }

    gotoList() {
        this._router.navigate(["home/operation/job-management"]);
    }
}
