import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationModule, TabsModule, ModalModule, BsDropdownModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AirImportHBLComponent } from './air-import-hbl.component';
import { AirImportHBLFormCreateComponent } from './components/form-create-house-bill-air-import/form-create-house-bill-air-import.component';
import { AirImportCreateHBLComponent } from './create/create-house-bill.component';
import { AirImportDetailHBLComponent } from './detail/detail-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';



const routing: Routes = [
    {
        path: '', component: AirImportHBLComponent,
        data: { name: '', path: 'hbl', level: 4, serviceId: ChargeConstants.AI_CODE }
    },
    {
        path: 'new', component: AirImportCreateHBLComponent,
        data: { name: 'New House Bill ', path: ':id', level: 5 }
    },
    {
        path: ':hblId', component: AirImportDetailHBLComponent,
        data: { name: 'House Bill Detail', path: ':id', level: 5 }
    }
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    SelectModule,
    NgxDaterangepickerMd.forRoot(),
    BsDropdownModule.forRoot()

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
        AirImportHBLComponent,
        AirImportHBLFormCreateComponent,
        AirImportCreateHBLComponent,
        AirImportDetailHBLComponent
    ],
    providers: [],
})
export class AirImportHBLModule { }
