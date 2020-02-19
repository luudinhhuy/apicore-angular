import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SystemRepo } from './shared/repositories/system.repo';
import { HttpErrorResponse } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { IAppState } from './store/reducers';
import { MenuUpdatePermissionAction } from './store/actions';

@Injectable()
export class MenuResolveGuard implements Resolve<any> {

    constructor(
        private _systemRepo: SystemRepo,
        private _router: Router,
        private _store: Store<IAppState>
    ) {
    }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        const pathArray = state.url.split("/");
        if (!!pathArray[3]) {
            return this._systemRepo.getUserPermissionByMenu(pathArray[3])
                .pipe()
                .subscribe(
                    (res: SystemInterface.IUserPermission) => {
                        console.log(res);

                        // * Dispatch to redux.
                        this._store.dispatch(new MenuUpdatePermissionAction(res));
                        if (!!res && !res.access) {
                            this._router.navigate(["/login"]);
                        }
                    },
                    (err: HttpErrorResponse | any) => {
                        switch (err.status) {
                            // case 403:
                            //     // TODO redirect to forbidden page.
                            //     break;
                            default:
                                this._router.navigate(["/login"]);
                                break;
                        }
                    }
                );
        }

    }
}
