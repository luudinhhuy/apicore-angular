import { Component, ViewChild, TemplateRef } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { Currency } from 'src/app/shared/models';
import { SettlementListChargeComponent } from '../../settlement-payment/components/list-charge-settlement/list-charge-settlement.component';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { ISettlementPaymentData } from '../../settlement-payment/detail/detail-settlement-payment.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingRepo, ExportRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { finalize, catchError } from 'rxjs/operators';
import { SettlementFormCreateComponent } from '../../settlement-payment/components/form-create-settlement/form-create-settlement.component';
import { switchMap, tap } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

@Component({
    selector: 'app-approve-settlement',
    templateUrl: './approve.settlement.component.html',
})

export class ApporveSettlementPaymentComponent extends AppPage {

    @ViewChild(SettlementListChargeComponent, { static: true }) requestSurchargeListComponent: SettlementListChargeComponent;
    @ViewChild(SettlementFormCreateComponent, { static: true }) formCreateSurcharge: SettlementFormCreateComponent;

    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;
    @ViewChild('confirmDenyPopup', { static: false }) confirmDenyPopup: ConfirmPopupComponent;
    @ViewChild('confirmApprovePopup', { static: false }) confirmApprovePopup: ConfirmPopupComponent;

    settlementId: string = '';
    settlementCode: string = '';
    settlementPayment: ISettlementPaymentData;

    dataReport: any = null;
    approveInfo: any = null;

    modalRef: BsModalRef;
    comment: string = '';

    constructor(
        private _activedRouter: ActivatedRoute,
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _modalService: BsModalService,
        private _exportRepo: ExportRepo,
    ) {
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: any) => {
            if (!!param.id) {
                this.settlementId = param.id;
                this.getDetailSettlement(this.settlementId);
            }
        });
    }

    onChangeCurrency(currency: string) {
        this.requestSurchargeListComponent.changeCurrency(currency);
    }

    getDetailSettlement(settlementId: string) {
        this._progressRef.start();
        this._accoutingRepo.getDetailSettlementPayment(settlementId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
                tap((res: any) => {
                    if (!res.settlement) {
                        this._router.navigate(['home/accounting/settlement-payment']);
                        this._toastService.warning("Settlement not found");
                        return;
                    }
                    this.settlementPayment = res;

                    this.formCreateSurcharge.form.disable();
                    this.formCreateSurcharge.isDisabled = true;

                    // * wait to currecy list api
                    this.formCreateSurcharge.form.setValue({
                        settlementNo: this.settlementPayment.settlement.settlementNo,
                        requester: this.settlementPayment.settlement.requester,
                        requestDate: new Date(this.settlementPayment.settlement.requestDate),
                        paymentMethod: this.formCreateSurcharge.methods.filter(method => method.value === this.settlementPayment.settlement.paymentMethod)[0],
                        note: this.settlementPayment.settlement.note,
                        amount: this.settlementPayment.chargeGrpSettlement.reduce((acc, curr) => acc + curr.totalAmount, 0),
                        currency: this.settlementPayment.settlement.settlementCurrency
                    });

                    this.requestSurchargeListComponent.surcharges = this.settlementPayment.chargeNoGrpSettlement;
                    this.requestSurchargeListComponent.groupShipments = this.settlementPayment.chargeGrpSettlement;

                    this.requestSurchargeListComponent.settlementCode = this.settlementPayment.settlement.settlementNo;

                    // *SWITCH UI TO GROUP LIST SHIPMENT
                    this.requestSurchargeListComponent.TYPE = 'GROUP'; // ? <> LIST
                    this.requestSurchargeListComponent.STATE = 'READ'; // ? <> WRITE


                    if (this.requestSurchargeListComponent.groupShipments.length) {
                        this.requestSurchargeListComponent.openAllCharge.next(true);
                    }
                }),
                switchMap(data => this._accoutingRepo.getInfoApproveSettlement(data.settlement.settlementNo)),
            )
            .subscribe(
                (res: any) => {
                    this.approveInfo = res;
                },
            );
    }

    getInfoApproveSettlement(settlementNo: string) {
        this._accoutingRepo.getInfoApproveSettlement(settlementNo)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.approveInfo = res;
                },
            );
    }

    showModalApprove() {
        this.confirmApprovePopup.show();
    }

    showDenyPopup() {
        this.confirmDenyPopup.show();
    }

    openModalDeny(template: TemplateRef<any>) {
        this.confirmDenyPopup.hide();
        this.modalRef = this._modalService.show(template, { backdrop: 'static' });
    }

    onConfirmApprove() {
        this.confirmApprovePopup.hide();
        this._progressRef.start();
        this._accoutingRepo.approveSettlementPayment(this.settlementPayment.settlement.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete()),
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message, ' Approve Is Successfull');
                        this.getInfoApproveSettlement(this.settlementPayment.settlement.settlementNo)
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    onConfirmDenied() {
        this.confirmApprovePopup.hide();
        this._progressRef.start();
        this._accoutingRepo.deniedApproveSettlement(this.settlementPayment.settlement.id, this.comment)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); this.modalRef.hide(); }),
            )
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success(res.message, ' Deny Is Successfull');
                        this.getInfoApproveSettlement(this.settlementPayment.settlement.settlementNo);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    previewSettlementPayment() {
        if (!this.requestSurchargeListComponent.surcharges.length) {
            this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
            return;
        }

        this._progressRef.start();
        this._accoutingRepo.previewSettlementPayment(this.settlementPayment.settlement.settlementNo)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.previewPopup.frm.nativeElement.submit();
                        this.previewPopup.show();
                    }, 1000);

                },
            );
    }

    exportSettlementPayment(language: string) {
        if (!this.requestSurchargeListComponent.surcharges.length) {
            this._toastService.warning(`Settlement payment don't have any surcharge in this period, Please check it again! `, '');
            return;
        }

        this._progressRef.start();
        this._exportRepo.exportSettlementPaymentDetail(this.settlementPayment.settlement.id, language)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    this.downLoadFile(response, "application/ms-excel", 'Settlement Form - eFMS.xlsx');
                },
            );
    }
}

