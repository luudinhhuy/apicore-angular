import { Component, ViewChild } from '@angular/core';
import { AppPage } from 'src/app/app.base';
import { Currency, Surcharge } from 'src/app/shared/models';
import { SettlementListChargeComponent } from '../components/list-charge-settlement/list-charge-settlement.component';
import { SettlementFormCreateComponent } from '../components/form-create-settlement/form-create-settlement.component';
import { formatDate } from '@angular/common';
import { AccoutingRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
    selector: 'app-settle-payment-new',
    templateUrl: './add-settle-payment.component.html'
})

export class SettlementPaymentAddNewComponent extends AppPage {

    @ViewChild(SettlementListChargeComponent, { static: true }) requestSurchargeListComponent: SettlementListChargeComponent;
    @ViewChild(SettlementFormCreateComponent, { static: false }) formCreateSurcharge: SettlementFormCreateComponent;

    constructor(
        private _accountingRepo: AccoutingRepo,
        private _toastService: ToastrService,
        private _router: Router,
        private _progressService: NgProgress
    ) {
        super();

        this._progressRef = this._progressService.ref();
    }

    ngOnInit() { }

    onChangeCurrency(currency: Currency) {
        this.requestSurchargeListComponent.changeCurrency(currency);
    }

    saveSettlement() {
        const body: IDataSettlement = {
            settlement: {
                id: "00000000-0000-0000-0000-000000000000",
                settlementNo: this.formCreateSurcharge.settlementNo.value,
                requester: this.formCreateSurcharge.requester.value,
                requestDate: formatDate(this.formCreateSurcharge.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                paymentMethod: this.formCreateSurcharge.paymentMethod.value.value,
                settlementCurrency: this.formCreateSurcharge.currency.value.id,
                note: this.formCreateSurcharge.note.value,
            },
            shipmentCharge: this.requestSurchargeListComponent.surcharges || []
        };

        this._accountingRepo.addNewSettlement(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    console.log(res);
                    if (res.status) {
                        this._toastService.success(res.message);

                        this._router.navigate([`home/accounting/settlement-payment/${res.data.settlement.id}`]);
                    }
                }
            );
    }

    saveAndSendRequest() {
        this._progressRef.start();
        const body: IDataSettlement = {
            settlement: {
                id: "00000000-0000-0000-0000-000000000000",
                settlementNo: this.formCreateSurcharge.settlementNo.value,
                requester: this.formCreateSurcharge.requester.value,
                requestDate: formatDate(this.formCreateSurcharge.requestDate.value.startDate || new Date(), 'yyyy-MM-dd', 'en'),
                paymentMethod: this.formCreateSurcharge.paymentMethod.value.value,
                settlementCurrency: this.formCreateSurcharge.currency.value.id,
                note: this.formCreateSurcharge.note.value,
            },
            shipmentCharge: this.requestSurchargeListComponent.surcharges || []
        };

        this._accountingRepo.saveAndSendRequestSettlemntPayment(body)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(`${res.data.settlement.settlementNo}`, ' Send request successfully');

                        this._router.navigate([`home/accounting/settlement-payment/${res.data.settlement.id}/approve`]);

                    }
                }
            );
    }

}
interface IDataSettlement {
    settlement: any;
    shipmentCharge: Surcharge[];
}

