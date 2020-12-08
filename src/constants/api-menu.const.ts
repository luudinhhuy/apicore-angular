import { SystemConstants } from "./system.const";
import { environment } from 'src/environments/environment';

export class API_MENU {
    private HOST = {
        Local: "localhost:",
        Test: "test.api-efms.itlvn.com",
        Staging: "staging.api-efms.itlvn.com"
    }

    private PORT = {
        System: 44360,
        Catalogue: 44361,
        Department: 44242,
        Setting: 44363,
        Documentation: 44366,
        ReportPreview: 53717,
        Operation: 44365,
    }

    private PROTOCOL = "http://";

    /**
     * Use HOST.Local to run on local environment
     * Use HOST.Test to run on test environment
     * Use HOST.Staging to run on staging environment 
     */
    private CURRENT_HOST: String = environment.HOST.WEB_URL;  //this.HOST.Local;

    private getCurrentLanguage() {
        return localStorage.getItem(SystemConstants.CURRENT_LANGUAGE);
    }

    private getCurrentVersion() {
        return localStorage.getItem(SystemConstants.CURRENT_VERSION);
    }


    private getUrlMainPath(Module: string) {

        if (this.CURRENT_HOST == this.HOST.Local) {
            return this.PROTOCOL + this.HOST.Local + this.getPort(Module) + "/api/v" + this.getCurrentVersion() + "/" + this.getCurrentLanguage() + "/";
        }
        if (this.CURRENT_HOST == this.HOST.Test) {
            return this.PROTOCOL + this.HOST.Test + "/" + Module + "/api/v" + this.getCurrentVersion() + "/" + this.getCurrentLanguage() + "/";
        }
        if (this.CURRENT_HOST == this.HOST.Staging) {
            return this.PROTOCOL + this.HOST.Staging + "/" + Module + "/api/v" + this.getCurrentVersion() + "/" + this.getCurrentLanguage() + "/";
        }
    }
    private getReportPath(Module: string) {
        if (this.CURRENT_HOST == this.HOST.Local) {
            return this.PROTOCOL + this.HOST.Local + this.getPort(Module) + "/Default.aspx";
        }
        if (this.CURRENT_HOST == this.HOST.Test) {
            return this.PROTOCOL + this.HOST.Test + "/" + Module + "/Default.aspx";
        }
        if (this.CURRENT_HOST == this.HOST.Staging) {
            return this.PROTOCOL + this.HOST.Staging + "/" + Module + "/Default.aspx";
        }
    }
    private getPort(Module: string) {
        return this.PORT[Module]; //eval("this.PORT." + Module);
    }


    /**
     * CATALOGUE MODULE API URL DEFINITION 
     */
    public Catalogue = {
        CatPlace: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/Paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/",
            //getBy: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/GetBy",
            add: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/",
            getProvinces: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/GetProvinces",
            getDistricts: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/GetDistricts",
            getModeOfTransport: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/GetModeOfTransport",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/DownloadExcel",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/UpLoadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPlace/Import"
        },
        PartnerData: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/Paging",
            customerPaging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/PagingCustomer",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/",
            add: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/",
            getDepartments: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/GetDepartments",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/DownloadExcel",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/UpLoadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartner/Import"
        },
        partnerGroup: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatPartnerGroup"
        },
        Commodity: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/Paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/",
            add: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/",
            uploadFile: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/uploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/import",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommonity/downloadExcel",
        },
        CommodityGroup: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/Paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/",
            add: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/",
            getAllByLanguage: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/GetByLanguage",
            uploadFile: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/uploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/import",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCommodityGroup/downloadExcel",
        },
        Stage_Management: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/getAll",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/getById/",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/addnew",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/delete/",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/uploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/import",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatStage/downloadExcel",
        },
        Unit: {
            getAllByQuery: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/Paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/Update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/Delete/",
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit",
            getUnitTypes: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatUnit/GetUnitTypes"
        },
        Charge: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/Query",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/Paging",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/addnew",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/delete/",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/getById/",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/update",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/uploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/import",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCharge/downloadExcel",
        },
        Charge_DefaultAccount: {
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatChargeDefaultAccount/uploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatChargeDefaultAccount/import",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatChargeDefaultAccount/downloadExcel",
        },
        Country: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/query",
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/getAll",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/getById/",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/addNew",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/delete/",
            getAllByLanguage: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/GetByLanguage",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/DownloadExcel",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/UpLoadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCountry/Import"
        },
        Area: {
            getAllByLanguage: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatArea/GetByLanguage"
        },
        Currency: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/getAll",
            getAllByQuery: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/getAllByQuery",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/getById/",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/paging",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrency/",
        }
    }

    /**
    * SYSTEM MODULE API URL DEFINITION 
    */
    public System = {
        User_Management: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser",
            login: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/login",
            getUserByID: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/GetById/",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/Paging",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/DownloadExcel",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/upLoadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysUser/Import"

        },
        Group: {

        },
        Role: {

        },
        Permission: {

        },
        Department: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "CatDepartment"
        },
        Company_Info: {

        },
        Employee: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.SYSTEM) + "SysEmployee/query"
        }
    }

    /**
    * TOOL-SETTING MODULE API URL DEFINITION 
    */
    public ToolSetting = {
        ExchangeRate: {
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/GetExchangeRateHistory/Paging",
            getNewest: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/GetNewest",
            getBy: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/GetExchangeRatesBy",
            updateRate: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/UpdateRate",
            getCurrencies: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/GetCurrencies",
            convertRate: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/ConvertRate",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/",
            removeExchangeCurrency: this.getUrlMainPath(SystemConstants.MODULE_NAME.CATALOUGE) + "CatCurrencyExchange/RemoveExchangeCurrency"
        },
        CatalogueLogViewer: {
            getCategory: this.getUrlMainPath(SystemConstants.MODULE_NAME.SETTING) + "CategoryLog/GetCategory",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.SETTING) + "CategoryLog/Paging"
        }
    }

    /**
     * DOCUMENTATION MODULE API URL DEFINITION 
     */
    public Documentation = {
        Terminology: {
            getShipmentCommonData: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "Terminology/getShipmentCommonData",
            getOPSShipmentCommonData: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "Terminology/GetOPSShipmentCommonData"
        },
        CsTransaction: {
            post: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/Paging",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/",
            getTotalProfit: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/GetTotalProfit",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/Import",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/",
            checkAllowDelete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransaction/CheckAllowDelete/"
        },
        CsTransactionDetail: {
            getByJob: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/GetByJob",
            getHBDetails: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/GetHbDetails",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/addNew",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/delete",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/Paging",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsTransactionDetail/Import"
        },
        CsMawbcontainer: {
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/Query",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/Update",
            getHBLConts: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/GetHBConts",
            downloadFileExecl: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/downloadFileExcel",
            uploadFileExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/UploadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsMawbcontainer/Import"
        },
        CsShipmentSurcharge: {
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/Update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/Delete",
            getByHBId: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/GetByHB",
            getPartners: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/GetPartners",
            getChargesByPartner: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShipmentSurcharge/GroupByListHB",
        },
        AcctSOA: {
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/Update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/Delete",
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/Get",
            getDetails: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/GetDetails",
            previewCDNote: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "AcctCDNote/PreviewOpsCdNote"
        },
        CsManifest: {
            get: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsManifest/",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsManifest/AddOrUpdateManifest",
            preview: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsManifest/PreviewFCLManifest"
        },
        CsShippingInstruction: {
            get: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShippingInstruction/",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShippingInstruction",
            previewSI: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShippingInstruction/PreviewFCLShippingInstruction",
            previewOCL: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "CsShippingInstruction/PreviewFCLOCL"
        },
        Operation: {
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/Paging",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/Update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/Delete/",
            getById: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction",
            checkAllowDelete: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/CheckAllowDelete/",
            convertClearanceToJob: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/ConvertClearanceToJob",
            convertExistedClearancesToJobs: this.getUrlMainPath(SystemConstants.MODULE_NAME.Documentation) + "OpsTransaction/ConvertExistedClearancesToJobs"
        }
    }

    /**
     * OPERATION MODULE API URL DEFINITION 
     */
    public Operation = {
        EcusConnection: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/GetAll",
            details: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/GetDetails",
            addNew: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/Add",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/Update",
            delete: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/Delete",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "EcusConnection/Paging"
        },
        CustomClearance: {
            getAll: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration",
            getClearanceTypes: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/GetClearanceTypes",
            paging: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/Paging",
            details: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/GetById/",
            getByJob: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/GetBy",
            query: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/Query",
            updateToAJob: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/UpdateJobToClearances",
            update: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/Update",
            add: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/Add",
            importClearancesFromEcus: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/ImportClearancesFromEcus",
            deleteMultiple: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/DeleteMultiple",
            downloadExcel: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/DownloadExcel",
            uploadExel: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/upLoadFile",
            import: this.getUrlMainPath(SystemConstants.MODULE_NAME.OPERATION) + "CustomsDeclaration/Import"
        }
    }

    /**
     * REPORT MODULE API URL DEFINITION
     */
    public Report = this.getReportPath(SystemConstants.MODULE_NAME.Report);
}