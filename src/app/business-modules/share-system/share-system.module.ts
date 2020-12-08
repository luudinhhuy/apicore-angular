import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";

import { SelectModule } from "ng2-select";
import { CollapseModule, TabsModule } from "ngx-bootstrap";

import { CommonComponentModule } from "src/app/shared/common/common.module";
import { DirectiveModule } from "src/app/shared/directives/directive.module";
import { PipeModule } from "src/app/shared/pipes/pipe.module";

import { ShareSystemAddUserComponent } from "./components/add-user/add-user.component";
import { ShareSystemDetailPermissionComponent } from "./components/permission/permission-detail.component";
import { PermissionFormCreateComponent } from "../system/permission/components/form-create-permission/form-create-permission.component";
import { reducers, shareSystemEffects } from "./store";


const COMPONENTS = [
    ShareSystemAddUserComponent,
    ShareSystemDetailPermissionComponent,
    PermissionFormCreateComponent,

]
@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        CommonComponentModule,
        FormsModule,
        ReactiveFormsModule,
        DirectiveModule,
        PipeModule,
        SelectModule,
        TabsModule.forRoot(),
        CollapseModule.forRoot(),

        // * STORE
        StoreModule.forFeature('share-system', reducers),
        EffectsModule.forFeature(shareSystemEffects),

    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})

export class ShareSystemModule {


}
