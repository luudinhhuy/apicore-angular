import { NgModule } from '@angular/core';
import { ProcessApporveComponent } from './process-approve/process-approve.component';
import { CommonModule } from '@angular/common';


@NgModule({
    imports: [
        CommonModule
    ],
    exports: [
        ProcessApporveComponent
    ],
    declarations: [
        ProcessApporveComponent
    ],
    providers: [],
})
export class ShareApprovePaymentModule { }
