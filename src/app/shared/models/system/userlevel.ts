export class UserLevel {
    id: number = 0;
    userId: string = null;
    groupId: number = 0;
    departmentId: number = null;
    officeId: string = null;
    companyId: string = null;
    position: string = null;
    employeeName: string = '';
    employeeNameVn: string = '';
    isDup: boolean = false;
    active: boolean = true;
    groupName: string = null;
    companyName: string = null;
    departmentName: string = null;
    officeName: string = null;

    constructor(data?: any) {
        let self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
