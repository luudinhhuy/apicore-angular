import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { GroupComponent } from './group.component';
import { AddGroupComponent } from './add/add-group/add-group.component';
import { GroupDetailComponent } from './detail/detail-group/detail-group.component';
import { FormSearchGroupComponent } from './components/form-search-group/form-search-group.component';
import { FormUserGroupComponent } from './components/form-user-group/form-user-group.component';
import { ShareSystemModule } from '../../share-system/share-system.module';
import { ShareSystemDetailPermissionComponent } from '../../share-system/components/permission/permission-detail.component';


const routing: Routes = [
    {
        path: "", data: { name: "" },
        children: [
            {
                path: "", component: GroupComponent
            },
            {
                path: "new", component: AddGroupComponent,
                data: { name: "New" }
            },
            {
                path: ":id", component: GroupDetailComponent,
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
        GroupComponent,
        AddGroupComponent,
        GroupDetailComponent,
        FormSearchGroupComponent,
        FormUserGroupComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        PaginationModule.forRoot(),
        ReactiveFormsModule,
        PerfectScrollbarModule,
        RouterModule.forChild(routing),
        ShareSystemModule
    ],
    exports: [],
    providers: [],
    bootstrap: [
        GroupComponent,
        AddGroupComponent,
        GroupDetailComponent,
        FormSearchGroupComponent,
        FormUserGroupComponent
    ]
})
export class GroupModule { }