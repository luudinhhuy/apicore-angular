import { WAREHOUSEENCOLUMNSETTING } from "../app/business-modules/catalogue/warehouse/warehouse.columns";
import { WAREHOUSEIMPORTENCOLUMNSETTING } from "src/app/business-modules/catalogue/warehouse-import/warehouse-import.columns";

export const language = {
  Menu: [
    {
      "parent_name": "Catalogue",
      "icon": "icon-books",
      "route_parent": "/home/catalogue/",
      "display_child": false,
      "childs": [

        { name: "Warehouse", route_child: "ware-house", display:true },
        { name: "Warehouse-import", route_child: "ware-house-import",display:false },
        { name: "Port Index", route_child: "port-index",display:true },
        { name: "Port Index Import", route_child: "port-index-import",display:false },
        { name: "Partner Data", route_child: "partner-data",display:true },
        { name: "Commodity", route_child: "commodity",display:true },
        { name: "Stage Management", route_child: "stage-management",display:true },
        { name: "Stage Import", route_child: "stage-import",display:false },
        { name: "Unit", route_child: "unit",display:true },
        { name: "Location", route_child: "location",display:true },
        { name: "Charge", route_child: "charge",display:true },
        { name: "Currency", route_child: "currency",display:true }
      ]
    },

    {
      "parent_name": "Operation",
      "icon": "icon-cogs",
      "route_parent": "/home/operation/",
      "display_child": false,
      "childs": [
        { name: "Job Management", route_child: "job-management",display:true },
        { name: "Assignment", route_child: "assigment",display:true },
        { name: "Trucking Assigment", route_child: "trucking-assigment",display:true }
      ]
    },

    {
      "parent_name": "Documentation",
      "icon": "icon-file-text2",
      "route_parent": "/home/documentation/",
      "display_child": false,
      "childs": [
        { name: "Inland Trucking", route_child: "inland-trucking",display:true },
        { name: "Air Export", route_child: "air-export",display:true },
        { name: "Air Import", route_child: "air-import",display:true },
        { name: "Sea Consol Export", route_child: "sea-consol-export",display:true },
        { name: "Sea Consol Import", route_child: "sea-consol-import",display:true },
        { name: "Sea FCL Export", route_child: "sea-fcl-export",display:true },
        { name: "Sea FCL Import", route_child: "sea-fcl-import",display:true },
        { name: "Sea LCL Export", route_child: "sea-lcl-export",display:true },
        { name: "Sea LCL Import", route_child: "sea-lcl-import",display:true }
        { name: "Sea LCL Import", route_child: "sea-lcl-import" }
      ]
    },

    {
      "parent_name": "Accounting",
      "icon": "icon-calculator",
      "route_parent": "/home/accounting/",
      "display_child": false,
      "childs": [
        { name: "Account Receivable Payable", route_child: "account-receivable-payable",display:true },
        { name: "Advance Payment", route_child: "advance-payment",display:true },
        { name: "Settlement Payment", route_child: "settlement-payment",display:true },
        { name: "Statement of Account", route_child: "statement-of-account",display:true }
      ]
    },

    {
      "parent_name": "System",
      "icon": "icon-database",
      "route_parent": "/home/system/",
      "display_child": false,
      "childs": [
        { name: "User Management", route_child: "user-management",display:true },
        { name: "Group", route_child: "group",display:true },
        { name: "Role", route_child: "role",display:true },
        { name: "Permission", route_child: "permission",display:true },
        { name: "Department", route_child: "department",display:true },
        { name: "Company Informations", route_child: "company-info",display:true }
      ]
    },

    {
      "parent_name": "Tool - Setting",
      "icon": "icon-wrench",
      "route_parent": "/home/tool/",
      "display_child": false,
      "childs": [
        { name: "ID Definition", route_child: "id-definition",display:true },
        { name: "Tariff", route_child: "tariff",display:true },
        { name: "Exchange Rate", route_child: "exchange-rate",display:true },
        { name: "Ecus Connection", route_child: "ecus-connection",display:true },
        { name: "KPI", route_child: "kpi",display:true },
        { name: "Supplier", route_child: "supplier",display:true },
        { name: "Catalog Log Viewer", route_child: "log-viewer",display:true }

      ]
    },

    {
      "parent_name": "Report",
      "icon": "icon-stats-bars",
      "route_parent": "/home/report/",
      "display_child": false,
      "childs": [
        { name: "P/L Report", route_child: "pl-report",display:true },
        { name: "Performance Report", route_child: "performance-report",display:true },
        { name: "Shipment Overview", route_child: "shipment-overview",display:true }
      ]
    },

    {
      "parent_name": "Designs Zone",
      "icon": "icon-format_paint",
      "route_parent": "/home/designs-zone/",
      "display_child": false,
      "childs": [
        { name: "Form", route_child: "form",display:true },
        { name: "Table", route_child: "table",display:true }
      ]
    }
  ],
  Warehouse: WAREHOUSEENCOLUMNSETTING,
  WarehouseImport: WAREHOUSEIMPORTENCOLUMNSETTING,
  NOTIFI_MESS: {
    UNKNOW_ERR:"Unknow Error",
    SERVER_ERR_TITLE: "Server Error",
    CLIENT_ERR_TITLE: "Invalid Request",
    EXPIRED_SESSION_TITLE: "Expired Session",
    CHECK_CONNECT:"Check Your Connection !",
    EXPIRED_SESSION_MESS: "Please Login Again To Continue !",
    EXPORT_SUCCES: "Export File Successfully !",
    IMPORT_SUCCESS:"Import File Successfully !"
  }
}