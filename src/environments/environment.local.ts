
export const environment = {
    production: false,
    local: true,
    HOST: {
        WEB_URL: "localhost:",
        ACCOUNTING: "localhost:44368",
        DOCUMENTATION: "localhost:44366",
        CATALOGUE: "localhost:44361",
        OPERATION: "localhost:44365",
        SYSTEM: "localhost:44360",
        REPORT: "http://localhost:53717/Default.aspx",
        EXPORT: "localhost:63492",
        SETTING: "localhost:44363",
        INDENTITY_SERVER_URL: "https://localhost:44369",
        EXPORT_CRYSTAL: "localhost:53717/ExportCrystal.aspx",
    },
    AUTHORIZATION:
    {
        requireHttps: false
    }
};
