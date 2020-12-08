import { Component } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { CommonEnum } from 'src/app/shared/enums/common.enum';
import { CatalogueRepo, SystemRepo, DocumentationRepo } from 'src/app/shared/repositories';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { catchError, finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { formatDate } from '@angular/common';
import { CsShippingInstruction } from 'src/app/shared/models/document/shippingInstruction.model';

@Component({
    selector: 'app-sea-lcl-export-bill-instruction',
    templateUrl: './sea-lcl-export-bill-instruction.component.html'
})
export class SeaLclExportBillInstructionComponent extends AppForm {
    formSI: FormGroup;
    userIssues: any[] = [];
    suppliers: any[] = [];
    consignees: any[] = [];
    shippers: any[] = [];
    ports: any[] = [];
    termTypes: CommonInterface.INg2Select[];
    shippingInstruction: any;

    siRefNo: AbstractControl;
    issueDate: AbstractControl;
    issuedUser: AbstractControl;
    supplier: AbstractControl;
    invoiceNoticeRecevier: AbstractControl;
    shipper: AbstractControl;
    consignee: AbstractControl;
    consigneeDescription: AbstractControl;
    cargoNoticeRecevier: AbstractControl;
    realShipper: AbstractControl;
    actualShipperDescription: AbstractControl;
    realconsignee: AbstractControl;
    actualConsigneeDescription: AbstractControl;
    term: AbstractControl;
    remark: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    poDelivery: AbstractControl;
    voyNo: AbstractControl;
    loadingDate: AbstractControl;
    contSealNo: AbstractControl;
    desOfGoods: AbstractControl;
    sumContainers: AbstractControl;
    packages: AbstractControl;
    gw: AbstractControl;
    cbm: AbstractControl;

    constructor(private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.getUserIssuses();
        this.getSuppliers();
        this.getConsignees();
        this.getShippers();
        this.getPorts();
    }
    setformValue(res) {
        if (!!res) {
            this.formSI.setValue({
                siRefNo: res.refNo, // * disabled
                bookingNo: res.bookingNo,
                issueDate: !!res.invoiceDate ? { startDate: new Date(res.invoiceDate), endDate: new Date(res.invoiceDate) } : null,
                issuedUser: res.issuedUser,
                supplier: res.supplier,
                invoiceNoticeRecevier: res.invoiceNoticeRecevier,
                shipper: res.shipper,
                consignee: res.consigneeId,
                consigneeDescription: res.consigneeDescription,
                cargoNoticeRecevier: res.cargoNoticeRecevier,
                realShipper: res.actualShipperId,
                actualShipperDescription: res.actualShipperDescription,
                realconsignee: res.actualConsigneeId,
                actualConsigneeDescription: res.actualConsigneeDescription,
                term: [this.termTypes.find(type => type.id === res.paymenType)],
                remark: res.remark,
                pol: res.pol,
                pod: res.pod,
                poDelivery: res.poDelivery,
                voyNo: res.voyNo,
                loadingDate: !!res.loadingDate ? { startDate: new Date(res.loadingDate), endDate: new Date(res.loadingDate) } : null,
                contSealNo: res.containerSealNo,
                desOfGoods: res.goodsDescription,
                sumContainers: res.containerNote,
                packages: res.packagesNote,
                gw: res.grossWeight,
                cbm: res.volume
            });
        }
    }
    initForm() {
        this.formSI = this._fb.group({
            siRefNo: [{ value: null, disabled: true }], // * disabled
            bookingNo: [],
            issueDate: [null, Validators.required],
            issuedUser: [null, Validators.required],
            supplier: [null, Validators.required],
            invoiceNoticeRecevier: [],
            shipper: ['', Validators.required],
            consignee: [null, Validators.required],
            consigneeDescription: [null, Validators.required],
            cargoNoticeRecevier: [],
            realShipper: [],
            actualShipperDescription: [],
            realconsignee: [],
            actualConsigneeDescription: [],
            term: [],
            remark: [],
            pol: [null, Validators.required],
            pod: [null, Validators.required],
            poDelivery: ['', Validators.required],
            voyNo: ['', Validators.required],
            loadingDate: [null, Validators.required],
            contSealNo: [],
            desOfGoods: [],
            sumContainers: [],
            packages: [],
            gw: [],
            cbm: []
        });
        this.siRefNo = this.formSI.controls["siRefNo"];
        this.issueDate = this.formSI.controls["issueDate"];
        this.issuedUser = this.formSI.controls["issuedUser"];
        this.supplier = this.formSI.controls["supplier"];
        this.invoiceNoticeRecevier = this.formSI.controls["invoiceNoticeRecevier"];
        this.shipper = this.formSI.controls["shipper"];
        this.consignee = this.formSI.controls["consignee"];
        this.consigneeDescription = this.formSI.controls["consigneeDescription"];
        this.cargoNoticeRecevier = this.formSI.controls["cargoNoticeRecevier"];
        this.realShipper = this.formSI.controls["realShipper"];
        this.actualShipperDescription = this.formSI.controls["actualShipperDescription"];
        this.realconsignee = this.formSI.controls["realconsignee"];
        this.actualConsigneeDescription = this.formSI.controls["actualConsigneeDescription"];
        this.term = this.formSI.controls["term"];
        this.remark = this.formSI.controls["remark"];
        this.pol = this.formSI.controls["pol"];
        this.pod = this.formSI.controls["pod"];
        this.poDelivery = this.formSI.controls["poDelivery"];
        this.voyNo = this.formSI.controls["voyNo"];
        this.loadingDate = this.formSI.controls["loadingDate"];
        this.contSealNo = this.formSI.controls["contSealNo"];
        this.desOfGoods = this.formSI.controls["desOfGoods"];
        this.sumContainers = this.formSI.controls["sumContainers"];
        this.packages = this.formSI.controls["packages"];
        this.gw = this.formSI.controls["gw"];
        this.cbm = this.formSI.controls["cbm"];
    }
    getPorts() {
        this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA })
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.ports = res;
                },
            );
    }
    getShippers() {
        this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.SHIPPER)
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.shippers = res;
                },
            );
    }
    getConsignees() {
        this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CONSIGNEE).pipe(
            catchError(this.catchError),
            finalize(() => { })
        )
            .subscribe(
                (res: any) => {
                    this.consignees = res;
                },
            );
    }
    getSuppliers() {
        this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CARRIER).pipe(
            catchError(this.catchError),
            finalize(() => { })
        )
            .subscribe(
                (res: any) => {
                    this.suppliers = res;
                },
            );
    }
    getUserIssuses() {
        this._systemRepo.getSystemUsers()
            .pipe(
                catchError(this.catchError),
                finalize(() => { })
            )
            .subscribe(
                (res: any) => {
                    this.userIssues = res;
                },
            );
    }

    onSelectDataForm(data, type) {
        switch (type) {
            case 'issuedUser':
                this.issuedUser.setValue(data.id);
                break;
            case 'supplier':
                this.supplier.setValue(data.id);
                break;
            case 'consignee':
                this.consignee.setValue(data.id);
                const indexConsignee = this.consignees.findIndex(x => x.id === data.id);
                if (indexConsignee > -1) {
                    this.getConsigneeDescription(this.consignees[indexConsignee]);
                }
                break;
            case 'realshipper':
                this.realShipper.setValue(data.id);
                const indexShipper = this.shippers.findIndex(x => x.id === data.id);
                if (indexShipper > -1) {
                    this.getActualShipperDescription(this.shippers[indexShipper]);
                }
                break;
            case 'realconsignee':
                this.realconsignee.setValue(data.id);
                const indexRealConsignee = this.consignees.findIndex(x => x.id === data.id);
                if (indexRealConsignee > -1) {
                    this.getActualConsigneeDescription(this.consignees[indexRealConsignee]);
                }
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            default:
                break;
        }
    }
    onSubmitForm() {
        const form: any = this.formSI.getRawValue();
        const formData = {
            refNo: form.siRefNo,
            bookingNo: form.bookingNo,
            invoiceDate: !!form.issueDate && !!form.issueDate.startDate ? formatDate(form.issueDate.startDate, 'yyyy-MM-dd', 'en') : null,
            issuedUser: form.issuedUser,
            supplier: form.supplier,
            invoiceNoticeRecevier: form.invoiceNoticeRecevier,
            shipper: form.shipper,
            consigneeId: form.consignee,
            consigneeDescription: form.consigneeDescription,
            cargoNoticeRecevier: form.cargoNoticeRecevier,
            actualShipperId: form.realShipper,
            actualShipperDescription: form.actualShipperDescription,
            actualConsigneeId: form.realconsignee,
            actualConsigneeDescription: form.actualConsigneeDescription,
            paymenType: !!form.term ? form.term[0].id : null,
            remark: form.remark,
            pol: form.pol,
            pod: form.pod,
            poDelivery: form.poDelivery,
            voyNo: form.voyNo,
            loadingDate: !!form.loadingDate && !!form.loadingDate.startDate ? formatDate(form.loadingDate.startDate, 'yyyy-MM-dd', 'en') : null,
            containerSealNo: form.contSealNo,
            goodsDescription: form.desOfGoods,
            containerNote: form.sumContainers,
            packagesNote: form.packages,
            grossWeight: form.gw,
            volume: form.cbm
        };
        const shippingModel: CsShippingInstruction = new CsShippingInstruction(formData);
        return shippingModel;
    }
    getActualConsigneeDescription(consignee: any) {
        const description = consignee.shortName +
            (consignee.addressEn == null ? '\n' : ("\nAddress: " + consignee.addressEn));
        this.actualConsigneeDescription.setValue(description);
    }
    getActualShipperDescription(shipper: any) {
        const description = shipper.shortName +
            (shipper.addressEn == null ? '\n' : ("\nAddress: " + shipper.addressEn));
        this.actualShipperDescription.setValue(description);
    }
    getConsigneeDescription(consignee: any) {
        const description = consignee.shortName +
            (consignee.addressEn == null ? '\n' : ("\nAddress: " + consignee.addressEn));
        this.consigneeDescription.setValue(description);
    }
}
