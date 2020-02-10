import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { AppPage } from 'src/app/app.base';

import cloneDeep from 'lodash/cloneDeep';
import { ListKeyManager } from '@angular/cdk/a11y';
import { UP_ARROW, DOWN_ARROW, ENTER } from '@angular/cdk/keycodes';
@Component({
    selector: 'app-combo-grid-virtual-scroll',
    templateUrl: './combo-grid-virtual-scroll.component.html'
})
export class ComboGridVirtualScrollComponent extends AppPage implements OnInit, OnChanges, AfterViewInit {

    @Input() dataSources: any[];
    @Input() displayFields: { field: string, label: string }[];
    @Input() searchFields: any[];
    @Input() selectedDisplayFields: any[];
    @Input() currentActiveItemId: any;
    @Input() disabled: boolean;
    @Input() height: number = 200;
    @Input() isTooltip: boolean = false;
    @Input() loading: boolean = false;
    @Input() placeholder: string = '';
    @Output() itemSelected = new EventEmitter<any>();
    @Output() remove = new EventEmitter<any>();

    @ViewChild('inputSearch', { static: true }) inputSearch: ElementRef;
    @ViewChildren('listItem') listItems: QueryList<any>;

    currentItemSelected: any = null;
    CurrentActiveItemIdObj: { field: string, value: any, hardValue: any } = null;
    indexSelected: number = -1;
    displaySelectedStr: string = '';
    ConstDataSources: any[] = [];
    DataSources: any[] = [];
    DisplayFields: { field: string, label: string }[] = [];
    SearchFields: string[] = [];
    SelectedDisplayFields: string[] = [];
    Disabled: boolean = false;
    searchKeys: string[] = [];

    keyboardEventsManager: ListKeyManager<any>;

    constructor(
        private cdr: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!changes.dataSources && !!changes.dataSources.currentValue) {
            this.setDataSource(changes.dataSources.currentValue);
        }
        if (!!changes.displayFields && !!changes.displayFields.currentValue) {
            this.setDisplayFields(changes.displayFields.currentValue);
        }
        if (!!changes.selectedDisplayFields && !!changes.selectedDisplayFields.currentValue) {
            this.setSelectedDisplayFields(changes.selectedDisplayFields.currentValue);
        }
        if (!!changes.currentActiveItemId && (changes.currentActiveItemId.previousValue !== changes.currentActiveItemId.currentValue)) {
            this.setCurrentActiveItemId(changes.currentActiveItemId.currentValue);
        }
        if (changes.disabled !== undefined && changes.disabled !== null) {
            this.setDisabled(changes.disabled.currentValue);
        }
        if (!!changes.loading && typeof changes.loading.currentValue === 'boolean') {
            this.loading = changes.loading.currentValue;
        }
    }

    ngAfterViewInit(): void {
        this.cdr.markForCheck();
    }

    ngOnInit() {

    }
    // tslint:disable: deprecation
    handleKeyUp(event: KeyboardEvent) {
        let currenIndex: number;
        currenIndex = this.indexSelected;
        event.stopImmediatePropagation();
        if (this.keyboardEventsManager) {
            if (event.keyCode === DOWN_ARROW) {
                this.keyboardEventsManager.onKeydown(event);

                currenIndex++;
                return false;
            } else if (event.keyCode === UP_ARROW) {
                this.keyboardEventsManager.onKeydown(event);

                if (currenIndex === 0) {
                    return;
                }
                currenIndex--;

                return false;
            } else if (event.keyCode === ENTER) {
                // TODO handle event enter when selecting titem.
                // Set index for item is selecting
                this.keyboardEventsManager.setActiveItem(this.indexSelected);

                // get item selected.
                const arrayItems = this.listItems.toArray();
                const dataSourceIndex: number = +(<ElementRef>arrayItems[this.keyboardEventsManager.activeItemIndex]).nativeElement.getAttribute('id');
                const itemObject = this.ConstDataSources[dataSourceIndex - 1];

                if (!!this.CurrentActiveItemIdObj) {
                    // this.setCurrentActiveItemId(Object.assign({}, this.CurrentActiveItemIdObj, { value: itemObject[this.CurrentActiveItemIdObj.field] }));
                }

                return false;
            }
        }
    }

    setDataSource(data: any[]) {
        if (!!data && data.length > 0) {
            // * ? initializing the eventkey manager here
            this.keyboardEventsManager = new ListKeyManager(this.listItems);

            this.DataSources = data;
            this.ConstDataSources = cloneDeep(data);
            if (this.CurrentActiveItemIdObj !== null) {
                const activeItemData = this.CurrentActiveItemIdObj;

                this.loading = true;
                const itemIndex = this.ConstDataSources.findIndex(o => o[activeItemData.field] === activeItemData.value);

                if (itemIndex !== -1) {
                    this.indexSelected = itemIndex;
                    this.setCurrentActiveItem(this.ConstDataSources[itemIndex]);
                } else if (!!activeItemData.hardValue) {
                    this.displaySelectedStr = activeItemData.hardValue;
                } else {
                    if (this.loading) {
                        this.loading = false;
                    }
                }
            }
        }
        //  else {
        //     this.DataSources = [];
        // }
    }

    setDisplayFields(data: { field: string, label: string }[]) {
        if (!!data && data.length > 0) {
            this.DisplayFields = data;
            this.searchKeys = this.DisplayFields.map(d => d.field);
        }
    }

    setSelectedDisplayFields(data: any[]) {
        if (data.length > 0) {
            this.SelectedDisplayFields = data;
            this.searchKeys.push(...data);
        }
    }

    setDisabled(data: boolean) {
        this.Disabled = data;
    }

    setCurrentActiveItemId(data: any) {
        if (data.value != null) {
            this.CurrentActiveItemIdObj = data;

            this.loading = true;
            const itemIndex = this.ConstDataSources.findIndex(i => i[data.field] === data.value);

            if (itemIndex !== -1) {
                this.indexSelected = itemIndex;
                this.setCurrentActiveItem(this.ConstDataSources[itemIndex]);

            } else if (!!data.hardValue) {
                this.displaySelectedStr = data.hardValue;
            } else {
                setTimeout(() => {
                    if (this.loading) {
                        this.loading = false;
                    }
                }, 500);
            }
        } else {
            this.indexSelected = -1;
            if (!!data.hardValue) {
                this.displaySelectedStr = data.hardValue;
            } else {
                this.displaySelectedStr = null;
            }
            setTimeout(() => {
                if (this.loading) {
                    this.loading = false;
                }
            }, 500);
        }
    }

    removeCurrenActiveItem() {
        // this.indexSelected = -1;
        // this.displaySelectedStr = null;
        this.setCurrentActiveItemId({ value: null });
        this.remove.emit();
    }

    emitSelected(item: any, index: number) {
        this.indexSelected = index;
        this.itemSelected.emit(item);
        this.setCurrentActiveItem(item);

        this.currentItemSelected = item;
        if (this.CurrentActiveItemIdObj !== null && this.CurrentActiveItemIdObj.value !== null) {
            this.CurrentActiveItemIdObj.value = item[this.CurrentActiveItemIdObj.field];
        }

        // * Reset keyword search.
        this.keyword = '';
    }

    setCurrentActiveItem(item: any) {
        this.displaySelectedStr = '';
        if (this.SelectedDisplayFields.length === 1) {
            this.displaySelectedStr += item[this.SelectedDisplayFields[0]];
        } else {
            this.SelectedDisplayFields.forEach((data: string, index: number) => {
                if (index === this.selectedDisplayFields.length - 1) {
                    this.displaySelectedStr += item[data];
                } else {
                    this.displaySelectedStr += item[data] + ' - ';
                }
            });
        }
    }

    // Search(key: string) {
    //     key = key.toLowerCase().trim();
    //     const constData = this.ConstDataSources;
    //     const displayFields = this.DisplayFields;
    //     const context = this;

    //     const data = constData.filter(o => {
    //         let matched: boolean = false;
    //         for (const i of displayFields) {
    //             const field: string = i.field;
    //             const value: string = context.getValue(o, field) == null ? "" : context.getValue(o, field);
    //             const valueType: string = typeof value;

    //             if (valueType === 'boolean' && value === key) {
    //                 matched = true;
    //             }

    //             if (valueType === 'string' && value.toLowerCase().includes(key)) {
    //                 matched = true;
    //             }

    //             if (valueType === 'number' && +value === +key) {
    //                 matched = true;
    //             }
    //         }
    //         return matched;
    //     });
    //     if (!!data.length) {
    //         this.DataSources = data;
    //     } else {
    //         this.DataSources = constData;
    //     }

    //     if (this.CurrentActiveItemIdObj !== null && this.CurrentActiveItemIdObj.value !== null) {
    //         const _CurrentActiveItemIdObj: { field: string, value: any, hardValue: any } = this.CurrentActiveItemIdObj;
    //         this.indexSelected = this.DataSources.findIndex(o => o[_CurrentActiveItemIdObj.field] === _CurrentActiveItemIdObj.value);
    //     }
    // }

    getValue(item: any, field: string) {
        return item[field] || null;
    }

    clickSearch() {
        if (this.inputSearch) {
            setTimeout(() => this.inputSearch.nativeElement.focus(), 0);
        }
    }
}
