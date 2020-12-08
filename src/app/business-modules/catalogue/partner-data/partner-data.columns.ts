import { ColumnSetting } from "src/app/shared/models/layout/column-setting.model";

export const PARTNERDATACOLUMNSETTING: ColumnSetting[] =
  [
    {
      primaryKey: 'id',
      header: 'Partner ID',
      isShow: true,
      dataType: "text",
      lookup: '',
      allowSearch: true
    },
    {
      primaryKey: 'shortName',
      header: 'Name ABBR',
      isShow: true,
      allowSearch: true,
      dataType: "text",
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'addressVn',
      header: 'Billing Address',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'taxCode',
      header: 'Tax Code',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'tel',
      header: 'Tel',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'fax',
      header: 'Fax',
      isShow: true,
      dataType: 'text',
      required: true,
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'userCreatedName',
      header: 'Creator',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      lookup: ''
    },
    {
      primaryKey: 'datetimeModified',
      header: 'Modify',
      isShow: true,
      required: true,
      dataType: 'Date',
      allowSearch: false,
      lookup: 'provinces',
      format: undefined
    },
    {
      primaryKey: 'active',
      header: 'Status',
      isShow: true,
      dataType: 'boolean',
      required: true,
      lookup: ''
    }
  ]