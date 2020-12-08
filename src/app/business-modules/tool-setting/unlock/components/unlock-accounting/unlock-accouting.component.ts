import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { AccountingRepo } from '@repositories';
import { catchError } from 'rxjs/operators';
import { IShipmentLockInfo } from '../unlock-shipment/unlock-shipment.component';
import { UnlockHistoryPopupComponent } from '../unlock-history/unlock-history.popup';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'unlock-accounting',
    templateUrl: './unlock-accouting.component.html'
})

export class UnlockAccountingComponent extends AppForm implements OnInit {
    @ViewChild(UnlockHistoryPopupComponent, { static: false }) confirmPopup: UnlockHistoryPopupComponent;

    types: CommonInterface.ICommonTitleValue[] = [
        { value: 1, title: 'Advance Payment' },
        { value: 2, title: 'Settlement Payment' },
    ];
    selectedType: CommonInterface.ICommonTitleValue = this.types[0];

    lockHistory: string[] = [];
    selectedDataAccountingToUnlock: any;

    constructor(
        private _accountingRepo: AccountingRepo,
        private _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() { }

    unlockPaymentRequest($event: boolean) {
        if (!this.keyword.trim()) {
            this._toastService.warning("Please input keyword");
            return;
        }
        const keywords = !!this.keyword ? this.keyword.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : [];
        if (this.selectedType.value === 1) {
            this._accountingRepo.getAdvancePaymentToUnlock(keywords)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: IShipmentLockInfo) => {
                        if (!!res.logs && !!res.logs.length) {
                            this.lockHistory = (res.logs || []);
                            this.confirmPopup.show();

                        } else {
                            this.lockHistory = [];
                        }
                        if (!!res.lockedLogs) {
                            this.selectedDataAccountingToUnlock = res.lockedLogs;
                        }
                        if (this.lockHistory.length === 0) {
                            this.onUnlockAccounting($event);

                        }
                    }
                );
        } else {
            this._accountingRepo.getSettlementPaymentToUnlock(keywords)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: IShipmentLockInfo) => {
                        if (!!res.logs && !!res.logs.length) {
                            this.lockHistory = (res.logs || []);
                            this.confirmPopup.show();
                        } else {
                            this.lockHistory = [];
                        }
                        if (!!res.lockedLogs) {
                            this.selectedDataAccountingToUnlock = res.lockedLogs;
                        }
                        if (this.lockHistory.length === 0) {
                            this.onUnlockAccounting($event);
                        }
                    }
                );
        }
    }

    onUnlockAccounting($event: boolean) {
        if ($event) {
            if (this.selectedType.value === 1) {
                if (!!this.selectedDataAccountingToUnlock) {
                    this._accountingRepo.unlockAdvance(this.selectedDataAccountingToUnlock)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: any) => {
                                if (res.success) {
                                    this._toastService.success("Unlock Successfull");
                                } else {
                                    this._toastService.error("Unlock failed, Please check again!");
                                }
                            }
                        )
                }
            } else {
                if (!!this.selectedDataAccountingToUnlock) {
                    this._accountingRepo.unlockSettlement(this.selectedDataAccountingToUnlock)
                        .pipe(catchError(this.catchError))
                        .subscribe(
                            (res: any) => {
                                if (res.success) {
                                    this._toastService.success("Unlock Successfull");
                                } else {
                                    this._toastService.error("Unlock failed, Please check again!");
                                }
                            }
                        );
                }

            }
        }
    }
}
