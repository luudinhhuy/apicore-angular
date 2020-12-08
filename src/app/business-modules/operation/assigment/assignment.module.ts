import { NgModule } from '@angular/core';
import { AssigmentComponent } from './assigment.component';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SelectModule } from 'ng2-select';
import { TabsModule, ModalModule, PaginationModule } from 'ngx-bootstrap';
import { NgProgressModule } from '@ngx-progressbar/core';

const routing: Routes = [
    {
        path: "", component: AssigmentComponent, pathMatch: 'full', data: {
            name: "",
        }
    },
];

const LIB = [
    NgxDaterangepickerMd,
    DragDropModule,
    SelectModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    NgProgressModule,
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild(routing),
        ...LIB
    ],
    exports: [],
    declarations: [AssigmentComponent],
    providers: [],
})
export class AssignmentModule { }
