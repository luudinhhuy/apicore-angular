import { Component, ViewChild } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { DocumentationRepo } from 'src/app/shared/repositories';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { SortService } from 'src/app/shared/services';
import { ShareBussinessCdNoteAddPopupComponent } from '../add-cd-note/add-cd-note.popup';
import { ShareBussinessCdNoteDetailPopupComponent } from '../detail-cd-note/detail-cd-note.popup';
import { Store } from '@ngrx/store';
import { TransactionActions } from '../../../store';
import { getParamsRouterState, getDataRouterState } from 'src/app/store';
import { combineLatest } from 'rxjs';
import { TransactionTypeEnum } from 'src/app/shared/enums';

@Component({
    selector: 'cd-note-list',
    templateUrl: './cd-note-list.component.html',
})
export class ShareBussinessCdNoteListComponent extends AppList {
    @ViewChild(ShareBussinessCdNoteAddPopupComponent, { static: false }) cdNoteAddPopupComponent: ShareBussinessCdNoteAddPopupComponent;
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeleteCdNotePopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteCdNotePopup: InfoPopupComponent;
    @ViewChild(ShareBussinessCdNoteDetailPopupComponent, { static: false }) cdNoteDetailPopupComponent: ShareBussinessCdNoteDetailPopupComponent;

    headers: CommonInterface.IHeaderTable[];
    idMasterBill: string = '';
    cdNoteGroups: any[] = [];
    initGroup: any[] = [];
    deleteMessage: string = '';
    selectedCdNoteId: string = '';
    transactionType: TransactionTypeEnum = 0;

    isDesc = true;
    sortKey: string = '';

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _progressService: NgProgress,
        private _sortService: SortService,
        private _store: Store<TransactionActions>,
    ) {
        super();
        this._progressRef = this._progressService.ref();
        //this.requestSort = this.sortCdNotes;
    }

    ngOnInit(): void {
        combineLatest([
            this._store.select(getParamsRouterState),
            this._store.select(getDataRouterState),
        ]).pipe(
            map(([params, qParams]) => ({ ...params, ...qParams })),
            take(1)
        ).subscribe(
            (params: any) => {
                const jobId = params.id || params.jobId;
                if (jobId) {
                    this.transactionType = +params.transactionType || 0;
                    this.idMasterBill = jobId;
                    this.getListCdNote(this.idMasterBill);
                }
            }
        );

        this.headers = [
            { title: 'Type', field: 'type', sortable: true },
            { title: 'Note No', field: 'code', sortable: true },
            { title: 'Charges Count', field: 'total_charge', sortable: true, },
            { title: 'Balance Amount', field: 'total', sortable: true, width: 220 },
            { title: 'Creator', field: 'userCreated', sortable: true },
            { title: 'Create Date', field: 'datetimeCreated', sortable: true },
            { title: 'SOA', field: 'soaNo', sortable: true },
        ];
    }

    ngAfterViewInit() {
        this.cdNoteAddPopupComponent.getListSubjectPartner(this.idMasterBill);
        this.cdNoteDetailPopupComponent.cdNoteEditPopupComponent.getListSubjectPartner(this.idMasterBill);
    }

    openPopupAdd() {
        this.cdNoteAddPopupComponent.action = 'create';
        this.cdNoteAddPopupComponent.transactionType = this.transactionType;
        this.cdNoteAddPopupComponent.currentMBLId = this.idMasterBill;
        this.cdNoteAddPopupComponent.setHeader();
        this.cdNoteAddPopupComponent.show();
    }

    openPopupDetail(jobId: string, cdNote: string) {
        this.cdNoteDetailPopupComponent.jobId = jobId;
        this.cdNoteDetailPopupComponent.cdNote = cdNote;
        this.cdNoteDetailPopupComponent.transactionType = this.transactionType;
        this.cdNoteDetailPopupComponent.setHeader();
        this.cdNoteDetailPopupComponent.getDetailCdNote(jobId, cdNote);
        this.cdNoteDetailPopupComponent.show();
    }

    getListCdNote(id: string) {
        this.isLoading = true;
        const isShipmentOperation = false;
        this._documentationRepo.getListCDNote(id, isShipmentOperation)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; }),
            ).subscribe(
                (res: any) => {
                    this.cdNoteGroups = res;
                    this.initGroup = res;
                },
            );
    }

    checkDeleteCdNote(id: string) {
        this._progressRef.start();
        this._documentationRepo.checkCdNoteAllowToDelete(id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        this.selectedCdNoteId = id;
                        this.deleteMessage = `All related information will be lost? Are you sure you want to delete this Credit/Debit Note?`;
                        this.confirmDeleteCdNotePopup.show();
                    } else {
                        this.canNotDeleteCdNotePopup.show();
                    }
                },
            );
    }

    onDeleteCdNote() {
        this._progressRef.start();
        this._documentationRepo.deleteCdNote(this.selectedCdNoteId)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.confirmDeleteCdNotePopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.getListCdNote(this.idMasterBill);
                    }
                },
            );
    }

    sortCdNotes(property) {
        this.isDesc = !this.isDesc;
        this.sortKey = property;
        this.cdNoteGroups.forEach(element => {
            element.listCDNote = this._sortService.sort(element.listCDNote, property, this.isDesc);
        });
    }

    // sortCdNotes(sort: string): void {
    //     this.cdNoteGroups.forEach(element => {
    //         element.listCDNote = this._sortService.sort(element.listCDNote, sort, this.order);
    //     });
    // }

    onRequestCdNoteChange() {
        this.getListCdNote(this.idMasterBill);
    }

    onDeletedCdNote() {
        this.getListCdNote(this.idMasterBill);
    }

    // Charge keyword search
    onChangeKeyWord(keyword: string) {
        this.cdNoteGroups = this.initGroup;
        // TODO improve search.
        if (!!keyword) {
            if (keyword.indexOf('\\') !== -1) { return this.cdNoteGroups = []; }
            keyword = keyword.toLowerCase();
            // Search group
            let dataGrp = this.cdNoteGroups.filter((item: any) => item.partnerNameEn.toLowerCase().toString().search(keyword) !== -1);
            // Không tìm thấy group thì search tiếp list con của group
            if (dataGrp.length === 0) {
                const arrayCharge = [];
                for (const group of this.cdNoteGroups) {
                    const data = group.listCDNote.filter((item: any) => item.type.toLowerCase().toString().search(keyword) !== -1
                        || item.code.toLowerCase().toString().search(keyword) !== -1
                        || item.userCreated.toLowerCase().toString().search(keyword) !== -1
                        || item.soaNo.toLowerCase().toString().search(keyword) !== -1);
                    if (data.length > 0) {
                        arrayCharge.push({ id: group.id, partnerNameEn: group.partnerNameEn, partnerNameVn: group.partnerNameVn, listCDNote: data });
                    }
                }
                dataGrp = arrayCharge;
            }
            return this.cdNoteGroups = dataGrp;
        } else {
            this.cdNoteGroups = this.initGroup;
        }
    }
}
