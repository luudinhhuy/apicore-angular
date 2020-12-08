import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'negativeNumber',
})

export class NegativeNumberePipe implements PipeTransform {
    transform(value: number, ...args: any[]): any {
        if (!isNaN(value) && value < 0) {
            return `(${Math.abs(value)})`;
        } else {
            return value;
        }
    }
}
