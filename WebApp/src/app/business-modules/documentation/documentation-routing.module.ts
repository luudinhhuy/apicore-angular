import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AirExportComponent } from './air-export/air-export.component';
import { AirImportComponent } from './air-import/air-import.component';
import { InlandTruckingComponent } from './inland-trucking/inland-trucking.component';
import { SeaConsolExportComponent } from './sea-consol-export/sea-consol-export.component';
import { SeaConsolImportComponent } from './sea-consol-import/sea-consol-import.component';
import { SeaLCLExportComponent } from './sea-lcl-export/sea-lcl-export.component';
import { SeaLclExportCreateComponent } from './sea-lcl-export-create/sea-lcl-export-create.component';
import { SeaLclExportHousebillAddnewComponent } from './sea-lcl-export-create/sea-lcl-export-housebill-addnew/sea-lcl-export-housebill-addnew.component';
import { SeaLclExportManifestComponent } from './sea-lcl-export-create/sea-lcl-export-manifest/sea-lcl-export-manifest.component';
import { SeaLclExportShippingInstructionComponent } from './sea-lcl-export-create/sea-lcl-export-shipping-instruction/sea-lcl-export-shipping-instruction.component';

const routes: Routes = [

    {
        path: '',
        redirectTo: 'inland-trucking',
        pathMatch: 'full'
    },
    {
        path: 'inland-trucking',
        component: InlandTruckingComponent,
        data: {
            name: "Inland Trucking",
            level: 2
        },
    },
    {
        path: 'air-export',
        component: AirExportComponent,
        data: {
            name: "Air Export",
            level: 2
        }
    },
    {
        path: 'air-import',
        component: AirImportComponent,
        data: {
            name: "Air Import",
            level: 2
        }
    },
    {
        path: 'sea-consol-export',
        component: SeaConsolExportComponent,
        data: {
            name: "Sea Consol Export",
            level: 2
        }
    },
    {
        path: 'sea-consol-import',
        component: SeaConsolImportComponent,
        data: {
            name: "Sea Consol Import",
            level: 2
        }
    },

    {
        path: 'sea-fcl-import', loadChildren: () => import('./sea-fcl-import/sea-fcl-import.module').then(m => m.SeaFCLImportModule),
    },
    {
        path: 'sea-fcl-export', loadChildren: () => import('./sea-fcl-export/sea-fcl-export.module').then(m => m.SeaFCLExportModule),
    },
    {
        path: 'sea-lcl-import', loadChildren: () => import('./sea-lcl-import/sea-lcl-import.module').then(m => m.SeaLCLImportModule),

    },
    {
        path: 'sea-lcl-export', loadChildren: () => import('./sea-lcl-export/sea-lcl-export.module').then(m => m.SeaLCLExportModule),

    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DocumentationRoutingModule { }
