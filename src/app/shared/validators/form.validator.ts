import { FormGroup, AbstractControl, FormControl, Validators, ValidationErrors, } from '@angular/forms';

export class FormValidators extends Validators {

    public static comparePort(controls: AbstractControl | FormControl | FormGroup): ValidationErrors | any {

        const pol: string = controls.get('pol').value;
        const pod: string = controls.get('pod').value;

        if (!pol || !pod) {
            return null;
        }
        if (pol !== null && pod !== null && pol === pod) {
            return { invalidPort: true };
        }
        return null;

    }

    public static compareGW_CW(controls: AbstractControl | FormControl | FormGroup): ValidationErrors | any {
        const gw: string = controls.get('grossWeight').value;
        const cw: string = controls.get('chargeWeight').value;
        if (!gw || !cw) {
            return null;
        }
        if (gw !== null && cw !== null && gw > cw) {
            return { invalidGW: true };
        }
        return null;
    }

    static required(control: FormControl): ValidationErrors {
        if (control.value !== null) {
            return control.value.trim() === "" ? { "required": true } : null;
        }
        return { "required": true };
    }


    public static compareETA_ETD(controls: AbstractControl | FormControl | FormGroup): ValidationErrors | any {
        const eta: any = controls.get('eta').value;
        const etd: any = controls.get('etd').value;

        if (!eta || !etd || !eta.startDate || !etd.startDate) {
            return null;
        }
        const etaTime = new Date(eta.startDate).getTime();
        const etdTime = new Date(etd.startDate).getTime();

        return (etaTime >= etdTime) ? null : {
            validateEta_Etd: true
        };

    }

    // TODO Custom validator Fn here !
}
