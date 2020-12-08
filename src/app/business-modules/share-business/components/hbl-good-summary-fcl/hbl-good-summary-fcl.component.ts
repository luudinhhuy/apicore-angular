import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActionsSubject, Store } from '@ngrx/store';
import { Params } from '@angular/router';

import { Container } from 'src/app/shared/models/document/container.model';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { Unit, HouseBill } from 'src/app/shared/models';

import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, skip, takeUntil } from 'rxjs/operators';
import _groupBy from 'lodash/groupBy';

import * as fromStore from '../../store';
import { getParamsRouterState } from 'src/app/store';
import { GetContainerAction } from '../../store';
import { AppPage } from 'src/app/app.base';
import { ConfirmPopupComponent } from '@common';
import { ShareBussinessHBLFCLContainerPopupComponent } from '../hbl-fcl-container/hbl-fcl-container.popup';


@Component({
    selector: 'hbl-goods-summary-fcl',
    templateUrl: './hbl-good-summary-fcl.component.html'
})

export class ShareBussinessHBLGoodSummaryFCLComponent extends AppPage implements OnInit {

    @ViewChild(ShareBussinessHBLFCLContainerPopupComponent, { static: false }) containerPopup: ShareBussinessHBLFCLContainerPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmRefresh: ConfirmPopupComponent;
    @Input() type: string = 'import';

    packageQty: number = null;
    containerDescription: string = '';

    packages: Unit[];
    selectedPackage: number;

    mblid: string = null;
    hblid: string = null;
    description: string = 'AS PER BILL OF LADING';
    commodities: string = null;
    containerDetail: string = '';

    grossWeight: number = null;
    netWeight: number = null;
    totalChargeWeight: number = null;
    totalCBM: number = null;

    containers: Container[] = [];

    isSave: boolean = false;

    constructor(
        protected _actionStoreSubject: ActionsSubject,
        protected _store: Store<fromStore.IContainerState>,
        private _catalogueRepo: CatalogueRepo
    ) {
        super();

        this._catalogueRepo.getUnit({ active: true, unitType: CommonEnum.UnitType.PACKAGE })
            .pipe(catchError(this.catchError))
            .subscribe(
                (units: Unit[]) => { this.packages = units || []; }
            );

    }

    ngOnInit() {
        this._store.select(getParamsRouterState).subscribe(
            (p: Params) => {
                this.hblid = p['hblId'];
                this.mblid = p['jobId'];
            }
        );

        this._store.select(fromStore.getHBLContainersState)
            .pipe(skip(1))
            .subscribe(
                (containers: Container[]) => {
                    this.containers = containers;
                }
            );

        this.isLocked = this._store.select(fromStore.getTransactionLocked);

        this._store.select(fromStore.getDetailHBlState)
            .pipe(skip(1))
            .subscribe(
                (res: HouseBill) => {
                    if (!!res.id) {
                        this.totalCBM = res.cbm;
                        this.netWeight = res.netWeight;
                        this.totalChargeWeight = res.chargeWeight;
                        this.grossWeight = res.grossWeight;
                        this.containerDetail = res.packageContainer;
                        this.commodities = res.commodity;
                        this.description = res.desOfGoods;
                        this.selectedPackage = res.packageType;
                        this.containerDescription = res.contSealNo;
                    }
                }
            );
    }

    updateData(containers: Container[] | any) {
        // * Description, Commondity.
        if (!this.description) {
            this.description = (containers || []).filter((c: Container) => Boolean(c.description)).reduce((acc: string, curr: Container) => acc += curr.description + "\n", '');
        }

        const comoditiesName: string[] = containers.map((c: Container) => c.commodityName);

        if (!this.commodities) {
            this.commodities = comoditiesName
                .filter((item: string, index: number) => Boolean(item) && comoditiesName.indexOf(item) === index)
                .reduce((acc: string, curr: any) => acc += curr + "\n", '');
        }

        // * GW, Nw, CW, CBM
        this.grossWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.gw, 0);
        this.netWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.nw, 0);
        this.totalChargeWeight = (containers || []).reduce((acc: string, curr: Container) => acc += curr.chargeAbleWeight, 0);
        this.totalCBM = (containers || []).reduce((acc: string, curr: Container) => acc += curr.cbm, 0);
        this.packageQty = (containers || []).reduce((acc: string, curr: Container) => acc += curr.packageQuantity, 0);

        if (!!containers.length && !this.selectedPackage || containers.length === 1) {
            if (!!containers[0].packageTypeId) {
                this.selectedPackage = this.packages.find((unit: Unit) => unit.id === containers[0].packageTypeId).id;
            }
        }

        // * Container
        this.containerDetail = '';
        this.containerDescription = '';

        containers.forEach((c: Container) => {
            this.containerDescription += this.handleStringContSeal(c.containerNo, c.containerTypeName, c.sealNo);
        });

        const contObject: any[] = (containers || []).map((container: Container | any) => ({
            cont: container.containerTypeName || '',
            quantity: container.quantity,
            isPartOfContainer: container.isPartOfContainer
        }));

        const contData = [];
        for (const item of Object.keys(_groupBy(contObject, 'cont'))) {
            contData.push({
                cont: item,
                quantity: _groupBy(contObject, 'cont')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b)
            });
        }

        for (const item of contObject) {
            if (item.isPartOfContainer) {
                this.containerDetail += "A Part Of ";
            }
            this.containerDetail += this.handleStringCont(item);
        }
        this.containerDetail = this.containerDetail.trim().replace(/\,$/, "");
    }

    initContainer() {
        this._store.dispatch(new fromStore.InitContainerAction([]));
    }

    handleStringCont(contOb: { cont: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.cont + ', ';
    }

    handleStringPackage(contOb: { package: string, quantity: number }) {
        return contOb.quantity + 'x' + contOb.package + ', ';
    }

    openContainerListPopup() {
        this.containerPopup.mblid = this.mblid;
        this.containerPopup.hblid = this.hblid;

        if ((!!this.mblid && !!this.hblid) && !this.isSave) {
            this._store.dispatch(new GetContainerAction({ mblid: this.mblid }));
        }

        if ((!!this.hblid && !!this.mblid) && !this.isSave) {
            this._store.dispatch(new GetContainerAction({ hblId: this.hblid }));
        }

        this.containerPopup.show();
    }

    refresh() {
        this.confirmRefresh.show();
    }


    handleStringContSeal(contNo: string = '', contType: string = '', sealNo: string = '') {
        return `${!!contNo ? contNo + '/' : ''}${!!contType ? contType : ''}${!!sealNo ? '/' : ''}${!!sealNo ? sealNo : ''}\n`;
    }

    onRefresh() {
        this.confirmRefresh.hide();

        this.description = '';
        this.commodities = '';
        this.updateData(this.containers);
    }

    onChangeContainer(container: Container[]) {
        this.isSave = true;
        this.containers = container;
        this.updateData(container);
    }
}
