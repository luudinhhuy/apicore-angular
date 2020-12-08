import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChange, SimpleChanges } from '@angular/core';
import { AppList } from 'src/app/app.list';

@Component({
    selector: 'app-combo-grid',
    templateUrl: './app-combo-grid.component.html',
    // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComboGridComponent<T> extends AppList {

    @Input() headers: CommonInterface.IHeaderTable[];
    @Input() data: any[] = [];
    @Input() height: 200;
    @Input() fields: string[] = [];
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() active: any;

    selectedItem: any = null;

    constructor() {
        super();
    }

    ngOnInit(): void { }

    selectItem(item: any) {
        this.active = item.id;
        this.selectedItem = item;
        this.onClick.emit(this.selectedItem);
    }

    clickSearch($event: Event) {
        $event.stopPropagation();
        $event.stopImmediatePropagation();
    }
}
