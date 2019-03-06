import * as moment from 'moment';
import { Component, OnInit, ViewChild, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
// import { PaginationComponent } from 'ngx-bootstrap';
import { BaseService } from 'src/services-base/base.service';
import { API_MENU } from 'src/constants/api-menu.const';
import { ButtonType } from 'src/app/shared/enums/type-button.enum';
import { ButtonModalSetting } from 'src/app/shared/models/layout/button-modal-setting.model';
import { NgForm, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MasterBillComponent } from './master-bill/master-bill.component';
import * as dataHelper from 'src/helper/data.helper';
import { CsTransaction } from 'src/app/shared/models/document/csTransaction';
declare var $: any;
import { CsTransactionDetail } from 'src/app/shared/models/document/csTransactionDetail';
import { ActivatedRoute, Router } from '@angular/router';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';


export class FirstLoadData {
    lstPartner: any[] = null;
    lstUnit: any[] = null;
    lstCurrency: any[] = null;
    lstCharge: any[] = null;
}

@Component({
    selector: 'app-sea-fcl-export-create',
    templateUrl: './sea-fcl-export-create.component.html',
    styleUrls: ['./sea-fcl-export-create.component.scss']
})


export class SeaFclExportCreateComponent implements OnInit {


    _firstLoadData:FirstLoadData = new FirstLoadData();
    


    shipment: CsTransaction = new CsTransaction();
    containerTypes: any[] = [];
    lstMasterContainers: any[] = [];
    lstContainerTemp: any[];
    packageTypes: any[] = [];
    commodities: any[] = [];
    weightMesurements: any[] = [];
    totalGrossWeight: number = 0;
    totalNetWeight: number = 0;
    totalCharWeight: number = 0;
    totalCBM: number = 0;
    myForm: FormGroup;
    submitted = false;
    searchcontainer: string = '';
    @ViewChild('containerMasterForm') containerMasterForm: NgForm;
    @ViewChild(MasterBillComponent) masterBillComponent: any;
    selectedCommodityValue: any;
    numberOfTimeSaveContainer: number = 0;
    saveButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.save
    };
    //
    housebillTabviewHref = '#';//'#confirm-create-job-modal';
    housebillRoleToggle = 'modal';
    indexItemConDelete = null;
    isLoaded = true;
    inEditing: boolean = false;
    isImport: boolean = false;
     /**
        * problem: Bad performance when switch between 'Shipment Detail' tab and 'House Bill List' tab
        * this method imporove performance for web when detecting change 
        * for more informations, check this reference please 
        * https://blog.bitsrc.io/boosting-angular-app-performance-with-local-change-detection-8a6a3afa8d4d
        *
      */
    
    switchTab(){
        // this.cdr.detach();
        // setTimeout(() => {
        //     this.cdr.reattach();
        //     this.cdr.checkNoChanges();
        // }, 1000);
        //if(this.shipment.id == "00000000-0000-0000-0000-000000000000"){
        if(this.inEditing == false){
            if(this.myForm.invalid){
                this.housebillTabviewHref = "#confirm-can-not-create-job-modal";
                //$('#confirm-can-not-create-job-modal').modal('show');
            }
            else{
                if(this.shipment.csMawbcontainers != null){
                    this.housebillTabviewHref = "#confirm-create-job-modal";
                    //$('#confirm-create-job-modal').modal('show');
                }
                else{
                    this.housebillTabviewHref = "#confirm-not-create-job-misscont-modal";
                    //$('#confirm-not-create-job-misscont-modal').modal('show');
                }
            }
        }
    }

    //open tab by link
    activeTab() {
        $('#masterbill-tablink').removeClass('active');
        $('#masterbill-tabview-tab').removeClass('active show');
        $('#housebill-tablink').addClass('active');
        $('#housebill-tabview-tab').addClass('active show');
    }

    constructor(private baseServices: BaseService,
        private router:Router,
        private route: ActivatedRoute,
        private api_menu: API_MENU, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
        this.initNewShipmentForm();
    }

    async ngOnInit() {
        await this.route.params.subscribe(async prams => {
            if(prams.id != undefined){
                this.inEditing = true;
                this.shipment.id = prams.id;
                await this.getShipmentDetail(this.shipment.id);
                await this.getShipmentContainer(this.shipment.id);
                this.housebillTabviewHref = "#housebill-tabview-tab";
                this.housebillRoleToggle = "tab";
                console.log(this.myForm.controls.estimatedTimeofDepature);
                if(this.isImport){
                    this.submitted = false;
                    this.isImport = false;
                }
            }
        });
        this.getContainerTypes();
        this.getPackageTypes();
        this.getComodities();
        this.getWeightTypes();
        this.getListPartner();
        this.getListUnits();
        this.getListCurrency();
        if (this.lstMasterContainers.length == 0) {
            this.lstMasterContainers.push(this.initNewContainer());
        }
        console.log(this.lstMasterContainers);
    }
    async getShipmentContainer(id: String) {
        let responses = await this.baseServices.postAsync(this.api_menu.Documentation.CsMawbcontainer.query, { mblid: id }, false, false);
        this.shipment.csMawbcontainers = this.lstMasterContainers = responses;
        if (this.lstMasterContainers != null) {
            this.getShipmentContainerDescription(this.lstMasterContainers);
        }
    }
    getShipmentContainerDescription(listContainers: any[]){
        for (var i = 0; i < listContainers.length; i++) {
            listContainers[i].isSave = true;
            this.totalGrossWeight = this.totalGrossWeight + listContainers[i].gw;
            this.totalNetWeight = this.totalNetWeight + listContainers[i].nw;
            this.totalCharWeight = this.totalCharWeight + listContainers[i].chargeAbleWeight;
            this.totalCBM = this.totalCBM + listContainers[i].cbm;
            if(this.shipment.id == "00000000-0000-0000-0000-000000000000"){
                if(this.numberOfTimeSaveContainer == 1){
                    this.shipment.packageContainer = this.shipment.packageContainer + ((listContainers[i].quantity == null && listContainers[i].containerTypeName==null)?"": (listContainers[i].quantity + "x" + listContainers[i].containerTypeName + ", "));
                    this.shipment.commodity = this.shipment.commodity + (listContainers[i].commodityName== ""?"": (listContainers[i].commodityName + ", "));
                    this.shipment.desOfGoods = this.shipment.desOfGoods + (listContainers[i].description== null?"": (listContainers[i].description + ", "));
                }
            }
        }
    }
    async getShipmentDetail(id: String) {
        this.shipment = await this.baseServices.getAsync(this.api_menu.Documentation.CsTransaction.getById + id, false, true);
        console.log(this.shipment);
    }
    initNewShipmentForm() {
        this.myForm = this.fb.group({
            jobId: new FormControl({ value: '', disabled: true }),
            estimatedTimeofDepature: new FormControl('', Validators.required),
            estimatedTimeofArrived: new FormControl(''),
            mawb: new FormControl('', Validators.required),
            //mbltype: new FormControl(null, Validators.required),
            coloaderId: new FormControl(''),
            coloaderName: new FormControl(''),
            bookingNo: new FormControl(''),
            //typeOfService: new FormControl(null, Validators.required),
            flightVesselName: new FormControl(''),
            agentId: new FormControl(null),
            agentName: new FormControl(null),
            pol: new FormControl(null),
            polName: new FormControl(null),
            pod: new FormControl(null),
            podName: new FormControl(null),
            //paymentTerm: new FormControl(''),
            voyNo: new FormControl(''),
            //shipmentType: new FormControl(null, Validators.required),
            pono: new FormControl(''),
            personIncharge: new FormControl(''),
            personInChargeName: new FormControl(''),
            notes: new FormControl(''),
            commodity: new FormControl(''),
            packageContainer: new FormControl(''),
            desOfGoods: new FormControl('')
        });
    }
    async getContainerTypes() {
        let responses = await this.baseServices.postAsync(this.api_menu.Catalogue.Unit.getAllByQuery, { unitType: "Container", inactive: false }, false, false);
        if (responses != null) {
            this.containerTypes = dataHelper.prepareNg2SelectData(responses, 'id', 'unitNameEn');
        }
    }
    async getWeightTypes() {
        let responses = await this.baseServices.postAsync(this.api_menu.Catalogue.Unit.getAllByQuery, { unitType: "Weight Measurement", inactive: false }, false, false);
        if (responses != null) {
            this.weightMesurements = dataHelper.prepareNg2SelectData(responses, 'id', 'unitNameEn');
            console.log(this.weightMesurements);
        }
    }
    async getPackageTypes() {
        let responses = await this.baseServices.postAsync(this.api_menu.Catalogue.Unit.getAllByQuery, { unitType: "Package", inactive: false }, false, false);
        if (responses != null) {
            this.packageTypes = dataHelper.prepareNg2SelectData(responses, 'id', 'unitNameEn');
            console.log(this.packageTypes);
        }
    }
    async getComodities() {
        let responses = await this.baseServices.postAsync(this.api_menu.Catalogue.Commodity.query, { inactive: false }, false, false);
        this.commodities = responses;
        console.log(this.commodities);
    }
    confirmCreateJob(){
        if(this.myForm.invalid){
            $('#confirm-can-not-create-job-modal').modal('show');
        }
        else{
            if(this.shipment.csMawbcontainers != null){
                $('#confirm-create-job-modal').modal('show');
            }
            else{
                $('#confirm-not-create-job-misscont-modal').modal('show');
            }
        }
    }
    async onSubmit() {
        this.submitted = true;
        //this.shipment = this.myForm.value;
        this.shipment.etd = this.myForm.value.estimatedTimeofDepature != null ? this.myForm.value.estimatedTimeofDepature["startDate"] : null;
        this.shipment.eta = this.myForm.value.estimatedTimeofArrived != null ? this.myForm.value.estimatedTimeofArrived["startDate"] : null;
        console.log(this.shipment);

        if (this.myForm.valid && this.shipment.pol != null) {
            console.log('abc');
            if(this.lstMasterContainers.find(x => x.isNew == false) != null){
                this.shipment.csMawbcontainers = this.lstMasterContainers.filter(x => x.isNew == false);
            }
            await this.saveJob();
        }
    }
    
    showListContainer(){
        if(this.shipment.id != "00000000-0000-0000-0000-000000000000"){
            for(let i=0; i< this.lstMasterContainers.length; i++){
                this.lstMasterContainers[i].allowEdit = false;
                this.lstMasterContainers[i].isNew = false;
                this.lstMasterContainers[i].containerTypeActive = this.lstMasterContainers[i].containerTypeId != null? [{ id: this.lstMasterContainers[i].containerTypeId, text: this.lstMasterContainers[i].containerTypeName }]: [];
                this.lstMasterContainers[i].packageTypeActive = this.lstMasterContainers[i].packageTypeId != null? [{ id: this.lstMasterContainers[i].packageTypeId, text: this.lstMasterContainers[i].packageTypeName }]: [];
                this.lstMasterContainers[i].unitOfMeasureActive = this.lstMasterContainers[i].unitOfMeasureID!= null? [{ id: this.lstMasterContainers[i].unitOfMeasureID, text: this.lstMasterContainers[i].unitOfMeasureName }]: [];
            }
        }
    }
    async saveJob(){
        if(this.shipment.id == "00000000-0000-0000-0000-000000000000"){
            this.addShipment();
        }
        else{
            if(this.inEditing == false){
                this.importShipment();
            }
            else{
                this.updateShipment();
            }
        }
    }
    async importShipment(){
        var response = await this.baseServices.postAsync(this.api_menu.Documentation.CsTransaction.import, this.shipment, true, true);
        if(response != null){
            if(response.result.success){
                this.shipment = response.model;
                this.router.navigate(["/home/documentation/sea-fcl-export-create/",{ id: this.shipment.id }]);
                this.isLoaded = false;
                setTimeout(() => {
                    this.isLoaded = true;
                  }, 300);
            }
        }
    }
    async updateShipment(){
        var response = await this.baseServices.putAsync(this.api_menu.Documentation.CsTransaction.update, this.shipment, true, true);
        if(response != null){
            if(response.status){
                this.shipment.csMawbcontainers = this.lstMasterContainers;
            }
        }
    }
    async addShipment(){
        var response = await this.baseServices.postAsync(this.api_menu.Documentation.CsTransaction.post, this.shipment, true, true);
        if(response != null){
            if(response.result.success){
                // this.shipment = response.model;
                // this.shipment.csMawbcontainers = this.lstMasterContainers;
                this.shipment = response.model;
                this.router.navigate(["/home/documentation/sea-fcl-export-create/",{ id: this.shipment.id }]);
                if(this.inEditing == false){
                    this.activeTab();
                }
                this.inEditing = true;
            }
        }
        this.housebillTabviewHref = "#housebill-tabview-tab";
        this.housebillRoleToggle = "tab";
    }
    cancelSaveJob() {
        $('#confirm-create-job-modal').modal('hide');
    }
    async showShipment(event){
        await this.getShipmentDetail(event);
        this.isLoaded = false;
        this.shipment.jobNo = null;
        this.shipment.mawb = null;
        this.isImport = true;
        await this.getShipmentContainer(event);
        this.getHouseBillList(event);
        setTimeout(() => {
            this.isLoaded = true;
          }, 300);
          this.inEditing = false;
        console.log(this.shipment);
    }
    async getHouseBillList(jobId: string){
        var responses = await this.baseServices.getAsync(this.api_menu.Documentation.CsTransactionDetail.getByJob + "?jobId=" + jobId, false, false);
        this.shipment.csTransactionDetails = responses;
    }
    /**
     * Container
     */
    
    initNewContainer() {
        var container = {
            mawb: this.shipment.id,
            containerTypeId: null,
            containerTypeName: '',
            containerTypeActive: [],
            quantity: null,
            containerNo: '',
            sealNo: '',
            markNo: '',
            unitOfMeasureId: null,
            unitOfMeasureName: '',
            unitOfMeasureActive: [],
            commodityId: null,
            commodityName: '',
            packageTypeId: null,
            packageTypeName: '',
            packageTypeActive: [],
            packageQuantity: null,
            description: null,
            gw: null,
            nw: null,
            chargeAbleWeight: null,
            cbm: null,
            packageContainer: '',
            allowEdit: true,
            isNew: true,
            verifying: false
        };
        return container;
    }
    
    addNewContainer() {
        let hasItemEdited = false;
        for (let i = 0; i < this.lstMasterContainers.length; i++) {
            if (this.lstMasterContainers[i].allowEdit == true) {
                hasItemEdited = true;
                break;
            }
        }
        if (hasItemEdited == false) {
            console.log(this.containerMasterForm);
            this.lstMasterContainers.push(this.initNewContainer());
        }
        else {
            this.baseServices.errorToast("Current container must be save!!!");
        }
    }
    removeAContainer(index: number){
        this.indexItemConDelete = index;
    }
    removeContainer(){
        this.lstMasterContainers.splice(this.indexItemConDelete, 1);
        this.shipment.csMawbcontainers = this.lstMasterContainers;
        $('#confirm-accept-delete-container-modal').modal('hide');
        this.resetSumContainer();
    }
    async saveNewContainer(index: any){
        console.log(this.containerMasterForm.submitted && this.lstMasterContainers[index].containerTypeId == null && this.lstMasterContainers[index].verifying);
        this.lstMasterContainers[index].verifying = true;
        if (this.containerMasterForm.invalid) return;
        //Cont Type, Cont Q'ty, Container No, Package Type
        let existedItem = this.lstMasterContainers.filter(x => x.containerTypeId == this.lstMasterContainers[index].containerTypeId
            && x.quantity == this.lstMasterContainers[index].quantity
            && x.containerNo == this.lstMasterContainers[index].containerNo
            && x.packageTypeId == this.lstMasterContainers[index].packageTypeId);
        if(existedItem.length > 1) { 
            this.lstMasterContainers[index].inValidRow = true;
        }
        else{
            if(this.lstMasterContainers[index].isNew == true) this.lstMasterContainers[index].isNew = false;
            else{
                this.lstMasterContainers[index].inValidRow = false;
                this.lstMasterContainers[index].containerTypeActive = this.lstMasterContainers[index].containerTypeId != null? [{ id: this.lstMasterContainers[index].containerTypeId, text: this.lstMasterContainers[index].containerTypeName }]: [];
                this.lstMasterContainers[index].packageTypeActive = this.lstMasterContainers[index].packageTypeId != null? [{ id: this.lstMasterContainers[index].packageTypeId, text: this.lstMasterContainers[index].packageTypeName }]: [];
                this.lstMasterContainers[index].unitOfMeasureActive = this.lstMasterContainers[index].unitOfMeasureId!= null? [{ id: this.lstMasterContainers[index].unitOfMeasureId, text: this.lstMasterContainers[index].unitOfMeasureName }]: [];
            }
            this.lstMasterContainers[index].allowEdit = false;
        }
        this.lstContainerTemp = Object.assign([], this.lstMasterContainers);
    }


    cancelNewContainer(index: number) {
        if (this.lstMasterContainers[index].isNew == true) {
            this.lstMasterContainers.splice(index, 1);
        }
        else {
            this.lstMasterContainers[index].allowEdit = false;
        }
    }
    changeEditStatus(index: any) {
        if (this.lstMasterContainers[index].allowEdit == false) {
            this.lstMasterContainers[index].allowEdit = true;
            for(let i =0; i< this.lstMasterContainers.length; i++){
                if(i != index){
                    this.lstMasterContainers[i].allowEdit = false;
                }
            }
        }
        else {
            this.lstMasterContainers[index].allowEdit = false;
        }
    }
    async onSubmitContainer() {
        this.numberOfTimeSaveContainer = this.numberOfTimeSaveContainer + 1;
        
        for(let i=0; i< this.lstMasterContainers.length; i++){
            this.lstMasterContainers[i].verifying = true;
        }
        if (this.containerMasterForm.valid) {

            let hasItemEdited = false;
            for(let i=0; i< this.lstMasterContainers.length; i++){
                if(this.lstMasterContainers[i].allowEdit == true){
                    hasItemEdited = true;
                    break;
                }
            }
            if(hasItemEdited == false){
                this.totalGrossWeight = 0;
                this.totalNetWeight = 0;
                this.totalCharWeight = 0;
                this.totalCBM = 0;
                if (this.numberOfTimeSaveContainer == 1 && this.inEditing == false) {
                    this.shipment.commodity = '';
                    this.shipment.desOfGoods = '';
                    this.shipment.packageContainer = '';
                }
                this.getShipmentContainerDescription(this.lstMasterContainers);
                this.shipment.csMawbcontainers = this.lstMasterContainers;
                $('#container-list-of-job-modal-master').modal('hide');
            }
            else{
                this.baseServices.errorToast("Current container must be save!!!");
            }
            
            if(this.shipment.id != "00000000-0000-0000-0000-000000000000" && this.isImport == false && this.inEditing == true){
                var response = await this.baseServices.putAsync(this.api_menu.Documentation.CsMawbcontainer.update, { csMawbcontainerModels: this.shipment.csMawbcontainers, masterId: this.shipment.id}, true, false);
                let responses = await this.baseServices.postAsync(this.api_menu.Documentation.CsMawbcontainer.query, {mblid: this.shipment.id}, false, false);
            }
        }
    }
    searchContainer(keySearch: any) {
        keySearch = keySearch != null ? keySearch.trim().toLowerCase() : "";
        this.lstMasterContainers = Object.assign([], this.lstContainerTemp).filter(
            item => (item.containerTypeName.toLowerCase().includes(keySearch)
                || (item.quantity != null ? item.quantity.toString() : "").includes(keySearch)
                || (item.containerNo != null ? item.containerNo.toLowerCase() : "").includes(keySearch)
                || (item.sealNo != null ? item.sealNo.toLowerCase() : "").includes(keySearch)
                || (item.markNo != null ? item.markNo.toLowerCase() : "").includes(keySearch)
                || (item.commodityName != null ? item.commodityName.toLowerCase() : "").includes(keySearch)
                || (item.packageTypeName != null ? item.packageTypeName.toLowerCase() : "").includes(keySearch)
                || (item.packageQuantity != null ? item.packageQuantity.toString().toLowerCase() : "").includes(keySearch)
                || (item.description != null ? item.description.toLowerCase() : "").includes(keySearch)
                || (item.nw != null ? item.nw.toString().toLowerCase() : "").includes(keySearch)
                || (item.chargeAbleWeight != null ? item.chargeAbleWeight.toString() : "").toLowerCase().includes(keySearch)
                || (item.gw != null ? item.gw.toString().toLowerCase() : "").includes(keySearch)
                || (item.unitOfMeasureName != null ? item.unitOfMeasureName.toLowerCase() : "").includes(keySearch)
                || (item.cbm != null ? item.cbm.toString().toLowerCase() : "").includes(keySearch)
            )
        );
        console.log(this.lstMasterContainers);
    }
    closeContainerPopup() {
        let index = this.lstMasterContainers.findIndex(x => x.isNew == true);
        if (index > -1) {
            this.lstMasterContainers.splice(index, 1);
        }
        this.shipment.csMawbcontainers = this.lstMasterContainers;
        if(this.shipment.csMawbcontainers == null){
            this.lstMasterContainers = [];
        }
    }
    resetSumContainer(){
        this.totalGrossWeight = 0;
        this.totalNetWeight = 0;
        this.totalCharWeight = 0;
        this.totalCBM = 0;
        this.shipment.packageContainer = '';
        this.shipment.commodity = '';
        this.shipment.desOfGoods = '';
        if(this.shipment.csMawbcontainers == null) return;
        for (var i = 0; i < this.shipment.csMawbcontainers.length; i++) {
            this.totalGrossWeight = this.totalGrossWeight + this.shipment.csMawbcontainers[i].gw;
            this.totalNetWeight = this.totalNetWeight + this.shipment.csMawbcontainers[i].nw;
            this.totalCharWeight = this.totalCharWeight + this.shipment.csMawbcontainers[i].chargeAbleWeight;
            this.totalCBM = this.totalCBM + this.shipment.csMawbcontainers[i].cbm;
            this.shipment.packageContainer = this.shipment.packageContainer + ((this.shipment.csMawbcontainers[i].quantity == null && this.shipment.csMawbcontainers[i].containerTypeName == "")?"": (this.shipment.csMawbcontainers[i].quantity + "x" + this.shipment.csMawbcontainers[i].containerTypeName + ", "));
            this.shipment.commodity = this.shipment.commodity + (this.shipment.csMawbcontainers[i].commodityName== ""?"": (this.shipment.csMawbcontainers[i].commodityName + ", "));
            this.shipment.desOfGoods = this.shipment.desOfGoods + (this.shipment.csMawbcontainers[i].description== null?"": (this.shipment.csMawbcontainers[i].description + ", "));
        }
    }

    /**
     * Daterange picker
     */
    selectedRange: any;
    selectedDate: any;
    keepCalendarOpeningWithRange: true;
    maxDate: moment.Moment = moment();
    ranges: any = {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
            moment()
                .subtract(1, 'month')
                .startOf('month'),
            moment()
                .subtract(1, 'month')
                .endOf('month')
        ]
    };


    public houseBillList: Array<object> = [];
    public houseBillCatcher(e:any) {
      this.houseBillList = e ;
      console.log({"AAAA":this.houseBillList});
    }
     /**
   * ng2-select
   */
  
  public selected(value: any): void {
    console.log('Selected value is: ', value);
  }

  public removed(value: any): void {
    console.log('Removed value is: ', value);
  }

  public typed(value: any): void {
    console.log('New search input: ', value);
  }
  public refreshValue(value: any): void {
  }



    /**
     * PREPARE DATA
     */

    getListPartner(search_key: string = null) {
        var key = "";
        if (search_key !== null && search_key.length < 3) {
            return;
        } else {
            key = search_key;
        }
        this.baseServices.post(this.api_menu.Catalogue.PartnerData.paging + "?page=" + 1 + "&size=" + 20, { partnerGroup: PartnerGroupEnum.ALL, inactive: false, all: key }).subscribe(res => {
            var data = res['data'];
            this._firstLoadData.lstPartner = data;
            console.log({"firstLoadData":this._firstLoadData})
        });
    }
    getListUnits() {
        this.baseServices.post(this.api_menu.Catalogue.Unit.getAllByQuery, { all: "", inactive: false }).subscribe((data: any) => {
          this._firstLoadData.lstUnit = data;
        });
    }
    getListCurrency(){
        // this.baseServices.post(this.api_menu.Catalogue.Currency.paging+"?page="+1+"&size="+20,{inactive:false,all:""}).subscribe(res=>{
        //     this._firstLoadData.lstCurrency = res['data'];
        // });
        this.baseServices.get(this.api_menu.Catalogue.Currency.getAll).subscribe((res:any)=>{
            this._firstLoadData.lstCurrency = res;
        });
    }

}
