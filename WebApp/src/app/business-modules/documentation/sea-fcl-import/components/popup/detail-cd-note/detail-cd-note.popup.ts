import { Component, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { PopupBase } from "src/app/popup.base";
import { DocumentationRepo } from "src/app/shared/repositories";
import { CdNoteAddPopupComponent } from "../add-cd-note/add-cd-note.popup";
import { catchError, finalize } from "rxjs/operators";
import { SortService } from "src/app/shared/services";
import { ToastrService } from "ngx-toastr";
import { ConfirmPopupComponent, InfoPopupComponent } from "src/app/shared/common/popup";

@Component({
    selector: 'cd-note-detail-popup',
    templateUrl: './detail-cd-note.popup.html'
})
export class CdNoteDetailPopupComponent extends PopupBase {
    @ViewChild(ConfirmPopupComponent, { static: false }) confirmDeleteCdNotePopup: ConfirmPopupComponent;
    @ViewChild(InfoPopupComponent, { static: false }) canNotDeleteCdNotePopup: InfoPopupComponent;
    @ViewChild(CdNoteAddPopupComponent, { static: false }) cdNoteEditPopupComponent: CdNoteAddPopupComponent;
    @Output() onDeleted: EventEmitter<any> = new EventEmitter<any>();
    
    jobId: string = null;
    cdNote: string = null;
    deleteMessage: string = '';

    headers: CommonInterface.IHeaderTable[];

    CdNoteDetail: any = null;
    totalCredit: string = '';
    totalDebit: string = '';
    balanceAmount: string = '';

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _sortService: SortService,
        private _toastService: ToastrService,
    ) {
        super();
        this.requestSort = this.sortChargeCdNote;
    }

    ngOnInit() {
        this.headers = [
            { title: 'HBL No', field: 'hwbno', sortable: true },
            { title: 'Code', field: 'chargeCode', sortable: true },
            { title: 'Charge Name', field: 'nameEn', sortable: true },
            { title: 'Quantity', field: 'quantity', sortable: true },
            { title: 'Unit', field: 'unit', sortable: true },
            { title: 'Unit Price', field: 'unitPrice', sortable: true },
            { title: 'Currency', field: 'currency', sortable: true },
            { title: 'VAT', field: 'vatrate', sortable: true },
            { title: "Credit Value (Local)", field: 'total', sortable: true },
            { title: "Debit Value (Local)", field: 'total', sortable: true },
            { title: 'Note', field: 'notes', sortable: true }
        ];

    }

    getDetailCdNote(jobId: string, cdNote: string) {
        console.log(jobId);
        console.log(cdNote);
        this._documentationRepo.getDetailsCDNote(jobId, cdNote)
            .pipe(
                catchError(this.catchError),
            ).subscribe(
                (dataCdNote: any) => {
                    console.log('CdNote detail')
                    console.log(dataCdNote);
                    this.CdNoteDetail = dataCdNote;

                    //Tính toán Amount Credit, Debit, Balance
                    this.calculatorAmount();
                },
            );
    }

    calculatorAmount() {
        this.totalCredit = '';
        this.totalDebit = '';
        this.balanceAmount = '';
        const _credit = this.CdNoteDetail.listSurcharges.filter(f => (f.type === 'BUY' || (f.type === 'OBH' && this.CdNoteDetail.partnerId === f.payerId)) ).reduce((credit, charge) => credit + charge.total*charge.exchangeRate, 0);
        const _debit = this.CdNoteDetail.listSurcharges.filter(f => (f.type === 'SELL' || (f.type === 'OBH' && this.CdNoteDetail.partnerId === f.paymentObjectId)) ).reduce((debit, charge) => debit + charge.total*charge.exchangeRate, 0);
        const _balance = _debit - _credit;
        this.totalCredit = this.formatNumberCurrency(_credit) ;
        this.totalDebit = this.formatNumberCurrency(_debit);
        this.balanceAmount = (_balance > 0 ? this.formatNumberCurrency(_balance) : '(' + this.formatNumberCurrency(Math.abs(_balance)) + ')');
    }

    formatNumberCurrency(input: number) {
        return input.toLocaleString(
            undefined, // leave undefined to use the browser's locale, or use a string like 'en-US' to override it.
            { minimumFractionDigits: 3 }
        );
    }

    closePopup() {
        this.hide();
    }

    deleteCdNote() {
        console.log('delete cd note')
    }

    checkDeleteCdNote(id: string) {
        //this._progressRef.start();
        this._documentationRepo.checkCdNoteAllowToDelete(id)
            .pipe(
                catchError(this.catchError),
                //finalize(() => this._progressRef.complete())
            ).subscribe(
                (res: any) => {
                    if (res) {
                        //this.selectedCdNoteId = id;
                        //console.log(this.selectedCdNoteId)
                        this.deleteMessage = `All related information will be lost? Are you sure you want to delete this Credit/Debit Note?`;
                        this.confirmDeleteCdNotePopup.show();
                    } else {
                        this.canNotDeleteCdNotePopup.show();
                    }
                },
            );
    }

    onDeleteCdNote() {
        console.log('đang delete CDNote')
        console.log(this.CdNoteDetail.cdNote.id)
        this._documentationRepo.deleteCdNote(this.CdNoteDetail.cdNote.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this.confirmDeleteCdNotePopup.hide();
                })
            ).subscribe(
                (respone: CommonInterface.IResult) => {
                    if (respone.status) {
                        this._toastService.success(respone.message, 'Delete Success !');
                        this.onDeleted.emit();
                        this.closePopup();
                    }
                },
            );
    }

    openPopupEdit() {        
        this.cdNoteEditPopupComponent.action = 'update';
        this.cdNoteEditPopupComponent.selectedPartner = { field: "id", value: this.CdNoteDetail.partnerId };
        this.cdNoteEditPopupComponent.selectedNoteType = this.CdNoteDetail.cdNote.type;
        this.cdNoteEditPopupComponent.CDNote = this.CdNoteDetail.cdNote;
        this.cdNoteEditPopupComponent.getListCharges(this.CdNoteDetail.partnerId,true, this.CdNoteDetail.cdNote.code);
        this.cdNoteEditPopupComponent.show({ backdrop: 'static' });
    }

    previewCdNote() {
        console.log('preview cd note')
    }

    onUpdateCdNote(dataRequest: any) {
        console.log(dataRequest);
        console.log('đã update cdnote');
        this.onDeleted.emit();
        this.getDetailCdNote(this.jobId,this.cdNote);
    }

    sortChargeCdNote(sort: string): void {
        if (this.CdNoteDetail) {
            this.CdNoteDetail.listSurcharges = this._sortService.sort(this.CdNoteDetail.listSurcharges, sort, this.order);
        }
    }
    
}