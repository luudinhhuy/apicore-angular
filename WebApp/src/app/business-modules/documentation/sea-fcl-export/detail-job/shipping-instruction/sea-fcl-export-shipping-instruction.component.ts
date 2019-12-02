import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { catchError, finalize, takeUntil, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromShareBussiness from './../../../../share-business/store';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { SeaFclExportBillInstructionComponent } from './bill-instruction/sea-fcl-export-bill-instruction.component';
import { CsShippingInstruction } from 'src/app/shared/models/document/shippingInstruction.model';
import { ToastrService } from 'ngx-toastr';
import * as fromShare from './../../../../share-business/store';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { CsTransaction } from 'src/app/shared/models';
import { SeaFclExportBillDetailComponent } from './bill-detail/sea-fcl-export-bill-detail.component';
import { ReportPreviewComponent } from 'src/app/shared/common';

@Component({
    selector: 'app-sea-fcl-export-shipping-instruction',
    templateUrl: './sea-fcl-export-shipping-instruction.component.html'
})
export class SeaFclExportShippingInstructionComponent extends AppList {
    @ViewChild(SeaFclExportBillInstructionComponent, { static: false }) billInstructionComponent: SeaFclExportBillInstructionComponent;
    @ViewChild(SeaFclExportBillDetailComponent, { static: false }) billDetail: SeaFclExportBillDetailComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;
    jobId: string;
    termTypes: CommonInterface.INg2Select[];
    houseBills: any[] = [];
    dataReport: any = null;

    constructor(private _store: Store<fromShareBussiness.TransactionActions>,
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _activedRouter: ActivatedRoute,
        private _dataService: DataService) {
        super();
    }

    ngOnInit() {
        this.getTerms();
        this._activedRouter.params.subscribe((param: any) => {
            if (!!param && param.jobId) {
                this.jobId = param.jobId;
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));
                this.getHouseBills();
            }
        });
    }
    getHouseBills() {
        this.isLoading = true;
        this._documentRepo.getListHouseBillOfJob({ jobId: this.jobId }).pipe(
            catchError(this.catchError),
            finalize(() => { this.isLoading = false; }),
        ).subscribe(
            (res: any) => {
                this.houseBills = res;
                this.billDetail.housebills = res;

                this.getBillingInstruction(this.jobId);
                console.log(this.houseBills);
            },
        );
    }
    async getTerms() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA)) {
            const commonData = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA);
            this.termTypes = this.utility.prepareNg2SelectData(commonData.freightTerms, 'value', 'displayName');

        } else {
            const commonData: { [key: string]: CommonInterface.IValueDisplay[] } = await this._documentRepo.getShipmentDataCommon().toPromise();
            this._dataService.setDataService(SystemConstants.CSTORAGE.SHIPMENT_COMMON_DATA, commonData);
            this.termTypes = this.utility.prepareNg2SelectData(commonData.freightTerms, 'value', 'displayName');
        }
    }
    getBillingInstruction(jobId: string) {
        this._documentRepo.getShippingInstruction(jobId)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.setDataBillInstructionComponent(res);
                },
            );
    }
    setDataBillInstructionComponent(data: any) {
        this.billInstructionComponent.shippingInstruction = data;

        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), take(1))
            .subscribe(
                (res) => {
                    if (!!res) {
                        console.log(res);
                        if (this.billInstructionComponent.shippingInstruction != null) {
                            this.billInstructionComponent.shippingInstruction.refNo = res.jobNo;
                        } else {
                            this.initNewShippingInstruction(res);
                            this.getContainerData();
                        }
                        this.billInstructionComponent.shippingInstruction.csTransactionDetails = this.houseBills;
                        this.billInstructionComponent.termTypes = this.termTypes;
                        this.billInstructionComponent.setformValue(this.billInstructionComponent.shippingInstruction);
                        console.log(this.billInstructionComponent.shippingInstruction);
                    }
                }
            );
    }
    getContainerData() {
        if (this.houseBills != null) {
            let desOfGoods = '';
            let containerNotes = '';
            this.houseBills.forEach(x => {
                this.billInstructionComponent.shippingInstruction.grossWeight = this.billInstructionComponent.shippingInstruction.grossWeight + x.gw;
                this.billInstructionComponent.shippingInstruction.volume = this.billInstructionComponent.shippingInstruction.volume + x.cbm;
                desOfGoods = (x.desOfGoods !== null) ? (x.desOfGoods + " ") : null;
                this.billInstructionComponent.shippingInstruction.goodsDescription = this.billInstructionComponent.shippingInstruction.goodsDescription + desOfGoods;
                containerNotes = (x.packageContainer !== null) ? (x.packageContainer + "") : null;
                this.billInstructionComponent.shippingInstruction.containerNote = this.billInstructionComponent.shippingInstruction.containerNote + containerNotes;
                this.billInstructionComponent.shippingInstruction.packagesNote = this.billInstructionComponent.shippingInstruction.containerNote + containerNotes;
            });
            this.billInstructionComponent.shippingInstruction.containerSealNo = "";
        }
    }
    initNewShippingInstruction(res: CsTransaction) {
        this.billInstructionComponent.shippingInstruction = new CsShippingInstruction();
        this.billInstructionComponent.shippingInstruction.refNo = res.jobNo;
        this.billInstructionComponent.shippingInstruction.bookingNo = res.bookingNo;
        this.billInstructionComponent.shippingInstruction.paymenType = "Prepaid";
        this.billInstructionComponent.shippingInstruction.invoiceDate = new Date();
        this.billInstructionComponent.shippingInstruction.issuedUser = localStorage.getItem("currently_userName");
        this.billInstructionComponent.shippingInstruction.supplier = res.coloaderId;
        this.billInstructionComponent.shippingInstruction.consigneeId = res.agentId;
        this.billInstructionComponent.shippingInstruction.pol = res.pol;
        this.billInstructionComponent.shippingInstruction.pod = res.pod;
        this.billInstructionComponent.shippingInstruction.loadingDate = res.etd;
    }
    save() {
        this.billInstructionComponent.isSubmitted = true;
        if (!this.checkValidateForm()) {
            return;
        }

        const data = this.billInstructionComponent.onSubmitForm();
        data.jobId = this.jobId;
        this.saveData(data);
    }
    saveData(data: CsShippingInstruction) {
        this._documentRepo.updateShippingInstruction(data).pipe(
            catchError(this.catchError)
        )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getBillingInstruction(this.jobId);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
    checkValidateForm() {
        let valid: boolean = true;
        if (!this.billInstructionComponent.formSI.valid
            || (!!this.billInstructionComponent.loadingDate.value && !this.billInstructionComponent.loadingDate.value.startDate)
            || (!!this.billInstructionComponent.issueDate.value && !this.billInstructionComponent.issueDate.value.startDate)
        ) {
            valid = false;
        }
        return valid;
    }
    refresh() {
        this.getHouseBills();
    }
    previewSIReport() {
        this._documentRepo.previewSIReport(this.billInstructionComponent.shippingInstruction)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    if (this.dataReport != null && res.dataSource.length > 0) {
                        setTimeout(() => {
                            this.previewPopup.frm.nativeElement.submit();
                            this.previewPopup.show();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }
}

