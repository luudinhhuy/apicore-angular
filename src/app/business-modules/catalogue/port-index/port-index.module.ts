import { NgModule } from '@angular/core';

import { PortIndexComponent } from './port-index.component';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PortIndexImportComponent } from './port-index-import/port-index-import.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { NgProgressModule } from '@ngx-progressbar/core';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { FormPortIndexComponent } from './components/form-port-index.component';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: PortIndexComponent
            },
            {
                path: 'import', component: PortIndexImportComponent, data: { name: "Import" }
            },
        ]
    },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        SharedModule,
        ReactiveFormsModule,
        FormsModule,
        SelectModule,
        NgProgressModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),

    ],
    exports: [],
    bootstrap: [PortIndexComponent],
    declarations: [
        PortIndexComponent,
        PortIndexImportComponent,
        FormPortIndexComponent
    ],
    providers: [],
})
export class PortIndexModule { }
