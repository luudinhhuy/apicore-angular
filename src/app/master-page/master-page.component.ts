import { Component, OnInit, ViewChild } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Office } from '@models';

import { environment } from 'src/environments/environment';
import { IAppState } from '../store/reducers';
import { SystemConstants } from 'src/constants/system.const';
import { RSAHelper } from 'src/helper/RSAHelper';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

import crypto_js from 'crypto-js';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JwtService } from '@services';
import { HeaderComponent } from './header/header.component';
import { ChangeOfficeClaimUserAction } from '@store';

@Component({
    selector: 'app-master-page',
    templateUrl: './master-page.component.html',
})
export class MasterPageComponent implements OnInit {

    @ViewChild(HeaderComponent, { static: false }) headerComponent: HeaderComponent;

    selectedOffice: Office;
    selectedDepartGroup: SystemInterface.IDepartmentGroup;

    password: string;
    username: string;

    isChangeOffice: boolean = false;
    isChangeDepartgroup: boolean = false;

    ngUnsubscribe: Subject<number> = new Subject();

    constructor(
        private _jwtService: JwtService,
        private oauthService: OAuthService,
        private http: HttpClient,
        private cookieService: CookieService,
        private _toastService: ToastrService,
        private _spinner: NgxSpinnerService,
        private _store: Store<IAppState>
    ) {

    }

    ngOnInit() {
        // interval(3000000)
        //     .pipe(takeUntil(this.ngUnsubscribe))
        //     .subscribe(
        //         () => {
        //             console.log("checking token expired...");
        //             const remainingMinutes: number = this._jwtService.remainingExpireTimeToken();
        //             console.log(remainingMinutes)
        //             if (remainingMinutes <= 3 && remainingMinutes >= 0) {
        //                 this._toastService.warning("Phiên đăng nhập sẽ hết hạn sau " + remainingMinutes + " phút nữa, hãy lưu công việc hiện tại hoặc đăng nhập lại để tiếp tục công việc.", "Cảnh Báo !")
        //             }
        //         });

    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    logout() {
        this.oauthService.logoutUrl = window.location.origin + '/#/login';
        if (this.oauthService.hasValidAccessToken()) {
            this.http.get(`${environment.HOST.INDENTITY_SERVER_URL}/api/Account/Signout`).toPromise()
                .then(
                    (res: any) => {

                        this.oauthService.logoutUrl = window.location.origin + '/#/login';
                        this.oauthService.logOut(false);
                    },
                    (error: any) => {
                        console.log(error + '');
                    }
                );
        } else { window.location.href = this.oauthService.logoutUrl; }
    }

    officeChange(office: Office) {
        if (!!office) {
            this.selectedOffice = office;
        }
    }

    groupDepartmentChange(groupDepartment: SystemInterface.IDepartmentGroup) {
        if (!!groupDepartment) {
            this.selectedDepartGroup = groupDepartment;
        }
    }

    submitChangeOffice() {
        if (!!this.selectedOffice) {
            const userInfoCurrent: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

            if (!!userInfoCurrent) {
                this.isChangeOffice = true;
                this.isChangeDepartgroup = false;
                this.loginAgain(userInfoCurrent.companyId, this.selectedOffice.id, userInfoCurrent.departmentId, userInfoCurrent.groupId);
            }
        }
    }

    submitChangedDepartGroup() {
        if (!!this.selectedDepartGroup) {
            const userInfoCurrent: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

            if (!!userInfoCurrent) {
                this.isChangeDepartgroup = true;
                this.isChangeOffice = false;
                this.loginAgain(userInfoCurrent.companyId, userInfoCurrent.officeId, this.selectedDepartGroup.departmentId, this.selectedDepartGroup.groupId);
            }
        }
    }

    loginAgain(companyId: string, officeId: string, departmentId: number, groupId: number) {
        this._spinner.show();

        this.oauthService.loadDiscoveryDocument().then((a) => {
            this.oauthService.tryLogin().then((b) => {
                let header: HttpHeaders;
                if (this.isChangeDepartgroup) {
                    header = new HttpHeaders({
                        companyId: companyId,
                        officeId: officeId,
                        groupId: '' + groupId,
                        departmentId: '' + departmentId
                    });
                } else {
                    header = new HttpHeaders({
                        companyId: companyId,
                        officeId: officeId,
                    });
                }
                this.password = this.getUserPassword();
                this.username = this.getUserName();

                if (!!this.username && !!this.password) {
                    this.oauthService.fetchTokenUsingPasswordFlow(this.username, RSAHelper.serverEncode(this.password), header)
                        .then((tokenInfo: SystemInterface.IToken) => {
                            localStorage.setItem(SystemConstants.ACCESS_TOKEN, tokenInfo.access_token);
                            return this.oauthService.loadUserProfile();
                        }).then((userInfo: SystemInterface.IClaimUser) => {
                            this._spinner.hide();
                            localStorage.setItem(SystemConstants.USER_CLAIMS, JSON.stringify(userInfo));

                            if (this.isChangeDepartgroup) {
                                this.headerComponent.getOfficeDepartGroupCurrentUser(userInfo);
                                this._toastService.info(userInfo.userName.toUpperCase(), "Change Department - Group Success");
                            } else {
                                this.headerComponent.getOfficeDepartGroupCurrentUser(userInfo);
                                this._store.dispatch(new ChangeOfficeClaimUserAction(this.selectedOffice.id));
                                this._toastService.info(userInfo.userName.toUpperCase(), "Change Office Success");
                            }
                        });
                } else {
                    throw new Error("Not found login information");
                }
            }).catch(
                (err) => {
                    this._toastService.error(err + '');
                    this._spinner.hide();
                });
        });
    }

    getUserPassword() {
        const pass_encypt = this.cookieService.get("__p");
        const bytes = crypto_js.AES.decrypt(pass_encypt, SystemConstants.SECRET_KEY);
        return bytes.toString(crypto_js.enc.Utf8);
    }

    getUserName() {
        const username_encypt = this.cookieService.get("__u");
        const bytes = crypto_js.AES.decrypt(username_encypt, SystemConstants.SECRET_KEY);
        return bytes.toString(crypto_js.enc.Utf8);
    }
}
