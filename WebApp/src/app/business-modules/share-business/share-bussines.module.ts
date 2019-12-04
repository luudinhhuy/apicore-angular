import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgxCurrencyModule } from 'ngx-currency';
import { ModalModule, BsDropdownModule, PaginationModule, TooltipModule, CollapseModule } from 'ngx-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SelectModule } from 'ng2-select';

import { CommonComponentModule } from 'src/app/shared/common/common.module';
import { DirectiveModule } from 'src/app/shared/directives/directive.module';
import { ShareContainerImportComponent } from './components/container-import/container-import.component';
import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import {
    ShareBussinessFormCreateSeaImportComponent,
    ShareBussinessBuyingChargeComponent,
    ShareBussinessSellingChargeComponent,
    ShareBussinessOBHChargeComponent, ShareBussinessProfitSummaryComponent,
    ShareBussinessShipmentGoodSummaryComponent, ShareBussinessContainerListPopupComponent,
    ShareBussinessGrantTotalProfitComponent,
    ShareBusinessImportJobDetailPopupComponent,
    ShareBusinessFormSearchImportJobComponent,
    ShareBussinessCdNoteListComponent,
    ShareBussinessCdNoteAddPopupComponent,
    ShareBussinessCdNoteAddRemainingChargePopupComponent,
    ShareBussinessCdNoteDetailPopupComponent,
    ShareBussinessShipmentGoodSummaryLCLComponent,
    ShareBussinessHBLGoodSummaryComponent,
    ShareBussinessGoodsListPopupComponent,
    ShareBusinessFormManifestComponent,
    ShareBusinessAddHblToManifestComponent,
    ShareBusinessAssignStagePopupComponent,
    ShareBusinessAsignmentComponent,
    ShareBusinessStageManagementDetailComponent,
    ShareBusinessFormSearchSeaComponent,
    ShareBusinessAssignStagePopupComponent,
    ShareBusinessAsignmentComponent,
    ShareBusinessStageManagementDetailComponent,
    ShareBusinessAddHblToManifestComponent,
    ShareBusinessFormManifestComponent,
    ShareBusinessFormCreateHouseBillImportComponent,
    ShareBusinessArrivalNoteComponent,
    ShareBusinessDeliveryOrderComponent,
    ShareBusinessImportHouseBillDetailComponent,
    ShareBusinessFormSearchHouseBillComponent,
    ShareBussinessGoodsListPopupComponent

} from './components';


import { reducers, effects } from './store';
import { ShareBusinessFormSearchSeaComponent } from './components/form-search-sea/form-search-sea.component';

const COMPONENTS = [
    ShareBussinessBuyingChargeComponent,
    ShareBussinessSellingChargeComponent,
    ShareBussinessOBHChargeComponent,
    ShareContainerImportComponent,
    ShareBussinessProfitSummaryComponent,
    ShareBussinessShipmentGoodSummaryComponent,
    ShareBussinessContainerListPopupComponent,
    ShareBussinessGrantTotalProfitComponent,
    ShareBusinessImportJobDetailPopupComponent,
    ShareBusinessFormSearchImportJobComponent,
    ShareBussinessCdNoteListComponent,
    ShareBussinessCdNoteAddPopupComponent,
    ShareBussinessCdNoteAddRemainingChargePopupComponent,
    ShareBussinessCdNoteDetailPopupComponent,
    ShareBusinessFormManifestComponent,
    ShareBusinessAddHblToManifestComponent,
    ShareBussinessGoodsListPopupComponent,
    ShareBussinessFormCreateSeaImportComponent,
    ShareBussinessShipmentGoodSummaryLCLComponent,
    ShareBusinessAssignStagePopupComponent,
    ShareBusinessAsignmentComponent,
    ShareBusinessStageManagementDetailComponent,
    ShareBusinessFormCreateHouseBillImportComponent,
    ShareBusinessArrivalNoteComponent,
    ShareBusinessDeliveryOrderComponent,
    ShareBusinessFormSearchSeaComponent,
    ShareBussinessHBLGoodSummaryComponent,
    ShareBusinessImportHouseBillDetailComponent,
    ShareBusinessFormSearchHouseBillComponent
];


const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: false,
    allowZero: true,
    decimal: ".",
    precision: 2,
    prefix: "",
    suffix: "",
    thousands: ",",
    nullable: true
};

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        CommonComponentModule,
        FormsModule,
        SelectModule,
        ReactiveFormsModule,
        SelectModule,
        ModalModule.forRoot(),
        NgxDaterangepickerMd.forRoot(),
        DirectiveModule,
        PipeModule,
        SelectModule,
        PaginationModule.forRoot(),
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        FroalaEditorModule.forRoot(),
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        StoreModule.forFeature('share-bussiness', reducers),
        EffectsModule.forFeature(effects),
        CollapseModule.forRoot(),
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class ShareBussinessModule {

}
