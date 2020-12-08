import { createFeatureSelector, createSelector, ActionReducerMap } from "@ngrx/store";
import { opsReducer, IOPSTransactionState } from "./operation.reducer";

export interface IOperationState {
    transaction: IOPSTransactionState;
}

export const OperationState = createFeatureSelector<IOperationState>('operations');

export const getOperationState = createSelector(OperationState, (state: IOperationState) => state);
export const getOperationTransationState = createSelector(OperationState, (state: IOperationState) => state && state.transaction);

export const reducers: ActionReducerMap<IOperationState> = {
    transaction: opsReducer,
}

