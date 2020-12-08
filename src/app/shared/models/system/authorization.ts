export class Authorization {
    id: number = 0;
    userId: string = '';
    assignTo: string = '';
    name: string = '';
    services: string = '';
    description: string = '';
    startDate: string = '';
    endDate: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active: boolean = true;
    inactiveOn: string = '';
    servicesName: string = '';
    userNameAssignTo: string = '';
    userNameAssign: string = '';
    constructor(object?: any) {
        const self = this;
        for (const key in object) {
            if (self.hasOwnProperty(key.toString())) {
                self[key] = object[key];
            }
        }
    }
}