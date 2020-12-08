import { Component, OnInit, AfterViewInit } from "@angular/core";
import { Router } from "@angular/router";

import { AppList } from "src/app/app.list";
import { ExportRepo } from "@repositories";
import { NgProgress } from "@ngx-progressbar/core";
import { SystemConstants } from "src/constants/system.const";

import { catchError, finalize } from "rxjs/operators";


type LOCATION_TAB = 'country' | 'city' | 'district' | 'town';

enum LocationTab {
    COUNTRY = 'country',
    CITY = 'city',
    DISTRICT = 'district',
    TOWN = 'town'
}

@Component({
    selector: 'app-location',
    templateUrl: './location.component.html'
})


export class LocationComponent extends AppList implements OnInit, AfterViewInit {

    selectedTab: LOCATION_TAB = LocationTab.COUNTRY; // Default tab.

    constructor(
        private _router: Router,
        private _exportRepo: ExportRepo,
        private _ngProgressService: NgProgress
    ) {
        super();

        this._progressRef = this._ngProgressService.ref();
    }

    ngOnInit() {

    }

    onSelectTabLocation(tabname: LOCATION_TAB) {
        this.selectedTab = tabname;
    }

    import() {
        this._router.navigate(["home/catalogue/location/location-import"], { queryParams: { type: this.selectedTab } });
    }

    export() {
        this._progressRef.start();

        switch (this.selectedTab) {
            case LocationTab.COUNTRY:
                this._exportRepo.exportCountry()
                    .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                    .subscribe(
                        (res: any) => {
                            this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'eFms_country.xlsx');
                        }
                    );
                break;
            case LocationTab.CITY:
                this._exportRepo.exportProvince()
                    .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                    .subscribe(
                        (res: any) => {
                            this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'eFms_provinces.xlsx');
                        }
                    );
                break;
            case LocationTab.DISTRICT:
                this._exportRepo.exportDistrict()
                    .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                    .subscribe(
                        (res: any) => {
                            this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'eFms_districts.xlsx');
                        }
                    );
                break;
            case LocationTab.TOWN:
                this._exportRepo.exportTownWard()
                    .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                    .subscribe(
                        (res: any) => {
                            this.downLoadFile(res, SystemConstants.FILE_EXCEL, 'eFms_towns_wards.xlsx');
                        }
                    );
                break;
            default:
                break;
        }
    }
}
