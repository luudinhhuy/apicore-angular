import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActionsSubject } from '@ngrx/store';

import { AppForm } from 'src/app/app.form';
import { InfoPopupComponent } from 'src/app/shared/common/popup';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { CsTransaction } from 'src/app/shared/models';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { Container } from 'src/app/shared/models/document/container.model';
import {
    ShareBussinessFormCreateSeaExportComponent,
    ShareBusinessImportJobDetailPopupComponent,
    ShareBussinessShipmentGoodSummaryLCLComponent
} from 'src/app/business-modules/share-business';

import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-create-job-lcl-export',
    templateUrl: './create-job-lcl-export.component.html'
})

export class SeaLCLExportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareBussinessFormCreateSeaExportComponent, { static: false }) formCreateComponent: ShareBussinessFormCreateSeaExportComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBussinessShipmentGoodSummaryLCLComponent, { static: false }) shipmentGoodSummaryComponent: ShareBussinessShipmentGoodSummaryLCLComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: false }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;
    containers: Container[] = [];
    isImport: boolean = false;
    selectedJob: any = {}; // TODO model.

    constructor(
        protected _toastService: ToastrService,
        protected _documenRepo: DocumentationRepo,
        protected _router: Router,
        protected _actionStoreSubject: ActionsSubject,
        protected _cdr: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit() {

    }

    gotoList() {
        this._router.navigate(["home/documentation/sea-lcl-export"]);
    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formGroup.getRawValue();

        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,

            mawb: form.mawb,
            voyNo: form.voyNo,
            notes: form.notes,
            personIncharge: form.personalIncharge, // TODO user with Role = CS.
            coloader: form.coloader,
            bookingNo: form.bookingNo,
            flightVesselName: form.flightVesselName,
            pono: form.pono,

            shipmentType: !!form.shipmentType && !!form.shipmentType.length ? form.shipmentType[0].id : null,
            typeOfService: !!form.typeOfService && !!form.typeOfService.length ? form.typeOfService[0].id : null,
            mbltype: !!form.mbltype && !!form.mbltype.length ? form.mbltype[0].id : null,
            paymentTerm: !!form.term && !!form.term.length ? form.term[0].id : null,

            agentId: form.agent,
            pol: form.pol,
            pod: form.pod,
            coloaderId: form.coloader,

            // * containers summary
            commodity: this.shipmentGoodSummaryComponent.commodities,
            grossWeight: this.shipmentGoodSummaryComponent.gw,
            cbm: this.shipmentGoodSummaryComponent.cbm,
            packageQty: this.shipmentGoodSummaryComponent.packageQuantity,
            packageType: this.shipmentGoodSummaryComponent.packageTypes.map(type => type.id).toString(),
        };

        const fclExportAddModel: CsTransaction = new CsTransaction(formData);
        fclExportAddModel.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaLCLExport;

        return fclExportAddModel;
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateComponent.formGroup.valid || (!!this.formCreateComponent.etd.value && !this.formCreateComponent.etd.value.startDate)) {
            valid = false;
        }

        if (
            this.shipmentGoodSummaryComponent.gw === null
            || this.shipmentGoodSummaryComponent.cbm === null
            || this.shipmentGoodSummaryComponent.packageQuantity === null
            || this.shipmentGoodSummaryComponent.gw < 0
            || this.shipmentGoodSummaryComponent.cbm < 0
            || this.shipmentGoodSummaryComponent.packageQuantity < 0
        ) {
            valid = false;
        }
        return valid;
    }

    onSaveJob() {
        [this.formCreateComponent.isSubmitted, this.shipmentGoodSummaryComponent.isSubmitted] = [true, true];
        if (Object.keys(this.selectedJob).length > 0) {
            this.containers = this.selectedJob.containers;
        }
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        const modelAdd = this.onSubmitData();

        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
            this.isImport = false;
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

                        this._router.navigate([`home/documentation/sea-lcl-export/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.formCreateComponent.formGroup.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaLCLExport;
        this.formImportJobDetailPopup.getShippments();
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
                        this._router.navigate([`home/documentation/sea-lcl-export/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}
