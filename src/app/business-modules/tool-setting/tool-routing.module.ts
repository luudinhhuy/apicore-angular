import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IDDefinitionComponent } from './id-definition/id-definition.component';
import { KPIComponent } from './kpi/kpi.component';
import { SupplierComponent } from './supplier/supplier.component';
import { LogViewerComponent } from './log-viewer/log-viewer.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'ecus-connection',
        pathMatch: 'full'
    },
    {
        path: 'ecus-connection', loadChildren: () => import('./ecus-connection/ecus-connection.module').then(m => m.EcusConectionModule),
        data: { name: 'Ecus Connection' }
    },
    {
        path: 'tariff', loadChildren: () => import('./tariff/tariff.module').then(m => m.TariffModule),
        data: { name: 'Tariff' }
    },
    {
        path: 'exchange-rate', loadChildren: () => import('./exchange-rate/exchange-rate.module').then(m => m.ExchangeRateModule),
        data: {
            name: "Exchange Rate",
        }
    },
    {
        path: 'unlock', loadChildren: () => import('./unlock/unlock.module').then(m => m.UnlockModule),
        data: { name: 'Unlock' }
    },
    {
        path: 'log-viewer',
        component: LogViewerComponent,
        data: {
            name: "Log Viewer",
            level: 2
        }
    },
    {
        path: 'id-definition',
        component: IDDefinitionComponent,
        data: {
            name: "ID Definition",
            level: 2
        }
    },
    {
        path: 'kpi',
        component: KPIComponent,
        data: {
            name: "KPI",
            level: 2
        }
    },
    {
        path: 'supplier',
        component: SupplierComponent,
        data: {
            name: "Supplier",
            level: 2
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ToolRoutingModule { }
