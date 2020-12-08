import { Component, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountingRepo, ExportRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { AdvancePayment, Currency } from 'src/app/shared/models';
import { AdvancePaymentFormCreateComponent } from '../components/form-create-advance-payment/form-create-advance-payment.component';
import { formatDate } from '@angular/common';
import { AdvancePaymentListRequestComponent } from '../components/list-advance-payment-request/list-advance-payment-request.component';
import { ToastrService } from 'ngx-toastr';
import { ReportPreviewComponent } from 'src/app/shared/common';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'app-advance-payment-detail',
    templateUrl: './detail-advance-payment.component.html',
})
export class AdvancePaymentDetailComponent extends AppPage {

    @ViewChild(AdvancePaymentFormCreateComponent, { static: true }) formCreateComponent: AdvancePaymentFormCreateComponent;
    @ViewChild(AdvancePaymentListRequestComponent, { static: true }) listRequestAdvancePaymentComponent: AdvancePaymentListRequestComponent;
    @ViewChild(ReportPreviewComponent, { static: false }) previewPopup: ReportPreviewComponent;

    progress: any[] = [];
    advancePayment: AdvancePayment = null;

    advId: string = '';
    actionList: string = 'update';

    dataReport: any = null;
    constructor(
        private _activedRouter: ActivatedRoute,
        private _accoutingRepo: AccountingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress,
        private _exportRepo: ExportRepo,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {

        this._activedRouter.params.subscribe((param: any) => {
            if (!!param.id) {
                this.advId = param.id;
                this.getDetail(this.advId);
            }
        });
    }

    onChangeCurrency(currency: string) {
        this.listRequestAdvancePaymentComponent.changeCurrency(currency);
        for (const item of this.listRequestAdvancePaymentComponent.listRequestAdvancePayment) {
            item.requestCurrency = currency;
        }
        this.listRequestAdvancePaymentComponent.currency = currency;

    }

    getDetail(advanceId: string) {
        this._progressRef.start();
        this._accoutingRepo.getDetailAdvancePayment(advanceId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (!res) {
                        this._toastService.warning('Advance Payment not found');
                        this.back();
                        return;
                    }
                    this.advancePayment = new AdvancePayment(res);
                    switch (this.advancePayment.statusApproval) {
                        case 'New':
                        case 'Denied':
                            break;
                        default:
                            this.formCreateComponent.formCreate.disable();
                            this.formCreateComponent.isDisabled = true;

                            this.actionList = 'read';
                            break;
                    }
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
                },
                (error: any) => {
                    console.log(error);
                },
                () => { }
            );

    }

    updateAdvPayment() {
        if (this.listRequestAdvancePaymentComponent.totalAmount > 100000000 && this.formCreateComponent.paymentMethod.value.value === 'Cash') {
            this._toastService.warning(`Total Advance Amount by cash is not exceed 100.000.000 VND `, '', { positionClass: 'toast-bottom-right' });
            return;
        }
        if (!this.listRequestAdvancePaymentComponent.listRequestAdvancePayment.length) {
            this._toastService.warning(`Advance Payment don't have any request in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
            return;
        } else {
            const body = {
                advanceRequests: this.listRequestAdvancePaymentComponent.listRequestAdvancePayment,
                requester: this.formCreateComponent.requester.value || 'Admin',
                department: this.formCreateComponent.department.value || '',
                paymentMethod: this.formCreateComponent.paymentMethod.value.value,
                advanceCurrency: this.formCreateComponent.currency.value || 'VND',
                requestDate: !!this.formCreateComponent.requestDate.value.startDate ? formatDate(this.formCreateComponent.requestDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
                deadlinePayment: !!this.formCreateComponent.deadLine.value.startDate ? formatDate(this.formCreateComponent.deadLine.value.startDate, 'yyyy-MM-dd', 'en') : null,
                advanceNote: this.formCreateComponent.note.value || '',
                statusApproval: this.advancePayment.statusApproval,
                advanceNo: this.advancePayment.advanceNo,
                id: this.advancePayment.id,
                UserCreated: this.advancePayment.userCreated,
                DatetimeCreated: this.advancePayment.datetimeCreated
            };
            this._progressRef.start();
            this._accoutingRepo.updateAdvPayment(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`${res.data.advanceNo + ' is update successfully'}`, 'Update Success !');
                            this.getDetail(this.advId);

                        } else {
                            this.handleError((data: any) => {
                                this._toastService.error(data.message, data.title);
                            });
                        }
                    },
                );
        }
    }

    back() {
        this._router.navigate(['home/accounting/advance-payment']);
    }

    previewAdvPayment() {
        this._progressRef.start();
        this._accoutingRepo.previewAdvancePayment(this.advId)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
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

    sendRequest() {
        if (this.listRequestAdvancePaymentComponent.totalAmount > 100000000 && this.formCreateComponent.paymentMethod.value.value === 'Cash') {
            this._toastService.warning(`Total Advance Amount by cash is not exceed 100.000.000 VND `, '', { positionClass: 'toast-bottom-right' });
            return;
        }
        if (!this.listRequestAdvancePaymentComponent.listRequestAdvancePayment.length) {
            this._toastService.warning(`Advance Payment don't have any request in this period, Please check it again! `, '', { positionClass: 'toast-bottom-right' });
            return;
        }
        const body = {
            advanceRequests: this.listRequestAdvancePaymentComponent.listRequestAdvancePayment,
            requester: this.formCreateComponent.requester.value || 'Admin',
            department: this.formCreateComponent.department.value || '',
            paymentMethod: this.formCreateComponent.paymentMethod.value.value,
            advanceCurrency: this.formCreateComponent.currency.value || 'VND',
            requestDate: !!this.formCreateComponent.requestDate.value.startDate ? formatDate(this.formCreateComponent.requestDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            deadlinePayment: !!this.formCreateComponent.deadLine.value.startDate ? formatDate(this.formCreateComponent.deadLine.value.startDate, 'yyyy-MM-dd', 'en') : null,
            advanceNote: this.formCreateComponent.note.value || '',
            statusApproval: this.advancePayment.statusApproval,
            advanceNo: this.advancePayment.advanceNo,
            id: this.advancePayment.id,
            UserCreated: this.advancePayment.userCreated,
            DatetimeCreated: this.advancePayment.datetimeCreated
        };
        this._progressRef.start();
        this._accoutingRepo.sendRequestAdvPayment(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(`${res.data.advanceNo + ' Send request successfully'}`, 'Update Success !');
                        this._router.navigate([`home/accounting/advance-payment/${res.data.id}/approve`]);

                    } else {
                        this.handleError((data: any) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                },
            );
    }

    exportAdvPayment(lang: string) {
        this._progressRef.start();
        this._exportRepo.exportAdvancePaymentDetail(this.advId, lang)
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
