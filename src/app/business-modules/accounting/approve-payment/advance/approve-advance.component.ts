import { Component, ViewChild, TemplateRef } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { AdvancePaymentListRequestComponent } from '../../advance-payment/components/list-advance-payment-request/list-advance-payment-request.component';
import { AccountingRepo, ExportRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { AdvancePayment, Currency } from 'src/app/shared/models';
import { AdvancePaymentFormCreateComponent } from '../../advance-payment/components/form-create-advance-payment/form-create-advance-payment.component';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';

@Component({
    selector: 'app-approve-advance',
    templateUrl: './approve-advance.component.html',
})

export class ApproveAdvancePaymentComponent extends AppPage {

    @ViewChild(AdvancePaymentFormCreateComponent, { static: true }) formCreateComponent: AdvancePaymentFormCreateComponent;
    @ViewChild(AdvancePaymentListRequestComponent, { static: true }) listRequestAdvancePaymentComponent: AdvancePaymentListRequestComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;
    @ViewChild('confirmDenyPopup', { static: false }) confirmDenyPopup: ConfirmPopupComponent;
    @ViewChild('confirmApprovePopup', { static: false }) confirmApprovePopup: ConfirmPopupComponent;

    idAdvPayment: string = '';
    advancePayment: AdvancePayment;
    approveInfo: any = null;
    dataReport: any = null;

    modalRef: BsModalRef;
    comment: string = '';

    constructor(
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _ngProgressService: NgProgress,
        private _activedRouter: ActivatedRoute,
        private _modalService: BsModalService,
        private _router: Router,
        private _exportRepo: ExportRepo,
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        this._activedRouter.params.subscribe((param: any) => {
            if (!!param && param.id) {
                this.idAdvPayment = param.id;
                this.getDetail(this.idAdvPayment);
            }
        });
    }

    getDetail(idAdvance: string) {
        this._progressRef.start();
        this._accoutingRepo.getDetailAdvancePayment(idAdvance)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.advancePayment = new AdvancePayment(res);

                        this.formCreateComponent.formCreate.disable();
                        this.formCreateComponent.isDisabled = true;

                        // * wait to currecy list api
                        this.formCreateComponent.formCreate.setValue({
                            advanceNo: this.advancePayment.advanceNo,
                            requester: this.advancePayment.requester,
                            requestDate: { startDate: new Date(this.advancePayment.requestDate), endDate: new Date(this.advancePayment.requestDate) },
                            paymentMethod: this.formCreateComponent.methods.filter(method => method.value === this.advancePayment.paymentMethod)[0],
                            department: this.advancePayment.department,
                            deadLine: { startDate: new Date(this.advancePayment.deadlinePayment), endDate: new Date(this.advancePayment.deadlinePayment) },
                            note: this.advancePayment.advanceNote,
                            currency: this.advancePayment.advanceCurrency
                        });

                        this.listRequestAdvancePaymentComponent.listRequestAdvancePayment = this.advancePayment.advanceRequests;
                        this.listRequestAdvancePaymentComponent.totalAmount = this.listRequestAdvancePaymentComponent.updateTotalAmount(this.advancePayment.advanceRequests);

                        this.listRequestAdvancePaymentComponent.advanceNo = this.advancePayment.advanceNo;

                        this.getInfoApprove(this.advancePayment.advanceNo);
                    } else {
                        this._toastService.warning('Advance Payment not found');
                        this.back();
                        return;
                    }
                },
            );
    }

    getInfoApprove(advanceNo: string) {
        this._accoutingRepo.getInfoApprove(advanceNo)
            .pipe(
                catchError(this.catchError)
            )
            .subscribe(
                (res: any) => {
                    this.approveInfo = res;
                },
            );
    }

    apporve() {
        this._progressRef.start();
        this._accoutingRepo.approveAdvPayment(this.idAdvPayment)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    console.log(res);
                    if (res.status) {
                        this._toastService.success(res.message, 'Approve Is Successfull');
                        this.getInfoApprove(this.advancePayment.advanceNo);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    openModalDeny(template: TemplateRef<any>) {
        this.confirmDenyPopup.hide();
        this.modalRef = this._modalService.show(template, { backdrop: 'static' });
    }

    showDenyPopup() {
        this.confirmDenyPopup.show();
    }

    onSaveComment() {
        this._progressRef.start();
        this._accoutingRepo.deniedApprove(this.idAdvPayment, this.comment)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.modalRef.hide(); this._progressRef.complete(); })
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, ' Deny Is Successfull');
                        this.getInfoApprove(this.advancePayment.advanceNo);
                    } else {
                        this._toastService.error(res.message, '');
                    }
                },
            );
    }

    previewAdvPayment() {
        this._progressRef.start();
        this._accoutingRepo.previewAdvancePayment(this.idAdvPayment)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    this.dataReport = res;
                    setTimeout(() => {
                        this.previewPopup.show();
                    }, 1000);

                },
            );
    }

    back() {
        this._router.navigate(['home/accounting/advance-payment']);
    }

    showModalApprove() {
        this.confirmApprovePopup.show();
    }

    onApprove() {
        this.confirmApprovePopup.hide();
        this.apporve();
    }

    onChangeCurrency(currency: string) {
        this.listRequestAdvancePaymentComponent.changeCurrency(currency);
        for (const item of this.listRequestAdvancePaymentComponent.listRequestAdvancePayment) {
            item.requestCurrency = currency;
        }
        this.listRequestAdvancePaymentComponent.currency = currency;
    }

    exportAdvPayment(lang: string) {
        this._progressRef.start();
        this._exportRepo.exportAdvancePaymentDetail(this.idAdvPayment, lang)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: ArrayBuffer) => {
                    this.downLoadFile(response, "application/ms-excel", 'Advance Form - eFMS.xlsx');
                },
            );
    }
}
