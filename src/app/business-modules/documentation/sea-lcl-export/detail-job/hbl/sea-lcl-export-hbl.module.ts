import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SeaLCLExportHBLComponent } from './sea-lcl-export-hbl.component';
import { SeaLCLExportCreateHBLComponent } from './create/create-house-bill.component';
import { SeaLCLExportDetailHBLComponent } from './detail/detail-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';


const routing: Routes = [
    {
        path: '', component: SeaLCLExportHBLComponent,
        data: { name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.SLE_CODE }
    },
    {
        path: 'new', component: SeaLCLExportCreateHBLComponent,
        data: { name: 'New House Bill', path: ':id', level: 5 }
    },
    {
        path: ':hblId', component: SeaLCLExportDetailHBLComponent,
        data: { name: 'House Bill Detail', path: ':id', level: 5 }
    }
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    SelectModule,
    NgxDaterangepickerMd.forRoot()

];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ShareBussinessModule,
        FormsModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        NgxSpinnerModule,
        ...LIB

    ],
    exports: [],
    declarations: [
        SeaLCLExportHBLComponent,
        SeaLCLExportCreateHBLComponent,
        SeaLCLExportDetailHBLComponent
    ],
    providers: [],
})
export class SeaLCLExportHBLModule { }
