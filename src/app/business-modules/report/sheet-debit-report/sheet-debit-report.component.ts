import { Component } from "@angular/core";
import { AppList } from "src/app/app.list";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { DocumentationRepo } from "@repositories";
import { CommonEnum } from "@enums";

@Component({
    selector: 'app-sheet-debit-report',
    templateUrl: './sheet-debit-report.component.html',
})
export class SheetDebitReportComponent extends AppList {
    constructor(
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _documentationRepo: DocumentationRepo
    ) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
    }

    onSearchSheetDebitReport(data: ReportInterface.ISaleReportCriteria) {
        console.log(data)
        switch (data.typeReport) {
            case CommonEnum.SHEET_DEBIT_REPORT_TYPE.ACCNT_PL_SHEET:

                break;
        }
    }
}