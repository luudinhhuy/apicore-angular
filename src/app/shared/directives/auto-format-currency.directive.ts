import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Directive({
    selector: '[autoFormatCurrency]',
})
export class AutoFormatCurrencyDirective {
    @Input() set decimals(number: number) {
        this.setRegex(number);
    }

    currencyCode: string = '';
    digitNumber = '.0-3';

    private el: HTMLInputElement;
    private digitRegex: RegExp = new RegExp(this.regexString(), 'g');

    private lastValid = '';

    constructor(
        private currencyPipe: CurrencyPipe,
        private _elementRef: ElementRef,
        private renderer: Renderer2

    ) {
        this.el = this._elementRef.nativeElement;
    }
    private setRegex(maxDigits?: number) {
        if (maxDigits <= 0) {
            this.digitRegex = new RegExp(/^\d+$/);
        } else {
            this.digitRegex = new RegExp(this.regexString(maxDigits), 'g');
        }
    }

    private regexString(max?: number) {
        return "^\\s*((\\d+(\\.\\d{0," + max + "})?)|((\\d*(\\.\\d{1," + max + "}))))\\s*$";
    }

    ngOnInit(): void {
        if (!this._elementRef.nativeElement.getAttribute('type') || this._elementRef.nativeElement.getAttribute('type') === 'number') {
            this.renderer.setAttribute(this._elementRef.nativeElement, 'type', 'text');
        }

        setTimeout(() => {
            this.el.value = this.currencyPipe.transform(this.el.value, this.currencyCode, '', this.digitNumber);
        }, 1000);
    }

    @HostListener("focus", ["$event.target.value"])
    onFocus(value) {
        this.el.value = value.replace(/[^0-9.]+/g, '');
        this.el.select();
    }

    @HostListener("blur", ["$event.target.value"])
    onBlur(value) {
        this.el.value = this.currencyPipe.transform(value, this.currencyCode, '', this.digitNumber);
    }

    @HostListener("keydown.control.z", ["$event.target.value"])
    onUndo(value) {
        this.el.value = '';
    }

    @HostListener('input', ['$event'])
    onInput(event) {
        // when user on input, check regex
        const cleanValue = (event.target.value.match(this.digitRegex) || []).join('');
        if (cleanValue || !event.target.value) {
            this.lastValid = cleanValue;
        }
        this.el.value = cleanValue || this.lastValid;
    }
}
