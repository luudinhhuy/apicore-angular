import { Component, OnInit } from '@angular/core';
import { AppPage } from 'src/app/app.base';

@Component({
    selector: 'app-unlock',
    templateUrl: './unlock.component.html'
})

export class UnlockComponent extends AppPage implements OnInit {
    constructor() {
        super();
    }

    ngOnInit() { }
}
