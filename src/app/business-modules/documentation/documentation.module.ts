import { NgModule } from '@angular/core';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { SeaConsolExportComponent } from './sea-consol-export/sea-consol-export.component';
import { SeaConsolImportComponent } from './sea-consol-import/sea-consol-import.component';
import { InlandTruckingComponent } from './inland-trucking/inland-trucking.component';

@NgModule({
  imports: [
    DocumentationRoutingModule
  ],
  declarations: [
    SeaConsolExportComponent,
    SeaConsolImportComponent,
    InlandTruckingComponent,
  ]
})
export class DocumentationModule { }
