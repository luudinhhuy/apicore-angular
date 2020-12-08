import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { DocumentationRepo } from '@repositories';
import { SortService } from '@services';
import { AppShareHBLBase, IShareBussinessState } from '@share-bussiness';
import { NgxSpinnerService } from 'ngx-spinner';

import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-air-export-hbl',
    templateUrl: './air-export-hbl.component.html'
})

export class AirExportHBLComponent extends AppShareHBLBase implements OnInit {
    serviceType: CommonType.SERVICE_TYPE = 'air';

    constructor(
        private _router: Router,
        protected _store: Store<IShareBussinessState>,
        protected _documentRepo: DocumentationRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
        protected _spinner: NgxSpinnerService,
        protected _sortService: SortService
    ) {
        super(_sortService, _store, _spinner, _progressService, _toastService, _documentRepo);
    }

    gotoList() {
        this._router.navigate(["home/documentation/air-export"]);
    }

    gotoCreate() {
        this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/new`]);
    }

    gotoDetail(id: string) {
        this._documentRepo.checkDetailShippmentPermission(this.shipmentDetail.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this._router.navigate([`/home/documentation/air-export/${this.jobId}/hbl/${id}`]);
                    } else {
                        this.info403Popup.show();
                    }
                },
            );
    }

    onSelectTab(tabName: string) {
        switch (tabName) {
            case 'shipment':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'SHIPMENT' } });
                break;
            case 'cdNote':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'CDNOTE' } });
                break;
            case 'assignment':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'ASSIGNMENT' } });
                break;
            case 'files':
                this._router.navigate([`home/documentation/air-export/${this.jobId}`], { queryParams: { tab: 'FILES' } });
                break;
        }
    }

    duplicateConfirm() {
        this._router.navigate([`home/documentation/air-export/${this.jobId}`], {
            queryParams: Object.assign({}, { tab: 'SHIPMENT' }, { action: 'copy' })
        });
    }
}
