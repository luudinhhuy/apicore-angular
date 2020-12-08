import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpsModuleStageManagementComponent } from './stage-management.component';
import { OpsModuleStageManagementAddStagePopupComponent } from './add/add-stage.popup.component';
import { OpsModuleStageManagementDetailComponent } from './detail/detail-stage-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { SelectModule } from 'ng2-select';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AssignStagePopupComponent } from './assign-stage/assign-stage.popup';

@NgModule({
    declarations: [
        OpsModuleStageManagementComponent,
        OpsModuleStageManagementDetailComponent,
        OpsModuleStageManagementAddStagePopupComponent,
        AssignStagePopupComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        ReactiveFormsModule,
        SelectModule,
        ModalModule,
        NgxDaterangepickerMd,

    ],
    exports: [
        OpsModuleStageManagementComponent,
        OpsModuleStageManagementDetailComponent,
        OpsModuleStageManagementAddStagePopupComponent,
        AssignStagePopupComponent
    ],
    providers: [],
    entryComponents: [
        OpsModuleStageManagementComponent
    ]
})
export class StateManagmentModule {
    static rootComponent = OpsModuleStageManagementComponent;
}