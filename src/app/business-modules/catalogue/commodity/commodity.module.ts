import { NgModule } from '@angular/core';
import { CommodityComponent } from './commodity.component';
import { Routes, RouterModule } from '@angular/router';
import { CommodityImportComponent } from '../commodity-import/commodity-import.component';
import { CommodityGroupImportComponent } from '../commodity-group-import/commodity-group-import.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SelectModule } from 'ng2-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgProgressModule } from '@ngx-progressbar/core';
import { CommodityAddPopupComponent } from './components/form-create-commodity/form-create-commodity.popup';
import { ModalModule, PaginationModule, TabsModule } from 'ngx-bootstrap';
import { CommodityGroupAddPopupComponent } from './components/form-create-commodity-group/form-create-commodity-group.popup';
import { CommodityGroupListComponent } from './components/list-commodity-group/list-commodity-group.component';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: CommodityComponent
            },
            {
                path: 'commodity-import', component: CommodityImportComponent, data: { name: "Import" }
            },
            {
                path: 'commodity-group-import', component: CommodityGroupImportComponent, data: { name: "Group Import" }
            },
        ]
    },
];
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SelectModule,
        FormsModule,
        NgProgressModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
    ],
    exports: [],
    declarations: [
        CommodityComponent,
        CommodityImportComponent,
        CommodityGroupImportComponent,
        CommodityAddPopupComponent,
        CommodityGroupAddPopupComponent,
        CommodityGroupListComponent
    ],
    providers: [],
})
export class CommondityModule { }
