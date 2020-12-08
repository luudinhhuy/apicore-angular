import { Component, Output, EventEmitter } from "@angular/core";
import { AppForm } from "src/app/app.form";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";
import { Observable } from "rxjs";
import { Customer, PortIndex } from "@models";
import { CatalogueRepo, SystemRepo } from "@repositories";
import { Store } from "@ngrx/store";
import { IAppState, getMenuUserPermissionState } from "@store";
import { formatDate } from "@angular/common";
import { catchError, finalize, takeUntil } from "rxjs/operators";
import { CommonEnum } from "@enums";
import { SystemConstants } from "src/constants/system.const";

@Component({
    selector: 'sheet-debit-report-form-search',
    templateUrl: './form-search-sheet-debit-report.component.html'
})

export class SheetDebitReportFormSearchComponent extends AppForm {
    @Output() onSearch: EventEmitter<ReportInterface.ISaleReportCriteria> = new EventEmitter<ReportInterface.ISaleReportCriteria>();

    menuPermission: SystemInterface.IUserPermission;

    formSearch: FormGroup;
    serviceDate: AbstractControl;
    dateType: AbstractControl;
    customer: AbstractControl;
    carrier: AbstractControl;
    agent: AbstractControl;
    service: AbstractControl;
    currency: AbstractControl;
    refNo: AbstractControl;
    refNoType: AbstractControl;
    office: AbstractControl;
    department: AbstractControl;
    group: AbstractControl;
    staff: AbstractControl;
    staffType: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    typeReport: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'taxCode', label: 'Tax Code' },
        { field: 'shortName', label: 'Name ABBR' }
    ];

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' }
    ];

    customers: Observable<Customer[]>;
    carriers: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;

    dateTypeList: any[] = [];
    dateTypeActive: any[] = [];
    serviceList: any[] = [];
    serviceActive: any[] = [];
    currencyList: any[] = [];
    currencyActive: any[] = [];
    refNoTypeList: any[] = [];
    refNoTypeActive: any[] = [];
    officeList: any[] = [];
    officeActive: any[] = [];
    departmentList: any[] = [];
    departmentActive: any[] = [];
    groupList: any[] = [];
    groupActive: any[] = [];
    staffList: any[] = [];
    staffActive: any[] = [];
    staffTypeList: any[] = [];
    staffTypeActive: any[] = [];
    typeReportList: any[] = [];
    typeReportActive: any[] = [];

    userLogged: any;
    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>,
        private _systemRepo: SystemRepo,
    ) {
        super();
    }

    ngOnInit() {
        this.initDataInform();
        this.initFormSearch();
        this.customers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER, null);
        this.agents = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.AGENT, null);
        this.carriers = this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CARRIER, null);
        this.ports = this._catalogueRepo.getListPort({ placeType: CommonEnum.PlaceTypeEnum.Port });

        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this._store.select(getMenuUserPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: SystemInterface.IUserPermission) => {
                if (res !== null && res !== undefined && Object.keys(res).length !== 0) {
                    this.menuPermission = res;
                    if (this.menuPermission.list !== 'None') {
                        this.getDataUserLever();
                        this.getStaff();
                    }
                }
            });
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            serviceDate: [{
                startDate: this.createMoment().startOf('month').toDate(),
                endDate: this.createMoment().endOf('month').toDate(),
            }],
            dateType: [this.dateTypeActive],
            customer: [],
            carrier: [],
            agent: [],
            service: [this.serviceActive],
            currency: [this.currencyActive],
            refNo: [],
            refNoType: [this.refNoTypeActive],
            office: [this.officeActive],
            department: [this.departmentActive],
            group: [this.groupActive],
            staff: [this.staffActive],
            staffType: [this.staffTypeActive],
            pol: [],
            pod: [],
            typeReport: [this.typeReportActive]
        });

        this.serviceDate = this.formSearch.controls['serviceDate'];
        this.dateType = this.formSearch.controls['dateType'];
        this.customer = this.formSearch.controls['customer'];
        this.carrier = this.formSearch.controls['carrier'];
        this.agent = this.formSearch.controls['agent'];
        this.service = this.formSearch.controls['service'];
        this.currency = this.formSearch.controls['currency'];
        this.refNo = this.formSearch.controls['refNo'];
        this.refNoType = this.formSearch.controls['refNoType'];
        this.office = this.formSearch.controls['office'];
        this.department = this.formSearch.controls['department'];
        this.group = this.formSearch.controls['group'];
        this.staff = this.formSearch.controls['staff'];
        this.staffType = this.formSearch.controls['staffType'];
        this.pol = this.formSearch.controls['pol'];
        this.pod = this.formSearch.controls['pod'];
        this.typeReport = this.formSearch.controls['typeReport'];
    }

    initDataInform() {
        this.getDateType();
        this.getService();
        this.getCurrency();
        this.getRefNoType();
        this.getStaffType();
        this.getTypeReport();
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'customer':
                this.customer.setValue(data.id);
                break;
            case 'carrier':
                this.carrier.setValue(data.id);
                break;
            case 'agent':
                this.agent.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'service':
                if (data.id === 'All') {
                    this.serviceActive = [];
                    this.serviceActive.push({ id: 'All', text: "All" });
                } else {
                    this.serviceActive.push(data);
                    this.detectServiceWithAllOption('service', data);
                    this.service.setValue(this.serviceActive);
                }
                break;
            case 'office':
                if (data.id === 'All') {
                    this.officeActive = [];
                    this.officeActive.push({ id: 'All', text: "All" });
                } else {
                    this.officeActive.push(data);
                    this.detectServiceWithAllOption('office', data);
                    this.office.setValue(this.officeActive);
                }
                break;
            case 'department':
                if (data.id === 'All') {
                    this.departmentActive = [];
                    this.departmentActive.push({ id: 'All', text: "All" });
                } else {
                    this.departmentActive.push(data);
                    this.detectServiceWithAllOption('department', data);
                    this.department.setValue(this.departmentActive);
                }
                break;
            case 'group':
                if (data.id === 'All') {
                    this.groupActive = [];
                    this.groupActive.push({ id: 'All', text: "All" });
                } else {
                    this.groupActive.push(data);
                    this.detectServiceWithAllOption('group', data);
                    this.group.setValue(this.groupActive);
                }
                break;
            case 'staff':
                if (data.id === 'All') {
                    this.staffActive = [];
                    this.staffActive.push({ id: 'All', text: "All" });
                } else {
                    this.staffActive.push(data);
                    this.detectServiceWithAllOption('staff', data);
                    this.staff.setValue(this.staffActive);
                }
                break;
            case 'currency':
                this.currencyActive = [];
                this.currencyActive.push(data);
                this.currency.setValue(this.currencyActive);
                break;
            case 'typeReport':
                this.typeReportActive = [];
                this.typeReportActive.push(data);
                this.typeReport.setValue(this.typeReportActive);
                break;
            default:
                break;
        }
    }

    onRemoveDataFormInfo(data: any, type: string) {
        if (type === 'service') {
            this.serviceActive.splice(this.serviceActive.findIndex((item) => item.id === data.id), 1);
        }
        if (type === 'office') {
            this.officeActive.splice(this.officeActive.findIndex((item) => item.id === data.id), 1);
        }
        if (type === 'department') {
            this.departmentActive.splice(this.departmentActive.findIndex((item) => item.id === data.id), 1);
        }
        if (type === 'group') {
            this.groupActive.splice(this.groupActive.findIndex((item) => item.id === data.id), 1);
        }
        if (type === 'staff') {
            this.staffActive.splice(this.staffActive.findIndex((item) => item.id === data.id), 1);
        }
        this.detectServiceWithAllOption(type);
    }

    detectServiceWithAllOption(type: string, data?: any) {
        if (type === "service") {
            if (!this.serviceActive.every((value) => value.id !== 'All')) {
                this.serviceActive.splice(this.serviceActive.findIndex((item) => item.id === 'All'), 1);
                this.serviceActive = [];
                this.serviceActive.push(data);
            }
        } else if (type === 'office') {
            if (!this.officeActive.every((value) => value.id !== 'All')) {
                this.officeActive.splice(this.officeActive.findIndex((item) => item.id === 'All'), 1);
                this.officeActive = [];
                this.officeActive.push(data);
            }
        } else if (type === 'department') {
            if (!this.departmentActive.every((value) => value.id !== 'All')) {
                this.departmentActive.splice(this.departmentActive.findIndex((item) => item.id === 'All'), 1);
                this.departmentActive = [];
                this.departmentActive.push(data);
            }
        } else if (type === 'group') {
            if (!this.groupActive.every((value) => value.id !== 'All')) {
                this.groupActive.splice(this.groupActive.findIndex((item) => item.id === 'All'), 1);
                this.groupActive = [];
                this.groupActive.push(data);
            }
        } else if (type === 'staff') {
            if (!this.staffActive.every((value) => value.id !== 'All')) {
                this.staffActive.splice(this.staffActive.findIndex((item) => item.id === 'All'), 1);
                this.staffActive = [];
                this.staffActive.push(data);
            }
        }
    }

    getDateType() {
        this.dateTypeList = [
            { "text": 'Service Date', "id": 'ServiceDate' },
            { "text": 'Created Date', "id": 'CreatedDate' }
        ];
        // Default value: Service Date
        this.dateTypeActive = [this.dateTypeList[0]];
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.serviceList = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        this.serviceList.unshift({ id: 'All', text: 'All' });
                        this.serviceActive = [this.serviceList[0]];
                    }
                },
            );
    }

    getCurrency() {
        this._catalogueRepo.getListCurrency()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    if (!!data) {
                        this.currencyList = data.map((item) => ({ text: item.id, id: item.id }));
                        // Default value: USD
                        this.currencyActive = [this.currencyList.filter((curr) => curr.id === "USD")[0]];
                    }
                },
            );
    }

    getRefNoType() {
        this.refNoTypeList = [
            { text: 'JOB JD', id: 'JOBID' },
            { text: 'HBL/HAWB', id: 'HBL' },
            { text: 'MBL/MAWB', id: 'MBL' }
        ];
        // Default value: JOB ID
        this.refNoTypeActive = [this.refNoTypeList[0]];
    }

    getDataUserLever() {
        this._systemRepo.getListUserLevelByUserId(this.userLogged.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        this.getOffice(res);
                        this.getDepartment(res);
                        this.getGroup(res);
                    }
                },
            );
    }

    getOffice(data: any) {
        this.officeList = data
            .filter(f => f.officeId !== null)
            .map((item: any) => ({ text: item.officeName, id: item.officeId }))
            .filter((o, i, arr) => arr.findIndex(t => t.id === o.id) === i); // Distinct office

        if (this.officeList.length > 0) {
            this.officeList.unshift({ id: 'All', text: 'All' });
            this.officeActive = [this.officeList.filter(off => off.id === this.userLogged.officeId)[0]];
        }
    }

    getDepartment(data: any) {
        this.departmentList = data
            .filter(f => f.departmentId !== null)
            .map((item: any) => ({ text: item.departmentName, id: item.departmentId.toString() }))
            .filter((d, i, arr) => arr.findIndex(t => t.id === d.id) === i); // Distinct department

        if (this.departmentList.length > 0) {
            this.departmentList.unshift({ id: 'All', text: 'All' });
            if (this.menuPermission.list === 'Office' || this.menuPermission.list === 'Company') {
                this.departmentActive = [this.departmentList[0]];
            } else {
                this.departmentActive = [this.departmentList.filter(dept => dept.id === this.userLogged.departmentId)[0]];
            }
        }
    }

    getGroup(data: any) {
        this.groupList = data
            .filter(f => f.groupId !== null)
            .map((item: any) => ({ text: item.groupName, id: item.groupId.toString() }))
            .filter((g, i, arr) => arr.findIndex(t => t.id === g.id) === i); // Distinct group

        if (this.groupList.length > 0) {
            this.groupList.unshift({ id: 'All', text: 'All' });
            if (this.menuPermission.list === 'Department') {
                this.groupActive = [this.groupList[0]];
            } else {
                this.groupActive = [this.groupList.filter((grp) => grp.id === this.userLogged.groupId)[0]];
            }
        }
    }

    getStaff() {
        let body = {};
        if (this.menuPermission.list === "All") {
            body = { type: 'all' };
        } else if (this.menuPermission.list === "Company") {
            body = { companyId: this.userLogged.companyId, type: 'company' };
        } else if (this.menuPermission.list === "Office") {
            body = {
                officeId: this.userLogged.officeId,
                companyId: this.userLogged.companyId,
                type: 'office'
            };
        } else if (this.menuPermission.list === "Department") {
            body = {
                departmentId: this.userLogged.departmentId,
                officeId: this.userLogged.officeId,
                companyId: this.userLogged.companyId,
                type: 'department'
            };
        } else if (this.menuPermission.list === "Group") {
            body = {
                groupId: this.userLogged.groupId,
                departmentId: this.userLogged.departmentId,
                officeId: this.userLogged.officeId,
                companyId: this.userLogged.companyId,
                type: 'group'
            };
        } else if (this.menuPermission.list === "Owner") {
            body = {
                userId: this.userLogged.id,
                groupId: this.userLogged.groupId,
                departmentId: this.userLogged.departmentId,
                officeId: this.userLogged.officeId,
                companyId: this.userLogged.companyId,
                type: 'owner'
            };
        }
        if (Object.keys(body).length !== 0) {
            this._systemRepo.getUserLevelByType(body)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => { }),
                ).subscribe(
                    (res: any) => {
                        if (!!res) {
                            this.staffList = res
                                .filter(f => f.userId !== null)
                                .map(item => ({ text: item.userName, id: item.userId }))
                                .filter((g, i, arr) => arr.findIndex(t => t.id === g.id) === i); // Distinct user

                            if (this.staffList.length > 0) {
                                this.staffList.unshift({ id: 'All', text: 'All' });
                                if (this.menuPermission.list === 'Group') {
                                    this.staffActive = [this.staffList[0]];
                                } else {
                                    this.staffActive = [this.staffList.filter(stf => stf.id === this.userLogged.id)[0]];
                                }
                            }
                        }
                    },
                );
        }
    }

    getStaffType() {
        this.staffTypeList = [
            { "text": 'Person In Charge', "id": 'PIC' },
            { "text": 'Salesman', "id": 'SALESMAN' },
            { "text": 'Creator', "id": 'CREATOR' }
        ];
        // Default value: Person In Charge
        this.staffTypeActive = [this.staffTypeList[0]];
    }

    getTypeReport() {
        this.typeReportList = [
            { text: 'Accountant P/L Sheet', id: CommonEnum.SHEET_DEBIT_REPORT_TYPE.ACCNT_PL_SHEET }
        ];
        // Default value: Accountant P/L Sheet
        this.typeReportActive = [this.typeReportList[0]];
    }

    searchReport() {
        const body: ReportInterface.ISaleReportCriteria = {
            serviceDateFrom: this.dateType.value[0].id === "ServiceDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDateTo: this.dateType.value[0].id === "ServiceDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            createdDateFrom: this.dateType.value[0].id === "CreatedDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            createdDateTo: this.dateType.value[0].id === "CreatedDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerId: this.customer.value,
            service: this.mapObject(this.serviceActive, this.serviceList), // ---*
            currency: this.currencyActive[0].id, // ---**
            jobId: this.refNoType.value[0].id === "JOBID" ? this.refNo.value : null,
            mawb: this.refNoType.value[0].id === "MBL" ? this.refNo.value : null,
            hawb: this.refNoType.value[0].id === "HBL" ? this.refNo.value : null,
            officeId: this.mapObject(this.officeActive, this.officeList), // ---*
            departmentId: this.mapObject(this.departmentActive, this.departmentList), // ---*
            groupId: this.mapObject(this.groupActive, this.groupList), // ---*
            personInCharge: this.staffType.value[0].id === "PIC" ? this.staffActive.map((item) => item.id).toString().replace(/(?:,)/g, ';') : null,
            salesMan: this.staffType.value[0].id === "SALESMAN" ? this.staffActive.map((item) => item.id).toString().replace(/(?:,)/g, ';') : null,
            creator: this.staffType.value[0].id === "CREATOR" ? this.staffActive.map((item) => item.id).toString().replace(/(?:,)/g, ';') : null,
            carrierId: this.carrier.value,
            agentId: this.agent.value,
            pol: this.pol.value,
            pod: this.pod.value,
            typeReport: this.typeReportActive[0].id
        };
        this.onSearch.emit(body);
    }

    mapObject(dataSelected: any[], dataList: any[]) {
        let result = '';
        if (dataSelected.length > 0) {
            if (dataSelected[0].id === 'All') {
                const list = dataList.filter(f => f.id !== 'All');
                result = list.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            } else {
                result = dataSelected.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            }
        }
        return result;
    }

    resetSearch() {
        this.formSearch.reset();
        this.resetFormControl(this.customer);
        this.resetFormControl(this.carrier);
        this.resetFormControl(this.agent);
        this.resetFormControl(this.pol);
        this.resetFormControl(this.pod);
        this.onSearch.emit(<any>{});

        this.dateTypeActive = [this.dateTypeList[0]];
        this.dateType.setValue(this.dateTypeActive);

        this.serviceActive = [this.serviceList[0]];
        this.service.setValue(this.serviceActive);

        this.currencyActive = [this.currencyList.filter((curr) => curr.id === "USD")[0]];
        this.currency.setValue(this.currencyActive);

        this.refNoTypeActive = [this.refNoTypeList[0]];
        this.refNoType.setValue(this.refNoTypeActive);

        this.staffTypeActive = [this.staffTypeList[0]];
        this.staffType.setValue(this.staffTypeActive);

        if (this.menuPermission.list !== 'None') {
            this.officeActive = [this.officeList.filter((off) => off.id === this.userLogged.officeId)[0]];
            this.office.setValue(this.officeActive);

            if (this.menuPermission.list === 'Office' || this.menuPermission.list === 'Company') {
                this.departmentActive = [this.departmentList[0]];
            } else {
                this.departmentActive = [this.departmentList.filter((dept) => dept.id === this.userLogged.departmentId)[0]];
            }
            this.department.setValue(this.departmentActive);

            if (this.menuPermission.list === 'Department') {
                this.groupActive = [this.groupList[0]];
            } else {
                this.groupActive = [this.groupList.filter((grp) => grp.id === this.userLogged.groupId)[0]];
            }
            this.group.setValue(this.groupActive);

            if (this.menuPermission.list === 'Group') {
                this.staffActive = [this.staffList[0]];
            } else {
                this.staffActive = [this.staffList.filter((stf) => stf.id === this.userLogged.id)[0]];
            }
            this.staff.setValue(this.staffActive);
        }

        this.typeReportActive = [this.typeReportList[0]];
        this.typeReport.setValue(this.typeReportActive);

        this.serviceDate.setValue({
            startDate: this.createMoment().startOf('month').toDate(),
            endDate: this.createMoment().endOf('month').toDate(),
        });
    }
}

