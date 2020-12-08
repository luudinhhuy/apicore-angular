import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'app-search-multiple',
    templateUrl: './search-multiple.component.html',
    styleUrls: ['./search-multiple.component.scss']
})
export class SearchMultipleComponent extends PopupBase implements OnInit {
    @Output() isCloseModal = new EventEmitter();

    customNoSearch: string = '';
    constructor() {
        super();
    }
    close() {
        this.customNoSearch = '';
        this.isCloseModal.emit('');
        this.hide();
    }
    ApplyToList() {
        if (this.customNoSearch.includes(',')) {
            this.customNoSearch = '';
            return;
        }
        this.isCloseModal.emit(this.customNoSearch + 'isMultiple');
        this.hide();
    }
    ChangeCustomNoSearch() {

    }
    ClearToList() {
        this.isCloseModal.emit('');
        this.customNoSearch = '';
        this.hide();
    }



    ngOnInit() {
    }

}
