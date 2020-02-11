import { NgModule } from '@angular/core';
import { DepartmentFormSearchComponent } from './components/form-search-department/form-search-department.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentComponent } from './department.component';
import { DepartmentAddNewComponent } from './add/add-department.component';
import { DepartmentDetailComponent } from './detail/detail-department.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { PaginationModule } from 'ngx-bootstrap';
import { ShareSystemModule } from '../../share-system/share-system.module';
const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: DepartmentComponent
            },
            {
                path: "new", component: DepartmentAddNewComponent,
                data: { name: "New", }
            },
            {
                path: ":id", component: DepartmentDetailComponent,
                data: { name: "Detail", }
            },
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
        ShareSystemModule
    ],
    exports: [],
    declarations: [
        DepartmentComponent,
        DepartmentFormSearchComponent,
        DepartmentAddNewComponent,
        DepartmentDetailComponent
    ],
    providers: [],
})
export class DepartmentModule { }
