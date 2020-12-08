import { Component, ViewChild } from '@angular/core';
import { Permission } from 'src/app/shared/models';
import { SystemRepo } from 'src/app/shared/repositories';
import { NgProgress } from '@ngx-progressbar/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SortService } from 'src/app/shared/services';
import { AppList } from 'src/app/app.list';
import { ConfirmPopupComponent } from 'src/app/shared/common/popup';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
})
export class PermissionComponent extends AppList {
    @ViewChild(ConfirmPopupComponent, { static: false }) configmDeletePopup: ConfirmPopupComponent;

    headers: CommonInterface.IHeaderTable[];
    permissions: Permission[] = new Array<Permission>();

    dataSearch: any = {};

    selectedPermission: Permission;
    constructor(
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _router: Router,
        private _toastService: ToastrService,
        private _sortService: SortService,
    ) {
        super();
        this._progressRef = this._progressService.ref();

        this.requestList = this.searchPermission;
        this.requestSort = this.sortPermission;
    }

    ngOnInit() {
        this.headers = [
            { field: 'name', title: 'Permission Name', sortable: true, dataType: 'LINK' },
            { field: 'type', title: 'Type', sortable: true },
            { field: 'roleName', title: 'Role', sortable: true },
            { field: 'active', title: 'Status', sortable: true, dataType: 'BOOLEAN' },
        ];

        this.searchPermission(this.dataSearch);
    }

    searchPermission(dataSearch?: any) {
        this._progressRef.start();

        this._systemRepo.getListPermissionGeneral(dataSearch)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: any) => {
                    this.permissions = (res || []).map(p => new Permission(p));
                    console.log(this.permissions);
                }
            );
    }

    sortPermission() {
        this.permissions = this._sortService.sort(this.permissions, this.sort, this.order);
    }

    gotoDetail(permission: Permission) {
        this._router.navigate([`home/system/permission/${permission.id}`]);
    }

    deletePermission(permission: Permission) {
        if (!permission.active) {
            this.selectedPermission = new Permission(permission);
            this.configmDeletePopup.show();
        }

    }

    onDeletePermission() {
        this.configmDeletePopup.hide();

        this._progressRef.start();

        this._systemRepo.deletePermissionGeneral(this.selectedPermission.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);

                        // * search again.
                        this.searchPermission(this.dataSearch);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

}
