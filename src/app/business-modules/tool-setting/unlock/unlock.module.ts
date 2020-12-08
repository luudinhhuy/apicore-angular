import { NgModule } from '@angular/core';
import { UnlockComponent } from './unlock.component';
import { Route, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { TabsModule, ModalModule } from 'ngx-bootstrap';
import { UnlockShipmentComponent } from './components/unlock-shipment/unlock-shipment.component';
import { UnlockAccountingComponent } from './components/unlock-accounting/unlock-accouting.component';
import { SelectModule } from 'ng2-select';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UnlockHistoryPopupComponent } from './components/unlock-history/unlock-history.popup';

const routing: Route[] = [
    { path: '', component: UnlockComponent, data: { name: "" } },

];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routing),
        SharedModule,
        TabsModule.forRoot(),
        SelectModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        FormsModule
    ],
    exports: [],
    declarations: [
        UnlockComponent,
        UnlockShipmentComponent,
        UnlockAccountingComponent,
        UnlockHistoryPopupComponent
    ],
    providers: [],
})
export class UnlockModule { }
