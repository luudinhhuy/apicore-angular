export class SystemConstants {

    // Local Storage Key
    public static readonly CURRENT_CLIENT_LANGUAGE: string = 'CURRENT_CLIENT_LANGUAGE';
    public static readonly CURRENT_LANGUAGE: string = "CURRENT_LANGUAGE";
    public static readonly CURRENT_VERSION: string = "CURRENT_VERSION";
    public static readonly CURRENT_OFFICE = 'CURRENT_OFFICE';

    public static readonly LOGIN_STATUS: string = "LOGIN_STATUS";
    public static readonly LOGGED_IN: string = "LOGGED_IN";
    public static readonly LOGGED_OUT: string = "LOGGED_OUT";

    // Security
    public static readonly SECRET_KEY = "ITL-$EFMS-&SECRET_KEY001";
    public static readonly USER_CLAIMS = 'id_token_claims_obj';
    public static readonly ACCESS_TOKEN = 'access_token';
    public static readonly ID_TOKEN = 'id_token';


    // RSA 512 = 64 bytes for plain text encode
    public static readonly ENCRYPT_SERVER_PUBLIC_KEY: string =
        `-----BEGIN PUBLIC KEY-----
        MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJwRaef6v1122j4X4sRwF0JfUE+bD3gn
        KlsgyabpcbrgAVUl3eMR2KQbZI26JBQU32paL3zgZZYIeVVGGSEfNYcCAwEAAQ==
        -----END PUBLIC KEY-----
        `;
    public static readonly ENCRYPT_CLIENT_PRIVATE_KEY: string =
        `-----BEGIN RSA PRIVATE KEY-----
        MIIBOgIBAAJBAJwRaef6v1122j4X4sRwF0JfUE+bD3gnKlsgyabpcbrgAVUl3eMR
        2KQbZI26JBQU32paL3zgZZYIeVVGGSEfNYcCAwEAAQJAMHrgUSV9KIVxCfTVhnvj
        XcTJ59CdH4/bAm/O9EB0Cb5ra/J9RcavAg3oQvX9v89PFsBE8d4acEyN0nn9FYIk
        8QIhANal3OkAO8qTos7dhKikIe+T64y4n9AUyDOZ0ZMPt9U7AiEAuiJ45uZBz+J8
        U/xvUV05ZTYI4irmkabjSr/O981B7CUCIQC3rxqbneKM2chiRHiopESSM8BIHRpN
        w+sLFV+d/L5xTwIgQRidP+N3UMTcxmKaa9I2qHblVHO8f2PmSdYbA/789yECIBhN
        cEGqfwy0r/XiY3Vt/Jtez+FtJF072fmp14bEnygT
        -----END RSA PRIVATE KEY-----
        `;
    public static readonly DEFAULT_LANGUAGE: string = "en-US";
    public static readonly DEFAULT_HOME_PAGE: string = "/app/main/home";

    public static readonly FILE_EXCEL: string = 'application/ms-excel';

    // Page size for ngx-pageination options
    public static readonly OPTIONS_PAGE_SIZE: number = 15;
    public static readonly OPTIONS_NUMBERPAGES_DISPLAY: number = 10;
    public static readonly MAX_ITEMS_PER_REQUEST: number = 100;
    public static readonly ITEMS_PER_PAGE: number[] = [3, 15, 30, 50];

    public static readonly MODULE_NAME = {
        CATALOUGE: "Catalogue",
        SYSTEM: "System",
        LOG: "auditlog",
        Documentation: "Documentation",
        Report: "ReportPreview",
        SETTING: "Setting",
        OPERATION: "Operation"
    };

    public static readonly LANGUAGES = {
        ENGLISH_API: "en-US",  // SystemConstants.DEFAULT_LANGUAGE,
        VIETNAM_API: "vi-VN",
        ENGLISH: "en",
        VIETNAM: "vi"
    };

    public static readonly STATUS_BY_LANG = {
        INACTIVE: {
            ENGLISH: "Inactive",
            VIETNAM: "Ngưng Hoạt Động"
        },
        ACTIVE: {
            ENGLISH: "Active",
            VIETNAM: "Đang Hoạt Động"
        }
    };

    public static readonly CSTORAGE = {
        PARTNER: 'efms:partner',
        CURRENCY: 'efms:currency',
        SYSTEM_USER: 'efms:system-user',
        CHARGE: 'efms:charge',
        UNIT: 'efms:unit',
        CUSTOMER: 'efms:customer',
        CONSIGNEE: 'efms:consignee',
        PORT: 'efms:port',
        AGENT: 'efms:agent',
        SUPPLIER: 'efms:supplier',
        WAREHOUSE: 'efms:warehouse',
        COMMODITY: 'efms:commodity',
        OFFICE: 'efms:office',
        COMPANY: 'efms:company',
        DEPARTMENT: 'efms:department',
        CARRIER: 'efms:carrier',
        SHIPPER: 'efms:shipper',
        SHIPMENT_COMMON_DATA: 'efms:shipment-common-data',
        OPS_COMMON_DATA: 'efms:ops-common-data',
        SALE: 'efms:sale',
        PACKAGE: 'efms:unit:package'

    };

    public static EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

    public static readonly HW_AIR_CONSTANT: number = 6000;
    public static readonly CBM_AIR_CONSTANT: number = 166.67;

}
