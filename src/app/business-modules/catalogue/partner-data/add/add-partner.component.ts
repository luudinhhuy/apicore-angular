import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { SortService } from 'src/app/shared/services/sort.service';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { Saleman } from 'src/app/shared/models/catalogue/saleman.model';
import { SalemanAdd } from 'src/app/shared/models/catalogue/salemanadd.model';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { catchError, finalize } from "rxjs/operators";
import { AppList } from 'src/app/app.list';
import { ToastrService } from 'ngx-toastr';
import { SalemanPopupComponent } from '../components/saleman-popup.component';
import { forkJoin } from 'rxjs';
import { FormAddPartnerComponent } from '../components/form-add-partner/form-add-partner.component';
import { formatDate } from '@angular/common';
import { Company } from '@models';

@Component({
    selector: 'app-partner-data-add',
    templateUrl: './add-partner.component.html',
    styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerDataComponent extends AppList {
    @ViewChild(FormAddPartnerComponent, { static: false }) formPartnerComponent: FormAddPartnerComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeleteJobPopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) confirmTaxcode: InfoPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(SalemanPopupComponent, { static: false }) poupSaleman: SalemanPopupComponent;
    saleMans = [];
    activeNg: boolean = true;
    partner: Partner = new Partner();
    partnerGroupActives: any = [];
    partnerType: any;
    saleMandetail: any[] = [];
    headerSaleman: CommonInterface.IHeaderTable[];
    services: any[] = [];
    status: CommonInterface.ICommonTitleValue[] = [];
    offices: any[] = [];
    salemanToAdd: SalemanAdd = new SalemanAdd();
    strOfficeCurrent: any = '';
    strSalemanCurrent: any = '';
    selectedStatus: any = {};
    selectedService: any = {};
    deleteMessage: string = '';
    selectedSaleman: Saleman = null;
    saleMantoView: Saleman = new Saleman();
    dataSearchSaleman: any = {};
    isShowSaleMan: boolean = false;
    index: number = 0;
    company: Company[] = [];

    list: any[] = [];

    isDup: boolean = false;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private toastr: ToastrService,
        private _systemRepo: SystemRepo
    ) {
        super();
    }

    ngOnInit() {

        this.getComboboxData();
        this.initHeaderSalemanTable();
        this.route.queryParams.subscribe(prams => {
            if (prams.partnerType !== undefined) {
                this.partnerType = Number(prams.partnerType);
                if (this.partnerType === '3') {
                    this.isShowSaleMan = true;
                }
            }
        });
        this.getDataCombobox();
    }

    initHeaderSalemanTable() {
        this.headerSaleman = [
            { title: '', field: '', sortable: false },
            { title: 'Saleman', field: 'username', sortable: true },
            { title: 'Service', field: 'serviceName', sortable: true },
            { title: 'Office', field: 'office', sortable: true },
            { title: 'Company', field: 'company', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'CreatedDate', field: 'createDate', sortable: true }
        ];
    }

    closepp(param: SalemanAdd) {
        this.salemanToAdd = param;
        this.poupSaleman.isDetail = false;

        if (this.saleMandetail.length > 0) {
            for (const it of this.saleMandetail) {
                this.services.forEach(item => {
                    if (it.service === item.id) {
                        it.service = item.id;
                    }
                });

            }
        }
        this.isDup = this.saleMandetail.some((saleMane: Saleman) => (saleMane.service === this.salemanToAdd.service && saleMane.office === this.salemanToAdd.office));
        if (this.isDup) {
            for (const it of this.saleMandetail) {
                this.services.forEach(item => {
                    if (it.service === item.id) {
                        it.service = item.id;
                    }
                });
            }
        }

        if (this.salemanToAdd.service !== null && this.salemanToAdd.office !== null) {
            this._catalogueRepo.checkExistedSaleman(this.salemanToAdd)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        if (!!res) {
                            if (this.isDup) {
                                console.log("dup");
                                this.toastr.error('Duplicate service, office with sale man!');
                            } else {
                                this.saleMandetail.push(this.salemanToAdd);
                                console.log(this.saleMandetail);
                                this.poupSaleman.hide();

                                /// get detail employee --- to be continue
                                this.getEmployee(this.saleMandetail[0].saleManId);

                                for (const it of this.saleMandetail) {
                                    this.services.forEach(item => {
                                        if (it.service === item.id) {
                                            it.serviceName = item.text;
                                        }
                                    });
                                    this.offices.forEach(item => {
                                        if (it.office === item.id) {
                                            it.officeName = item.branchNameEn;
                                        }
                                        if (it.company === item.buid) {
                                            const objCompany = this.company.find(x => x.id === item.buid);
                                            it.companyName = objCompany.bunameAbbr;
                                        }
                                    });
                                }


                            }
                        }

                    },
                );
        }


    }
    closeppAndDeleteSaleman(index: any) {
        this.index = index;
        this.deleteSaleman(this.index);
    }

    showPopupSaleman() {
        this.poupSaleman.isSave = false;
        this.poupSaleman.isDetail = false;
        this.poupSaleman.resetForm();
        this.poupSaleman.show();
    }

    onDeleteSaleman() {
        if (this.saleMandetail.length > 0) {
            this.saleMandetail.splice(this.index, 1);
            this.confirmDeleteJobPopup.hide();
            this.toastr.success('Delete Success !');
        }

    }
    deleteSaleman(index: any) {
        this.index = index;
        this.deleteMessage = `Do you want to delete sale man  ${this.saleMandetail[index].username}?`;
        this.confirmDeleteJobPopup.show();
    }
    getDataCombobox() {
        forkJoin([
            this._catalogueRepo.getCountryByLanguage(),
            this._catalogueRepo.getProvinces()
        ])
            .pipe(catchError(this.catchError))
            .subscribe(
                ([countries, provinces]) => {
                    this.formPartnerComponent.countries = this.utility.prepareNg2SelectData(countries || [], 'id', 'name');
                    this.formPartnerComponent.billingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    this.formPartnerComponent.shippingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                },
                () => { },

            );
    }
    getComboboxData(): any {
        this.getPartnerGroups();
        this.getWorkPlaces();
        this.getparentCustomers();
        this.getService();
        this.getOffice();
        this.getCompany();
        this.getStatus();
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');

                    }
                },
            );
    }

    getOffice() {
        this._systemRepo.getListOffices()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.offices = res;
                    }
                },
            );
    }

    getCompany() {
        this._systemRepo.getListCompany()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.company = res;
                    }
                },
            );
    }


    getStatus(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Active', value: true },
            { title: 'Inactive', value: false },
        ];
    }
    getEmployee(userId: any): any {
        this._systemRepo.getEmployeeByUserId(userId)
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.partnerForm.controls['employeeWorkPhone'].setValue(res.tel);
                        this.formPartnerComponent.partnerForm.controls['employeeEmail'].setValue(res.email);
                    }
                }
            );
    }
    getparentCustomers() {
        this._catalogueRepo.getPartnersByType(PartnerGroupEnum.CUSTOMER)
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        // this.formPartnerComponent.parentCustomers = res.map(x => ({ "text": x.partnerNameVn, "id": x.id }));
                        this.formPartnerComponent.parentCustomers = res;
                    } else { this.formPartnerComponent.parentCustomers = []; }
                }
            );
    }
    getWorkPlaces() {
        this._catalogueRepo.getPlace({ placeType: PlaceTypeEnum.Branch })
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.workPlaces = res.map(x => ({ "text": x.code + ' - ' + x.nameVn, "id": x.id }));
                    } else { this.formPartnerComponent.workPlaces = []; }
                }
            );
    }
    getPartnerGroups(): any {
        this._catalogueRepo.getPartnerGroup().subscribe((response: any) => {
            if (response != null) {
                console.log(response);
                this.formPartnerComponent.partnerGroups = response.map(x => ({ "text": x.id, "id": x.id }));
                this.getPartnerGroupActive(this.partnerType);
            }
        }, err => {
        });
    }
    getPartnerGroupActive(partnerGroup: any): any {
        if (partnerGroup === PartnerGroupEnum.AGENT) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "AGENT"));
        }
        if (partnerGroup === PartnerGroupEnum.AIRSHIPSUP) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "AIRSHIPSUP"));
        }
        if (partnerGroup === PartnerGroupEnum.CARRIER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CARRIER"));
        }
        if (partnerGroup === PartnerGroupEnum.CONSIGNEE) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CONSIGNEE"));
        }
        if (partnerGroup === PartnerGroupEnum.CUSTOMER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CUSTOMER"));
            this.isShowSaleMan = true;
        }
        if (partnerGroup === PartnerGroupEnum.SHIPPER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "SHIPPER"));
        }
        if (partnerGroup === PartnerGroupEnum.SUPPLIER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "SUPPLIER"));
        }
        if (partnerGroup === PartnerGroupEnum.ALL) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "ALL"));
        }
        if (this.partnerGroupActives.find(x => x.id === "ALL")) {
            this.partner.partnerGroup = 'AGENT;AIRSHIPSUP;CARRIER;CONSIGNEE;CUSTOMER;SHIPPER;SUPPLIER';
            this.isShowSaleMan = true;
        }
        this.formPartnerComponent.partnerForm.controls['partnerGroup'].setValue(this.partnerGroupActives);
    }

    onSubmit() {
        this.formPartnerComponent.isSubmitted = true;
        this.partner.saleMans = this.saleMandetail;
        this.partner.saleMans.forEach(element => {
            element.effectDate = element.effectDate !== null ? formatDate(element.effectDate.startDate !== undefined ? element.effectDate.startDate : element.effectDate, 'yyyy-MM-dd', 'en') : null;
            element.createDate = element.createDate !== null ? formatDate(element.createDate.startDate !== undefined ? element.createDate.startDate : element.createDate, 'yyyy-MM-dd', 'en') : null;
        });
        this.getFormPartnerData();
        console.log(this.partner);
        if (this.partner.countryId == null || this.partner.provinceId == null
            || this.partner.countryShippingId == null || this.partner.provinceShippingId == null) {
            return;
        }

        this.formPartnerComponent.partnerWorkPlace.setErrors(null);
        this.formPartnerComponent.applyDim.setErrors(null);
        this.formPartnerComponent.roundUp.setErrors(null);
        if (this.formPartnerComponent.partnerForm.valid) {
            if (this.saleMandetail.length === 0) {
                if (this.isShowSaleMan) {
                    this.toastr.error('Please add saleman and service for customer!');
                    return;
                }
            }

            if (this.saleMandetail.length > 0) {
                for (const it of this.saleMandetail) {
                    this.services.forEach(item => {
                        if (it.service[0].id === item.id) {
                            it.service = item.id;
                        }
                    });
                }
            }

            if (this.isShowSaleMan) {
                if (this.saleMandetail.length === 0) {
                    this.toastr.error('Please add saleman and service for customer!');
                } else {
                    this.onCreatePartner();
                }
            } else {
                this.onCreatePartner();
            }
        }
    }
    getFormPartnerData() {
        const formBody = this.formPartnerComponent.partnerForm.getRawValue();
        this.trimInputForm(formBody);
        this.partner.partnerGroup = !!formBody.partnerGroup ? formBody.partnerGroup[0].id : null;
        if (formBody.partnerGroup != null) {
            if (formBody.partnerGroup.find(x => x.id === "ALL")) {
                this.partner.partnerGroup = 'AGENT;AIRSHIPSUP;CARRIER;CONSIGNEE;CUSTOMER;SHIPPER;SUPPLIER';
            } else {
                let s = '';
                for (const item of formBody.partnerGroup) {
                    s = item['id'] + ';';
                }
                this.partner.partnerGroup = s.substring(0, s.length - 1);
            }
        }
        this.partner.partnerNameVn = this.formPartnerComponent.nameLocalFull.value;
        this.partner.partnerNameEn = this.formPartnerComponent.nameENFull.value;
        this.partner.contactPerson = this.formPartnerComponent.partnerContactPerson.value;
        this.partner.addressVn = this.formPartnerComponent.billingAddressLocal.value;
        this.partner.addressEn = this.formPartnerComponent.billingAddressEN.value;
        this.partner.addressShippingVn = this.formPartnerComponent.shippingAddressVN.value;
        this.partner.addressShippingEn = this.formPartnerComponent.shippingAddressEN.value;
        this.partner.shortName = this.formPartnerComponent.shortName.value;
        this.partner.tel = this.formPartnerComponent.partnerContactNumber.value;
        this.partner.fax = this.formPartnerComponent.partnerContactFaxNo.value;
        this.partner.taxCode = this.formPartnerComponent.taxCode.value;
        this.partner.email = this.formPartnerComponent.employeeEmail.value;
        this.partner.website = this.formPartnerComponent.partnerWebsite.value;
        this.partner.bankAccountNo = this.formPartnerComponent.partnerbankAccountNo.value;
        this.partner.bankAccountName = this.formPartnerComponent.partnerBankAccountName.value;
        this.partner.bankAccountAddress = this.formPartnerComponent.partnerBankAccountAddress.value;
        this.partner.note = this.formPartnerComponent.note.value;
        this.partner.public = this.formPartnerComponent.isPublic;
        this.partner.workPhoneEx = this.formPartnerComponent.employeeWorkPhone.value;
        this.partner.countryId = !!formBody.billingCountry && !!formBody.billingCountry.length ? formBody.billingCountry[0].id : null;
        this.partner.countryShippingId = !!formBody.shippingCountry && formBody.shippingCountry.length ? formBody.shippingCountry[0].id : null;
        this.partner.provinceId = !!formBody.billingProvince && !!formBody.billingProvince.length ? formBody.billingProvince[0].id : null;
        this.partner.provinceShippingId = !!formBody.shippingProvince && !!formBody.shippingProvince.length ? formBody.shippingProvince[0].id : null;
        this.partner.parentId = this.formPartnerComponent.partnerAccountRef.value;
        this.partner.workPlaceId = !!formBody.partnerWorkPlace && !!formBody.partnerWorkPlace.length ? formBody.partnerWorkPlace[0].id : null;
        this.partner.zipCode = this.formPartnerComponent.billingZipcode.value;
        this.partner.zipCodeShipping = this.formPartnerComponent.zipCodeShipping.value;
        this.partner.swiftCode = this.formPartnerComponent.partnerSwiftCode.value;
        this.partner.active = this.formPartnerComponent.active.value;
        this.partner.internalReferenceNo = this.formPartnerComponent.internalReferenceNo.value;
        this.partner.coLoaderCode = this.formPartnerComponent.coLoaderCode.value;
        this.partner.roundUpMethod = !!this.formPartnerComponent.roundUp.value ? this.formPartnerComponent.roundUp.value[0].id : null;
        this.partner.applyDim = !!this.formPartnerComponent.applyDim.value ? this.formPartnerComponent.applyDim.value[0].id : null;
    }

    trimInputForm(formBody) {
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.nameENFull, formBody.nameENFull);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.nameLocalFull, formBody.nameLocalFull);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.shortName, formBody.shortName);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.taxCode, formBody.taxCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.billingAddressEN, formBody.billingAddressEN);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.billingAddressLocal, formBody.billingAddressLocal);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.billingZipcode, formBody.billingZipcode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.shippingAddressEN, formBody.shippingAddressEN);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.shippingAddressVN, formBody.shippingAddressVN);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.zipCodeShipping, formBody.zipCodeShipping);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.internalReferenceNo, formBody.internalReferenceNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.coLoaderCode, formBody.coLoaderCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerContactPerson, formBody.partnerContactPerson);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerContactNumber, formBody.partnerContactNumber);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerContactFaxNo, formBody.partnerContactFaxNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerWebsite, formBody.partnerWebsite);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerbankAccountNo, formBody.partnerbankAccountNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerBankAccountName, formBody.partnerbankAccountNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerBankAccountAddress, formBody.partnerBankAccountAddress);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerSwiftCode, formBody.partnerSwiftCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.note, formBody.note);
    }

    onCreatePartner() {
        this._catalogueRepo.checkTaxCode(this.partner)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        console.log(res);
                        this.formPartnerComponent.isExistedTaxcode = true;
                        console.log(this.formPartnerComponent.internalReferenceNo);
                        if (this.partner.internalReferenceNo !== null) {
                            this.deleteMessage = `This Parnter is existed, please you check again!`;
                        } else {
                            this.deleteMessage = `This <b>Taxcode</b> already <b>Existed</b> in  <b>${res.shortName}</b>, If you want to Create Internal account, Please fill info to <b>Internal Reference Info</b>.`;
                        }
                        this.confirmTaxcode.show();
                    } else {
                        this.onSave();
                    }
                },
            );
    }
    onSave() {
        this._catalogueRepo.createPartner(this.partner)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this.toastr.success(res.message);
                        this.router.navigate(["/home/catalogue/partner-data"]);

                    }

                }, err => {
                });
    }
    sortBySaleMan(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMandetail = this._sortService.sort(this.saleMandetail, sortData.sortField, sortData.order);
        }
    }

    showDetailSaleMan(saleman: Saleman, id: any) {
        this.poupSaleman.isDetail = true;
        const saleMane: any = {
            description: saleman.description,
            office: saleman.office,
            effectDate: saleman.effectDate,
            status: saleman.status,
            partnerId: null,
            saleManId: saleman.saleManId,
            service: saleman.service,
            createDate: saleman.createDate,
            freightPayment: saleman.freightPayment,
            serviceName: saleman.serviceName
        };
        this.poupSaleman.showSaleman(saleMane);
        this.poupSaleman.show();
    }
}
