import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ShareAccountingInputShipmentPopupComponent } from './components/input-shipment/input-shipment.popup';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap';
import { FormsModule } from '@angular/forms';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ModalModule.forRoot(),

    ],
    exports: [ShareAccountingInputShipmentPopupComponent],
    declarations: [ ShareAccountingInputShipmentPopupComponent ],
    providers: [],
})
export class ShareAccountingModule { }
