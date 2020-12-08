import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SaleReportComponent } from './sale-report.component';
import { SaleReportFormSearchComponent } from './components/form-search-sale-report/form-search-sale-report.component';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: SaleReportComponent
            }
        ]
    },
]
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SelectModule,
        FormsModule,
        PaginationModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
    ],
    exports: [],
    declarations: [
        SaleReportComponent,
        SaleReportFormSearchComponent
    ],
    providers: [],
})
export class SaleReportModule { }
