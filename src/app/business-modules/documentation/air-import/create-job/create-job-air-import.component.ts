import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { AbstractControl } from '@angular/forms';

import { AppForm } from 'src/app/app.form';
import { InfoPopupComponent } from 'src/app/shared/common/popup';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { CsTransaction } from 'src/app/shared/models';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import {
    ShareBusinessImportJobDetailPopupComponent,
    ShareBusinessFormCreateAirComponent
} from 'src/app/business-modules/share-business';

import * as fromShareBusiness from '../../../share-business/store';

import { catchError } from 'rxjs/operators';
import _merge from 'lodash/merge';
@Component({
    selector: 'app-create-job-air-import',
    templateUrl: './create-job-air-import.component.html'
})

export class AirImportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareBusinessFormCreateAirComponent, { static: false }) formCreateComponent: ShareBusinessFormCreateAirComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: true }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    isImport: boolean = false;
    selectedJob: any = {}; // TODO model.

    constructor(
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _store: Store<fromShareBusiness.IShareBussinessState>,
        protected _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit() {
        this._store.dispatch(new fromShareBusiness.TransactionGetDetailSuccessAction({}));
    }

    ngAfterViewInit(): void {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.AirImport;

        this.formImportJobDetailPopup.service = 'air';
        this._cd.detectChanges();
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formGroup.getRawValue();
        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: !!form.flightDate && !!form.flightDate.startDate ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,

            shipmentType: !!form.shipmentType && !!form.shipmentType.length ? form.shipmentType[0].id : null,
            mbltype: !!form.mbltype && !!form.mbltype.length ? form.mbltype[0].id : null,
            paymentTerm: !!form.paymentTerm && !!form.paymentTerm.length ? form.paymentTerm[0].id : null,
            packageType: !!form.packageType && !!form.packageType.length ? form.packageType[0].id : null,
            commodity: !!form.commodity && !!form.commodity.length ? form.commodity.map(i => i.id).toString() : null,

            agentId: form.agentId,
            pol: form.pol,
            pod: form.pod,
            coloaderId: form.coloaderId,
        };
        const airImportAddModel: CsTransaction = new CsTransaction(Object.assign(_merge(form, formData)));
        airImportAddModel.transactionTypeEnum = CommonEnum.TransactionTypeEnum.AirImport;

        return airImportAddModel;
    }

    checkValidateForm() {
        [this.formCreateComponent.shipmentType,
        this.formCreateComponent.packageType,
        this.formCreateComponent.commodity,
        this.formCreateComponent.mbltype,
        this.formCreateComponent.paymentTerm].forEach((control: AbstractControl) => this.setError(control));

        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)) {
            valid = false;
        }
        return valid;
    }

    onSaveJob() {
        this.formCreateComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();
        modelAdd.dimensionDetails = this.formCreateComponent.dimensionDetails;

        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
        } else {
            this.saveJob(modelAdd);
        }
    }

    saveJob(body: any) {
        this._documenRepo.createTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");
                        this._router.navigate([`home/documentation/air-import/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.formCreateComponent.isUpdate = true;
        this.formCreateComponent.formGroup.controls['jobNo'].setValue(null);
        this.formCreateComponent.formGroup.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

        this._store.dispatch(new fromShareBusiness.GetDimensionAction(selectedData.id));
    }

    showImportPopup() {

        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.selected = -1;
        this.formImportJobDetailPopup.selectedShipment = null;
        this.formImportJobDetailPopup.show();
    }

    importJob(body: any) {
        this._documenRepo.importCSTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        // TODO goto detail.
                        this._router.navigate([`home/documentation/air-import/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    gotoList() {
        this._router.navigate(["home/documentation/air-import"]);
    }
}
