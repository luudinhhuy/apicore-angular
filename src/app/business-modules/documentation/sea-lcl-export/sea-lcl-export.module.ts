import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { TabsModule, PaginationModule } from 'ngx-bootstrap';

import { SeaLCLExportComponent } from './sea-lcl-export.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SeaLCLExportCreateJobComponent } from './create-job/create-job-lcl-export.component';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { SeaLCLExportDetailJobComponent } from './detail-job/detail-job-lcl-export.component';
import { SeaLCLExportLazyLoadModule } from './sea-lcl-export-lazy-load.module';
import { SeaLclExportManifestComponent } from './detail-job/manifest/sea-lcl-export-manifest.component';
import { SeaLclExportShippingInstructionComponent } from './detail-job/shipping-instruction/sea-lcl-export-shipping-instruction.component';
import { SeaLclExportBillInstructionComponent } from './detail-job/shipping-instruction/bill-instruction/sea-lcl-export-bill-instruction.component';
import { SeaLclExportBillDetailComponent } from './detail-job/shipping-instruction/bill-detail/sea-lcl-export-bill-detail.component';
import { SelectModule } from 'ng2-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

const routing: Routes = [
    {
        path: '', component: SeaLCLExportComponent, data: {
            name: "",
        },
    },
    {
        path: 'new', component: SeaLCLExportCreateJobComponent,
        data: { name: "Create New Job" }
    },
    {
        path: ':jobId',
        data: { transactionType: CommonEnum.TransactionTypeEnum.SeaLCLExport, name: "Job Detail" },
        children: [
            {
                path: '', component: SeaLCLExportDetailJobComponent, data: { name: "" }
            },
            {
                path: 'hbl', loadChildren: () => import('./detail-job/hbl/sea-lcl-export-hbl.module').then(m => m.SeaLCLExportHBLModule),
                data: {
                    name: "House Bill",
                },
            },
            {
                path: 'manifest', component: SeaLclExportManifestComponent,
                data: { name: "Manifest", },
            },
            {
                path: 'si', component: SeaLclExportShippingInstructionComponent, data: {
                    name: "Shipping Instructions",
                }
            }
        ]
    },

];

const LIBS = [
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    PerfectScrollbarModule,
    SelectModule,
    NgxDaterangepickerMd.forRoot(),
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routing),
        FormsModule,
        ReactiveFormsModule,
        ShareBussinessModule,
        SeaLCLExportLazyLoadModule,
        ...LIBS,
    ],
    exports: [],
    declarations: [
        SeaLCLExportComponent,
        SeaLCLExportCreateJobComponent,
        SeaLCLExportDetailJobComponent,
        SeaLclExportManifestComponent,
        SeaLclExportShippingInstructionComponent,
        SeaLclExportBillInstructionComponent,
        SeaLclExportBillDetailComponent,
    ],
    providers: [],
})
export class SeaLCLExportModule { }
