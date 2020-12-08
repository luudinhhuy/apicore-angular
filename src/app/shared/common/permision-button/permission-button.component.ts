import { Component, OnInit, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { IAppState, getMenuUserPermissionState } from '@store';
import { AppForm } from 'src/app/app.form';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-permission-button',
    templateUrl: './permission-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPermissionButtonComponent extends AppForm implements OnInit {
    @Input() title: string;
    @Input() type: string;
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();


    menuPermission: Observable<SystemInterface.IUserPermission>;

    constructor(
        private _store: Store<IAppState>
    ) {
        super();
    }

    ngOnInit(): void {
        this.menuPermission = this._store.select(getMenuUserPermissionState);
    }


    onClicked(e) {
        this.onClick.emit(e);
    }
}
