import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { NgxCurrencyModule } from 'ngx-currency';
import { ModalModule, BsDropdownModule, PaginationModule, TooltipModule, CollapseModule } from 'ngx-bootstrap';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SelectModule } from 'ng2-select';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';

import { CommonComponentModule } from 'src/app/shared/common/common.module';
import { DirectiveModule } from 'src/app/shared/directives/directive.module';

import { PipeModule } from 'src/app/shared/pipes/pipe.module';
import {
    ShareBussinessFormCreateSeaImportComponent,
    ShareBussinessBuyingChargeComponent,
    ShareBussinessSellingChargeComponent,
    ShareBussinessOBHChargeComponent,
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
    ShareBussinessShipmentGoodSummaryLCLComponent,
    ShareBussinessHBLGoodSummaryLCLComponent,
    ShareBussinessGoodsListPopupComponent,
    ShareBusinessFormManifestComponent,
    ShareBusinessFormSearchSeaComponent,
    ShareBusinessAssignStagePopupComponent,
    ShareBusinessAsignmentComponent,
    ShareBusinessStageManagementDetailComponent,
    ShareBusinessAddHblToManifestComponent,
    ShareBusinessFormCreateHouseBillImportComponent,
    ShareBusinessArrivalNoteComponent,
    ShareBusinessDeliveryOrderComponent,
    ShareBusinessImportHouseBillDetailComponent,
    ShareBusinessFormSearchHouseBillComponent,
    ShareBussinessHBLGoodSummaryFCLComponent,
    ShareBussinessFormCreateSeaExportComponent,
    ShareBusinessFormCreateHouseBillExportComponent,
    ShareBusinessFormCreateAirComponent,
    ShareBusinessDIMVolumePopupComponent,
    ShareBussinessCdNoteListAirComponent,
    ShareBussinessCdNoteAddAirPopupComponent,
    ShareBussinessCdNoteAddRemainingChargeAirPopupComponent,
    ShareBussinessCdNoteDetailAirPopupComponent,
    ShareBussinessFilesAttachComponent,
    ShareBusinessHousebillsInManifestComponent,
    ShareBusinessArrivalNoteAirComponent,
    ShareBussinessDateTimeModifiedComponent,
    ShareContainerImportComponent,

} from './components';


import { reducers, effects } from './store';
import { ShareGoodsImportComponent } from './components/goods-import/goods-import.component';
import { ValidatorModule } from 'src/app/shared/validators/validator.module';
import { ShareBussinessHBLFCLContainerPopupComponent } from './components/hbl-fcl-container/hbl-fcl-container.popup';
import { NgxSpinnerModule } from 'ngx-spinner';

const COMPONENTS = [
    ShareBussinessBuyingChargeComponent,
    ShareBussinessSellingChargeComponent,
    ShareBussinessOBHChargeComponent,
    ShareContainerImportComponent,
    ShareGoodsImportComponent,
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
    ShareBussinessHBLGoodSummaryLCLComponent,
    ShareBusinessImportHouseBillDetailComponent,
    ShareBusinessFormSearchHouseBillComponent,
    ShareBussinessHBLGoodSummaryFCLComponent,
    ShareBussinessFormCreateSeaExportComponent,
    ShareBusinessFormCreateHouseBillExportComponent,
    ShareBusinessFormCreateAirComponent,
    ShareBusinessDIMVolumePopupComponent,
    ShareBussinessCdNoteListAirComponent,
    ShareBussinessCdNoteAddAirPopupComponent,
    ShareBussinessCdNoteAddRemainingChargeAirPopupComponent,
    ShareBussinessCdNoteDetailAirPopupComponent,
    ShareBussinessFilesAttachComponent,
    ShareBusinessHousebillsInManifestComponent,
    ShareBusinessArrivalNoteAirComponent,
    ShareBussinessDateTimeModifiedComponent,
    ShareBussinessHBLFCLContainerPopupComponent

];



const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: false,
    allowZero: true,
    decimal: ".",
    precision: 3,
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
        ReactiveFormsModule,
        ModalModule.forRoot(),
        NgxDaterangepickerMd.forRoot(),
        DirectiveModule,
        PipeModule,
        SelectModule,
        ValidatorModule,
        PaginationModule.forRoot(),
        BsDropdownModule.forRoot(),
        TooltipModule.forRoot(),
        FroalaEditorModule.forRoot(),
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        StoreModule.forFeature('share-bussiness', reducers),
        EffectsModule.forFeature(effects),
        CollapseModule.forRoot(),
        NgxSpinnerModule
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class ShareBussinessModule {

}
