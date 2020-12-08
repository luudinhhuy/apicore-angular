
import { Component } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NgProgress, NgProgressRef } from '@ngx-progressbar/core';
import { OAuthService, OAuthEvent, OAuthInfoEvent, TokenResponse } from 'angular-oauth2-oidc';
import { ToastrService } from 'ngx-toastr';
import { JwtService } from './shared/services/jwt.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    isLoading: boolean = false;
    progressRef: NgProgressRef;

    constructor(
        private router: Router,
        private _ngProgressService: NgProgress,
        private oauthService: OAuthService,
        private _toast: ToastrService,
        private _jwt: JwtService
    ) {
        this.progressRef = this._ngProgressService.ref();
        this.oauthService.setStorage(localStorage);
        // this.oauthService.setupAutomaticSilentRefresh();
    }

    ngOnInit() {
        this.router.events.subscribe((event: Event) => {
            switch (true) {
                case event instanceof NavigationStart: {
                    this.isLoading = true;
                    this.progressRef.start();
                    break;
                }

                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    this.progressRef.complete();
                    break;
                }
                default: {
                    break;
                }
            }
        });

        this.oauthService.events.subscribe(
            (e: OAuthEvent) => {
                console.log(e);
                if (e instanceof OAuthInfoEvent) {
                    if (e.type === 'token_expires') {
                        this.oauthService.refreshToken().then(
                            (res: TokenResponse | any) => {
                                this._jwt.saveTokenID('efms');
                            }
                        );
                    }
                    if (e.type === 'logout') {
                        this._toast.info('successfully', e.type);
                    }
                }
            });
    }
}
