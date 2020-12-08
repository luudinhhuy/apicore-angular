
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";
import { RouteReuseStrategy } from "@angular/router";

import { HeaderComponent } from "./master-page/header/header.component";
import { FooterComponent } from "./master-page/footer/footer.component";
import { PageSidebarComponent } from "./master-page/page-sidebar/page-sidebar.component";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { MasterPageComponent } from "./master-page/master-page.component";
import { NotfoundPageComponent } from "./404/404-page.component";
import { DashboardComponent } from "./dashboard/dashboard.component";

import {
    PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { CookieService } from "ngx-cookie-service";
import { OAuthModule, AuthConfig } from "angular-oauth2-oidc";
import { NgxSpinnerModule } from "ngx-spinner";
import { HighchartsChartModule } from "highcharts-angular";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgProgressModule } from "@ngx-progressbar/core";
import { ToastrModule } from "ngx-toastr";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { StoreRouterConnectingModule, RouterStateSerializer } from '@ngrx/router-store';

import { GlobalState } from "./global-state";
import { AuthInterceptor, DEFAULT_TIMEOUT } from "./auth.interceptor";
import { AppRoutingModule } from "./app-routing.module";
import { environment } from "src/environments/environment";

import { reducers, CustomSerializer, effects } from "./store";
import { MenuResolveGuard } from "./menu.resolve";
import { ForbiddenPageComponent } from "./403/403.component";
import { CustomRouteReuseStrategy } from "./router-reuse";

const authConfig: AuthConfig = {
    issuer: environment.HOST.INDENTITY_SERVER_URL,
    tokenEndpoint: environment.HOST.INDENTITY_SERVER_URL + '/connect/token',
    redirectUri: window.location.origin + '/#/home',
    clientId: 'eFMS',
    requireHttps: false,
    oidc: false,
    logoutUrl: window.location.origin + '/#/login',
    sessionCheckIntervall: 2000,
    scope: 'openid profile offline_access efms_api',
    sessionChecksEnabled: true,
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MasterPageComponent,
        NotfoundPageComponent,
        HeaderComponent,
        FooterComponent,
        PageSidebarComponent,
        DashboardComponent,
        ForbiddenPageComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
        }),
        NgxSpinnerModule,
        PerfectScrollbarModule,
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: ["**"],
                sendAccessToken: true
            }
        }),
        NgxDaterangepickerMd.forRoot(),
        HighchartsChartModule,
        NgProgressModule,

        StoreModule.forRoot(reducers),
        EffectsModule.forFeature(effects),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
            logOnly: !environment.production, // Restrict extension to log-only mode
        }),
        StoreRouterConnectingModule.forRoot(),

    ],
    providers: [
        GlobalState,
        CookieService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true,
        },
        { provide: AuthConfig, useValue: authConfig },
        {
            provide: RouterStateSerializer, useClass: CustomSerializer
        },
        { provide: DEFAULT_TIMEOUT, useValue: !environment.production ? 200000 : 30000 },
        MenuResolveGuard,
        {
            provide: RouteReuseStrategy,
            useClass: CustomRouteReuseStrategy
        }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    exports: []
})
export class AppModule { }

