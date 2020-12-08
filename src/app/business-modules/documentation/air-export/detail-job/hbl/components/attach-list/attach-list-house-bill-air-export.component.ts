import { Component, OnInit } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { IShareBussinessState, getDetailHBlState } from '@share-bussiness';
import { Store } from '@ngrx/store';
import { HouseBill } from '@models';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'air-export-hbl-attach-list',
    templateUrl: './attach-list-house-bill-air-export.component.html',
})
export class AirExportHBLAttachListComponent extends AppForm implements OnInit {

    attachList: string = '';

    constructor(
        private _store: Store<IShareBussinessState>
    ) {
        super();
    }

    ngOnInit(): void {
        this._store.select(getDetailHBlState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                (hbl: HouseBill) => {
                    if (!!hbl && !!hbl.id) {
                        this.attachList = hbl.attachList;
                    }
                }
            );
    }


}
