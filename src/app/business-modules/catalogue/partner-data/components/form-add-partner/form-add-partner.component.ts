import { Component, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { SalemanPopupComponent } from '../saleman-popup.component';
import { Partner } from 'src/app/shared/models';
import { FormValidators } from 'src/app/shared/validators/form.validator';
import { PartnerOtherChargePopupComponent } from '../other-charge/partner-other-charge.popup';

@Component({
    selector: 'form-add-partner',
    templateUrl: './form-add-partner.component.html'
})

export class FormAddPartnerComponent extends AppForm {

    @ViewChild(SalemanPopupComponent, { static: false }) poupSaleman: SalemanPopupComponent;
    @ViewChild(PartnerOtherChargePopupComponent, { static: false }) otherChargePopup: PartnerOtherChargePopupComponent;

    @Output() requireSaleman = new EventEmitter<boolean>();
    @Input() isUpdate: true;
    parentCustomers: any[] = [];
    parentCustomerss: any[] = [];
    partnerGroups: any[] = [];
    countries: any[] = [];
    shippingProvinces: any[] = [];
    billingProvinces: any[] = [];
    workPlaces: any[] = [];
    isExistedTaxcode: boolean = false;

    partnerForm: FormGroup;
    isSubmitted: boolean = false;
    partnerAccountNo: AbstractControl;
    internalReferenceNo: AbstractControl;
    nameENFull: AbstractControl;
    nameLocalFull: AbstractControl;
    shortName: AbstractControl;
    partnerAccountRef: AbstractControl;

    taxCode: AbstractControl;
    partnerGroup: AbstractControl;
    shippingCountry: AbstractControl;
    shippingProvince: AbstractControl;
    zipCodeShipping: AbstractControl;
    shippingAddressEN: AbstractControl;
    shippingAddressVN: AbstractControl;
    billingCountry: AbstractControl;
    billingProvince: AbstractControl;
    billingZipcode: AbstractControl;
    billingAddressEN: AbstractControl;
    billingAddressLocal: AbstractControl;
    partnerContactPerson: AbstractControl;
    partnerContactNumber: AbstractControl;
    partnerContactFaxNo: AbstractControl;
    employeeWorkPhone: AbstractControl;
    employeeEmail: AbstractControl;
    partnerWebsite: AbstractControl;
    partnerbankAccountNo: AbstractControl;
    partnerBankAccountName: AbstractControl;
    partnerBankAccountAddress: AbstractControl;
    partnerSwiftCode: AbstractControl;
    partnerWorkPlace: AbstractControl;
    active: AbstractControl;
    note: AbstractControl;
    isPublic: boolean = false;
    coLoaderCode: AbstractControl;
    roundUp: AbstractControl;
    applyDim: AbstractControl;

    roundMethods: CommonInterface.INg2Select[] = [
        { id: 'Standard', text: 'Standard' },
        { id: 'Round 0.5', text: 'Round 0.5' },
        { id: 'Round 1.0', text: 'Round 1.0' },
    ];

    applyDims: CommonInterface.INg2Select[] = [
        { id: 'Single Dim', text: 'Single Dim' },
        { id: 'Total Dim', text: 'Total Dim' }
    ];


    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo
    ) {
        super();
    }
    ngOnInit() {
        this.initForm();
    }

    onChange(event: any, type: string) {
        switch (type) {
            case 'shippingCountry':
                this.getShippingProvinces(event.id);
                break;
            case 'billingCountry':
                this.getBillingProvinces(event.id);
                break;
            case 'category':
                const isShowSaleMan = this.checkRequireSaleman(event.id);
                this.requireSaleman.emit(isShowSaleMan);
                break;
        }
    }
    removed(event, type: string) {
        switch (type) {
            case 'shippingCountry':
                this.getShippingProvinces();
                this.partnerForm.controls['shippingProvince'].setValue([]);
                break;
            case 'billingCountry':
                this.getBillingProvinces();
                this.partnerForm.controls['billingProvince'].setValue([]);
                break;
            case 'category':
                const isShowSaleMan = this.checkRequireSaleman(event.id, false);
                this.requireSaleman.emit(isShowSaleMan);
                break;
        }
    }
    checkRequireSaleman(partnerGroup: string, isAdded = true): boolean {
        if (isAdded) {
            if (partnerGroup != null) {
                if (partnerGroup.includes('CUSTOMER')) {
                    return true;
                }
            } else {
                return false;
            }
            if (partnerGroup == null) {
                return false;
            } else if (partnerGroup.includes('CUSTOMER') || partnerGroup.includes('ALL')) {

                return true;
            } else {
                return false;
            }
        } else {
            if (partnerGroup != null) {
                if (partnerGroup.includes('CUSTOMER') || partnerGroup.includes('ALL')) {
                    return false;
                }
            }
        }
    }
    getBillingProvinces(countryId?: number) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.billingProvinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.billingProvinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
    getShippingProvinces(countryId?: number) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.shippingProvinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.shippingProvinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
    initForm() {
        this.partnerForm = this._fb.group({
            partnerAccountNo: [{ value: null, disabled: true }],
            internalReferenceNo: [null],
            nameENFull: [null, Validators.compose([
                FormValidators.required,
            ])],
            nameLocalFull: [null, Validators.compose([
                FormValidators.required,
            ])],
            shortName: [null, Validators.compose([
                FormValidators.required
            ])],
            partnerAccountRef: [],
            taxCode: [null, Validators.compose([
                FormValidators.required
            ])],
            partnerGroup: [null, Validators.compose([
                Validators.required
            ])],
            shippingCountry: [null, Validators.compose([
                Validators.required
            ])],
            shippingProvince: [null, Validators.compose([
                Validators.required
            ])],
            zipCodeShipping: [null],
            shippingAddressEN: [null, Validators.compose([
                FormValidators.required
            ])],
            shippingAddressVN: [null, Validators.compose([
                FormValidators.required
            ])],
            billingCountry: [null, Validators.compose([
                Validators.required
            ])],
            billingProvince: [null, Validators.compose([
                Validators.required
            ])],
            billingZipcode: [null],
            billingAddressEN: [null, Validators.compose([
                FormValidators.required
            ])],
            billingAddressLocal: [null, Validators.compose([
                FormValidators.required
            ])],
            partnerContactPerson: [null],
            partnerContactNumber: [null],
            partnerContactFaxNo: [null],
            employeeWorkPhone: [null],
            employeeEmail: [null],
            partnerWebsite: [null],
            partnerbankAccountNo: [null],
            partnerBankAccountName: [null],
            partnerBankAccountAddress: [null],
            partnerSwiftCode: [null],
            partnerWorkPlace: [null],
            active: [true],
            note: [null],
            coLoaderCode: [null],
            applyDim: [null],
            roundUp: [null]
        });

        this.partnerAccountNo = this.partnerForm.controls['partnerAccountNo'];
        this.internalReferenceNo = this.partnerForm.controls['internalReferenceNo'];
        this.nameENFull = this.partnerForm.controls['nameENFull'];
        this.nameLocalFull = this.partnerForm.controls['nameLocalFull'];
        this.shortName = this.partnerForm.controls['shortName'];
        this.partnerAccountRef = this.partnerForm.controls['partnerAccountRef'];
        this.taxCode = this.partnerForm.controls['taxCode'];
        this.partnerGroup = this.partnerForm.controls['partnerGroup'];
        this.shippingCountry = this.partnerForm.controls['shippingCountry'];
        this.shippingProvince = this.partnerForm.controls['shippingProvince'];
        this.zipCodeShipping = this.partnerForm.controls['zipCodeShipping'];
        this.shippingAddressEN = this.partnerForm.controls['shippingAddressEN'];
        this.shippingAddressVN = this.partnerForm.controls['shippingAddressVN'];
        this.billingCountry = this.partnerForm.controls['billingCountry'];
        this.billingProvince = this.partnerForm.controls['billingProvince'];
        this.billingZipcode = this.partnerForm.controls['billingZipcode'];
        this.billingAddressEN = this.partnerForm.controls['billingAddressEN'];
        this.billingAddressLocal = this.partnerForm.controls['billingAddressLocal'];
        this.partnerContactPerson = this.partnerForm.controls['partnerContactPerson'];
        this.partnerContactNumber = this.partnerForm.controls['partnerContactNumber'];
        this.partnerContactFaxNo = this.partnerForm.controls['partnerContactFaxNo'];
        this.employeeWorkPhone = this.partnerForm.controls['employeeWorkPhone'];
        this.employeeEmail = this.partnerForm.controls['employeeEmail'];
        this.partnerWebsite = this.partnerForm.controls['partnerWebsite'];
        this.partnerbankAccountNo = this.partnerForm.controls['partnerbankAccountNo'];
        this.partnerBankAccountName = this.partnerForm.controls['partnerBankAccountName'];
        this.partnerBankAccountAddress = this.partnerForm.controls['partnerBankAccountAddress'];
        this.partnerSwiftCode = this.partnerForm.controls['partnerSwiftCode'];
        this.partnerWorkPlace = this.partnerForm.controls['partnerWorkPlace'];
        this.active = this.partnerForm.controls['active'];
        this.coLoaderCode = this.partnerForm.controls['coLoaderCode'];
        this.note = this.partnerForm.controls['note'];
        this.applyDim = this.partnerForm.controls['applyDim'];
        this.roundUp = this.partnerForm.controls['roundUp'];
    }

    onSelectDataFormInfo(data: any) {
        this.partnerAccountRef.setValue(data.id);
    }

    setFormData(partner: Partner) {
        console.log(partner);
        const isShowSaleMan = this.checkRequireSaleman(partner.partnerGroup);
        this.requireSaleman.emit(isShowSaleMan);
        const partnerGroupActives = this.getPartnerGroupActives(partner.partnerGroup.split(';'));
        let index = -1;
        let parentCustomerActive = [];
        let workPlaceActive = [];
        let billingCountryActive = [];
        let shippingCountryActive = [];
        let billingProvinceActive = [];
        let shippingProvinceActive = [];
        index = this.parentCustomers.findIndex(x => x.id === partner.parentId);
        if (index > -1) { parentCustomerActive = [this.parentCustomers[index]]; }
        index = this.workPlaces.findIndex(x => x.id === partner.workPlaceId);
        if (index > -1) { workPlaceActive = [this.workPlaces[index]]; }
        index = this.countries.findIndex(x => x.id === partner.countryId);
        if (index > - 1) {
            billingCountryActive = [this.countries[index]];
        }
        index = this.countries.findIndex(x => x.id === partner.countryShippingId);
        if (index > -1) {
            shippingCountryActive = [this.countries[index]];
        }
        index = this.billingProvinces.findIndex(x => x.id === partner.provinceId);
        if (index > -1) {
            billingProvinceActive = [this.billingProvinces[index]];
        }
        index = this.shippingProvinces.findIndex(x => x.id === partner.provinceShippingId);
        if (index > -1) {
            shippingProvinceActive = [this.shippingProvinces[index]];
        }
        this.isPublic = partner.public;

        console.log(this.isPublic);
        this.partnerForm.setValue({
            partnerAccountNo: partner.accountNo,
            internalReferenceNo: partner.internalReferenceNo,
            nameENFull: partner.partnerNameEn,
            nameLocalFull: partner.partnerNameVn,
            shortName: partner.shortName,
            partnerAccountRef: partner.parentId,
            taxCode: partner.taxCode,
            partnerGroup: partnerGroupActives,
            shippingCountry: shippingCountryActive,
            shippingProvince: shippingProvinceActive,
            zipCodeShipping: partner.zipCodeShipping,
            shippingAddressEN: partner.addressShippingEn,
            shippingAddressVN: partner.addressShippingVn,
            billingCountry: billingCountryActive,
            billingProvince: billingProvinceActive,
            billingZipcode: partner.zipCode,
            billingAddressEN: partner.addressEn,
            billingAddressLocal: partner.addressVn,
            partnerContactPerson: partner.contactPerson,
            partnerContactNumber: partner.tel,
            partnerContactFaxNo: partner.fax,
            employeeWorkPhone: partner.workPhoneEx,
            employeeEmail: partner.email,
            partnerWebsite: partner.website,
            partnerbankAccountNo: partner.bankAccountNo,
            partnerBankAccountName: partner.bankAccountName,
            partnerBankAccountAddress: partner.bankAccountAddress,
            partnerSwiftCode: partner.swiftCode,
            partnerWorkPlace: workPlaceActive,
            active: partner.active === null ? false : partner.active,
            note: partner.note,
            coLoaderCode: partner.coLoaderCode,
            roundUp: [<CommonInterface.INg2Select>{ id: partner.roundUpMethod, text: partner.roundUpMethod }],
            applyDim: [<CommonInterface.INg2Select>{ id: partner.applyDim, text: partner.applyDim }]
        });
    }
    getPartnerGroupActives(arg0: string[]): any {
        const partnerGroupActives = [];
        if (arg0.length > 0) {
            for (let i = 0; i < arg0.length; i++) {
                const group = this.partnerGroups.find(x => x.id === arg0[i]);
                if (group) {
                    partnerGroupActives.push(group);
                }
            }
        }
        return partnerGroupActives;
    }

    showPopupSaleman() {
        this.poupSaleman.isSave = false;
        this.poupSaleman.isDetail = false;
        this.poupSaleman.show();
    }

    showOtherCharge() {
        this.otherChargePopup.show();
    }

    copyShippingAddress() {
        this.billingCountry.setValue(this.shippingCountry.value);
        this.billingProvince.setValue(this.shippingProvince.value);
        this.billingZipcode.setValue(this.zipCodeShipping.value);
        this.billingAddressEN.setValue(this.shippingAddressEN.value);
        this.billingAddressLocal.setValue(this.shippingAddressVN.value);
    }
}
