import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'ng2-select';
import { OpsCdNoteDetailPopupComponent } from './components/popup/ops-cd-note-detail/ops-cd-note-detail.popup';
import { OpsCdNoteAddPopupComponent } from './components/popup/ops-cd-note-add/ops-cd-note-add.popup';
import { OpsCdNoteAddRemainingChargePopupComponent } from './components/popup/ops-cd-note-add-remaining-charge/ops-cd-note-add-remaining-charge.popup';

@NgModule({
    declarations: [
        OpsCdNoteDetailPopupComponent,
        OpsCdNoteAddPopupComponent,
        OpsCdNoteAddRemainingChargePopupComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        ModalModule.forRoot(),
        FormsModule,
        SelectModule,
    ],
    exports: [
        // ? Components Share with Credit/Debit note and Job Edit.
        OpsCdNoteDetailPopupComponent,
        OpsCdNoteAddPopupComponent,
        OpsCdNoteAddRemainingChargePopupComponent,
    ],
    providers: [],
})
export class JobEditShareModule { }