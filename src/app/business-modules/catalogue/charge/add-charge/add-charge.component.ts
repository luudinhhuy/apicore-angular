import { Component, ViewChild } from '@angular/core';
import { CatChargeToAddOrUpdate } from 'src/app/shared/models/catalogue/catChargeToAddOrUpdate.model';
import { Router } from '@angular/router';
import { FormAddChargeComponent } from '../components/form-add-charge/form-add-charge.component';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { AppPage } from 'src/app/app.base';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { VoucherListComponent } from '../components/voucher-list/voucher-list.component';
import { SystemConstants } from 'src/constants/system.const';

@Component({
    selector: 'add-charge',
    templateUrl: './add-charge.component.html',
    styleUrls: ['./../detail-charge/detail-charge.component.scss']
})
export class AddChargeComponent extends AppPage {

    @ViewChild(FormAddChargeComponent, { static: false }) formAddCharge: FormAddChargeComponent;
    @ViewChild(VoucherListComponent, { static: false }) voucherList: VoucherListComponent;

    constructor(
        protected router: Router,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _progressService: NgProgress,
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ChargeToAdd: CatChargeToAddOrUpdate = new CatChargeToAddOrUpdate();

    ngOnInit() {
    }

    onsubmitData() {
        this.ChargeToAdd.charge.code = this.formAddCharge.code.value;
        this.ChargeToAdd.charge.chargeNameEn = this.formAddCharge.nameEn.value;
        this.ChargeToAdd.charge.chargeNameVn = this.formAddCharge.nameVn.value;
        this.ChargeToAdd.charge.unitId = this.formAddCharge.unit.value[0].id;
        this.ChargeToAdd.charge.unitPrice = this.formAddCharge.unitPrice.value;
        this.ChargeToAdd.charge.currencyId = this.formAddCharge.currency.value[0].id;
        this.ChargeToAdd.charge.vatrate = this.formAddCharge.vat.value;
        this.ChargeToAdd.charge.debitCharge = this.formAddCharge.debitCharge.value;
        this.ChargeToAdd.charge.chargeGroup = this.formAddCharge.chargeGroup.value != null && this.formAddCharge.chargeGroup.value.length > 0 ? this.formAddCharge.chargeGroup.value[0].id : null;

        let serviceTypeId = '';
        this.ChargeToAdd.charge.type = this.formAddCharge.type.value[0].id;
        if (this.formAddCharge.service.value !== null) {
            if (this.formAddCharge.service.value.length > 0) {
                this.formAddCharge.requiredService = false;
                this.formAddCharge.service.value.forEach(element => {
                    serviceTypeId += ";" + element.id;
                });
            } else {
                this.formAddCharge.service.setValue(null);
                this.formAddCharge.requiredService = true;
                return null;
            }
            this.ChargeToAdd.charge.serviceTypeId = serviceTypeId;
            this.ChargeToAdd.charge.id = SystemConstants.EMPTY_GUID;
            this.ChargeToAdd.listChargeDefaultAccount = this.voucherList.ChargeToAdd.listChargeDefaultAccount;
            return this.ChargeToAdd;
        } else {
            return null;
        }
    }

    addCharge() {
        this.formAddCharge.isSubmitted = true;
        this.voucherList.isSubmitted = true;
        if (this.formAddCharge.service.value == null) {
            this.formAddCharge.requiredService = true;
            return;
        } else if (this.formAddCharge.service.value.length === 0) {
            this.formAddCharge.requiredService = true;
            return;
        } else {
            this.formAddCharge.requiredService = false;
        }
        if (this.formAddCharge.checkValidateForm() && this.voucherList.validatateDefaultAcountLine()) {
            this.onsubmitData();
            this._catalogueRepo.addCharge(this.ChargeToAdd)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message, '');
                            this.router.navigate(["/home/catalogue/charge"]);
                        } else {
                            this._toastService.error(res.message, '');
                        }
                    }
                );
        }

    }
}
