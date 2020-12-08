import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsModule, CollapseModule, PaginationModule } from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareBussinessModule } from '../../share-business/share-bussines.module';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { AirImportComponent } from './air-import.component';
import { AirImportLazyLoadModule } from './air-import-lazy-load.module';
import { AirImportCreateJobComponent } from './create-job/create-job-air-import.component';
import { AirImportDetailJobComponent } from './detail-job/detail-job-air-import.component';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: AirImportComponent
            },
            {
                path: 'new', component: AirImportCreateJobComponent,
                data: { name: "Create New Job" }
            },
            {
                path: ':jobId',
                data: { transactionType: CommonEnum.TransactionTypeEnum.AirImport, name: "Job Detail" },
                children: [
                    {
                        path: '', component: AirImportDetailJobComponent, data: { name: "" }
                    },
                    {
                        path: 'hbl', loadChildren: () => import('./detail-job/hbl/air-import-hbl.module').then(m => m.AirImportHBLModule),
                        data: {
                            name: "House Bill",
                        },
                    },

                ]
            },
        ]
    },

];

const LIB = [
    SelectModule,
    NgxDaterangepickerMd.forRoot(),
    PerfectScrollbarModule,
    TabsModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        ShareBussinessModule,
        AirImportLazyLoadModule,
        ...LIB,
    ],
    exports: [],
    declarations: [
        AirImportComponent,
        AirImportCreateJobComponent,
        AirImportDetailJobComponent
    ],
    providers: [],
})
export class AirImportModule { }
