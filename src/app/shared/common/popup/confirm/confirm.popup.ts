import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';

@Component({
    selector: 'confirm-popup',
    templateUrl: './confirm.popup.html',
    styleUrls: ['./confirm.popup.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmPopupComponent extends PopupBase {

    @Input() title: string = 'Notification';
    @Input() body: string = 'You are not allow to delete';
    @Input() labelConfirm: string = 'Yes';
    @Input() labelCancel: string = 'Cancel';
    @Input() iconConfirm = "la la-save";
    @Input() iconCancel: string = 'la la-ban';

    @Output() onSubmit: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

    constructor() {
        super();
    }

    ngOnInit(): void { }

    onConfirm() {
        this.onSubmit.emit(true);
    }

    close() {
        this.hide();
        this.onCancel.emit();
    }
}
