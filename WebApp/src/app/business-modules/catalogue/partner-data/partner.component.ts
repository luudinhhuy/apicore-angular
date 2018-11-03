import { Component, OnInit, ViewChild } from '@angular/core';
import { ColumnSetting } from 'src/app/shared/models/layout/column-setting.model';
import { PARTNERDATACOLUMNSETTING } from './partner-data.columns';
import { TypeSearch } from 'src/app/shared/enums/type-search.enum';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { AgentComponent } from './agent/agent.component';
import { PagerSetting } from 'src/app/shared/models/layout/pager-setting.model';
import { PAGINGSETTING } from 'src/constants/paging.const';
import { AllPartnerComponent } from './all/all-partner.component';
import { ConsigneeComponent } from './consignee/consignee.component';
import { CustomerComponent } from './customer/customer.component';
import { BaseService } from 'src/services-base/base.service';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { API_MENU } from 'src/constants/api-menu.const';
import { SortService } from 'src/app/shared/services/sort.service';
import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { Router } from '@angular/router';
import { AirShipSupComponent } from './air-ship-sup/air-ship-sup.component';
import { CarrierComponent } from './carrier/carrier.component';
import { ShipperComponent } from './shipper/shipper.component';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.sass']
})
export class PartnerComponent implements OnInit {
  selectedFilter = "All";
  pager: PagerSetting = PAGINGSETTING;
  partnerDataSettings: ColumnSetting[] = PARTNERDATACOLUMNSETTING;
  configSearch: any = {
    selectedFilter: this.selectedFilter,
    settingFields: this.partnerDataSettings,
    typeSearch: TypeSearch.intab
  };
  titleConfirmDelete: string = "Do you want to delete this partner?";
  criteria: any = { partnerGroup: PartnerGroupEnum.CUSTOMER };
  partner: Partner;
  partnerType: any;

  @ViewChild(AgentComponent) agentComponent; 
  @ViewChild(AllPartnerComponent) allPartnerComponent; 
  @ViewChild(ConsigneeComponent) consigneeComponent; 
  @ViewChild(CustomerComponent) customerComponent; 
  @ViewChild(AirShipSupComponent) airShipSupComponent; 
  @ViewChild(CarrierComponent) carrierComponent; 
  @ViewChild(ShipperComponent) shipperComponent; 

  constructor(private baseService: BaseService,
    private toastr: ToastrService, 
    private spinnerService: Ng4LoadingSpinnerService,
    private api_menu: API_MENU,
    private sortService: SortService,
    private router:Router) { }

  ngOnInit() {
    this.tabSelect('customerTab');
  }
  onSearch(event){
    if(event.field == "All"){
      this.criteria.all = event.searchString;
    }
    else{
      this.criteria.all = null;
      if(event.field == "id"){
        this.criteria.id = event.searchString;
      }
      if(event.field == "shortName"){
        this.criteria.shortName = event.searchString;
      }
      if(event.field == "addressVn"){
        this.criteria.addressVn = event.searchString;
      }
      if(event.field == "taxCode"){
        this.criteria.taxCode = event.searchString;
      }
      if(event.field == "tel"){
        this.criteria.tel = event.searchString;
      }
      if(event.field == "fax"){
        this.criteria.fax = event.searchString;
      }
      if(event.field == "userCreated"){
        this.criteria.userCreated = event.searchString;
      }
    }
    if(this.criteria.partnerGroup == PartnerGroupEnum.AGENT){
      this.agentComponent.getPartnerData(this.pager, this.criteria);
    }
    if(this.criteria.partnerGroup == PartnerGroupEnum.AGENT){
      this.agentComponent.getPartnerData(this.pager, this.criteria);
    }
  }
  tabSelect(tabName){
    if(tabName == "customerTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.CUSTOMER;
      this.partnerType = PartnerGroupEnum.CUSTOMER;
      this.customerComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "agentTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.AGENT;
      this.partnerType = PartnerGroupEnum.AGENT;
      this.agentComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "carrierTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.CARRIER;
      this.partnerType = PartnerGroupEnum.CARRIER;
      this.carrierComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "consigneeTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.CONSIGNEE;
      this.partnerType = PartnerGroupEnum.CONSIGNEE;
      this.consigneeComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "airshipsupTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.AIRSHIPSUP;
      this.partnerType = PartnerGroupEnum.AIRSHIPSUP;
      this.airShipSupComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "shipperTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.SHIPPER;
      this.partnerType = PartnerGroupEnum.SHIPPER;
      this.shipperComponent.getPartnerData(this.pager, this.criteria);
    }
    if(tabName == "allTab"){
      this.criteria.partnerGroup = PartnerGroupEnum.ALL;
      this.partnerType = PartnerGroupEnum.ALL;
      this.allPartnerComponent.getPartnerData(this.pager, this.criteria);
    }
  }
  resetSearch(event){
  }

  async onDelete(event) {
    console.log(event);
    this.partner = event;
    if (event) {
      this.baseService.delete(this.api_menu.Catalogue.PartnerData.delete + this.partner.id).subscribe((response: any) => {
        if (response.status == true) {
          this.toastr.success(response.message);
          // this.pager.currentPage = 1;
          // this.getPartnerData(this.pager);
          // setTimeout(() => {
          //   this.child.setPage(this.pager.currentPage);
          // }, 300);
         
        }
        if (response.status == false) {
          this.toastr.error(response.message);
        }
      }, error => this.baseService.handleError(error));
    }
  }

  addPartner(){
   this.router.navigate(["/home/catalogue/partner-data-addnew",{ partnerType: this.partnerType }]);
  }
}
