import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';

@Injectable()
export class IdentityRepo {
    constructor(protected _api: ApiService) {
    }

    signout() {
        console.log("ignout");
        return this._api.get(`${environment.HOST.INDENTITY_SERVER_URL}/api/Account/Signout`);
    }
}
