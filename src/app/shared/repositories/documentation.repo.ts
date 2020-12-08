import { Injectable } from "@angular/core";
import { ApiService } from "../services";
import { environment } from "src/environments/environment";
import { catchError, map } from "rxjs/operators";
import { throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DocumentationRepo {

    private VERSION: string = 'v1';
    constructor(protected _api: ApiService) {
    }

    getDetailHbl(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/GetById?id=${id}`).pipe(
            map((data: any) => data)
        );
    }

    getManifest(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsManifest`, { jobId: id }).pipe(
            map((data: any) => data)
        );
    }

    updateHbl(body: any) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransactionDetail/Update`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteHbl(id: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransactionDetail/Delete`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }


    getGoodSummaryOfAllHbl(jobId: any) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/GetGoodSummaryOfAllHblByJobId`, { jobId: jobId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    createTransaction(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction`, body);
    }

    AddOrUpdateManifest(body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsManifest/AddOrUpdateManifest`, body);
    }


    getDetailTransaction(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction/${id}`);
    }

    updateCSTransaction(body: any) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction`, body);
    }

    importCSTransaction(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction/Import`, body);
    }

    getDetailCSTransaction(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction?id=${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }


    addOPSJob(body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/Add`, body);
    }

    getListShipment(page?: number, size?: number, body = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/Paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    updateShipment(body: any) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/Update`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getDetailShipment(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction?id=${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getOPSShipmentCommonData() {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/Terminology/GetOPSShipmentCommonData`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkShipmentAllowToDelete(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/CheckAllowDelete/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkViewDetailPermission(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/CheckPermission/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkDetailShippmentPermission(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransaction/CheckPermission/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }


    deleteShipment(id: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/OpsTransaction/Delete/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getShipmentByPartnerOrService(partnerId: string, services: string[]) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetShipmentsCreditPayer`, { partner: partnerId, productServices: services }).pipe(
            map((data: any) => data)
        );
    }

    getShipmentNotLocked() {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetShipmentNotLocked`).pipe(
            map((data: any) => data)
        );
    }

    getListChargeShipment(body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsShipmentSurcharge/ListChargeShipment`, body).pipe(
            map((data: any) => data)
        );
    }

    checkAllowConvertJob(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/OpsTransaction/CheckAllowConvertJob`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    convertClearanceToJob(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/OpsTransaction/ConvertClearanceToJob`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    convertExistedClearanceToJob(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/OpsTransaction/ConvertExistedClearancesToJobs`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getDetailsCDNote(jobId: string, cdNo: String) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/GetDetails`, { jobId: jobId, cdNo: cdNo });
    }

    getSurchargeByHbl(type: string, hbId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GetByHB`, { hbId: hbId, type: type });
    }

    getListContainersOfJob(data: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsMawbcontainer/Query`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    getShipmentCommonData() {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/Terminology/GetOPSShipmentCommonData`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    downloadcontainerfileExcel() {
        return this._api.downloadfile(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsMawbcontainer/downloadFileExcel`, null).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    downloadgoodsfileExcel() {
        return this._api.downloadfile(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsMawbcontainer/downloadGoodsFileExcel`, null).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    previewCDNote(data) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/PreviewOpsCdNote`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewPL(jobId, currency) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/OpsTransaction/PreviewFormPLsheet`, { jobId: jobId, currency: currency }).pipe(
            map((data: any) => data)
        );
    }

    importContainerExcel(data) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsMawbcontainer/Import`, data).pipe(
            map((res: any) => {
                return res;
            })
        );
    }

    getShipmentBySearchOption(searchOption: string, keywords: string[] = []) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetShipmentsCopyListBySearchOption`, { searchOption: searchOption, keywords: keywords }).pipe(
            map((data: any) => data)
        );
    }
    getListHblPaging(page?: number, size?: number, body = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransactionDetail/Paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListShipmentDocumentation(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/Paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    getListHouseBillOfJob(data: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/QueryData`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    checkViewDetailHblPermission(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransactionDetail/CheckPermission/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListHouseBillAscHBLOfJob(data: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/GetListHouseBillAscHBL`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    createHousebill(body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsTransactionDetail/addNew`, body);
    }

    checkMasterBillAllowToDelete(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/CheckAllowDelete/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteMasterBill(id: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getShipmentDataCommon() {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/Terminology/GetShipmentCommonData`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getPartners(id: any, isHouseBillID: boolean) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GetPartners`, { Id: id, IsHouseBillID: isHouseBillID }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getChargesByPartner(id: any, partnerId: any, isHouseBillID: any, cdNoteCode: any) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GroupByListHB`, { Id: id, partnerID: partnerId, IsHouseBillID: isHouseBillID, cdNoteCode: cdNoteCode }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListCDNote(jobId: string, isShipmentOperation: boolean) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/AcctCDNote/Get`, { Id: jobId, IsShipmentOperation: isShipmentOperation });
    }

    checkCdNoteAllowToDelete(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/CheckAllowDelete/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteCdNote(cdNoteId: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/Delete`, { cdNoteId: cdNoteId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    addCdNote(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/Add`, body);
    }

    updateCdNote(body: any) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/Update`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getChargesByPartnerNotExitstCdNote(id: any, partnerId: any, isHouseBillID: boolean, listData: any[]) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GroupByListHBNotExistsCDNote`, { Id: id, partnerID: partnerId, IsHouseBillID: isHouseBillID, listData: listData }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    addShipmentSurcharge(data) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/Add`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    addShipmentSurcharges(data: any[]) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/AddAndUpdate`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    upLoadContainerFile(files: any, id: string, isHouseBill: boolean) {
        return this._api.postFile(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsMawbcontainer/UploadFile`, files, "uploadedFile", { id: id, isHouseBill: isHouseBill });
    }

    upLoadGoodsFile(files: any, id: string, isHouseBill: boolean) {
        return this._api.postFile(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsMawbcontainer/UploadGoodsFile`, files, "uploadedFile", { id: id, isHouseBill: isHouseBill });
    }

    deleteShipmentSurcharge(chargId: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/Delete`, { chargId: chargId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getShipmentTotalProfit(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GetShipmentTotalProfit`, { jobId: jobId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getHBLTotalProfit(hblId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShipmentSurcharge/GetHouseBillTotalProfit`, { hblid: hblId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    updateArrivalInfo(body: any = {}) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/UpdateArrival`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    previewSIFCdNote(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/PreviewSIFCdNote`, body).pipe(
            map((data: any) => data)
        );
    }


    setArrivalFreightChargeDefault(body: any = {}) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/SetArrivalChargeDefault`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    setArrivalHeaderFooterDefault(body: any = {}) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/SetArrivalHeaderFooterDefault`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getArrivalInfo(hblId: string, type: number) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/GetArrival`, { hblid: hblId, type: type }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getDeliveryOrder(hblId: string, type: number) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/GetDeliveryOrder`, { hblid: hblId, type: type }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    setDefaultHeaderFooterDeliveryOrder(body: any = {}) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/SetDeliveryOrderHeaderFooterDefault`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    updateDeliveryOrderInfo(body: any = {}) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/UpdateDeliveryOrder`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    previewDeliveryOrder(hblId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/PreviewDeliveryOrder`, { hblid: hblId }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewArrivalNotice(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/PreviewArrivalNotice`, body).pipe(
            map((data: any) => data)
        );
    }

    previewProofofDelivery(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewProofOfDelivery`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewAirProofofDelivery(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewAirProofOfDelivery`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewAirDocumentRelease(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewAirDocumentRelease`, { id: id }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewAirImportAuthorizeLetter1(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewAirImptAuthorisedLetter`, { housbillId: id }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewAirImportAuthorizeLetter2(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/AirImptAuthorisedLetter_Consign`, { housbillId: id }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }


    previewSIFPLsheet(jobId: string, hblId: string, currency: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/PreviewSIFPLsheet`, { jobId: jobId, hblId: hblId, currency: currency }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewSeaImportManifest(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsManifest/PreviewSeaImportManifest`, body).pipe(
            map((data: any) => data)
        );
    }
    previewSeaExportManifest(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsManifest/PreviewSeaExportManifest`, body).pipe(
            map((data: any) => data)
        );
    }
    previewAirExportManifest(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsManifest/PreviewAirExportManifest`, body).pipe(
            map((data: any) => data)
        );
    }
    getShippingInstruction(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsShippingInstruction/` + id).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    updateShippingInstruction(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/vi/CsShippingInstruction`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    previewSIReport(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShippingInstruction/PreviewFCLShippingInstruction`, body).pipe(
            map((data: any) => data)
        );
    }
    previewOCLReport(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsShippingInstruction/PreviewFCLOCL`, body).pipe(
            map((data: any) => data)
        );
    }

    previewSeaHBLOfLanding(hblId: string, reportType: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewSeaHBLofLading`, { hblId: hblId, reportType: reportType }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    GetShipmentNotExist(typeSearch: string, shipments: string[] = []) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetShipmentNotExist`, { typeSearch: typeSearch, shipments: shipments }).pipe(
            map((data: any) => data)
        );
    }

    previewHouseAirwayBillLastest(hblId: string, reportType: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewHouseAirwayBillLastest`, { hblId: hblId, reportType: reportType }).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    previewAirCdNote(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/AcctCDNote/PreviewAirCdNote`, body).pipe(
            map((data: any) => data)
        );
    }

    getShipmentDemensionDetail(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsDimensionDetail/GetByMasterBill`, { mblId: jobId }).pipe(
            map((data: any) => data)
        );
    }

    getHBLDemensionDetail(hblId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsDimensionDetail/GetByHouseBill`, { hblId: hblId }).pipe(
            map((data: any) => data)
        );
    }

    previewAirAttachList(hblId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewAirAttachList`, { hblId: hblId }).pipe(
            map((data: any) => data)
        );
    }

    previewArrivalNoticeAir(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsArrivalDeliveryOrder/PreviewArrivalNoticeAir`, body).pipe(
            map((data: any) => data)
        );
    }

    syncHBL(jobId: string, body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/SyncHBLByShipment/${jobId}`, body).pipe(
            map((data: any) => data)
        );
    }
    
    generateHBLNo(transactionTypeEnum: number) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/GenerateHBLNo`, { transactionTypeEnum: transactionTypeEnum }).pipe(
            map((data: any) => data)
        );
    }

    checkExistedHawbNo(hwbno: string, jobId: string, hblId: string = null) {
        if (hblId === null) {
            return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/CheckHwbNoExisted`, { hwbno: hwbno, jobId: jobId }).pipe(
                map((data: any) => data)
            );
        } else {
            return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/CheckHwbNoExisted`, { hwbno: hwbno, jobId: jobId, hblId: hblId }).pipe(
                map((data: any) => data)
            );
        }

    }

    getSeparate(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/GetSeparateByHblid`, { hbId: id });
    }


    getHouseDIMByJob(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsDimensionDetail/GetDIMFromHouseBillsByJob`, { id: jobId }).pipe(
            map((data: any) => data)
        );
    }

    uploadFileShipment(jobId: string, body: any) {
        return this._api.putFile(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/UploadMultiFiles/${jobId}`, body, 'files').pipe(
            map((data: any) => data)
        );
    }

    getShipmentFilesAttach(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/GetFileAttachs`, { jobId: jobId }).pipe(
            map((data: any) => data)
        );
    }

    deleteShipmentFilesAttach(fileId: string) {
        return this._api.delete(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/DeleteAttachedFile/${fileId}`).pipe(
            map((data: any) => data)
        );
    }

    getShipmentToUnlock(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetShipmentToUnLock`, body).pipe(
            map((data: any) => data)
        );
    }

    unlockShipment(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/UnLockShipment`, body).pipe(
            map((data: any) => data)
        );
    }

    checkPermissionAllowDeleteShipment(id: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransaction/CheckDeletePermission/${id}`).pipe(
            map((data: any) => data)
        );
    }

    getShipmentOtherCharge(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/csShipmentOtherCharge/GetByMasterBill`, { jobId: jobId }).pipe(
            map((data: any) => data)
        );
    }

    getHBLOtherCharge(hblId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/csShipmentOtherCharge/GetByHouseBill`, { hblId: hblId }).pipe(
            map((data: any) => data)
        );
    }

    createAirwayBill(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsAirWayBill`, body).pipe(
            map((data: any) => data)
        );
    }

    updateAirwayBill(body: any) {
        return this._api.put(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsAirWayBill`, body).pipe(
            map((data: any) => data)
        );
    }

    getAirwayBill(jobId: string) {
        return this._api.get(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsAirWayBill/GetBy/${jobId}`).pipe(
            map((data: any) => data)
        );
    }

    previewBookingNote(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/CsTransactionDetail/PreviewBookingNote`, body).pipe(
            map((data: any) => data)
        );
    }

    getGeneralReport(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/Shipment/GetDataGeneralReport`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    previewSaleMonthlyReport(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/SaleReport`, body).pipe(
            map((data: any) => data)
        );
    }

    previewSaleQuaterReport(body: any) {
        return this._api.post(`${environment.HOST.DOCUMENTATION}/api/${this.VERSION}/en-US/SaleReport/QuaterSaleReport`, body).pipe(
            map((data: any) => data)
        );
    }
}
