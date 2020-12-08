import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PLReportComponent } from './p-l-report/p-l-report.component';
import { PerformanceReportComponent } from './performance-report/performance-report.component';
import { ShipmentOverviewComponent } from './shipment-overview/shipment-overview.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pl-report'
  },
  {
    path: 'pl-report',
    component: PLReportComponent
  },
  {
    path: 'performance-report',
    component: PerformanceReportComponent
  },
  {
    path: 'shipment-overview',
    component: ShipmentOverviewComponent
  },
  {
    path: 'general-report', loadChildren: () => import('./general-report/general-report.module').then(m => m.GeneralReportModule),
    data: { name: 'General Report' }
  },
  {
    path: 'sale-report', loadChildren: () => import('./sale-report/sale-report.module').then(m => m.SaleReportModule),
    data: { name: 'Sale Report' }
  },
  {
    path: 'sheet-debit-report', loadChildren: () => import('./sheet-debit-report/sheet-debit-report.module').then(m => m.SheetDebitReportModule),
    data: { name: 'Sheet Debit Report' }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
