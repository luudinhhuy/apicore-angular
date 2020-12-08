import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActionsSubject } from '@ngrx/store';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

import { AppForm } from 'src/app/app.form';
import { FCLImportAddModel, CsTransaction } from 'src/app/shared/models';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { ShareBussinessShipmentGoodSummaryComponent } from 'src/app/business-modules/share-business/components/shipment-good-summary/shipment-good-summary.component';

import { InfoPopupComponent } from 'src/app/shared/common/popup';
import { Container } from 'src/app/shared/models/document/container.model';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { ShareBusinessImportJobDetailPopupComponent } from 'src/app/business-modules/share-business/components/import-job-detail/import-job-detail.popup';
import { ShareBussinessFormCreateSeaImportComponent } from 'src/app/business-modules/share-business';

import { catchError, takeUntil } from 'rxjs/operators';

import * as fromShareBussiness from './../../../share-business/store';


@Component({
    selector: 'app-create-job-fcl-import',
    templateUrl: './create-job-fcl-import.component.html',
})
export class SeaFCLImportCreateJobComponent extends AppForm {

    @ViewChild(ShareBussinessFormCreateSeaImportComponent, { static: false }) formCreateComponent: ShareBussinessFormCreateSeaImportComponent;
    @ViewChild(ShareBussinessShipmentGoodSummaryComponent, { static: false }) shipmentGoodSummaryComponent: ShareBussinessShipmentGoodSummaryComponent;
    @ViewChild(InfoPopupComponent, { static: false }) infoPopup: InfoPopupComponent;
    @ViewChild(ShareBusinessImportJobDetailPopupComponent, { static: false }) formImportJobDetailPopup: ShareBusinessImportJobDetailPopupComponent;

    containers: Container[] = [];
    selectedJob: any = {}; // TODO model.
    isImport: boolean = false;

    constructor(
        protected _router: Router,
        protected _documenRepo: DocumentationRepo,
        protected _actionStoreSubject: ActionsSubject,
        protected _toastService: ToastrService,
        protected _cd: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this._actionStoreSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromShareBussiness.ContainerAction) => {
                    if (action.type === fromShareBussiness.ContainerActionTypes.SAVE_CONTAINER) {
                        this.containers = action.payload;
                    }
                });
    }

    ngAfterViewInit() {
        // * Init container
        this.shipmentGoodSummaryComponent.initContainer();
        this.shipmentGoodSummaryComponent.containerPopup.isAdd = true;
        this._cd.detectChanges();

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
            desOfGoods: this.shipmentGoodSummaryComponent.description,
            packageContainer: this.shipmentGoodSummaryComponent.containerDetail,
            netWeight: this.shipmentGoodSummaryComponent.netWeight,
            grossWeight: this.shipmentGoodSummaryComponent.grossWeight,
            chargeWeight: this.shipmentGoodSummaryComponent.totalChargeWeight,
            cbm: this.shipmentGoodSummaryComponent.totalCBM,

        };


        const fclImportAddModel = new CsTransaction(formData);
        fclImportAddModel.transactionTypeEnum = CommonEnum.TransactionTypeEnum.SeaFCLImport;

        return fclImportAddModel;

    }

    onImport(selectedData: any) {
        this.selectedJob = selectedData;
        this.isImport = true;
        this.shipmentGoodSummaryComponent.commodities = this.selectedJob.commodity;
        this.shipmentGoodSummaryComponent.containerDetail = this.selectedJob.packageContainer;
        this.shipmentGoodSummaryComponent.description = this.selectedJob.desOfGoods;
        this.shipmentGoodSummaryComponent.grossWeight = this.selectedJob.grossWeight;
        this.shipmentGoodSummaryComponent.netWeight = this.selectedJob.netWeight;
        this.shipmentGoodSummaryComponent.totalChargeWeight = this.selectedJob.chargeWeight;
        this.shipmentGoodSummaryComponent.totalCBM = this.selectedJob.cbm;
        this.formCreateComponent.formCreate.controls['personIncharge'].setValue(this.formCreateComponent.userLogged.id);

    }

    checkValidateForm() {
        this.setError(this.formCreateComponent.mbltype);
        let valid: boolean = true;
        if (!this.formCreateComponent.formCreate.valid || (!!this.formCreateComponent.eta.value && !this.formCreateComponent.eta.value.startDate)) {
            valid = false;
        }
        return valid;
    }

    onCreateJob() {
        this.formCreateComponent.isSubmitted = true;
        if (Object.keys(this.selectedJob).length > 0) {
            this.containers = this.selectedJob.containers;
        }
        if (!this.checkValidateForm()) {
            this.infoPopup.show();
            return;
        }

        // if (!this.containers.length) {
        //     this._toastService.warning('Please add container to create new job');
        //     return;
        // }

        const modelAdd = this.onSubmitData();
        modelAdd.csMawbcontainers = this.containers; // * Update containers model
        if (this.isImport === true) {
            modelAdd.id = this.selectedJob.id;
            this.importJob(modelAdd);
            this.isImport = false;
        } else {
            this.createJob(modelAdd);
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
                        this._router.navigate([`home/documentation/sea-fcl-import/${res.data.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }
                }
            );
    }

    createJob(body: any) {
        this._documenRepo.createTransaction(body)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");

                        // TODO goto detail.
                        this._router.navigate([`home/documentation/sea-fcl-import/${res.model.id}`]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    showImportPopup() {

        this.formImportJobDetailPopup.transactionType = CommonEnum.TransactionTypeEnum.SeaFCLImport;
        this.formImportJobDetailPopup.getShippments();
        this.formImportJobDetailPopup.show();
    }

    gotoList() {
        this._router.navigate(["home/documentation/sea-fcl-import"]);
    }
}


