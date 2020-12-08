import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers, effects } from './store';

import { SharedModule } from 'src/app/shared/shared.module';
import { ComanyInformationComponent } from './company-information.component';
import { CompanyInformationAddComponent } from './add/add-company-information.componnt';
import { CompanyInformationDetailComponent } from './detail/detail-company-information.component';
import { CompanyInformationFormSearchComponent } from './components/form-search-company/form-search-company.component';
import { CompanyInformationFormAddComponent } from './components/form-add-company/form-add-company.component';

import { PaginationModule, TabsModule } from 'ngx-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { ShareSystemModule } from '../../share-system/share-system.module';
import { ShareSystemDetailPermissionComponent } from '../../share-system/components/permission/permission-detail.component';


const routing: Routes = [
    {
        path: "", data: { name: "" },
        children: [
            {
                path: "", component: ComanyInformationComponent
            },
            {
                path: "new", component: CompanyInformationAddComponent,
                data: { name: "New" }
            },
            {
                path: ":id", component: CompanyInformationDetailComponent,
                data: { name: "Detail" }
            },
            {
                path: ':id/:ido/:uid/:type', component: ShareSystemDetailPermissionComponent, data: { name: "UserPermission" }
            }
        ]
    },
];

@NgModule({
    declarations: [
        ComanyInformationComponent,
        CompanyInformationFormSearchComponent,
        CompanyInformationFormAddComponent,
        CompanyInformationDetailComponent,
        CompanyInformationAddComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,

        TabsModule.forRoot(),
        PaginationModule.forRoot(),
        ReactiveFormsModule,
        PerfectScrollbarModule,
        RouterModule.forChild(routing),
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),

        // * STORE
        StoreModule.forFeature('company', reducers),
        EffectsModule.forFeature(effects),

        ShareSystemModule

    ],
    exports: [],
    providers: [],
})
export class CompanyInformationModule { }

