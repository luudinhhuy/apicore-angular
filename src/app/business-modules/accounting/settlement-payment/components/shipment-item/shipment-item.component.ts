import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppList } from 'src/app/app.list';

@Component({
    selector: 'shipment-item',
    templateUrl: './shipment-item.component.html',
})

export class SettlementShipmentItemComponent extends AppList {

    @Output() onCheck: EventEmitter<any> = new EventEmitter<any>();
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() data: any = null;
    headers: CommonInterface.IHeaderTable[];

    initCheckbox: boolean = false;
    constructor(
    ) {
        super();
    }

    ngOnInit() {
        this.headers = [
            { title: 'Charge Name', field: 'jobId', },
            { title: 'Qty', field: 'jobId', },
            { title: 'Unit Price', field: 'jobId', },
            { title: 'Currency', field: 'jobId', },
            { title: 'VAT', field: 'jobId', },
            { title: 'Amount', field: 'jobId', },
            { title: 'Payer', field: 'jobId', },
            { title: 'OBH Partner', field: 'jobId', },
            { title: 'Invoice No', field: 'jobId', },
            { title: 'Series No', field: 'jobId', },
            { title: 'Inv Date', field: 'jobId', },
            { title: 'Custom No', field: 'jobId', },
            { title: 'Cont No', field: 'jobId', },
            { title: 'Note', field: 'jobId', },
        ];
    }

    showPaymentManagement($event: Event, data: any): any {
        this.onClick.emit({event: $event, data: data});
    }

    checkUncheckAllRequest($event: Event) {
        /* 
         * prevent collapse/expand within accordion-head
         */
        $event.stopPropagation();
        $event.preventDefault();

        this.initCheckbox = !this.initCheckbox;
        this.isCheckAll = this.initCheckbox;
        this.onCheck.emit(this.isCheckAll);

        return false;

    }

}
