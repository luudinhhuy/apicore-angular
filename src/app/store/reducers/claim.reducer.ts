import { ClaimUserActions, ClaimUserActionTypes } from "../actions";

export interface IClaimUserState extends SystemInterface.IClaimUser {
    id: string;
    companyId: string;
    email: string;
    employeeId: string;
    officeId: string;
    preferred_username: string;
    phone_number: string;
    sub: string;
    userName: string;
    departmentId: number;
    groupId: number;
}

const initialState: IClaimUserState = {
    id: null,
    companyId: null,
    email: null,
    employeeId: null,
    officeId: null,
    preferred_username: null,
    phone_number: null,
    sub: null,
    userName: null,
    departmentId: null,
    groupId: null,
};

export function claimUserReducer(state = initialState, action: ClaimUserActions): IClaimUserState {
    switch (action.type) {
        case ClaimUserActionTypes.UPDATE: {
            return { ...state, ...action.payload };
        }

        case ClaimUserActionTypes.CHANGE_OFFICE: {
            return { ...state, officeId: action.payload };
        }

        case ClaimUserActionTypes.CHANGE_GROUP: {
            return { ...state, departmentId: action.payload.departmentId, groupId: action.payload.groupId };
        }

        default: {
            return state;
        }
    }
}