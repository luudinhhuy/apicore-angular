import { NgModule } from '@angular/core';

import { ChargeComponent } from './charge.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { NgProgressModule } from '@ngx-progressbar/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ChargeImportComponent } from './charge-import/charge-import.component';
import { ChargeImportAccountVoucherComponent } from './charge-import-account-voucher/charge-import-account-voucher.component';
import { PaginationModule } from 'ngx-bootstrap';
import { FormSearchChargeComponent } from './components/form-search-charge/form-search-charge.component';
import { AddChargeComponent } from './add-charge/add-charge.component';
import { DetailChargeComponent } from './detail-charge/detail-charge.component';
import { FormAddChargeComponent } from './components/form-add-charge/form-add-charge.component';
import { VoucherListComponent } from './components/voucher-list/voucher-list.component';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: ChargeComponent
            },
            {
                path: 'addnew', component: AddChargeComponent, data: { name: "New" }
            },
            {

                path: 'import', component: ChargeImportComponent, data: { name: "Import" }
            },
            {

                path: 'import-account-voucher', component: ChargeImportAccountVoucherComponent, data: { name: "Import Account Voucher" }
            },
            {

                path: ':id', component: DetailChargeComponent, data: { name: "Detail" }
            },
        ]
    },



];
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SelectModule,
        NgProgressModule,
        SharedModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        ReactiveFormsModule,
    ],
    exports: [],
    declarations: [
        ChargeComponent,
        ChargeImportComponent,
        ChargeImportAccountVoucherComponent,
        FormSearchChargeComponent,
        AddChargeComponent,
        DetailChargeComponent,
        FormAddChargeComponent,
        VoucherListComponent
    ],
    providers: [],
})
export class

    ChargeModule { }
