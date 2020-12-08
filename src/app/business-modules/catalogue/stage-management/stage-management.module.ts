import { NgModule } from '@angular/core';

import { StageManagementComponent } from './stage-management.component';
import { RouterModule, Routes } from '@angular/router';
import { StageImportComponent } from '../stage-import/stage-import.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { NgProgressModule } from '@ngx-progressbar/core';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';
import { StageManagementAddPopupComponent } from './components/form-create/form-create-stage-management.popup';


const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: StageManagementComponent
            },
            {
                path: 'stage-import', component: StageImportComponent, data: { name: "Import" }
            },
        ]
    },
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        ModalModule.forRoot(),
        FormsModule,
        SelectModule,
        NgProgressModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        PaginationModule.forRoot(),
    ],
    exports: [],
    declarations: [
        StageManagementComponent,
        StageImportComponent,
        StageManagementAddPopupComponent
    ],
    providers: [],
})
export class
    StateManagementModule { }
