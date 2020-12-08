namespace ReportInterface {
    export interface ISaleReportCriteria {
        serviceDateFrom: string;
        serviceDateTo: string;
        createdDateFrom: string;
        createdDateTo: string;
        customerId: string;
        service: string;
        currency: string;
        jobId: string;
        mawb: string;
        hawb: string;
        officeId: string;
        departmentId: string;
        groupId: string;
        personInCharge: string;
        salesMan: string;
        creator: string;
        carrierId: string;
        agentId: string;
        pol: string;
        pod: string;
        typeReport: string;
    }
}