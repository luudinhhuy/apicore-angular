import { NgModule } from '@angular/core';
import { AdvancePaymentComponent } from './advance-payment.component';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ModalModule, PaginationModule, } from 'ngx-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { AdvancePaymentAddNewComponent } from './add/add-new-advance-payment.component';
import { AdvancePaymentFormCreateComponent } from './components/form-create-advance-payment/form-create-advance-payment.component';
import { AdvancePaymentListRequestComponent } from './components/list-advance-payment-request/list-advance-payment-request.component';
import { AdvancePaymentAddRequestPopupComponent } from './components/popup/add-advance-payment-request/add-advance-payment-request.popup';
import { AdvancePaymentFormsearchComponent } from './components/form-search-advance-payment/form-search-advance-payment.component';
import { AdvancePaymentDetailComponent } from './detail/detail-advance-payment.component';
import { ApproveAdvancePaymentComponent } from '../approve-payment/advance/approve-advance.component';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgxCurrencyModule } from "ngx-currency";
import { ShareApprovePaymentModule } from '../approve-payment/components/share-approve-payment.module';
const routing: Routes = [
    {
        path: "",
        data: { name: "" },
        children: [
            {
                path: '', component: AdvancePaymentComponent//,data: {reuse: true}
            },
            {
                path: "new", component: AdvancePaymentAddNewComponent,
                data: { name: "New", }
            },
            {
                path: ":id", component: AdvancePaymentDetailComponent,
                data: { name: "Detail" }
            },
            {
                path: ":id/approve", component: ApproveAdvancePaymentComponent,
                data: { name: "Approve" }
            }
        ]
    },


];

const COMPONENTS = [
    AdvancePaymentFormCreateComponent,
    AdvancePaymentListRequestComponent,
    AdvancePaymentAddRequestPopupComponent,
    AdvancePaymentFormsearchComponent,
];

const customCurrencyMaskConfig = {
    align: "right",
    allowNegative: false,
    allowZero: true,
    decimal: ".",
    precision: 0,
    prefix: "",
    suffix: "",
    thousands: ",",
    nullable: true
};

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        PerfectScrollbarModule,
        RouterModule.forChild(routing),
        ReactiveFormsModule,
        NgProgressModule,
        NgxCurrencyModule.forRoot(customCurrencyMaskConfig),
        ShareApprovePaymentModule
    ],
    declarations: [
        AdvancePaymentComponent,
        AdvancePaymentAddNewComponent,
        AdvancePaymentDetailComponent,
        ApproveAdvancePaymentComponent,
        ...COMPONENTS,
    ],
    providers: [
    ],
})
export class AdvancePaymentModule { }
