import { OnInit, OnDestroy, OnChanges, DoCheck, AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ComponentFactoryResolver, ComponentRef, ViewContainerRef } from "@angular/core";
import { Observable, Subject, throwError, BehaviorSubject } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

import { UtilityHelper } from "src/helper";
import { NgProgressRef } from "@ngx-progressbar/core";
import { ButtonModalSetting } from "./shared/models/layout/button-modal-setting.model";
import { ButtonType } from "./shared/enums/type-button.enum";
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, skip } from "rxjs/operators";
import moment from "moment/moment";
import { PermissionShipment } from "./shared/models/document/permissionShipment";

export abstract class AppPage implements OnInit, OnDestroy, OnChanges, DoCheck, AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit {

    ranges: any = {
        "Today": [new Date(), new Date()],
        "Yesterday": [new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1))],
        "Last 7 Days": [new Date(new Date().setDate(new Date().getDate() - 6)), new Date()],
        "Last 30 Days": [new Date(new Date().setDate(new Date().getDate() - 29)), new Date()],
        // "This Month": [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)],
        "This Month": [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
        "Last Month": [new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), new Date(new Date().getFullYear(), new Date().getMonth(), 0)]
    };

    maxDate: any = moment();
    minDate: any = moment();
    ngUnsubscribe: Subject<any> = new Subject();
    keyword: string = '';
    digitDecimal: number = 5;
    dataReport: any = null;

    utility: UtilityHelper = new UtilityHelper();

    isLoading: boolean | any = false;
    isCheckAll: boolean = false;
    isLocked: boolean | any = false;
    isShowUpdate: boolean = true;
    permissionShipments: Observable<PermissionShipment>;

    _isShowAutoComplete = new BehaviorSubject<boolean>(false);
    $isShowAutoComplete: Observable<boolean> = this._isShowAutoComplete.asObservable();

    _progressRef: NgProgressRef;

    componentRef: ComponentRef<any>;


    cancelButtonSetting: ButtonModalSetting = {
        buttonAttribute: {
            type: 'button',
            titleButton: "Cancel",
            classStyle: "btn btn-default m-btn--square m-btn--icon m-btn--uppercase",
            icon: "la la-ban"
        },
        typeButton: ButtonType.cancel,
    };

    searchlButtonSetting: ButtonModalSetting = {
        buttonAttribute: {
            type: 'button',
            titleButton: "Search",
            classStyle: "btn btn-brand m-btn--square m-btn--icon m-btn--uppercase",
            icon: "la la-search"
        },
        typeButton: ButtonType.search,
    };

    importButtonSetting: ButtonModalSetting = {
        buttonAttribute: {
            type: 'button',
            titleButton: "Import",
            classStyle: "btn btn-brand m-btn--square m-btn--icon m-btn--uppercase",
            icon: "la la-download"
        },
        typeButton: ButtonType.search,
    };

    saveButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.save
    };

    addButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.add
    };

    exportButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.export
    };

    previewButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.preview
    };

    lockButtonSetting: ButtonModalSetting = {
        typeButton: ButtonType.lock
    };

    configComoBoGrid: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [],
        dataSource: [],
        selectedDisplayFields: [],
    };

    optionEditor = {
        htmlExecuteScripts: false,
        heightMin: 150,
        charCounterCount: false,
        theme: 'royal',
        fontFamily: {
            "Roboto,sans-serif": 'Roboto',
            "Oswald,sans-serif": 'Oswald',
            "Montserrat,sans-serif": 'Montserrat',
            "'Open Sans Condensed',sans-serif": 'Open Sans Condensed',
            "'Arial',sans-serif,": 'Arial',
            "Time new Roman": 'Time new Roman',
            "Tahoma": 'Tahoma'
        },
        toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', 'inlineClass', 'inlineStyle', 'paragraphStyle', 'lineHeight', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertTable', '|', 'emoticons', 'fontAwesome', 'specialCharacters', 'insertHR', 'selectAll', 'clearFormatting', '|', 'spellChecker', 'help', 'html', '|', 'undo', 'redo'],
        quickInsertButtons: ['table', 'ul', 'ol', 'hr'],
        fontFamilySelection: true,
        language: 'vi',
    };

    ngOnInit(): void { }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ngDoCheck(): void { }

    ngOnChanges(changes: any): void { }

    ngAfterContentInit(): void { }

    ngAfterContentChecked(): void { }

    ngAfterViewInit(): void { }

    ngAfterViewChecked(): void { }

    trackByFn(index: number, item: any) {
        return !!item.id ? item.id : !!item.code ? item.code : index;
    }

    back() {
        window.history.back();
    }

    catchError(error: HttpErrorResponse): Observable<any> {
        return throwError(error || 'Có lỗi xảy, Vui lòng kiểm tra lại !');
    }

    handleError(errors?: any, callBack?: Function) {
        let message: string = 'Has Error Please Check Again !';
        let title: string = '';
        if (errors instanceof HttpErrorResponse) {
            message = errors.message;
            title = errors.statusText;
        }
        return callBack({ message, title });
        // this._toastService.error(message, title, { positionClass: 'toast-bottom-right' });
    }

    saveAs(blob: Blob, filename: string) {
        const anchorElem = document.createElement("a");
        anchorElem.id = "down";

        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            const url = window.URL.createObjectURL(blob);
            // const el = document.getElementById('down');
            const el = document.getElementById(anchorElem.id);

            anchorElem.setAttribute('href', url);
            anchorElem.setAttribute('download', filename);
            anchorElem.style.display = 'none';
            anchorElem.click();

            setTimeout(function () {
                document.body.removeChild(anchorElem);
                window.URL.revokeObjectURL(url);
            }, 500);
        }
    }

    downLoadFile(data: any, type: string = "application/ms-excel", filename: string = 'undefine.xlsx') {
        const blob: Blob = new Blob([data], { type: type });
        const fileName: string = filename;
        const objectUrl: string = URL.createObjectURL(blob);
        const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;

        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
    }

    autocomplete = (time: number, callBack: Function) => (source$: Observable<any>) =>
        source$.pipe(
            debounceTime(time),
            distinctUntilChanged(),
            switchMap((...args: any[]) =>
                callBack(...args).pipe(takeUntil(source$.pipe(skip(1))))
            )
        )

    createMoment(date?: any) {
        if (!!date) {
            return moment(date);
        } else {
            return moment();
        }
    }

    renderComponent(component: any, containerRef: ViewContainerRef) {
        const container = containerRef;
        container.clear();
        const injector = container.injector;

        // tslint:disable-next-line: no-any
        const cfr: ComponentFactoryResolver = injector.get<any>(ComponentFactoryResolver as any);

        const componentFactory = cfr.resolveComponentFactory(component);

        const componentRef = container.createComponent(componentFactory, 0, injector);

        this.componentRef = componentRef;
    }
}

