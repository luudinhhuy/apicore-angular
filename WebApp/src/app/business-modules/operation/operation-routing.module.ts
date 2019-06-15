import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssigmentComponent } from './assigment/assigment.component';
import { TruckingAssignmentComponent } from './trucking-assignment/trucking-assignment.component';
import { OpsModuleBillingJobCreateComponent } from './ops-module-billing-job-create/ops-module-billing-job-create.component';
import { OpsModuleBillingComponent } from './ops-module-billing/ops-module-billing.component';
import { OpsModuleBillingJobEditComponent } from './ops-module-billing-job-edit/ops-module-billing-job-edit.component';
import { CustomClearanceComponent } from './custom-clearance/custom-clearance.component';
import { CustomClearanceAddnewComponent } from './custom-clearance-addnew/custom-clearance-addnew.component';
import { CustomClearanceEditComponent } from './custom-clearance-edit/custom-clearance-edit.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'job-management',
        pathMatch: 'full'
    },
    //   {
    //     path:'job-management',
    //     component:JobMangementComponent
    //   },
    {
        path: 'job-management',
        component: OpsModuleBillingComponent,
        data:{
            name:"Job Management",
            level:2
          }
    },
    {
        path: 'job-create',
        component: OpsModuleBillingJobCreateComponent,
        data:{
            name:"Job Create",
            level:2
          }
    },
    {
        path: 'job-edit',
        component: OpsModuleBillingJobEditComponent,
        data:{
            name:"Job Edit",
            level:2
          }
    },
    {
        path: 'assigment',
        component: AssigmentComponent,
        data:{
            name:"Assigment",
            level:2
          }
    },
    {
        path: 'trucking-assigment',
        component: TruckingAssignmentComponent,
        data:{
            name:"Trucking Assigment",
            level:2
          }
    },
    {
        path: 'custom-clearance',
        component: CustomClearanceComponent,
        data:{
            name:"Custom Clearance",
            level:2
        }
    },
    {
        path: 'custom-clearance-addnew',
        component: CustomClearanceAddnewComponent,
        data:{
            name:"Add Custom Clearance",
            level:2
        }
    },
    {
        path: 'custom-clearnce-edit',
        component: CustomClearanceEditComponent,
        data:{
            name:"Detail/Edit Custom Clearance",
            level:2
        }
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OperationRoutingModule { }
