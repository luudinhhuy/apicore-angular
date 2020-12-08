import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SelectModule } from 'ng2-select';
import { NgProgressModule } from '@ngx-progressbar/core';

import { LocationImportComponent } from '../location-import/location-import.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { LocationComponent } from './location.component';
import { FormCountryPopupComponent } from './country/add-country/add-country.component';
import { ModalModule, TabsModule, PaginationModule } from 'ngx-bootstrap';
import { AddProvincePopupComponent } from './province/add-province/add-province.component';
import { AddDistrictPopupComponent } from './district/add-district/add-district.component';
import { AddWardPopupComponent } from './ward/add-ward/add-ward.component';
import { AppCountryComponent } from './country/country.component';
import { AppProvinceComponent } from './province/province.component';
import { AppDistrictComponent } from './district/district.component';
import { AppWardComponent } from './ward/ward.component';

const routing: Routes = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: LocationComponent,
            },
            {
                path: 'location-import', component: LocationImportComponent, data: { name: "Import" }
            },
        ]
    },
];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SelectModule,
        NgProgressModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routing),
        ModalModule.forRoot(),
        TabsModule.forRoot(),
        PaginationModule.forRoot()
    ],
    exports: [],
    declarations: [
        LocationComponent,
        AppCountryComponent,
        FormCountryPopupComponent,
        AppProvinceComponent,
        AppDistrictComponent,
        AppWardComponent,

        LocationImportComponent,
        AddProvincePopupComponent,
        AddDistrictPopupComponent,
        AddWardPopupComponent,
    ],
    providers: [],
})
export class LocationModule { }
