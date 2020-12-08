import { Component } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'permission-403-popup',
    templateUrl: './403.popup.html',
})

export class Permission403PopupComponent extends PopupBase {
    constructor() {
        super();
    }

    ngOnInit(): void { }

}