import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-switch',
    templateUrl: './switch-toggle.component.html',
    styles: [
        `
        .m-switch.m-switch--success:not(.m-switch--outline) input:empty ~ span:before {
            background-color: #ebedf2;
        }
        .m-switch.m-switch--success:not(.m-switch--outline)
            input:checked
            ~ span:before {
            background-color: #34bfa3;
        }`
    ]
})
export class SwitchToggleComponent {

    @Input() toggle: boolean = false;
    @Input() class: string = 'success';
    @Input() size: string = "md";
    @Input() disabled: boolean = null;
    @Output() toggleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() { }

    ngOnInit(): void { }

    onChangeToggle() {
        this.toggleChange.emit(this.toggle);
    }
}
