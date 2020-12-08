
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
import { NgProgress } from '@ngx-progressbar/core';
import { formatDate } from '@angular/common';
import { SystemConstants } from 'src/constants/system.const';
import { Company } from '@models';


@Component({
    selector: 'app-partner-detail',
    templateUrl: './detail-partner.component.html',
    styleUrls: ['./detail-partner.component.scss']
})
export class PartnerDetailComponent extends AppList {
    @ViewChild(FormAddPartnerComponent, { static: false }) formPartnerComponent: FormAddPartnerComponent;
    @ViewChild("popupDeleteSaleman", { static: false }) confirmDeleteSalemanPopup: ConfirmPopupComponent;
    @ViewChild("popupDeletePartner", { static: false }) confirmDeletePartnerPopup: ConfirmPopupComponent;
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
    isExistedTaxcode: boolean = false;
    currenctUser: any = '';
    company: Company[] = [];
    salemansId: string = null;

    list: any[] = [];

    isDup: boolean = false;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private toastr: ToastrService,
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }


    ngOnInit() {
        this.getComboboxDataSaleman();
        this.initHeaderSalemanTable();
        this.route.params.subscribe((prams: any) => {
            if (!!prams.id) {
                this.partner.id = prams.id;
                this.dataSearchSaleman.partnerId = this.partner.id;
            }
        });
        this.getDataCombobox();
        const claim = localStorage.getItem(SystemConstants.USER_CLAIMS);
        this.currenctUser = JSON.parse(claim)["id"];
    }

    RequireSaleman(partnerGroup: string): boolean {
        this.isShowSaleMan = false;
        if (partnerGroup != null) {
            if (partnerGroup.includes('CUSTOMER') || partnerGroup.includes('ALL')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    getParnerDetails() {
        this._progressRef.start();
        this._catalogueRepo.getDetailPartner(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.partner = res;
                        this.isShowSaleMan = this.checkRequireSaleman(this.partner.partnerGroup);
                        this.formPartnerComponent.setFormData(this.partner);
                    }
                }
            );

    }
    checkRequireSaleman(partnerGroup: string): boolean {
        this.isShowSaleMan = false;
        if (partnerGroup != null) {
            if (partnerGroup.includes('CUSTOMER') || partnerGroup.includes('ALL')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    getSalemanPagingByPartnerId(dataSearchSaleman?: any) {
        this.isLoading = true;
        this._catalogueRepo.getListSaleManDetail(Object.assign({}, dataSearchSaleman, { partnerId: this.partner.id }))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        console.log(res);
                        this.saleMandetail = (res || []).map((item: Saleman) => new Saleman(item));
                        if (this.saleMandetail.length > 0) {
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

    initHeaderSalemanTable() {
        this.headerSaleman = [
            { title: '', field: '', sortable: false },
            { title: 'Saleman', field: 'saleman_ID', sortable: true },
            { title: 'Service', field: 'service', sortable: true },
            { title: 'Office', field: 'office', sortable: true },
            { title: 'Company', field: 'company', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'CreatedDate', field: 'createDate', sortable: true }
        ];
    }
    closePopupSaleman(param: SalemanAdd) {
        this.salemanToAdd = param;
        this.salemanToAdd.partnerId = this.partner.id;
        this.poupSaleman.isDetail = false;
        this.isDup = this.saleMandetail.some((saleMane: Saleman) => (saleMane.service === this.salemanToAdd.service && saleMane.office === this.salemanToAdd.office));

        if (this.isDup) {
            for (const it of this.saleMandetail) {
                const index = this.services.findIndex(x => x.id === it.service);
                if (index > -1) {
                    it.serviceName = this.services[index].text;
                }
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
                                // this.saleMandetail.push(this.salemanToAdd);
                                this.saleMandetail = [...this.saleMandetail, this.salemanToAdd];
                                this.poupSaleman.hide();
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
        const id = this.saleMandetail[index].id;
        this.deleteSaleman(this.index, id);
    }

    showPopupSaleman() {
        this.poupSaleman.isSave = false;
        this.poupSaleman.isDetail = false;
        this.poupSaleman.resetForm();
        this.poupSaleman.show();
    }

    onDeleteSaleman() {
        if (this.saleMandetail.length === 1) {
            this._toastService.error('Salesman must have one row!');
            this.confirmDeleteSalemanPopup.hide();
            return;
        }
        this.confirmDeleteSalemanPopup.hide();
        if (!!this.salemansId) {
            this._catalogueRepo.deleteSaleman(this.salemansId, this.partner.id)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success(res.message);
                            this.saleMandetail = [...this.saleMandetail.slice(0, this.index), ...this.saleMandetail.slice(this.index + 1)];
                            this.confirmDeleteSalemanPopup.hide();
                        } else {
                            this._toastService.error(res.message);
                        }
                    }
                );
        } else {
            if (this.saleMandetail.length > 0) {
                this.saleMandetail = [...this.saleMandetail.slice(0, this.index), ...this.saleMandetail.slice(this.index + 1)];
                if (!this.salemansId) {
                    this._toastService.success('Data delete success!');
                }
            }
        }
    }
    deleteSaleman(index: any, id: string) {
        this.index = index;
        this.salemansId = id;
        this.deleteMessage = `Do you want to delete sale man  ${this.saleMandetail[index].username}?`;
        this.confirmDeleteSalemanPopup.show();
    }
    getDataCombobox() {
        forkJoin([
            this._catalogueRepo.getCountryByLanguage(),
            this._catalogueRepo.getProvinces(),
            this._catalogueRepo.getPartnersByType(PartnerGroupEnum.CUSTOMER),
            this._catalogueRepo.getPartnerGroup(),
            this._catalogueRepo.getPlace({ placeType: PlaceTypeEnum.Branch }),
            this._catalogueRepo.getPartnerCharge(this.partner.id)
        ])
            .pipe(catchError(this.catchError))
            .subscribe(
                ([countries, provinces, customers, partnerGroups, workPlaces, partnerCharge]) => {
                    this.formPartnerComponent.countries = this.utility.prepareNg2SelectData(countries || [], 'id', 'name');
                    this.formPartnerComponent.billingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    this.formPartnerComponent.shippingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    // this.formPartnerComponent.parentCustomers = this.utility.prepareNg2SelectData(customers || [], 'id', 'partnerNameVn');
                    this.formPartnerComponent.parentCustomers = customers;
                    this.formPartnerComponent.partnerGroups = this.utility.prepareNg2SelectData(partnerGroups || [], 'id', 'id');
                    this.getPartnerGroupActive(this.partnerType);
                    this.formPartnerComponent.workPlaces = this.utility.prepareNg2SelectData(workPlaces || [], 'id', 'nameVn');
                    this.getParnerDetails();

                    // * Update other charge.
                    this.formPartnerComponent.otherChargePopup.initCharges = partnerCharge || [];
                    this.formPartnerComponent.otherChargePopup.charges = partnerCharge || [];

                },
                () => { },

            );
    }
    getComboboxDataSaleman(): any {
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
                        this.getSalemanPagingByPartnerId(this.dataSearchSaleman);
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
        this.partner.saleMans = this.saleMandetail;
        this.formPartnerComponent.isSubmitted = true;
        this.getFormPartnerData();
        this.partner.saleMans.forEach(element => {
            element.effectDate = element.effectDate !== null ? formatDate(element.effectDate.startDate !== undefined ? element.effectDate.startDate : element.effectDate, 'yyyy-MM-dd', 'en') : null;
            element.createDate = element.createDate !== null ? formatDate(element.createDate.startDate !== undefined ? element.createDate.startDate : element.createDate, 'yyyy-MM-dd', 'en') : null;
        });
        if (this.partner.countryId == null || this.partner.provinceId == null
            || this.partner.countryShippingId == null || this.partner.provinceShippingId == null) {
            return;
        }

        this.formPartnerComponent.partnerWorkPlace.setErrors(null);
        this.formPartnerComponent.applyDim.setErrors(null);
        this.formPartnerComponent.roundUp.setErrors(null);
        if (this.formPartnerComponent.partnerForm.valid) {
            this.partner.accountNo = this.partner.id;
            if (this.saleMandetail.length === 0) {
                if (this.isShowSaleMan) {
                    this.toastr.error('Please add saleman and service for customer!');
                    return;
                }
            }

            if (this.saleMandetail.length > 0) {
                for (const it of this.saleMandetail) {
                    this.services.forEach(item => {
                        if (it.service === item.id) {
                            it.serviceName = item.text;
                        }
                    });
                }
            }

            if (this.isShowSaleMan) {
                if (this.saleMandetail.length === 0) {
                    this.toastr.error('Please add saleman and service for customer!');
                } else {
                    this.partner.saleMans = this.saleMandetail;
                    this.updatePartner();
                }
            } else {
                this.partner.saleMans = [];
                this.updatePartner();
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
                    s = s + item['id'] + ';';
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
        this.partner.parentId = !!formBody.partnerAccountRef && !!formBody.partnerAccountRef.length ? formBody.partnerAccountRef[0].id : null;
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
    trimInputForm(formBody: any) {
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
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerBankAccountName, formBody.partnerBankAccountName);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerBankAccountAddress, formBody.partnerBankAccountAddress);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerSwiftCode, formBody.partnerSwiftCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.note, formBody.note);
    }

    updatePartner() {
        this._catalogueRepo.checkTaxCode(this.partner)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        console.log(res);
                        this.formPartnerComponent.isExistedTaxcode = true;
                        this.deleteMessage = `This <b>Taxcode</b> already <b>Existed</b> in  <b>${res.shortName}</b>, If you want to Create Internal account, Please fill info to <b>Internal Reference Info</b>.`;
                        this.confirmTaxcode.show();
                    } else {
                        this.onSave();
                    }
                },
            );
    }
    onSave() {

        this._progressRef.start();
        this._catalogueRepo.updatePartner(this.partner.id, this.partner)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.router.navigate(["/home/catalogue/partner-data"]);
                    } else {
                        this._toastService.warning(res.message);
                    }
                }
            );
    }
    sortBySaleMan(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMandetail = this._sortService.sort(this.saleMandetail, sortData.sortField, sortData.order);
        }
    }

    showDetailSaleMan(saleman: Saleman, id: any) {
        this.poupSaleman.isDetail = true;

        //const obj = this.saleMandetail.find(x => x.id === id);
        const saleMane: any = {
            description: saleman.description,
            office: saleman.office,
            effectDate: saleman.effectDate,
            status: saleman.status,
            partnerId: null,
            saleManId: saleman.saleManId,
            service: saleman.service,
            freightPayment: saleman.freightPayment,
            serviceName: saleman.serviceName
        };
        this.poupSaleman.allowDelete = this.partner.permission.allowDelete;
        this.poupSaleman.showSaleman(saleMane);
        this.poupSaleman.show();
    }
    showConfirmDelete() {
        this.deleteMessage = `Do you want to delete this partner  ${this.partner.partnerNameEn}?`;
        this.confirmDeletePartnerPopup.show();
    }
    onDelete() {
        this._catalogueRepo.deletePartner(this.partner.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.confirmDeletePartnerPopup.hide();
                        this.router.navigate(["/home/catalogue/partner-data"]);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }
}
