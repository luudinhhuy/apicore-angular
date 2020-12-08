import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class SettingRepo {
    private VERSION: string = 'v1';
    constructor(private _api: ApiService) {
    }

    getTariff(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    deleteTariff(tariffId: string) {
        return this._api.delete(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Delete`, { id: tariffId }).pipe(
            map((data: any) => data)
        );
    }

    addTariff(body: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailTariff(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/GetTariff`, { tariffId: id }).pipe(
            map((data: any) => data)
        );
    }

    updateTariff(body: any) {
        return this._api.put(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    checkPermissionAllowDetail(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/CheckAllowDetail/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkPermissionAllowDelete(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/CheckAllowDelete/${id}`).pipe(
            map((data: any) => data)
        );
    }
}

