import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DIM } from '@models';
import { ToastrService } from 'ngx-toastr';

import { PopupBase } from 'src/app/popup.base';
import { SystemConstants } from 'src/constants/system.const';

import { skip, takeUntil, catchError } from 'rxjs/operators';

import * as fromStore from './../../store';
import { DocumentationRepo } from '@repositories';
import { ConfirmPopupComponent } from '@common';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'dim-volume-popup',
    templateUrl: './dim-volume.popup.html'
})

export class ShareBusinessDIMVolumePopupComponent extends PopupBase implements OnInit {
    @ViewChild('confirmDeleteDim', { static: false }) confirmDeleteDIMpopup: ConfirmPopupComponent;


    @Output() onUpdate: EventEmitter<DIM[]> = new EventEmitter<DIM[]>();

    jobId: string;

    dims: DIM[] = [];
    dimsTemp: DIM[] = []; // dim temp;

    hwConstant: number = SystemConstants.HW_AIR_CONSTANT; // ? 6000
    cbmConstant: number = SystemConstants.CBM_AIR_CONSTANT; // ? 166.67

    totalHW: number = null;
    totalCBM: number = null;

    isCBMChecked: boolean = false;
    isShowGetFromHAWB: boolean = true;

    selectedIndexDIMItem: number;

    constructor(
        private _toastService: ToastrService,
        private _store: Store<fromStore.IShareBussinessState>,
        private _documentRepo: DocumentationRepo
    ) {
        super();
    }

    ngOnInit() {
        this._store.select<any>(fromStore.getDimensionVolumesState)
            .pipe(
                skip(1),
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (dims: DIM[]) => {
                    this.dims = dims;
                    this.dimsTemp = cloneDeep(dims);

                    this.calculateHWDimension();
                }
            );
    }

    addDIM() {
        this.isSubmitted = false;
        // this.dims.push(new DIM());
        this.dimsTemp.push(new DIM());
    }

    delete(dimItem: DIM, index: number) {
        this.selectedIndexDIMItem = index;
        if (dimItem.id === SystemConstants.EMPTY_GUID) {
            this.isSubmitted = false;
            this.dimsTemp.splice(index, 1);

            this.calculateHWDimension();
        } else {
            this.confirmDeleteDIMpopup.show();
        }
    }

    onDeleteDIMItem() {
        this.isSubmitted = false;
        this.dimsTemp.splice(this.selectedIndexDIMItem, 1);

        this.calculateHWDimension();
    }

    saveDIM() {
        // if (!this.dims.length) {
        //     this._toastService.warning("Please Add Dimension Information");
        //     return;
        // }
        this.isSubmitted = true;

        if (!this.checkValidate()) {
            return;
        } else {
            this.isSubmitted = false;

            this.dims = cloneDeep(this.dimsTemp);

            this.onUpdate.emit(this.dims);
            this.hide();
        }
    }

    closePopup() {
        this.dimsTemp = cloneDeep(this.dims);
        this.isSubmitted = false;

        this.hide();
    }

    updateHeightWeight(dimItem: DIM) {
        // dimItem.hw = +((dimItem.length * dimItem.height * dimItem.width / this.hwContstant) * dimItem.package).toFixed(3);
        // dimItem.cbm = +((dimItem.length * dimItem.height * dimItem.width / this.hwContstant / this.cbmConstant) * dimItem.package).toFixed(3);
        dimItem.hw = this.utility.calculateHeightWeight(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwConstant);
        dimItem.cbm = this.utility.calculateCBM(dimItem.width, dimItem.height, dimItem.length, dimItem.package, this.hwConstant);

        this.updateTotalHeightWeight();
        this.updateCBM();
    }

    calculateHWDimension() {
        if (!!this.dimsTemp.length) {
            for (const item of this.dimsTemp) {
                this.updateHeightWeight(item);
            }
        } else {
            this.totalCBM = this.totalHW = 0;
        }
    }

    updateTotalHeightWeight() {
        this.totalHW = +this.dimsTemp.reduce((acc: number, curr: DIM) => acc += curr.hw, 0).toFixed(3);
    }

    updateCBM() {
        this.totalCBM = +this.dimsTemp.reduce((acc: number, curr: DIM) => acc += curr.cbm, 0).toFixed(3);
    }

    checkValidate() {
        let valid: boolean = true;
        for (const item of this.dimsTemp) {
            if (
                item.length === null
                || item.width === null
                || item.height === null
                || item.package === null
            ) {
                valid = false;
                break;
            }
        }
        return valid;
    }

    onGetDimsFromHAWB() {
        if (!!this.jobId) {
            this._documentRepo.getHouseDIMByJob(this.jobId).pipe(
                catchError(this.catchError)
            ).subscribe(
                (res: DIM[]) => {
                    if (!!res && !!res.length) {
                        this.dimsTemp.length = 0;
                        this.dimsTemp = cloneDeep(res);

                        this.calculateHWDimension();
                    } else {
                        this._toastService.warning("Not found DIMs from HAWB");
                    }
                }
            );
        }
    }
}
