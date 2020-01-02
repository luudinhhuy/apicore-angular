import { Injectable } from "@angular/core";
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from "@ngrx/effects";

import { DocumentationRepo } from "src/app/shared/repositories";

import { Observable, of } from "rxjs";

import { mergeMap, catchError, map, } from "rxjs/operators";
import {
    TransactionActionTypes, TransactionGetProfitSuccessAction, TransactionActions, TransactionGetProfitFailFailAction, ContainerAction, ContainerActionTypes, GetContainerSuccessAction, GetContainerFailAction, HBLActions, HBLActionTypes, GetDetailHBLSuccessAction, GetDetailHBLFailAction, GetProfitHBLSuccessAction, GetProfitHBLAction, GetContainersHBLSuccessAction, GetContainersHBLFailAction, TransactionGetDetailSuccessAction, TransactionGetDetailFailAction, TransactionUpdateSuccessAction, TransactionUpdateFailAction, TransactionLoadListSuccessAction, TransactionLoadListFailAction, GetListHBLSuccessAction, GetListHBLFailAction, DimensionActionTypes, GetDimensionSuccessAction, GetDimensionFailAction
} from "../actions";
import { ITransactionProfit } from "../reducers";

@Injectable()
export class ShareBussinessEffects {

    constructor(
        private actions$: Actions,
        private _documentRepo: DocumentationRepo
    ) { }


    @Effect()
    getListShipmentEffect$: Observable<Action> = this.actions$.
        pipe(
            ofType<TransactionActions>(TransactionActionTypes.LOAD_LIST),
            map((payload: any) => payload.payload),
            mergeMap(
                (param: any) => this._documentRepo.getListShipmentDocumentation(param.page, param.size, param.dataSearch)
                    .pipe(
                        map((data: any) => new TransactionLoadListSuccessAction(data)),
                        catchError(err => of(new TransactionLoadListFailAction(err)))
                    )
            )
        );

    @Effect()
    getDetailSeaFCLImportEffect$: Observable<Action> = this.actions$.
        pipe(
            ofType<TransactionActions>(TransactionActionTypes.GET_DETAIL),
            map((payload: any) => payload.payload),
            mergeMap(
                (id: string) => this._documentRepo.getDetailTransaction(id)
                    .pipe(
                        map((data: any) => new TransactionGetDetailSuccessAction(data)),
                        catchError(err => of(new TransactionGetDetailFailAction(err)))
                    )
            )
        );

    @Effect()
    updateCSTransaction$: Observable<Action> = this.actions$
        .pipe(
            ofType<TransactionActions>(TransactionActionTypes.UPDATE),
            map((payload: any) => payload.payload),
            mergeMap(
                (param: any) => this._documentRepo.updateCSTransaction(param)
                    .pipe(
                        map((data: CommonInterface.IResult) => new TransactionUpdateSuccessAction(data.data)),
                        catchError(err => of(new TransactionUpdateFailAction(err)))
                    )
            )
        );

    @Effect()
    getListContainerEffect$: Observable<Action> = this.actions$
        .pipe(
            ofType<ContainerAction>(ContainerActionTypes.GET_CONTAINER),
            map((payload: any) => payload.payload), // jobId
            mergeMap(
                (param: any) => this._documentRepo.getListContainersOfJob(param)
                    .pipe(
                        map((data: any) => new GetContainerSuccessAction(data)),
                        catchError(err => of(new GetContainerFailAction(err)))
                    ))
        );

    @Effect()
    getTotalProfitShipmentL$: Observable<Action> = this.actions$
        .pipe(
            ofType<TransactionActions>(TransactionActionTypes.GET_PROFIT),
            map((payload: any) => payload.payload),
            mergeMap(
                (jobId: string) => this._documentRepo.getShipmentTotalProfit(jobId)
                    .pipe(
                        map((data: ITransactionProfit[]) => new TransactionGetProfitSuccessAction(data)),
                        catchError(err => of(new TransactionGetProfitFailFailAction(err)))
                    ))
        );

    @Effect()
    getDetailHBL$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(HBLActionTypes.GET_DETAIL),
            map((payload: any) => payload.payload),
            mergeMap(
                (id: string) => this._documentRepo.getDetailHbl(id)
                    .pipe(
                        map((data: any) => new GetDetailHBLSuccessAction(data)),
                        catchError(err => of(new GetDetailHBLFailAction(err)))
                    )
            )
        );

    @Effect()
    getListHBL$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(HBLActionTypes.GET_LIST),
            map((payload: any) => payload.payload),
            mergeMap(
                (body: any) => this._documentRepo.getListHouseBillOfJob(body)
                    .pipe(
                        map((data: any) => new GetListHBLSuccessAction(data)),
                        catchError(err => of(new GetListHBLFailAction(err)))
                    )
            )
        );

    @Effect()
    getHBLProfit$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(HBLActionTypes.GET_PROFIT),
            map((payload: any) => payload.payload),
            mergeMap(
                (hblid: string) => this._documentRepo.getHBLTotalProfit(hblid)
                    .pipe(
                        map((data: any) => new GetProfitHBLSuccessAction(data)),
                        catchError(err => of(new GetProfitHBLAction(err)))
                    )
            )
        );

    @Effect()
    getListHBLContainerEffect$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(HBLActionTypes.GET_CONTAINERS),
            map((payload: any) => payload.payload), // jobId
            mergeMap(
                (param: any) => this._documentRepo.getListContainersOfJob(param)
                    .pipe(
                        map((data: any) => new GetContainersHBLSuccessAction(data)),
                        catchError(err => of(new GetContainersHBLFailAction(err)))
                    ))
        );

    @Effect()
    getListDimensionShipment$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(DimensionActionTypes.GET_DIMENSION),
            map((payload: any) => payload.payload), // jobId
            mergeMap(
                (jobId: string) => this._documentRepo.getShipmentDemensionDetail(jobId)
                    .pipe(
                        map((data: any) => new GetDimensionSuccessAction(data)),
                        catchError(err => of(new GetDimensionFailAction(err)))
                    ))
        );

    @Effect()
    getListDimensionHBL$: Observable<Action> = this.actions$
        .pipe(
            ofType<HBLActions>(DimensionActionTypes.GET_DIMENSION_HBL),
            map((payload: any) => payload.payload), // hblId
            mergeMap(
                (hblId: string) => this._documentRepo.getHBLDemensionDetail(hblId)
                    .pipe(
                        map((data: any) => new GetDimensionSuccessAction(data)),
                        catchError(err => of(new GetDimensionFailAction(err)))
                    ))
        );

}
