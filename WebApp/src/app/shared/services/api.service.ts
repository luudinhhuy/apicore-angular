import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SystemConstants } from 'src/constants/system.const';

@Injectable({ providedIn: 'root' })
export class ApiService {

    baseUrl: string = '//';
    private _headers: {} = {};
    constructor(protected _http: HttpClient,
    ) {
    }

    setHeaders(headers: any = {}) {
        this._headers = Object.assign({}, this._headers, headers);
        return this;
    }

    // set resorce to request
    setUrl(url: string = ''): string {
        return `${this.baseUrl}/${url}`;
    };

    getCurrentLanguage() {
        return localStorage.getItem(SystemConstants.CURRENT_LANGUAGE);
    }

    getCurrentVersion() {
        return localStorage.getItem(SystemConstants.CURRENT_VERSION);
    }

    post(url: string, data?: any, params?: any, headers?: any) {
        return this._http
            .post(this.setUrl(url), data, {
                params,
                headers: Object.assign({}, this._headers, headers)
            });
    }

    postFile(url: string, files: any, name: string = null, params?: any) {
        if (files.length === 0) {
            return;
        }
        const formData = new FormData();
        for (const file of files) {
            formData.append(name || file.name, file);
        }
        // const params = new HttpParams();
        const options = {
            params: params,
            reportProgress: true,
            headers: new HttpHeaders({
                'accept': 'application/json'
            })
        };
        return this._http.post(this.setUrl(url), formData, options);
    }

    put(url: string, data?: any, params?: any, headers?: any) {
        return this._http
            .put(this.setUrl(url), data, {
                params,
                headers: Object.assign({}, this._headers, headers)
            });
    }

    downloadfile(url: string, data?: any, params?: any, headers?: any) {
        return this._http.post(this.setUrl(url), data, {
            params,
            headers: Object.assign({}, this._headers, headers),
            responseType: 'arraybuffer'
        });
    }

    get(url: string = '', params?: any, headers: any = {}) {
        return this._http.get(this.setUrl(url), { params, headers });
    }

    delete(url: string, params?: any, headers?: any) {
        return this._http.delete(this.setUrl(url), { params, headers });
    }
}
