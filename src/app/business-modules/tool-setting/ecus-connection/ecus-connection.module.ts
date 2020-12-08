import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { EcusConnectionComponent } from './ecus-connection.component';
import { SelectModule } from 'ng2-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { EcusConnectionFormPopupComponent } from './form-ecus/form-ecus.component';


const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: EcusConnectionComponent
            },
        ]
    },
];

@NgModule({
    declarations: [
        EcusConnectionComponent,
        EcusConnectionFormPopupComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        SharedModule,
        SelectModule,
        FormsModule,
        PaginationModule,
        ModalModule,
        ReactiveFormsModule
    ],
    exports: [],
    providers: [],
})
export class EcusConectionModule { }
