import { NgModule } from '@angular/core';
import { LocationImportComponent } from '../location-import/location-import.component';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SelectModule } from 'ng2-select';
import { NgProgressModule } from '@ngx-progressbar/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationComponent } from './location.component';
import { AddCountryComponent } from './country/add-country/add-country.component';
import { ModalModule } from 'ngx-bootstrap';
import { AddProvinceComponent } from './province/add-province/add-province.component';
import { UpdateProvinceComponent } from './province/update-province/update-province.component';
import { UpdateCountryComponent } from './country/update-country/update-country.component';
import { AddDistrictComponent } from './district/add-district/add-district.component';
import { UpdateDistrictComponent } from './district/update-district/update-district.component';

const routing: Routes = [
    { path: '', component: LocationComponent, data: { name: "Location", level: 2 } },
    { path: 'location-import', component: LocationImportComponent, data: { name: "Location Import", level: 3 } },
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
        ModalModule.forRoot()
    ],
    exports: [],
    declarations: [
        LocationComponent,
        LocationImportComponent,
        AddCountryComponent,
        AddProvinceComponent,
        UpdateProvinceComponent,
        UpdateCountryComponent,
        AddDistrictComponent,
        UpdateDistrictComponent
    ],
    providers: [],
})
export class LocationModule { }
