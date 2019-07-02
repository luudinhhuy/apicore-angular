import { ModalOptions, ModalDirective } from "ngx-bootstrap";
import * as _ from "lodash";
import { AppPage } from "src/app/app.base";
import { ViewChild } from "@angular/core";

export abstract class PopupBase extends AppPage {
    @ViewChild("popup", { static: false }) popup: ModalDirective;

    options: ModalOptions = {
        animated: false
    };

    reset: any = null;

    constructor() {
        super();
    }

    // fn set options
    setOptions(options?: any) {
        let self = this;
        if (_.isObject(options) || _.isArray(options)) {
            _.each(options, function(val, key) {
                if (self.hasOwnProperty(key)) {
                    self[key] = val;
                }
            });
        }
    }

    // fn set config to handle
    setSettings(options?: any): any {
        let self = this;
        if (_.isObject(options) || _.isArray(options)) {
            _.each(options, function(val, key) {
                if (self.hasOwnProperty(key)) {
                    self[key] = val;
                }
            });
        }

        return this;
    }

    // show poup
    show(options?: any): void {
        console.log("popup is showing");
        this.setOptions(Object.assign(this.options, options));

        if (!this.popup.isShown) {
            if (typeof this.reset === "function") {
                this.reset();
            }

            this.popup.config = this.options;
            this.popup.show();
        }
    }

    // fn open popup
    open = (settings?: any, options?: any): any => {
        console.log("open");
        this.setSettings(settings || {}).setOptions(options || {});

        if (!this.popup.isShown) {
            this.popup.show();
        }

        return this;
    };

    // close popup
    hide(): void {
        console.log("hiding popup");
        this.popup.hide();
    }

    onHide($event: any) {
        console.log("hided popup");
    }

    onShow($event: any) {
        console.log("popup Showed");
    }
}
