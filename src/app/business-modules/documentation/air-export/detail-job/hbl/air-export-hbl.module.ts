import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { PaginationModule, TabsModule, ModalModule, CollapseModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxCurrencyModule } from 'ngx-currency';

import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { ChargeConstants } from 'src/constants/charge.const';
import { AirExportHBLComponent } from './air-export-hbl.component';
import { AirExportCreateHBLComponent } from './create/create-house-bill.component';
import { AirExportHBLFormCreateComponent } from './components/form-create-house-bill-air-export/form-create-house-bill-air-export.component';
import { AirExportHBLAttachListComponent } from './components/attach-list/attach-list-house-bill-air-export.component';
import { AirExportDetailHBLComponent } from './detail/detail-house-bill.component';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { SeparateHouseBillComponent } from './components/form-separate-house-bill/form-separate-house-bill.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ShareAirExportModule } from '../../share-air-export.module';
import { InputBookingNotePopupComponent } from './components/input-booking-note/input-booking-note.popup';

const routing: Routes = [
    {
        path: '', component: AirExportHBLComponent,
        data: { name: '', path: '/', level: 4, serviceId: ChargeConstants.AE_CODE }
    },
    {
        path: 'new', component: AirExportCreateHBLComponent,
        data: { name: 'New House Bill', path: ':id', level: 5, transactionType: CommonEnum.TransactionTypeEnum.AirExport }
    },
    {
        path: ':hblId', component: AirExportDetailHBLComponent,
        data: { name: 'House Bill Detail', path: ':id', level: 5 }
    },
    {
        path: ':hblId/separate', component: SeparateHouseBillComponent,
        data: { name: "Separate Hawb", path: ":id", level: 6 },
    },
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    SelectModule,
    NgxDaterangepickerMd.forRoot(),
    PerfectScrollbarModule,
    FroalaEditorModule.forRoot(),
    CollapseModule,
    NgxCurrencyModule.forRoot({
        align: "right",
        allowNegative: true,
        allowZero: true,
        decimal: ".",
        precision: 3,
        prefix: "",
        suffix: "",
        thousands: ",",
        nullable: true
    }),
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
        ShareAirExportModule,
        ...LIB
    ],
    exports: [],
    declarations: [
        AirExportHBLComponent,
        AirExportCreateHBLComponent,
        AirExportHBLFormCreateComponent,
        AirExportHBLAttachListComponent,
        AirExportDetailHBLComponent,
        SeparateHouseBillComponent,
        InputBookingNotePopupComponent
    ],
    providers: [],
})
export class AirExportHBLModule { }
