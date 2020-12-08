namespace CommonInterface {
    export interface IHeaderTable {
        title: string;
        field: string;
        sortable?: boolean;
        class?: string;
        width?: number;
        required?: boolean;
        dataType?: CommonType.DataType;
    }

    export interface IComboGirdConfig {
        placeholder: string;
        displayFields: any[];
        dataSource: any[];
        selectedDisplayFields: any[];
    }

    export interface IComboGridData {
        field: string;
        value: string;
        data?: any;
    }

    export interface IResult {
        data: any;
        message: string;
        status: boolean;
    }

    export interface IResponsePaging {
        data: any;
        page: number;
        size: number;
        totalItems: number;
    }

    export interface ICommonTitleValue {
        title: string;
        value: any;
    }

    export interface IError {
        message: string;
        title: string;
        data?: any;
    }

    export interface ICommonShipmentData {
        productServices: IValueDisplay[];
        serviceModes: IValueDisplay[];
        shipmentModes: IValueDisplay[];
    }

    export interface IValueDisplay {
        value: any;
        displayName: string;
        fieldName?: string;
    }

    export interface ISortData {
        sortField: string;
        order: boolean;
    }

    export interface INg2Select {
        id: any;
        text: any;
    }

    export interface IComboGridDisplayField {
        field: string;
        label: string;
    }

    export interface IDataParam {
        level: number;
        name: string;
        path: string;
        [name: string]: any;
    }

    export interface IConfigSearchOption {
        settingFields: ISearchOption[];
        typeSearch: any;

    }

    export interface ISearchOption {
        fieldName: string;
        displayName: string;
        searchString?: string;
        [name: string]: any;
    }
}



