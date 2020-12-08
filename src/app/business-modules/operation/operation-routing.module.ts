import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { TruckingAssignmentComponent } from "./trucking-assignment/trucking-assignment.component";

const routes: Routes = [
    {
        path: "",
        redirectTo: "job-management",
    },
    {
        path: "job-management",
        loadChildren: () => import('./job-mangement/job-management.module').then(m => m.JobManagementModule),
        data: { name: 'Job Management' }
    },
    {
        path: "assigment",
        loadChildren: () => import('./assigment/assignment.module').then(m => m.AssignmentModule),
        data: { name: 'Assignment' }
    },

    {
        path: "custom-clearance",
        loadChildren: () => import('./custom-clearance/custom-clearance.module').then(m => m.CustomClearanceModule),
        data: { name: 'Custom Clearance' }
    },
    {
        path: "trucking-assigment",
        component: TruckingAssignmentComponent,
        data: {
            name: "Trucking Assigment",
        },
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: []
})
export class OperationRoutingModule { }
