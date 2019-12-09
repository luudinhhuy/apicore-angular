import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { catchError, skip } from 'rxjs/operators';

import * as fromStore from './../../store';

@Component({
    selector: 'shipment-good-summary-lcl',
    templateUrl: './shipment-good-summary-lcl.component.html'
})

export class ShareBussinessShipmentGoodSummaryLCLComponent extends AppForm implements OnInit {

    packages: CommonInterface.INg2Select[];
    commodities: string = null;
    gw: number = null;
    cbm: number = null;
    packageQuantity: number = null;
    packageTypes: CommonInterface.INg2Select[] = [];

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<fromStore.IShareBussinessState>
    ) {
        super();
    }

    ngOnInit() {
        this.getPackage();

        this._store.select(fromStore.getTransactionDetailCsTransactionState)
            .pipe(skip(1))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.commodities = res.commodity;
                        this.gw = res.grossWeight;
                        this.packageQuantity = res.packageQty;
                        this.cbm = res.cbm;
                    }
                }
            );
    }

    getPackage() {
        this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.packages = this.utility.prepareNg2SelectData(res, 'code', 'unitNameEn');
                }
            );
    }

    selected($event: any) {
        if (!this.packageTypes.length) {
            this.packageTypes.push($event);
        }
        console.log(this.packageTypes);
    }

    removed($event: any) {
        console.log(this.packageTypes);
    }
}
