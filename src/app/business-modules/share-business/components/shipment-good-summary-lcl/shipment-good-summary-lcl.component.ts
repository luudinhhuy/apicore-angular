import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';

import * as fromStore from './../../store';

import { catchError, skip } from 'rxjs/operators';



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
        private _store: Store<fromStore.IShareBussinessState>,
        private _dataService: DataService
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

                        // * Update package type.
                        const packageTypesTemp: CommonInterface.INg2Select[] =
                            (res.packageType || '').split(',').map((i: string) => <CommonInterface.INg2Select>({
                                id: i,
                                text: i,
                            }));
                        const packageTypes = [];
                        packageTypesTemp.forEach((type: CommonInterface.INg2Select) => {
                            const dataTempInPackages = (this.packages || []).find((t: CommonInterface.INg2Select) => t.id === type.id);
                            if (!!dataTempInPackages) {
                                packageTypes.push(dataTempInPackages);
                            }
                        });

                        this.packageTypes = packageTypes;
                    }
                }
            );
    }

    getPackage() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.PACKAGE)) {
            this.packages = this.utility.prepareNg2SelectData(this._dataService.getDataByKey(SystemConstants.CSTORAGE.PACKAGE), 'code', 'unitNameEn');
        } else {
            this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE })
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        this.packages = this.utility.prepareNg2SelectData(res, 'code', 'unitNameEn');
                    }
                );
        }
    }

    selected($event: any) {
        if (!this.packageTypes.length) {
            this.packageTypes.push($event);
        }
    }

    removed($event: any) {
    }
}
