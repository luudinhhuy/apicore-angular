import { Component, Input } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'info-popup',
    templateUrl: 'info.popup.html',
    styleUrls: ['./info.popup.scss']
})

export class InfoPopupComponent extends PopupBase {

    @Input() title: string = 'Notification';
    @Input() body: string = 'Default Info Popup';
    @Input() isShowButton: boolean = true;
    @Input() label: string = 'Ok';
    constructor() {
        super();
    }

    ngOnInit(): void { }

}