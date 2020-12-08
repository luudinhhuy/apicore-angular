import { Action } from '@ngrx/store';


export enum OPSActionTypes {
    GET_DETAIL = '[OPS] Get Detail',
    GET_DETAIL_SUCCESS = '[OPS] Get Detail Success',
    GET_DETAIL_FAIL = '[OPS] Get Detail Fail',
};


export class OPSTransactionGetDetailAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL;

    constructor(public payload: any) { }
}

export class OPSTransactionGetDetailSuccessAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL_SUCCESS;

    constructor(public payload: any) { }
}

export class OPSTransactionGetDetailFailAction implements Action {
    readonly type = OPSActionTypes.GET_DETAIL_FAIL;

    constructor(public payload: any) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type OPSActions
    = OPSTransactionGetDetailAction
    | OPSTransactionGetDetailFailAction
    | OPSTransactionGetDetailSuccessAction;
