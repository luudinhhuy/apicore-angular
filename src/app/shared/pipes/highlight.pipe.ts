import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {

    transform(text: string, search: string): string {
        const regex = new RegExp(search || '', 'gi');
        return search ? (text + '' || '').replace(regex, (match) => `<span class="highlight">${match}</span>`) : text;
    }
}