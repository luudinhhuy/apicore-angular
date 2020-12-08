import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Warehouse } from 'src/app/shared/models/catalogue/ware-house.model';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { FormValidators } from 'src/app/shared/validators/form.validator';
import { CommonEnum } from '@enums';

@Component({
    selector: 'form-warehouse',
    templateUrl: './form-warehouse.component.html'
})
export class FormWarehouseComponent extends PopupBase implements OnInit {
    @Output() saveSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
    warehouse: Warehouse = new Warehouse();
    warehouseForm: FormGroup;
    title: string;
    countries: any[] = [];
    provinces: any[] = [];
    districts: any[] = [];

    code: AbstractControl;
    warehouseNameEN: AbstractControl;
    warehouseNameVN: AbstractControl;
    country: AbstractControl;
    province: AbstractControl;
    district: AbstractControl;
    address: AbstractControl;
    active: AbstractControl;
    flightVesselNo: AbstractControl;

    isSubmitted: boolean = false;
    isUpdate: boolean = false;
    isShowUpdate: boolean = true;

    constructor(private _fb: FormBuilder,
        private _toastService: ToastrService,
        private _catalogueRepo: CatalogueRepo,
        private _progressService: NgProgress) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.warehouseForm = this._fb.group({
            code: [{ value: null, disabled: true }, FormValidators.required],
            warehouseNameEN: [null, FormValidators.required],
            warehouseNameVN: [null, FormValidators.required],
            country: [null, Validators.required],
            province: [null, Validators.required],
            district: [null, Validators.required],
            address: [null, FormValidators.required],
            flightVesselNo: [],
            active: [true]
        });
        this.code = this.warehouseForm.controls['code'];
        this.warehouseNameEN = this.warehouseForm.controls['warehouseNameEN'];
        this.warehouseNameVN = this.warehouseForm.controls['warehouseNameVN'];
        this.country = this.warehouseForm.controls['country'];
        this.province = this.warehouseForm.controls['province'];
        this.district = this.warehouseForm.controls['district'];
        this.address = this.warehouseForm.controls['address'];
        this.flightVesselNo = this.warehouseForm.controls['flightVesselNo'];
        this.active = this.warehouseForm.controls['active'];
    }

    setFormValue(res: Warehouse) {
        let countryActive = [];
        let provinceActive = [];
        let districtActive = [];
        const indexcountry = this.countries.findIndex(x => x.id === res.countryId);
        const indexProvince = this.provinces.findIndex(x => x.id === res.provinceId);
        const indexDistrict = this.districts.findIndex(x => x.id === res.districtId);

        if (indexcountry > -1) {
            countryActive = [this.countries[indexcountry]];
        }
        if (indexProvince > -1) {
            provinceActive = [this.provinces[indexProvince]];
        }
        if (indexDistrict > -1) {
            districtActive = [this.districts[indexDistrict]];
        }
        this.warehouseForm.setValue({
            code: res.code,
            warehouseNameEN: res.nameEn,
            warehouseNameVN: res.nameVn,
            country: countryActive || [],
            province: provinceActive || [],
            district: districtActive || [],
            address: res.address,
            active: res.active,
            flightVesselNo: res.flightVesselNo
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        const formData = this.warehouseForm.getRawValue();
        this.trimInputForm(formData);
        if (this.warehouseForm.valid) {
            this.setWarehouseModel();
            if (this.isUpdate) {
                this._catalogueRepo.updatePlace(this.warehouse.id, this.warehouse)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addPlace(this.warehouse)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }
        } else {
            console.log(this.warehouseForm);
        }
    }
    setWarehouseModel() {
        this.warehouse.placeType = CommonEnum.PlaceTypeEnum.Warehouse;
        this.warehouse.code = this.code.value;
        this.warehouse.nameEn = this.warehouseNameEN.value;
        this.warehouse.nameVn = this.warehouseNameVN.value;
        this.warehouse.countryId = this.country.value[0].id;
        this.warehouse.provinceId = this.province.value[0].id;
        this.warehouse.districtId = this.district.value[0].id;
        this.warehouse.address = this.address.value;
        this.warehouse.flightVesselNo = this.flightVesselNo.value;
        this.warehouse.active = !!this.isUpdate ? this.active.value : true;
    }
    trimInputForm(formData: any) {
        this.trimInputValue(this.code, formData.code);
        this.trimInputValue(this.warehouseNameEN, formData.warehouseNameEN);
        this.trimInputValue(this.warehouseNameVN, formData.warehouseNameVN);
        this.trimInputValue(this.address, formData.address);
    }
    onHandleResult(res: CommonInterface.IResult) {
        if (res.status) {
            this._toastService.success(res.message);
            this.hide();
            this.saveSuccess.emit(true);
        } else {
            this._toastService.error(res.message);
        }
    }
    onCancel() {
        this.hide();
    }

    onChange(event: any, type: string) {
        switch (type) {
            case 'country':
                this.getProvinces(event.id);
                break;
            case 'province':
                this.getDistricts(event.id);
                break;
        }
    }
    removed(type: string) {
        switch (type) {
            case 'country':
                this.getProvinces();
                this.warehouseForm.controls['province'].setValue([]);
                this.warehouseForm.controls['district'].setValue([]);
                break;
            case 'province':
                this.getDistricts();
                this.warehouseForm.controls['district'].setValue([]);
                break;
        }
    }

    getProvinces(countryId?: number) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.provinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.provinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
    getDistricts(provinceId?: any) {
        if (provinceId) {
            this._catalogueRepo.getDistrictsByProvince(provinceId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.districts = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getDistricts()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.districts = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
}
