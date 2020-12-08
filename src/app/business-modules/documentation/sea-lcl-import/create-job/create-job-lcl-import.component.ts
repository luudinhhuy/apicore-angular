import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { AppForm } from 'src/app/app.form';
import { ShareBussinessFormCreateSeaImportComponent, ShareBussinessShipmentGoodSummaryLCLComponent, ShareBusinessImportJobDetailPopupComponent } from 'src/app/business-modules/share-business';
import { CsTransaction } from 'src/app/shared/models';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { InfoPopupComponent } from 'src/app/shared/common/popup';

import { catchError } from 'rxjs/operators';

@Component({
    selector: 'app-create-job-lcl-import',
    templateUrl: './create-job-lcl-import.component.html'
})

export class SeaLCLImportCreateJobComponent extends AppForm implements OnInit {

    @ViewChild(ShareBussinessFormCreateSeaImportComponent, { static: false }) formCreateComponent: ShareBussinessFormCreateSeaImportComponent;
    @ViewChild(ShareBussinessShipmentGoodSummaryLCLComponent, { static: false }) shipmentGoodSummaryComponent: ShareBussinessShipmentGoodSummaryLCLComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: false }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    isImport: boolean = false;
    selectedJob: any = {}; // TODO model.

    constructor(
        protected _router: Router,
        protected _documenRepo: DocumentationRepo,
        protected _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
    }

    gotoList() {
        this._router.navigate(["home/documentation/sea-lcl-import"]);
    }

    showImportPopup() {
        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaLCLImport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.show();
    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.formCreateComponent.formCreate.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

    }

    onSubmitData() {
        const form: any = this.formCreateComponent.formCreate.getRawValue();

        const formData = {
            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            etd: !!form.etd && !!form.etd.startDate ? formatDate(form.etd.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDate: !!form.serviceDate && !!form.serviceDate.startDate ? formatDate(form.serviceDate.startDate, 'yyyy-MM-dd', 'en') : null,

            mawb: form.mawb,
            voyNo: form.voyNo,
            pono: form.pono,
            notes: form.notes,
            personIncharge: this.formCreateComponent.personIncharge.value, // TODO user with Role = CS.
            subColoader: form.subColoader || null,

            flightVesselName: form.flightVesselName,

            shipmentType: !!form.shipmentType && !!form.shipmentType.length ? form.shipmentType[0].id : null,
            typeOfService: !!form.typeOfService && !!form.typeOfService.length ? form.typeOfService[0].id : null,
            mbltype: !!form.mbltype && !!form.mbltype.length ? form.mbltype[0].id : null,

            agentId: form.agentId,
            pol: form.pol,
            pod: form.pod,
            deliveryPlace: form.deliveryPlace,
            coloaderId: form.coloader,

            // * containers summary
            commodity: this.shipmentGoodSummaryComponent.commodities,
            grossWeight: this.shipmentGoodSummaryComponent.gw,
            cbm: this.shipmentGoodSummaryComponent.cbm,
            packageQty: this.shipmentGoodSummaryComponent.packageQuantity,
            packageType: this.shipmentGoodSummaryComponent.packageTypes.map(type => type.id).toString(),
        };


        const fclExportAddModel: CsTransaction = new CsTransaction(formData);
        fclExportAddModel.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaLCLImport;

        return fclExportAddModel;
    }

    checkValidateForm() {
        let valid: boolean = true;
        this.setError(this.formCreateComponent.mbltype);
        if (
            !this.formCreateComponent.formCreate.valid
            || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)
        ) {
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

    onCreateJob() {
        [this.formCreateComponent.isSubmitted, this.shipmentGoodSummaryComponent.isSubmitted] = [true, true];

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
                        this._router.navigate([`home/documentation/sea-lcl-import/${res.data.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
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

                        this._router.navigate([`home/documentation/sea-lcl-import/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }
}
