import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';

import { SeaFCLExportHBLComponent } from './sea-fcl-export-hbl.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { SeaFCLExportCreateHBLComponent } from './create/create-house-bill.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SeaFCLExportDetailHBLComponent } from './detail/detail-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';


const routing: Routes = [
    {
        path: '', component: SeaFCLExportHBLComponent,
        data: { name: 'House Bill List', path: 'hbl', level: 4, serviceId: ChargeConstants.SFE_CODE }
    },
    {
        path: 'new', component: SeaFCLExportCreateHBLComponent,
        data: { name: 'New House Bill Detail', path: ':id', level: 5 }
    },
    {
        path: ':hblId', component: SeaFCLExportDetailHBLComponent,
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
        SeaFCLExportHBLComponent,
        SeaFCLExportCreateHBLComponent,
        SeaFCLExportDetailHBLComponent,
    ],
    providers: [],
})
export class SeaFCLExportHBLModule { }
