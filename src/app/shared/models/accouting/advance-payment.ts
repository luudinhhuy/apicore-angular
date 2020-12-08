export class AdvancePayment {
    id: string = '';
    customNo: string = '';
    advanceNo: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    requester: string = '';
    requesterName: string = '';
    department: string = '';
    paymentMethod: string = ''
    advanceCurrency: string = '';
    requestDate: string = '';
    deadlinePayment: string = '';
    statusApproval: string = '';
    statusApprovalName: string = '';
    advanceNote: string = '';
    advanceDatetimeModified: string = '';
    statusPayment: string = '';
    advanceStatusPayment: string = '';
    isSelected: boolean = true;
    advanceRequests: AdvancePaymentRequest[] = [];
    amount: number = 0;
    paymentMethodName: string = '';
    userNameCreated: string = '';
    userNameModified: string = '';

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

export class AdvancePaymentRequest {
    id: string = "00000000-0000-0000-0000-000000000000";
    description: string = '';
    customNo: string = '';
    jobId: string = '';
    hbl: string = '';
    mbl: string = '';
    amount: number = 0;
    requestCurrency: string = '';
    advanceType: string = '';
    advanceNo: string = '';
    requestNote: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    statusPayment: string = '';

    isSelected?: boolean;

    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}

