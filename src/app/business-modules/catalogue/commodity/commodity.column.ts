import { ColumnSetting } from "src/app/shared/models/layout/column-setting.model";

export const COMMODITYCOLUMNSETTING: ColumnSetting[] =
  [
    {
      primaryKey: 'id',
      header: 'Id',
      dataType: "number",
      lookup: ''
    },
    {
      primaryKey: 'code',
      header: 'Code',
      allowSearch: true,
      isShow: true,
      dataType: 'text',
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'commodityNameEn',
      header: 'Name( EN)',
      isShow: true,
      allowSearch: true,
      dataType: "text",
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'commodityNameVn',
      header: 'Name( Local)',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'commodityGroupNameEn',
      header: 'Group',
      isShow: true,
      dataType: 'text',
      allowSearch: true,
      required: true,
      lookup: ''
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