import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'app-multiple-select',
    templateUrl: './select-multiple.component.html',
    styleUrls: ['./select-multiple.component.scss']
})

export class AppMultipleSelectComponent extends AppPage {
    @Output() onChange: EventEmitter<any> = new EventEmitter<any[]>(); // * event will be fired when item was selected

    @Input() source: any[] = []; // * source data with [{id, text}]
    @Input() active: any[] = []; // * active item   
    @Input() placeHolder: string = 'Please select';

    isShow: boolean = false;  // * show data source
    isCheckAll: boolean = false;  // * check all

    constructor() {
        super();
    }

    ngOnInit() {
    }

    ngOnChanges() {
        if (!!this.active.length && !!this.source.length) {

            for (const item of this.source) {
                if (this.active.filter((i: any) => Boolean(i)).includes(item)) {
                    item.isSelected = true;
                } else {
                    item.isSelected = false;
                }
            }
            this.isCheckAll = this.source.every((item: any) => item.isSelected);

        }
    }

    onChangeCheckItem(data: any) {
        this.isCheckAll = this.source.every((item: any) => item.isSelected);

        if (data.isSelected) {
            this.active.push(data);
        } else {
            const index: number = this.active.findIndex((item: any) => item.id === data.id);
            if (index !== -1) {
                this.active.splice(index, 1);
            }
        }
        this.onChange.emit(this.active);
    }

    checkUncheckAll() {
        this.active = [];
        for (const item of this.source) {
            item.isSelected = this.isCheckAll;
        }

        this.isCheckAll ? this.active.push(...this.source) : this.active = [];

        this.onChange.emit(this.active);
    }

    onclickOutSide() {
        this.isShow = false;
    }
}
