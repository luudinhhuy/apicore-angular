import { Component, OnInit, AfterViewInit, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SystemConstants } from 'src/constants/system.const';
import { Router } from '@angular/router';
import { OAuthService, JwksValidationHandler} from 'angular-oauth2-oidc';
import { CookieService } from 'ngx-cookie-service';
import * as crypto_js from 'crypto-js';
import { NgForm } from '@angular/forms';
import { authConfig } from '../shared/authenticate/authConfig';
import { BaseService } from 'src/services-base/base.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit,AfterViewChecked {
  ngAfterViewInit(): void {
    if (this.cookieService.get("login_status") === "LOGGED_IN") {
      this.router.navigateByUrl('/home');
    }
    this.getLoginData();
  }

  constructor(
    private toastr: ToastrService,
    private baseService:BaseService,
    private router: Router,
    private oauthService: OAuthService,
    private cookieService: CookieService,
    private changeDetector : ChangeDetectorRef ) {       
      this.oauthService.setStorage(localStorage);
      this.oauthService.setupAutomaticSilentRefresh();
  }
  ngAfterViewChecked(){
    this.changeDetector.detectChanges();
  }

  private async configureWithNewConfigApi() {
    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    await this.oauthService.loadDiscoveryDocumentAndTryLogin();     
  }

  username: string = "";
  password: string = "";
  remember_me: boolean = false;

  ngOnInit() {
    this.setupLocalInfo();
  }

  async Login(form: NgForm) {    
    this.baseService.spinnerShow();
    await this.configureWithNewConfigApi();
    if (form.form.status !== "INVALID") {
      this.oauthService.fetchTokenUsingPasswordFlow(this.username, this.password).then((resp) => {
        return this.oauthService.loadUserProfile();
      }).then(() => {
        let claims = this.oauthService.getIdentityClaims();
        if (claims) {
          localStorage.setItem("currently_userName",claims['preferred_username']);
          localStorage.setItem("currently_userEmail",claims['email']);
          
          this.rememberMe();
          this.toastr.success("Welcome back, "+claims['preferred_username'].toUpperCase()+" !", "", { positionClass: 'toast-bottom-right' });
          this.router.navigateByUrl('/home');       
          this.baseService.spinnerHide();
        }
      }).catch((err) => {
        this.toastr.error(err.error.error_description, "", { positionClass: 'toast-bottom-right' })
        this.baseService.spinnerHide();
      })
    }
  }


  rememberMe() {
    if (this.remember_me) {
      const userInfo = this.encryptUserInfo(this.username, this.password);
      this.cookieService.set("_u", userInfo.username_encrypt, null, "/", window.location.hostname);
      this.cookieService.set("_p", userInfo.password_encrypt, null, "/", location.hostname);
    } else {
      this.cookieService.deleteAll("/", window.location.hostname);
    }
  }

  encryptUserInfo(username, password) {
    const username_encrypt = crypto_js.AES.encrypt(username, SystemConstants.SECRET_KEY);
    const password_encrypt = crypto_js.AES.encrypt(password, SystemConstants.SECRET_KEY);

    const returnObj = {
      username_encrypt: username_encrypt.toString(),
      password_encrypt: password_encrypt.toString()
    }

    return returnObj;
  }

  getUserName() {
    const username_encypt = this.cookieService.get("_u");
    const bytes = crypto_js.AES.decrypt(username_encypt, SystemConstants.SECRET_KEY);
    const username = bytes.toString(crypto_js.enc.Utf8);
    return username;
  }

  getUserPassword() {
    const pass_encypt = this.cookieService.get("_p");
    const bytes = crypto_js.AES.decrypt(pass_encypt, SystemConstants.SECRET_KEY);
    const password = bytes.toString(crypto_js.enc.Utf8);
    return password;
  }

  private getLoginData() {
    this.username = this.getUserName();
    this.password = this.getUserPassword();
    this.remember_me = (this.username != '' || this.password != '');
  }  

  changeLanguage(lang) {
    localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, lang);
    if (localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE) === "en") {
      localStorage.setItem(SystemConstants.CURRENT_LANGUAGE,"en-US");
      window.location.href = window.location.protocol + "//" + window.location.hostname;
    } else {
      localStorage.setItem(SystemConstants.CURRENT_LANGUAGE,"vi-VN");
      window.location.href = window.location.protocol + "//" + window.location.hostname + "/" + lang + "/";
    }
  }


  setupLocalInfo(){
    if (localStorage.getItem(SystemConstants.CURRENT_LANGUAGE) == null) {
      localStorage.setItem("CURRENT_LANGUAGE", SystemConstants.DEFAULT_LANGUAGE);
    }
    if (localStorage.getItem(SystemConstants.CURRENT_VERSION) == null) {
      localStorage.setItem("CURRENT_VERSION", "1");
    }
    var current_client_lang = localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE);
 
    if (current_client_lang === null) {
      localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, "en");
    }
  }



}
