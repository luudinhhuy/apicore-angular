import { Component } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { SortService } from 'src/app/shared/services';

@Component({
    selector: 'app-sea-fcl-export-bill-detail',
    templateUrl: './sea-fcl-export-bill-detail.component.html'
})
export class SeaFclExportBillDetailComponent extends AppList {
    housebills: any[] = [];
    headers: CommonInterface.IHeaderTable[];

    constructor(private _sortService: SortService) {
        super();
        this.requestSort = this.sortLocal;
    }

    ngOnInit() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true, width: 100 },
            { title: 'Description', field: 'desOfGoods', sortable: true },
            { title: 'Shipping Marks', field: 'shippingMark', sortable: true },
            { title: 'Containers', field: 'contSealNo', sortable: true },
            { title: 'Packages', field: 'packageContainer', sortable: true },
            { title: 'G.W', field: 'gw', sortable: true },
            { title: 'CBM', field: 'cbm', sortable: true }
        ];
    }
    sortLocal(sort: string): void {
        this.housebills = this._sortService.sort(this.housebills, sort, this.order);
    }
}
