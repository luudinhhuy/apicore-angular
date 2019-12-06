import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SelectModule } from 'ng2-select';
import { FroalaViewModule, FroalaEditorModule } from 'angular-froala-wysiwyg';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TabsModule, ModalModule, PaginationModule, BsDropdownModule } from 'ngx-bootstrap';

import { SeaFCLImportHBLComponent } from './sea-fcl-import-hbl.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateHouseBillComponent } from './create/create-house-bill.component';
import { DetailHouseBillComponent } from './detail/detail-house-bill.component';
import { ShareBussinessModule } from 'src/app/business-modules/share-business/share-bussines.module';
import { FormSearchHouseBillComponent } from './components/form-search-house-bill/form-search-house-bill.component';
import { SeaFClImportArrivalNoteComponent } from './components/arrival-note/arrival-note.component';
import { SeaFClImportDeliveryOrderComponent } from './components/delivery-order/delivery-order.component';
import { ChargeConstants } from 'src/constants/charge.const';

const routing: Routes = [
    {
        path: '', component: SeaFCLImportHBLComponent,
        data: <CommonInterface.IDataParam>{ name: 'House Bill List', path: 'hbl', level: 4, serviceId: ChargeConstants.SFI_CODE }
    },
    {
        path: 'new', component: CreateHouseBillComponent,
        data: { name: 'New House Bill Detail', path: ':id', level: 5 }
    },
    {
        path: ':hblId', component: DetailHouseBillComponent,
        data: { name: 'House Bill Detail', path: ':id', level: 5 }
    }
];

const LIB = [
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    SelectModule,
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    NgxDaterangepickerMd,
    TabsModule.forRoot(),
    BsDropdownModule.forRoot()
];


@NgModule({
    declarations: [
        SeaFCLImportHBLComponent,
        CreateHouseBillComponent,
        DetailHouseBillComponent,

        FormSearchHouseBillComponent,
        SeaFClImportArrivalNoteComponent,
        SeaFClImportDeliveryOrderComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        ShareBussinessModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        ...LIB

    ],
    exports: [],
    providers: [],
    bootstrap: [
        SeaFCLImportHBLComponent
    ]
})
export class SeaFCLImportHBLModule { }
