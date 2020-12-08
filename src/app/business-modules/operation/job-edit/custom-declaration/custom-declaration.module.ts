import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingCustomDeclarationComponent } from './billing-custom-declaration.component';
import { PaginationModule, ModalModule } from 'ngx-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddMoreModalComponent } from './add-more-modal/add-more-modal.component';
import { SearchMultipleComponent } from './components/search-multiple/search-multiple.component';


const LIB = [
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
];

@NgModule({
    declarations: [
        BillingCustomDeclarationComponent,
        AddMoreModalComponent,
        SearchMultipleComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        ...LIB
    ],
    exports: [],
    providers: [],
    entryComponents: [
        BillingCustomDeclarationComponent
    ]
})
export class CustomDeclarationModule {
    static rootComponent = BillingCustomDeclarationComponent;
}