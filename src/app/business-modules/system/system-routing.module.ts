import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'company-info',
        pathMatch: 'full'
    },
    {
        path: 'company', loadChildren: () => import('./company/company-information.module').then(m => m.CompanyInformationModule),
        data: { name: 'Company' }
    },
    {
        path: 'department', loadChildren: () => import('./department/department.module').then(m => m.DepartmentModule),
        data: { name: 'Department' }
    },
    {
        path: 'group', loadChildren: () => import('./group/group.module').then(m => m.GroupModule),
        data: { name: 'Group' }
    },
    {
        path: 'permission', loadChildren: () => import('./permission/permission.module').then(m => m.PermissionModule),
        data: { name: 'Permission' }
    },
    {
        path: 'role',
        component: RoleComponent
    },
    {
        path: 'user-management', loadChildren: () => import('./user-management/user-management.module').then(m => m.UserManagementModule),
        data: {
            name: 'User Management'
        }
    },
    {
        path: 'office', loadChildren: () => import('./office/office.module').then(m => m.OfficeModule), data: {
            name: 'Office'
        }
    },
    {
        path: 'authorization', loadChildren: () => import('./authorization/authorization.module').then(m => m.AuthorizationModule),
        data: { name: 'Authorization' }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemRoutingModule { }
