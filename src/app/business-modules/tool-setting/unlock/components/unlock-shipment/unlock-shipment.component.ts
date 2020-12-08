import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { ToastrService } from 'ngx-toastr';
import { CommonEnum } from '@enums';
import { formatDate } from '@angular/common';
import { DocumentationRepo } from '@repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { catchError, finalize } from 'rxjs/operators';
import { UnlockHistoryPopupComponent } from '../unlock-history/unlock-history.popup';

@Component({
    selector: 'unlock-shipment',
    templateUrl: './unlock-shipment.component.html',
    styleUrls: ['./unlock-shipment.component.scss']
})

export class UnlockShipmentComponent extends AppForm implements OnInit {

    @ViewChild(UnlockHistoryPopupComponent, { static: false }) confirmPopup: UnlockHistoryPopupComponent;

    options: CommonInterface.INg2Select[] = [
        { id: 1, text: 'Job ID' },
        { id: 2, text: 'MBL' },
        { id: 3, text: 'HBL' },
    ];
    selectedOption: CommonInterface.INg2Select[] = [this.options[0]];

    services: CommonInterface.INg2Select[] = [
        { id: 'All', text: 'All' },
        { id: CommonEnum.TransactionTypeEnum.AirExport, text: 'Air Export' },
        { id: CommonEnum.TransactionTypeEnum.AirImport, text: 'Air Import' },
        { id: CommonEnum.TransactionTypeEnum.CustomLogistic, text: 'Custom logistic' },
        { id: CommonEnum.TransactionTypeEnum.SeaFCLExport, text: 'Sea FCL Export' },
        { id: CommonEnum.TransactionTypeEnum.SeaFCLImport, text: 'Sea FCL Import' },
        { id: CommonEnum.TransactionTypeEnum.SeaLCLExport, text: 'Sea LCL Export' },
        { id: CommonEnum.TransactionTypeEnum.SeaLCLImport, text: 'Sea LCL Import' },
    ];
    selectedService: CommonInterface.INg2Select[] = [this.services[0]];

    isSelectOption: boolean = true;
    isSelectServiceDate: boolean = false;

    lockHistory: string[] = [];
    shipmentUnlock: any;


    constructor(
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _ngProgressService: NgProgress,
    ) {
        super();

        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {
        // * default disabled serviceDate.
        this.isDisabled = true;
    }

    onSelectOptionChange(e: any) {
        if (e.target.checked) {
            this.isSelectOption = true;
            this.isSelectServiceDate = false;

            this.selectedOption = [this.options[0]];
            this.isDisabled = true;
            this.selectedRange = null;

        } else {
            this.isSelectOption = false;
        }
    }

    onSelectServiceDate(e: any) {
        if (e.target.checked) {
            this.isSelectServiceDate = true;
            this.isSelectOption = false;

            this.isDisabled = null;
            this.keyword = '';
            this.selectedService = [this.services[0]];


        } else {
            this.isSelectServiceDate = false;
        }
    }

    unlock($event: boolean) {
        let body = {};
        if (this.isSelectOption) {
            if (!this.keyword.trim()) {
                this._toastService.warning("Please input keyword");
                return;
            }
            body = {
                shipmentPropertySearch: this.selectedOption[0].id,
                keywords: !!this.keyword ? this.keyword.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            };
        } else {
            body = {
                fromDate: !!this.selectedRange && !!this.selectedRange.startDate ? formatDate(this.selectedRange.startDate, 'yyyy-MM-dd', 'en') : null,
                toDate: !!this.selectedRange && !!this.selectedRange.endDate ? formatDate(this.selectedRange.endDate, 'yyyy-MM-dd', 'en') : null,
                transactionType: this.selectedService[0].id !== 'All' ? this.selectedService[0].id : 0
            };
        }

        this._progressRef.start();
        this._documentRepo.getShipmentToUnlock(body)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: IShipmentLockInfo) => {
                    if (!!res.logs && !!res.logs.length) {
                        this.lockHistory = (res.logs || []);
                        this.confirmPopup.show();
                    } else {
                        this.lockHistory = [];
                    }

                    if (!!res.lockedLogs) {
                        this.shipmentUnlock = res.lockedLogs;
                    }

                    if (this.lockHistory.length === 0) {
                        this.onUnlockShipment($event);
                    }
                }
            );
    }

    onUnlockShipment($event: boolean) {
        if ($event && !!this.shipmentUnlock) {
            this._progressRef.start();
            this._documentRepo.unlockShipment(this.shipmentUnlock)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: any) => {
                        if (res.success) {
                            this._toastService.success("Unlock Successful");
                        } else {
                            this._toastService.error("Unlock failed, Please check again!");
                        }
                    }
                );
        }

    }
}

interface IShipmentLock {
    shipmentPropertySearch: number;
    keywords: string[];
    transactionType: number;
    fromDate: string;
    toDate: string;
}


export interface IShipmentLockInfo {
    lockedLogs: {
        id: string;
        advanceNo: string;
        settlementNo: string;
        lockedLog: string;
        opsShipmentNo: string;
        csShipmentNo: string;
    };
    logs: string[];
}

