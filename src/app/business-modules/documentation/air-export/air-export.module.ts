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
import { AirExportComponent } from './air-export.component';
import { AirExportLazyLoadModule } from './air-export-lazy-load.module';
import { AirExportCreateJobComponent } from './create-job/create-job-air-export.component';
import { AirExportDetailJobComponent } from './detail-job/detail-job-air-export.component';
import { AirExportManifestComponent } from './detail-job/manifest/air-export-manifest.component';
import { AirExportMAWBFormComponent } from './detail-job/mawb/air-export-mawb.component';
import { ShareAirExportModule } from './share-air-export.module';

const routing: Routes = [
    {
        path: '', data: { name: "" }, children: [
            {
                path: '', component: AirExportComponent
            },
            {
                path: 'new', component: AirExportCreateJobComponent,
                data: { name: "Create New Job" }
            },
            {
                path: ':jobId',
                data: { transactionType: CommonEnum.TransactionTypeEnum.AirExport, name: "Job Detail" },
                children: [
                    {
                        path: '', component: AirExportDetailJobComponent, data: { name: "" }
                    },
                    {
                        path: 'hbl', loadChildren: () => import('./detail-job/hbl/air-export-hbl.module').then(m => m.AirExportHBLModule),
                        data: {
                            name: "House Bill",
                        },
                    },
                    {
                        path: 'manifest', component: AirExportManifestComponent,
                        data: { name: "Manifest", },
                    },
                    {
                        path: 'mawb', component: AirExportMAWBFormComponent,
                        data: { name: "MAWB Detail", },
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
        AirExportLazyLoadModule,
        ShareAirExportModule,
        ...LIB,
    ],
    exports: [],
    declarations: [
        AirExportComponent,
        AirExportCreateJobComponent,
        AirExportDetailJobComponent,
        AirExportManifestComponent,
        AirExportMAWBFormComponent
    ],
    providers: [],
})
export class AirExportModule { }
