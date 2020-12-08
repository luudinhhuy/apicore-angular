import { Component, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Store } from '@ngrx/store';
import { getParamsRouterState, IAppState } from '@store';
import { Params } from '@angular/router';
import { ConfirmPopupComponent } from '@common';
import { getTransactionLocked, getTransactionPermission } from '../../store';


@Component({
    selector: 'files-attach',
    templateUrl: './files-attach.component.html',
    styleUrls: ['./files-attach.component.scss']
})
export class ShareBussinessFilesAttachComponent extends AppForm implements OnInit {

    @ViewChild('confirmDelete', { static: false }) confirmDeletePopup: ConfirmPopupComponent;

    jobId: string;

    files: IShipmentAttachFile[] = [];
    selectedFile: IShipmentAttachFile;


    constructor(
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _ngProgressService: NgProgress,
        private _store: Store<IAppState>
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();

        this.isLocked = this._store.select(getTransactionLocked);

        this.permissionShipments = this._store.select(getTransactionPermission);

    }

    ngOnInit(): void {
        this._store.select(getParamsRouterState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: Params) => {
                if (params.jobId) {
                    this.jobId = params.jobId;
                    this.getFileShipment(this.jobId);
                }
            });
    }

    chooseFile(event: any) {
        const fileList: FileList[] = event.target['files'];
        if (fileList.length > 0) {
            this._progressRef.start();
            this._documentRepo.uploadFileShipment(this.jobId, fileList)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success("Upload file successfully!");
                            if (!!this.jobId) {
                                this.getFileShipment(this.jobId);
                            }
                        }
                    }
                );
        }
    }

    getFileShipment(jobId: string) {
        this.isLoading = true;
        this._documentRepo.getShipmentFilesAttach(jobId).
            pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            }))
            .subscribe(
                (res: IShipmentAttachFile[] = []) => {
                    this.files = res;
                    this.files.forEach(f => f.extension = f.name.split("/").pop().split('.').pop());
                }
            );
    }

    deleteFile(file: IShipmentAttachFile) {
        if (!!file) {
            this.selectedFile = file;
            this.confirmDeletePopup.show();
        }
    }

    onDeleteFile() {
        this.confirmDeletePopup.hide();
        this._progressRef.start();
        this._documentRepo.deleteShipmentFilesAttach(this.selectedFile.id)
            .pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            }))
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("File deleted successfully!");
                        this.getFileShipment(this.jobId);
                    } else {
                        this._toastService.error("some thing wrong");
                    }
                }
            );
    }
}


interface IShipmentAttachFile {
    id: string;
    name: string;
    thumb: string;
    url: string;
    folder: string;
    objectId: string;
    extension: string;
    userCreated: string;
    dateTimeCreated: string;
    fileName: string;

}
