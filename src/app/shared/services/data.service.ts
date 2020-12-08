import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class DataService {

    private messageSource = new BehaviorSubject({ "default": "hello world !" });
    currentMessage = this.messageSource.asObservable();
    data: Object = {};

    constructor() {
    }

    setData(key: string, value: any) {
        this.messageSource.next({ ...this.messageSource.value, [key]: value });
    }


    getDataByKey(key: string) {
        if (!!key && this.data.hasOwnProperty(key)) {
            return this.data[key];
        } else {
            return null;
        }
    }

    setDataService(key, newData: any) {
        this.data = Object.assign({}, this.data, { [key]: newData });
    }
}
