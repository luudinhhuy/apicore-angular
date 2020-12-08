export class Charge {
    id: string = '';
    code: string = '';
    chargeNameVn: string = '';
    chargeNameEn: string = '';
    serviceTypeId: string = '';
    type: string = null;
    currencyId: string = null;
    unitPrice: number = 0;
    unitId: number = null;
    vatrate: number = 0;
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    inactiveOn: string = '';
    debitCharge: string = null;
    chargeGroup: string = null;

    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}

