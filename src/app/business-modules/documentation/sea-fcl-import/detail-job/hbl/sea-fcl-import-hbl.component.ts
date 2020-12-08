import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppShareHBLBase, IShareBussinessState } from '@share-bussiness';

import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-sea-fcl-import-hbl',
    templateUrl: './sea-fcl-import-hbl.component.html',
})
export class SeaFCLImportHBLComponent extends AppShareHBLBase {
    constructor(
        private _router: Router,
        protected _sortService: SortService,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
        protected _store: Store<IShareBussinessState>,
        protected _activedRoute: ActivatedRoute,
        protected _spinner: NgxSpinnerService
    ) {
        super(_sortService, _store, _spinner, _progressService, _toastService, _documentRepo);
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
        }
    }

    gotoCreate() {
        this._router.navigate([`/home/documentation/sea-fcl-import/${this.jobId}/hbl/new`]);
    }


    gotoDetail(id: string) {
        this._documentRepo.checkDetailShippmentPermission(this.shipmentDetail.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`/home/documentation/sea-fcl-import/${this.jobId}/hbl/${id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    duplicateConfirm() {
        this._router.navigate([`home/documentation/sea-fcl-import/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }

    gotoList() {
        this._router.navigate(["home/documentation/sea-fcl-import"]);
    }
}
