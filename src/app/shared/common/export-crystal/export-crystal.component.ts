import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Crystal } from '../../models/report/crystal.model';
import { PopupBase } from 'src/app/popup.base';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-export-crystal',
    templateUrl: './export-crystal.component.html'
})
export class ExportCrystalComponent extends PopupBase {

    @Input() modalId: any;
    @Input() data: Crystal = null;
    @ViewChild('formExportCrystal', { static: true }) frm: ElementRef;

    constructor(private sanitizer: DomSanitizer) {
        super();
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        if (this.data != null && this.frm) {
            this.frm.nativeElement.submit();
        }
    }

    submitForm(event) {
        return true;
    }
    get value() {
        if (this.data != null && this.frm) {
            return JSON.stringify(this.data);
        }
    }
    get scr() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.HOST.EXPORT_CRYSTAL}`);
    }
}
