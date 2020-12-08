import { AppList } from "src/app/app.list";
import { Component } from "@angular/core";
import { SortService } from "@services";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { DocumentationRepo, ExportRepo } from "@repositories";
import { catchError, finalize, map } from "rxjs/operators";

@Component({
    selector: 'app-general-report',
    templateUrl: './general-report.component.html',
})
export class GeneralReportComponent extends AppList {
    headers: CommonInterface.IHeaderTable[];
    dataList: any[] = [];
    isClickSubMenu: boolean = false;


    constructor(
        private _sortService: SortService,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
        private _exportRepo: ExportRepo,

    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchGeneralReport;
        this.requestSort = this.sortGeneralReport;
    }

    ngOnInit() {
        this.headers = [
            { title: 'No.', field: 'no', sortable: true },
            { title: 'Job ID', field: 'jobId', sortable: true },
            { title: 'MBL/MAWB', field: 'mawb', sortable: true },
            { title: 'HBL/HAWB', field: 'hawb', sortable: true },
            { title: 'Customer', field: 'customerName', sortable: true },
            { title: 'Carrier', field: 'carrierName', sortable: true },
            { title: 'Agent', field: 'agentName', sortable: true },
            { title: 'Service Date', field: 'serviceDate', sortable: true },
            { title: 'Route', field: 'route', sortable: true },
            { title: 'Qty', field: 'qty', sortable: true },
            { title: 'Revenue', field: 'revenue', sortable: true },
            { title: 'Cost', field: 'cost', sortable: true },
            { title: 'Profit', field: 'profit', sortable: true },
            { title: 'OBH', field: 'obh', sortable: true },
            { title: 'P.I.C', field: 'personInCharge', sortable: true },
            { title: 'Salesman', field: 'salesman', sortable: true },
            { title: 'Service', field: 'serviceName', sortable: true },
        ];
    }

    onSearchGeneralReport(data: any) {
        this.page = 1; // reset page.        
        if (Object.keys(data).length !== 0) {
            this.dataSearch = data;
            this.searchGeneralReport();
        } else {
            this.dataList = [];
        }
    }

    searchGeneralReport() {
        console.log(this.dataSearch);
        this._progressRef.start();
        this._documentRepo.getGeneralReport(this.page, this.pageSize, Object.assign({}, this.dataSearch))
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                }),
                map((data: any) => {
                    return {
                        data: data.data,
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: any) => {
                    this.totalItems = res.totalItems || 0;
                    this.dataList = res.data;
                },
            );
    }

    sortGeneralReport(sort: string): void {
        this.dataList = this._sortService.sort(this.dataList, sort, this.order);
    }

    exportShipmentOverview(){
        if(this.dataList.length == 0){
            this._toastService.warning('Please Apply Report');
            return;
        }
        else {
            this.isClickSubMenu = false;
            this._exportRepo.exportShipmentOverview(this.dataSearch)
                .pipe(
                    catchError(this.catchError),
                    finalize(() => this._progressRef.complete())
                )
                .subscribe(
                    (response: ArrayBuffer) => {
                        const fileName = "Export ShipmentOverview.xlsx";
                        this.downLoadFile(response, "application/ms-excel", fileName);
                    },
                );
        }
       
    }
}