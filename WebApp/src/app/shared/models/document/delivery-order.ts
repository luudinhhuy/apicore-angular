export class DeliveryOrder {
    hblid: string = null;
    deliveryOrderNo: string = null;
    transactionType: number = null;
    userDefault: string = null;
    doheader1: string = null;
    doheader2: string = null;
    dofooter: string = null;
    deliveryOrderPrintedDate: any = null;

    constructor(object: any = {}) {
        const self = this;
        for (const key of Object.keys(object)) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}
