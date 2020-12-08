export class ExportExcel  {   

    title:string;
    titleFontStyle:CellStyle =new CellStyle();
    type?: 'xlsx' | 'csv';
    header:Headertype[];
    sheetName:string;
    author?:string;
    authorFontSyle:CellStyle = new CellStyle() ;
    fileName?:string;
    logoPath?:string;
    company?:string;
    data:any[];
    cellStyle?:CellStyle = new CellStyle();

}

class CellStyle {    
    backgroundColor?:string;
    fontColor?:string;
    fontSize?:number;
    fontFamily?: 'Century Gothic' | 'Calibri' | 'Times New Roman' | 'Courier New' | 'Arial Black' | 'Kodchasan SemiBold';
    isBold?:boolean;
    isItalic?:boolean;
}

class Headertype{
    name:string;
    width:number;
}