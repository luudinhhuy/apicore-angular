namespace SystemInterface {
    export interface IClaimUser {
        email: string;
        employeeId: string;
        id: string;
        phone_number: string;
        preferred_username: string;
        sub: string;
        userName: string;
        companyId: string;
        officeId: string;
        departmentId: number;
        groupId: number;
    }

    export interface IDepartmentGroup {
        userId: string;
        departmentId: number;
        groupId: number;
        departmentName: string;
        groupName: string;
    }

    export interface IUserPermission {
        menuId: string;
        access: boolean;
        detail: string;
        write: string;
        delete: string;
        list: string;
        import: boolean;
        export: boolean;
        speacialActions: any[];
        allowAdd: boolean;
        [name: string]: any;

    }

    export interface IToken {
        access_token: string;
        expire_in: number;
        token_type: string;
        refresh_token: string;
    }
}
