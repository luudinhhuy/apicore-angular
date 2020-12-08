import { PopupBase } from "src/app/popup.base";
import { Component, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, AbstractControl, FormBuilder } from "@angular/forms";
import { DocumentationRepo } from "@repositories";
import { catchError, finalize } from "rxjs/operators";
import { Crystal } from "@models";
import { ToastrService } from "ngx-toastr";
import { NgProgress } from "@ngx-progressbar/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ModalDirective } from "ngx-bootstrap";
import { environment } from "src/environments/environment";

@Component({
    selector: 'input-booking-note-popup',
    templateUrl: './input-booking-note.popup.html'
})

export class InputBookingNotePopupComponent extends PopupBase {
    @ViewChild('formPreviewBookingNote', { static: false }) formPreviewBookingNote: ElementRef;
    @ViewChild("popupReport", { static: false }) popupReport: ModalDirective;

    formInputBN: FormGroup;

    flexId: AbstractControl;
    flightNo2: AbstractControl;
    contactPerson: AbstractControl;
    closingTime: AbstractControl;

    dataReport: any = null;

    reportType: string = '';
    hblId: string = '';

    constructor(
        private _documentationRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _fb: FormBuilder,
        private _progressService: NgProgress,
        private sanitizer: DomSanitizer, ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formInputBN = this._fb.group({
            flexId: [],
            flightNo2: [],
            contactPerson: [],
            closingTime: []
        });

        this.flexId = this.formInputBN.controls['flexId'];
        this.flightNo2 = this.formInputBN.controls['flightNo2'];
        this.contactPerson = this.formInputBN.controls['contactPerson'];
        this.closingTime = this.formInputBN.controls['closingTime'];
    }

    previewBookingNote() {
        const body: IBookingNoteCriteria = {
            reportType: this.reportType,
            hblId: this.hblId,
            flexId: this.flexId.value,
            flightNo2: this.flightNo2.value,
            contactPerson: this.contactPerson.value,
            closingTime: this.closingTime.value
        };
        this._progressRef.start();
        this._documentationRepo.previewBookingNote(body)
            .pipe(
                catchError(this.catchError),
                finalize(() => { this._progressRef.complete(); })
            )
            .subscribe(
                (res: Crystal) => {
                    this.dataReport = JSON.stringify(res);
                    if (res != null && res.dataSource.length > 0) {
                        setTimeout(() => {
                            if (!this.popupReport.isShown) {
                                this.popupReport.config = this.options;
                                this.popupReport.show();
                            }
                            this.submitFormPreview();
                        }, 1000);
                    } else {
                        this._toastService.warning('There is no data to display preview');
                    }
                },
            );
    }

    closePopup() {
        this.formInputBN.reset();
        this.hide();
    }

    get scr() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.HOST.REPORT}`);
    }

    ngAfterViewInit() {
        if (!!this.dataReport) {
            this.formPreviewBookingNote.nativeElement.submit();
        }
    }

    submitFormPreview() {
        this.formPreviewBookingNote.nativeElement.submit();
    }

    onSubmitForm() {
        return true;
    }

    hidePreview() {
        this.popupReport.hide();
    }
}

interface IBookingNoteCriteria {
    reportType: string;
    hblId: string;
    flexId: string;
    flightNo2: string;
    contactPerson: string;
    closingTime: string;
}