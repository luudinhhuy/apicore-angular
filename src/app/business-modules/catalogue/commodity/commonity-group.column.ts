import { ColumnSetting } from "src/app/shared/models/layout/column-setting.model";

export const COMMODITYGROUPCOLUMNSETTING: ColumnSetting[] =
  [
    {
      primaryKey: 'id',
      header: 'Id',
      dataType: "number",
      lookup: '',
      isShow: true
    },
    {
      primaryKey: 'groupNameEn',
      header: 'Name( EN)',
      isShow: true,
      allowSearch: true,
      dataType: "text",
      required: true,
      lookup: ''
    },
    {
      primaryKey: 'groupNameVn',
      header: 'Name( Local)',
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