import { Component } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'soa-account-receive-payable',
    templateUrl: './account-receive-payable.component.html',
    styleUrls: ['./account-receive-payable.component.scss']
})
export class AccountReceivePayableComponent extends AppPage {
    constructor() {
        super();
    }

    ngOnInit(): void { }
}
