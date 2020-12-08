import { OpsTransaction } from "@models";
import { OPSActions, OPSActionTypes } from "../actions/operation.action";

export interface IOPSTransactionState {
    opstransaction: OpsTransaction;
    isLoading: boolean;
    isLoaded: boolean;
};

const initialState: IOPSTransactionState = {
    opstransaction: new OpsTransaction(),
    isLoaded: false,
    isLoading: false
};

export function opsReducer(state = initialState, action: OPSActions): IOPSTransactionState {
    switch (action.type) {
        case OPSActionTypes.GET_DETAIL: {
            return { ...state, isLoading: true, isLoaded: false };
        }

        case OPSActionTypes.GET_DETAIL_SUCCESS: {
            return { ...state, opstransaction: action.payload };
        }

        default: {
            return state;
        }
    }
}