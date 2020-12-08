import { NgModule } from '@angular/core';

import { PartnerComponent } from './partner.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { PartnerDataImportComponent } from './import/partner-data-import.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SalemanPopupComponent } from './components/saleman-popup.component';
import { ModalModule, TabsModule } from 'ngx-bootstrap';
import { FormAddPartnerComponent } from './components/form-add-partner/form-add-partner.component';
import { AddPartnerDataComponent } from './add/add-partner.component';
import { PartnerListComponent } from './components/partner-list/partner-list.component';
import { PartnerDetailComponent } from './detail/detail-partner.component';
import { PartnerOtherChargePopupComponent } from './components/other-charge/partner-other-charge.popup';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: PartnerComponent

            },
            {
                path: 'import', component: PartnerDataImportComponent, data: { name: "Import", level: 3 }
            },
            {
                path: 'add', component: AddPartnerDataComponent, data: { name: "New", level: 3 }
            },
            {
                path: 'detail/:id', component: PartnerDetailComponent, data: { name: "Detail", level: 3 }
            },
        ]
    },

]
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routing),
        NgProgressModule,
        FormsModule,
        ReactiveFormsModule,
        SelectModule,
        NgxDaterangepickerMd,
        PaginationModule.forRoot(),
        ModalModule.forRoot(),
        TabsModule.forRoot()
    ],
    exports: [],
    declarations: [
        PartnerComponent,
        PartnerDataImportComponent,
        SalemanPopupComponent,
        FormAddPartnerComponent,
        AddPartnerDataComponent,
        PartnerDetailComponent,
        PartnerListComponent,
        PartnerOtherChargePopupComponent

    ],
    providers: [],
})
export class PartnerDataModule { }
