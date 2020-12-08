import { Component } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { AccountingRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'payment-management-popup',
    templateUrl: './payment-management.popup.html'
})

export class SettlementPaymentManagementPopupComponent extends PopupBase {
    data: IPaymentManagement = null;
    constructor(
        private _accountingRepo: AccountingRepo,
        private _progressService: NgProgress,
    ) {
        super();

        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.data = {
            jobId: '',
            hbl: '',
            mbl: '',
            balance: '',
            totalSettlement: '',
            totalAdvance: '',
            advancePayment: [],
            settlementPayment: []
        };
    }

    getDataPaymentManagement(jobId: string, hbl: string, mbl: string) {
        this.isLoading = true;
        this._progressRef.start();
        this._accountingRepo.getPaymentManagement(jobId, mbl, hbl)
            .pipe(catchError(this.catchError), finalize(() => { this._progressRef.complete(); this.isLoading = false; }))
            .subscribe(
                (response: IPaymentManagement) => {
                    this.data = response;
                }
            );
    }
}


interface IPaymentManagement {
    jobId: string;
    hbl: string;
    mbl: string;
    balance: string;
    totalAdvance: string;
    totalSettlement: string;
    settlementPayment: any[];
    advancePayment: any[];
}
