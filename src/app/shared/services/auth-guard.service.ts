import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtService } from './jwt.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.checkLoginSession()) {
            this._router.navigate(['/login',]);
            return false;
        } else {
            return true;
        }
    }

    constructor(
        private _jwt: JwtService,
        private _router: Router,
    ) { }

    checkLoginSession(): boolean {
        if (this._jwt.hasValidAccessToken() === false) {
            this._jwt.destroyToken();
            this._jwt.destroyRefreshToken();
            this._jwt.destroyExpiresAt();
            this._jwt.destroyIdToken();
            this._jwt.destroyAccessTokenStoredAt();
            this._jwt.destroyClaim();
            return false;
        } else {
            return true;
        }
    }
}





