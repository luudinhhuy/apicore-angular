import { NgModule } from '@angular/core';
import { AuthorizationFormSearchComponent } from './components/form-search-authorization/form-search-authorization.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { AuthorizationComponent } from './authorization.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AuthorizationAddPopupComponent } from './components/popup/add-authorization/add-authorization.popup';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: AuthorizationComponent
            },
            // {
            //     path: "new", component: DepartmentAddNewComponent,
            //     data: { name: "New", }
            // },
            // {
            //     path: ":id", component: DepartmentDetailComponent,
            //     data: { name: "Detail", }
            // },
        ]
    },
]
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SelectModule,
        FormsModule,
        PaginationModule.forRoot(),
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
    ],
    exports: [],
    declarations: [
        AuthorizationComponent,
        AuthorizationFormSearchComponent,
        AuthorizationAddPopupComponent
    ],
    providers: [],
})
export class AuthorizationModule { }
