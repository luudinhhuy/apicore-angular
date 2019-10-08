export class Company {
    id: string = '';
    code: string = ''
    bunameVn: string = '';
    bunameEn: string = '';
    bunameAbbr: string = '';
    logoPath: string = '';
    logo: string = '';
    website: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    inactive: boolean = false;
    sysBranch: any[] = [];
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }
        }
    }
}
