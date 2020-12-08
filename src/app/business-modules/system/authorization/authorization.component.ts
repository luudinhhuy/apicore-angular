import { AppList } from "src/app/app.list";
import { Component, ViewChild } from "@angular/core";
import { NgProgress } from "@ngx-progressbar/core";
import { SystemRepo } from "@repositories";
import { SortService } from "@services";
import { ToastrService } from "ngx-toastr";
import { catchError, finalize, map } from "rxjs/operators";
import { ConfirmPopupComponent } from "@common";
import { AuthorizationAddPopupComponent } from "./components/popup/add-authorization/add-authorization.popup";
import { User, Authorization } from "@models";
import { SystemConstants } from "src/constants/system.const";

@Component({
  selector: 'app-authorization',
  templateUrl: './authorization.component.html',
})
export class AuthorizationComponent extends AppList {
  @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeletePopup: ConfirmPopupComponent;
  @ViewChild(AuthorizationAddPopupComponent, { static: false }) authorizationAddPopupComponent: AuthorizationAddPopupComponent;

  headers: CommonInterface.IHeaderTable[];

  authorizations: Authorization[] = [];
  selectedAuthorization: Authorization;
  userLogged: User;

  constructor(
    private _systemRepo: SystemRepo,
    private _sortService: SortService,
    private _progressService: NgProgress,
    private _toastService: ToastrService,
  ) {
    super();
    this._progressRef = this._progressService.ref();
    this.requestList = this.searchAuthorization;
    this.requestSort = this.sortAuthorization;
  }

  ngOnInit() {
    this.headers = [
      { title: 'Service', field: 'servicesName', sortable: true },
      { title: 'Person In Charge', field: 'userId', sortable: true },
      { title: 'Authorized Person', field: 'assignTo', sortable: true },
      { title: 'Name', field: 'name', sortable: true },
      { title: 'Effective Date', field: 'startDate', sortable: true },
      { title: 'Expiration Date', field: 'endDate', sortable: true },
      { title: 'Status', field: 'active', sortable: true },
    ];

    this.searchAuthorization();
  }

  onSearchAuthorization(data: any) {
    this.page = 1; // reset page.
    this.dataSearch = data;
    this.searchAuthorization();
  }

  searchAuthorization() {
    this._progressRef.start();
    this._systemRepo.getAuthorization(this.page, this.pageSize, Object.assign({}, this.dataSearch))
      .pipe(
        catchError(this.catchError),
        finalize(() => {
          this._progressRef.complete();
        }),
        map((data: any) => {
          return {
            data: data.data.map((item: any) => new Authorization(item)),
            totalItems: data.totalItems,
          };
        })
      ).subscribe(
        (res: any) => {
          this.totalItems = res.totalItems || 0;
          this.authorizations = res.data;
        },
      );
  }

  sortAuthorization(sort: string): void {
    this.authorizations = this._sortService.sort(this.authorizations, sort, this.order);
  }

  onDeleteAuthorization() {
    this.confirmDeletePopup.hide();
    this.deleteAuthorization(this.selectedAuthorization.id);
  }

  deleteAuthorization(id: number) {
    this._progressRef.start();
    this._systemRepo.deleteAuthorization(id)
      .pipe(
        catchError(this.catchError),
        finalize(() => { this.isLoading = false; this._progressRef.complete(); }),
      ).subscribe(
        (res: CommonInterface.IResult) => {
          if (res.status) {
            this._toastService.success(res.message, '');
            this.searchAuthorization();
          } else {
            this._toastService.error(res.message || 'Có lỗi xảy ra', '');
          }
        },
      );
  }

  openPopupAddAuthorization() {
    this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));


    this.authorizationAddPopupComponent.action = 'create';
    this.authorizationAddPopupComponent.authorizationActive.setValue(true);
    this.authorizationAddPopupComponent.minDateEffective = this.authorizationAddPopupComponent.minDateExpired = this.minDate;

    // this.authorizationAddPopupComponent.getUsers();
    const indexPIC = this.authorizationAddPopupComponent.personInChargeList.findIndex(x => x.id == this.userLogged.id);
    if (indexPIC > -1) {
      this.authorizationAddPopupComponent.personInChargeActive = [this.authorizationAddPopupComponent.personInChargeList[indexPIC]];
    }

    this.authorizationAddPopupComponent.show();
  }

  onRequestAuthorization() {
    this.searchAuthorization();
  }

  showDetailAuthorization(authorization) {
    this._systemRepo.getAuthorizationById(authorization.id).subscribe(
      (res: any) => {
        if (res.id !== 0) {
          const _authorization = new Authorization(res);
          this.authorizationAddPopupComponent.action = "update";
          this.authorizationAddPopupComponent.activeServices = this.authorizationAddPopupComponent.getCurrentActiveService(_authorization.services);
          this.authorizationAddPopupComponent.authorization = _authorization;
          this.authorizationAddPopupComponent.minDateEffective = this.authorizationAddPopupComponent.minDateExpired = this.createMoment(!!_authorization.startDate ? new Date(_authorization.startDate) : null);
          this.authorizationAddPopupComponent.getDetail();
          this.authorizationAddPopupComponent.show();
        } else {
          this._toastService.error("Not found data");
        }
      },
    );
  }

  showConfirmDelete(data: any) {
    this.selectedAuthorization = data;
    this.confirmDeletePopup.show();
  }
}