import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { PaginationModule, ModalModule, BsDropdownModule } from 'ngx-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { GeneralReportComponent } from './general-report.component';
import { GeneralReportFormSearchComponent } from './components/form-search-general-report/form-search-general-report.component';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: GeneralReportComponent
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
        BsDropdownModule.forRoot()
    ],
    exports: [],
    declarations: [
        GeneralReportComponent,
        GeneralReportFormSearchComponent
    ],
    providers: [],
})
export class GeneralReportModule { }
