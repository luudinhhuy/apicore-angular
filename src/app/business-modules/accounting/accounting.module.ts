import { NgModule } from '@angular/core';
import { routing } from './accounting-routing.module';
import { AccountReceivablePayableComponent } from './account-receivable-payable/account-receivable-payable.component';

const PAGES = [
  AccountReceivablePayableComponent,
];

@NgModule({
  imports: [
    routing,
  ],
  declarations: [
    ...PAGES
  ],
  bootstrap: [],
  providers: [
  ],
})
export class AccountingModule { }
