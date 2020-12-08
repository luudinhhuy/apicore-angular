import { Component, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { AdvancePaymentListRequestComponent } from '../components/list-advance-payment-request/list-advance-payment-request.component';
import { Currency } from 'src/app/shared/models';
import { AdvancePaymentFormCreateComponent } from '../components/form-create-advance-payment/form-create-advance-payment.component';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AccountingRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'app-advance-payment-new',
    templateUrl: './add-new-advance-payment.component.html',
})

export class AdvancePaymentAddNewComponent extends AppPage {

    @ViewChild(AdvancePaymentListRequestComponent, { static: true }) listRequestAdvancePaymentComponent: AdvancePaymentListRequestComponent;
    @ViewChild(AdvancePaymentFormCreateComponent, { static: true }) formCreateComponent: AdvancePaymentFormCreateComponent;

    constructor(
        private _toastService: ToastrService,
        private _accoutingRepo: AccountingRepo,
        private _router: Router,
        private _progressService: NgProgress

    ) {
        super();
        this._progressRef = this._progressService.ref();

    }

    ngOnInit() { }

    onChangeCurrency(currency: string) {
        this.listRequestAdvancePaymentComponent.changeCurrency(currency);
        for (const item of this.listRequestAdvancePaymentComponent.listRequestAdvancePayment) {
            item.requestCurrency = currency;
        }
        this.listRequestAdvancePaymentComponent.currency = currency;
    }

    saveAdvancePayment() {
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
                requestDate: formatDate(this.formCreateComponent.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                deadlinePayment: formatDate(this.formCreateComponent.deadLine.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                advanceNote: this.formCreateComponent.note.value || '',
            };
            this._progressRef.start();
            this._accoutingRepo.addNewAdvancePayment(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(`${res.data.advanceNo + ' is added successfully'}`, 'Save Success !', { positionClass: 'toast-bottom-right' });

                            //  * go to detail page
                            this._router.navigate([`home/accounting/advance-payment/${res.data.id}`]);
                        } else {
                            this.handleError(null, (data: any) => {
                                this._toastService.error(data.message, data.title);
                            });
                        }
                    },
                );
        }
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
            requestDate: formatDate(this.formCreateComponent.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
            deadlinePayment: formatDate(this.formCreateComponent.deadLine.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
            advanceNote: this.formCreateComponent.note.value || '',
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
                        this._toastService.success(`${res.data.advanceNo + 'Save and Send Request successfully'}`, 'Save Success !', { positionClass: 'toast-bottom-right' });
                        this._router.navigate([`home/accounting/advance-payment/${res.data.id}/approve`]);
                    } else {
                        this.handleError(null, (data: any) => {
                            this._toastService.error(data.message, data.title);
                        });
                    }
                },
            );

    }

    back() {
        this._router.navigate(['home/accounting/advance-payment']);
    }

}


