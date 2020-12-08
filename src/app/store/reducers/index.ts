import * as fromRouter from '@ngrx/router-store';
import { Params, RouterStateSnapshot, Data } from '@angular/router';
import { ActionReducerMap, createFeatureSelector, createSelector } from '@ngrx/store';
import { spinnerReducer, ISpinnerState } from './spinner.reducer';
import { catalogueReducer, ICatalogueState } from './catalogue.reducer';
import { IClaimUserState, claimUserReducer } from './claim.reducer';
import { IMenuState, menuReducer } from './menu.reducer';


export interface IRouterStateUrl {
    url: string;
    queryParams: Params;
    params: Params;
    data: Data;
}

export interface IAppState {
    routerReducer: fromRouter.RouterReducerState<IRouterStateUrl>;
    // spinnerReducer: ISpinnerState;
    catalogueReducer: ICatalogueState;
    claimReducer: IClaimUserState;
    menuReducer: IMenuState;
}

export const reducers: ActionReducerMap<IAppState> = {
    routerReducer: fromRouter.routerReducer,
    // spinnerReducer: spinnerReducer,
    catalogueReducer: catalogueReducer,
    claimReducer: claimUserReducer,
    menuReducer: menuReducer
};

// * Custom Serializer

export class CustomSerializer implements fromRouter.RouterStateSerializer<IRouterStateUrl> {
    serialize(routerStateSnapshot: RouterStateSnapshot): IRouterStateUrl {

        let state = routerStateSnapshot.root;

        while (state.firstChild) {
            state = state.firstChild;
        }

        const { url, root: { queryParams }, } = routerStateSnapshot;
        const { params, data } = state;

        return { url, params, queryParams, data };
    }
}

// * Selector

export const routerState = createFeatureSelector<fromRouter.RouterReducerState<IRouterStateUrl>>('routerReducer');
export const catalogueState = createFeatureSelector<any>('catalogueReducer');
export const claimUserState = createFeatureSelector<any>('claimReducer');
export const menuState = createFeatureSelector<any>('menuReducer');


export const getRouterState = createSelector(routerState, (state: fromRouter.RouterReducerState<IRouterStateUrl>) => state.state && state.state);
export const getQueryParamsRouterState = createSelector(routerState, (state: fromRouter.RouterReducerState<IRouterStateUrl>) => state.state && state.state.queryParams);
export const getParamsRouterState = createSelector(routerState, (state: fromRouter.RouterReducerState<IRouterStateUrl>) => state.state && state.state.params);
export const getUrlRouterState = createSelector(routerState, (state: fromRouter.RouterReducerState<IRouterStateUrl>) => state.state && state.state.url);
export const getDataRouterState = createSelector(routerState, (state: fromRouter.RouterReducerState<IRouterStateUrl>) => state.state && state.state.data);

// * CATALOGUE 

export const getCataloguePortState = createSelector(catalogueState, (state: ICatalogueState) => state && state.ports);
export const getCataloguePortLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueWarehouseState = createSelector(catalogueState, (state: ICatalogueState) => state && state.warehouses);
export const getCatalogueWarehouseLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);


export const getCatalogueCarrierState = createSelector(catalogueState, (state: ICatalogueState) => state && state.carriers);
export const getCatalogueCarrierLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueAgentState = createSelector(catalogueState, (state: ICatalogueState) => state && state.agents);
export const getCatalogueAgentLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueUnitState = createSelector(catalogueState, (state: ICatalogueState) => state && state.units);
export const getCatalogueUnitLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCommodityState = createSelector(catalogueState, (state: ICatalogueState) => state && state.commodities);
export const getCatalogueCommodityLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCommodityGroupState = createSelector(catalogueState, (state: ICatalogueState) => state && state.commodityGroups);
export const getCatalogueCommodityGroupLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCustomerState = createSelector(catalogueState, (state: ICatalogueState) => state && state.customers);
export const getCatalogueCustomerLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCountryState = createSelector(catalogueState, (state: ICatalogueState) => state && state.countries);
export const getCatalogueCountryLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

export const getCatalogueCurrencyState = createSelector(catalogueState, (state: ICatalogueState) => state && state.currencies);
export const getCatalogueCurrencyLoadingState = createSelector(catalogueState, (state: ICatalogueState) => state && state.isLoading);

// * SPINNER
export const isSpinnerShowing = createSelector(spinnerReducer, (state: ISpinnerState) => state.show);

// * CLAIM USER
export const getClaimUserState = createSelector(claimUserState, (state: IClaimUserState) => state);
export const getClaimUserOfficeState = createSelector(claimUserState, (state: IClaimUserState) => state && state.officeId);
export const getClaimUserDepartGrouptate = createSelector(claimUserState, (state: IClaimUserState) => state && { departmentId: state.departmentId, groupId: state.groupId });

// * Menu
export const getMenuPermissionState = createSelector(menuState, (state: IMenuState) => state);
export const getMenuUserPermissionState = createSelector(menuState, (state: IMenuState) => state && state.permission);

