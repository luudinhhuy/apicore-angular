import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CsManifest } from 'src/app/shared/models/document/manifest.model';
import { FormValidators } from '@validators';
import { Store } from '@ngrx/store';
import * as fromShare from './../../../../../share-business/store';
import { GetCataloguePortAction, getCataloguePortState } from '@store';
import { CommonEnum } from '@enums';
import { PortIndex } from '@models';
import { AppForm } from 'src/app/app.form';

@Component({
    selector: 'form-manifest',
    templateUrl: './form-manifest.component.html'
})
export class ShareBusinessFormManifestComponent extends AppForm {
    @Input() type: CommonEnum.PORT_TYPE;
    formGroup: FormGroup;
    referenceNo: AbstractControl;
    supplier: AbstractControl;
    attention: AbstractControl;
    marksOfNationality: AbstractControl;
    vesselNo: AbstractControl;
    date: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    selectedPortOfLoading: any = {};
    selectedPortOfDischarge: any = {};

    isSubmitted: boolean = false;
    freightCharge: AbstractControl;
    consolidator: AbstractControl;
    deconsolidator: AbstractControl;
    weight: AbstractControl;
    volume: AbstractControl;
    agent: AbstractControl;
    freightCharges: Array<string> = ['Prepaid', 'Collect'];
    shipmentDetail: any = {}; // TODO model.
    manifest: CsManifest;
    jobId: string = '';
    @Input() isAir: boolean = false;
    isImport: boolean = false;
    defaultMarksOfNationality: string = '';
    defaultVoyNo: string = '';
    ports: Observable<PortIndex[]>;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' },
        { field: 'countryNameEN', label: 'Country' },
    ];

    constructor(
        private _fb: FormBuilder,
        private _store: Store<fromShare.IShareBussinessState>,
        private _cd: ChangeDetectorRef


    ) {
        super();
    }

    ngOnInit() {
        switch (this.type) {
            case CommonEnum.PORT_TYPE.SEA:
                this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA }));
                break;
            case CommonEnum.PORT_TYPE.AIR:
                this._store.dispatch(new GetCataloguePortAction({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.AIR }));
                break;
        }
        this.ports = this._store.select(getCataloguePortState);
        this.initForm();
    }

    ngAfterViewInit() {
        this._cd.detectChanges;
    }

    getShipmentDetail(id: any) {
        this._store.select(fromShare.getTransactionDetailCsTransactionState)
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.shipmentDetail = res;
                        console.log(this.shipmentDetail);
                        if (this.supplier.value === null) {
                            this.supplier.setValue(this.shipmentDetail.supplierName);
                        }
                        if (this.pol.value === null) {
                            this.pol.setValue(this.shipmentDetail.pol);
                        }
                        if (this.pod.value === null) {
                            this.pod.setValue(this.shipmentDetail.pod);
                        }
                        if (this.marksOfNationality.value === null) {
                            this.marksOfNationality.setValue(this.defaultMarksOfNationality);
                        }
                        if (this.freightCharge.value === null) {
                            if (this.shipmentDetail.paymentTerm !== null) {
                                this.freightCharge.setValue([<CommonInterface.INg2Select>{ id: this.shipmentDetail.paymentTerm, text: this.shipmentDetail.paymentTerm }]);
                            }
                        }
                        if (this.vesselNo.value === null) {
                            this.vesselNo.setValue(this.defaultVoyNo);
                        }
                        if (!this.isImport) {
                            this.date.setValue({ startDate: new Date(this.shipmentDetail.etd), endDate: new Date(this.shipmentDetail.etd) });
                        } else {
                            this.date.setValue({ startDate: new Date(this.shipmentDetail.eta), endDate: new Date(this.shipmentDetail.eta) });
                        }
                        if (this.agent.value === null) {
                            this.agent.setValue('TYPE NAME OF AGENT WHO ASSEMBLED THIS MANIFEST: INDO TRANS LOGISTICS CORPORATION \nSIGNATURE OF ASSEMBLING AGENT: PHONE# OF ASSEMBLING AGENT: (84 - 8) 3948 6888 \nRECEIVED BY CUSTOMS');
                        }
                    }

                }
            );
    }

    onSelectDataFormInfo(data: any, key: string) {
        switch (key) {
            case 'PortOfLoading':
                this.pol.setValue(data.id);
                break;
            case 'PortOfDischarge':
                this.pod.setValue(data.id);
                break;
        }
    }

    updateDataToForm(res: CsManifest) {
        this.formGroup.setValue({
            referenceNo: res.refNo,
            supplier: res.supplier,
            attention: res.attention,
            marksOfNationality: res.masksOfRegistration,
            vesselNo: res.voyNo,
            date: !!res.invoiceDate ? { startDate: new Date(res.invoiceDate), endDate: new Date(res.invoiceDate) } : null,
            freightCharge: [<CommonInterface.INg2Select>{ id: res.paymentTerm, text: res.paymentTerm }],
            consolidator: res.consolidator,
            deconsolidator: res.deConsolidator,
            weight: res.weight,
            volume: res.volume,
            agent: res.manifestIssuer,
            pol: res.pol,
            pod: res.pod
        });
    }

    initForm() {
        this.formGroup = this._fb.group({
            referenceNo: [],
            supplier: [null, Validators.required],
            attention: [],
            marksOfNationality: [null, Validators.required],
            vesselNo: [null, Validators.required],
            date: [null, Validators.required],
            freightCharge: [null, Validators.required],
            consolidator: [],
            deconsolidator: [],
            weight: [],
            volume: [],
            agent: [null, Validators.required],
            pol: [null, Validators.required],
            pod: [null, Validators.required]

        }, { validator: FormValidators.comparePort });
        this.referenceNo = this.formGroup.controls['referenceNo'];
        this.supplier = this.formGroup.controls['supplier'];
        this.attention = this.formGroup.controls['attention'];
        this.marksOfNationality = this.formGroup.controls['marksOfNationality'];
        this.vesselNo = this.formGroup.controls['vesselNo'];
        this.date = this.formGroup.controls['date'];
        this.freightCharge = this.formGroup.controls['freightCharge'];
        this.consolidator = this.formGroup.controls['consolidator'];
        this.deconsolidator = this.formGroup.controls['deconsolidator'];
        this.weight = this.formGroup.controls['weight'];
        this.volume = this.formGroup.controls['volume'];
        this.agent = this.formGroup.controls['agent'];
        this.pol = this.formGroup.controls['pol'];
        this.pod = this.formGroup.controls['pod'];
    }

}
