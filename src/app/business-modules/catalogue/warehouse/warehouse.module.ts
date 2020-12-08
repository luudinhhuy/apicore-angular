import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgProgressModule } from '@ngx-progressbar/core';
import { SelectModule } from 'ng2-select';
import { ModalModule, PaginationModule } from 'ngx-bootstrap';

import { SharedModule } from 'src/app/shared/shared.module';

import { WarehouseComponent } from './warehouse.component';
import { WarehouseImportComponent } from './warehouse-import/warehouse-import.component';
import { FormWarehouseComponent } from './components/form-warehouse.component';


const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: WarehouseComponent,
            },
            { path: 'import', component: WarehouseImportComponent, data: { name: "Import", level: 3 } },
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
        NgProgressModule,
        SelectModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),

    ],
    declarations: [
        WarehouseComponent,
        WarehouseImportComponent,
        FormWarehouseComponent
    ],
    exports: [],
    bootstrap: [WarehouseComponent,],
    providers: [],
})
export class WareHouseModule {
}
