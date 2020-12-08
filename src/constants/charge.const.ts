export class ChargeConstants {
    public static readonly IT_CODE: string = "IT";
    public static readonly AI_CODE: string = "AI";
    public static readonly AE_CODE: string = "AE";
    public static readonly SFE_CODE: string = "SFE";
    public static readonly SFI_CODE: string = "SFI";
    public static readonly SLE_CODE: string = "SLE";
    public static readonly SLI_CODE: string = "SLI";
    public static readonly SCE_CODE: string = "SCE";
    public static readonly SCI_CODE: string = "SCI";
    public static readonly CL_CODE: string = "CL";

    public static readonly IT_DES: string = "Inland Trucking";
    public static readonly AI_DES: string = "Air Import";
    public static readonly AE_DES: string = "Air Export";
    public static readonly SFE_DES: string = "Sea FCL Export";
    public static readonly SFI_DES: string = "Sea FCL Import";
    public static readonly SLE_DES: string = "Sea LCL Export";
    public static readonly SLI_DES: string = "Sea LCL Import";
    public static readonly SCE_DES: string = "Sea Consol Export";
    public static readonly SCI_DES: string = "Sea Consol Import";
    public static readonly CL_DES: string = "Custom Logistic";


    public static readonly DEFAULT_AIR = ["BA_A_F_Air", "BA_SCR_Air", "BA_AMS_Air"];
    public static readonly BUYING_DEFAULT_FCL_EXPORT = ["BS_OCF_Sea", "BS_BL_Sea", "BS_SEL_Sea", "BS_THCF_Sea"];
    public static readonly BUYING_DEFAULT_LCL_EXPORT = ["BS_OCF_Sea", "BS_BL_Sea", "BS_SEL_Sea", "BS_THCL_Sea"];
    public static readonly BUYING_DEFAULT_FCL_IMPORT = ["BS_OCF_Sea", "BS_D_O_Sea", "BS_CIC_Sea", "BS_THCF_Sea", "BS_CCF1_Sea"];
    public static readonly BUYING_DEFAULT_LCL_IMPORT = ["BS_OCF_Sea", "BS_D_O_Sea", "BS_CIC_Sea", "BS_THCL_Sea", "BS_CCF1_Sea"];

    public static readonly SELLING_DEFAULT_FCL_EXPORT = ["SS_OCF_Sea", "SS_BL_Sea", "SS_SEL_Sea", "SS_THCF_Sea"];
    public static readonly SELLING_DEFAULT_LCL_EXPORT = ["SS_OCF_Sea", "SS_BL_Sea", "SS_SEL_Sea", "SS_THCL_Sea"];
    public static readonly SELLING_DEFAULT_FCL_IMPORT = ["SS_OCF_Sea", "SS_D_O_Sea", "SS_CIC_Sea", "SS_THCF_Sea", "SS_CCF1_Sea"];
    public static readonly SELLING_DEFAULT_LCL_IMPORT = ["SS_OCF_Sea", "SS_D_O_Sea", "SS_CIC_Sea", "SS_THCL_Sea", "SS_CCF1_Sea"];
}