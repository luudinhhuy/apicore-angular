import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InlandTruckingComponent } from './inland-trucking/inland-trucking.component';
import { SeaConsolExportComponent } from './sea-consol-export/sea-consol-export.component';
import { SeaConsolImportComponent } from './sea-consol-import/sea-consol-import.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'air-export',
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
        path: 'air-export', loadChildren: () => import('./air-export/air-export.module').then(m => m.AirExportModule),
        data: {
            name: 'Air Export',
        }
    },
    {
        path: 'air-import', loadChildren: () => import('./air-import/air-import.module').then(m => m.AirImportModule),
        data: {
            name: 'Air Import',
        }
    },
    {
        path: 'sea-fcl-export', loadChildren: () => import('./sea-fcl-export/sea-fcl-export.module').then(m => m.SeaFCLExportModule),
        data: {
            name: 'Sea FCL Export',
            path: '/'
        }
    },
    {
        path: 'sea-fcl-import', loadChildren: () => import('./sea-fcl-import/sea-fcl-import.module').then(m => m.SeaFCLImportModule),
        data: {
            name: 'Sea FCL Import',
            path: '/'
        }
    },
    {
        path: 'sea-lcl-export', loadChildren: () => import('./sea-lcl-export/sea-lcl-export.module').then(m => m.SeaLCLExportModule),
        data: {
            name: 'Sea LCL Export',
            path: '/'
        }

    },
    {
        path: 'sea-lcl-import', loadChildren: () => import('./sea-lcl-import/sea-lcl-import.module').then(m => m.SeaLCLImportModule),
        data: {
            name: 'Sea LCL Import',
            path: '/'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DocumentationRoutingModule { }
