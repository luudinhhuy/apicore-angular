import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ExchangeRateComponent } from './exchange-rate.component';
import { SelectModule } from 'ng2-select';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { ExchangeRateHistoryPopupComponent } from './components/detail-history/exchange-rate-history.popup';
import { ExchangeRateConvertComponent } from './components/convert/exchange-rate-convert.component';
import { ExchangeRateFormComponent } from './components/form-exchange-rate/exchange-rate-form.component';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: ExchangeRateComponent
            },
        ]
    },
];

@NgModule({
    declarations: [
        ExchangeRateComponent,
        ExchangeRateHistoryPopupComponent,
        ExchangeRateConvertComponent,
        ExchangeRateFormComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        SelectModule,
        FormsModule,
        NgxDaterangepickerMd,
        RouterModule.forChild(routing),
        PaginationModule,
        ModalModule
    ],
    exports: [],
    providers: [],
})
export class ExchangeRateModule { }

