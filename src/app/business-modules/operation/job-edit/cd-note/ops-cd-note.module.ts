import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobEditShareModule } from '../job-edit-share.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { OpsCDNoteComponent } from './ops-cd-note-list.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        OpsCDNoteComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        JobEditShareModule // ? Share with Job Edit
    ],
    exports: [],
    providers: [],
    entryComponents: [
        OpsCDNoteComponent
    ]
})
export class OpsCDNoteModule {
    static rootComponent = OpsCDNoteComponent;
}