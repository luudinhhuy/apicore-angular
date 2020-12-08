import { NgModule } from '@angular/core';
import { CustomClearanceComponent } from './custom-clearance.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TabsModule, ModalModule, PaginationModule } from 'ngx-bootstrap';
import { NgProgressModule } from '@ngx-progressbar/core';
import { CustomClearanceFormSearchComponent } from './components/form-search-custom-clearance/form-search-custom-clearance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'ng2-select';
import { CustomClearanceAddnewComponent } from './addnew/custom-clearance-addnew.component';
import { CustomClearanceEditComponent } from './detail/custom-clearance-edit.component';
import { CustomClearanceImportComponent } from './import/custom-clearance-import.component';
import { CustomClearanceFormAddComponent } from './components/form-add-custom-clearance/form-add-custom-clearance.component';

const routing: Routes = [
    {
        path: "",
        data: { name: "", },
        children: [
            {
                path: '', component: CustomClearanceComponent
            },
            {
                path: "new",
                component: CustomClearanceAddnewComponent,
                data: {
                    name: "New",
                }
            },
            {
                path: "detail/:id",
                component: CustomClearanceEditComponent,
                data: {
                    name: "Detail",
                }
            },
            {
                path: "import",
                component: CustomClearanceImportComponent,
                data: {
                    name: "Import",
                }
            },
        ]
    },

];

const LIB = [
    NgxDaterangepickerMd,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    NgProgressModule,
    PaginationModule.forRoot(),
    SelectModule
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routing),
        FormsModule,
        ReactiveFormsModule,
        ...LIB
    ],
    exports: [],
    declarations: [
        CustomClearanceComponent,
        CustomClearanceAddnewComponent,
        CustomClearanceImportComponent,
        CustomClearanceEditComponent,
        CustomClearanceFormSearchComponent,
        CustomClearanceFormAddComponent
    ],
    providers: [],
})
export class CustomClearanceModule { }
