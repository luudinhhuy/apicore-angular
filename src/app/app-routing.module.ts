import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MasterPageComponent } from './master-page/master-page.component';
import { NotfoundPageComponent } from './404/404-page.component';
import { AuthGuardService } from 'src/app/shared/services/auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuResolveGuard } from './menu.resolve';
import { ForbiddenPageComponent } from './403/403.component';

const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },

    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    /**
     * Lazy load business modules
     */

    {
        path: 'home',
        canActivate: [AuthGuardService],
        component: MasterPageComponent,
        data: {
            name: "Home",
        },
        resolve: {
            checkMenu: MenuResolveGuard
        },
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
            },
            {
                path: 'system',
                loadChildren: () => import('./business-modules/system/system.module').then(m => m.SystemModule),
                data: {
                    name: "System",
                }
            },
            {
                path: 'catalogue',
                loadChildren: () => import('./business-modules/catalogue/catalogue.module').then(m => m.CatalogueModule),
                data: {
                    name: "Catalogue",
                }
            },
            {
                path: 'accounting',
                loadChildren: () => import('./business-modules/accounting/accounting.module').then(m => m.AccountingModule),
                data: {
                    name: "Accounting",
                }
            },
            {
                path: 'documentation',
                loadChildren: () => import('./business-modules/documentation/documentation.module').then(m => m.DocumentationModule),
                data: {
                    name: 'Services',
                }
            },
            {
                path: 'operation',
                loadChildren: () => import('./business-modules/operation/operation.module').then(m => m.OperationModule),
                data: {
                    name: "Logistics",
                },

            },
            {
                path: 'report',
                loadChildren: () => import('./business-modules/report/report.module').then(m => m.ReportModule),
                data: {
                    name: "Report",
                }
            },
            {
                path: 'tool',
                loadChildren: () => import('./business-modules/tool-setting/tool.module').then(m => m.ToolModule),
                data: {
                    name: "Tool",
                }
            },
            {
                path: 'designs-zone',
                loadChildren: () => import('./design-modules/design-modules.module').then(m => m.DesignModulesModule),
                data: {
                    name: "Design Zone",
                }
            },

        ],
        runGuardsAndResolvers: "always"
    },
    /**
     * PAGE NOT FOUND 
     */
    {
        path: '404',
        component: NotfoundPageComponent
    },
    {
        path: '403',
        component: ForbiddenPageComponent
    },
    {
        path: '**',
        redirectTo: '404',
        pathMatch: 'full'
    }

];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
