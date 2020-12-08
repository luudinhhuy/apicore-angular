import { Component, Input } from '@angular/core';

@Component({
    selector: '[app-table-none-record]',
    template: `
            <td [attr.colspan]="colspan">
                <div class="no-data">
                    <i class="flaticon-coins"></i>
                    <span class="no-data-text">No records found</span>
                </div>
            </td>
    `
})

export class TableNoneRecordComponent {
    @Input() colspan: number = 100;

}

