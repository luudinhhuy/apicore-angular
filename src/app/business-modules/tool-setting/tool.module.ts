import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolRoutingModule } from './tool-routing.module';
import { IDDefinitionComponent } from './id-definition/id-definition.component';
import { KPIComponent } from './kpi/kpi.component';
import { SupplierComponent } from './supplier/supplier.component';
import { SharedModule } from '../../shared/shared.module';
import { SelectModule } from 'ng2-select';
import { FormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { LogViewerComponent } from './log-viewer/log-viewer.component';
@NgModule({
  imports: [
    CommonModule,
    ToolRoutingModule,
    SharedModule,
    SelectModule,
    FormsModule,
    NgxDaterangepickerMd,
  ],
  declarations: [IDDefinitionComponent, KPIComponent, SupplierComponent, LogViewerComponent]
})
export class ToolModule { }
