﻿using AutoMapper;
using eFMS.API.Common.Globals;
using eFMS.API.Documentation.DL.Common;
using eFMS.API.Documentation.DL.IService;
using eFMS.API.Documentation.DL.Models;
using eFMS.API.Documentation.DL.Models.Criteria;
using eFMS.API.Documentation.DL.Models.ReportResults;
using eFMS.API.Documentation.Service.Contexts;
using eFMS.API.Documentation.Service.Models;
using eFMS.API.Documentation.Service.ViewModels;
using eFMS.IdentityServer.DL.UserManager;
using ITL.NetCore.Common;
using ITL.NetCore.Connection;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace eFMS.API.Documentation.DL.Services
{
    public class OpsTransactionService : RepositoryBase<OpsTransaction, OpsTransactionModel>, IOpsTransactionService
    {
        //private ICatStageApiService catStageApi;
        //private ICatPlaceApiService catplaceApi;
        //private ICatPartnerApiService catPartnerApi;
        //private ISysUserApiService sysUserApi;
        private readonly ICurrentUser currentUser;
        private readonly IStringLocalizer stringLocalizer;
        private readonly ICsShipmentSurchargeService surchargeService;
        private readonly IContextBase<CatPartner> partnerRepository;
        private readonly IContextBase<SysUser> userRepository;
        private readonly IContextBase<CatUnit> unitRepository;
        private readonly IContextBase<CatPlace> placeRepository;
        private readonly IContextBase<OpsStageAssigned> opsStageAssignedRepository;
        private readonly IContextBase<CsShipmentSurcharge> surchargeRepository;
        private readonly IContextBase<CustomsDeclaration> customDeclarationRepository;

        public OpsTransactionService(IContextBase<OpsTransaction> repository, 
            IMapper mapper, 
            ICurrentUser user, 
            IStringLocalizer<LanguageSub> localizer, 
            ICsShipmentSurchargeService surcharge, 
            IContextBase<CatPartner> partner, 
            IContextBase<SysUser> userRepo,
            IContextBase<CatUnit> unitRepo,
            IContextBase<CatPlace> placeRepo,
            IContextBase<OpsStageAssigned> opsStageAssignedRepo,
            IContextBase<CsShipmentSurcharge> surchargeRepo,
            IContextBase<CustomsDeclaration> customDeclarationRepo) : base(repository, mapper)
        {
            //catStageApi = stageApi;
            //catplaceApi = placeApi;
            //catPartnerApi = partnerApi;
            //sysUserApi = userApi;
            currentUser = user;
            stringLocalizer = localizer;
            surchargeService = surcharge;
            partnerRepository = partner;
            userRepository = userRepo;
            unitRepository = unitRepo;
            placeRepository = placeRepo;
            opsStageAssignedRepository = opsStageAssignedRepo;
            surchargeRepository = surchargeRepo;
            customDeclarationRepository = customDeclarationRepo;
        }
        public override HandleState Add(OpsTransactionModel model)
        {
            model.Id = Guid.NewGuid();
            model.CreatedDate = DateTime.Now;
            model.UserCreated = currentUser.UserID;
            model.ModifiedDate = model.CreatedDate;
            model.UserModified = model.UserCreated;
            //model.CurrentStatus = "InSchedule";
            var dayStatus = (int)(model.ServiceDate.Value.Date - DateTime.Now.Date).TotalDays;
            if(dayStatus > 0)
            {
                model.CurrentStatus = TermData.InSchedule;
            }
            else
            {
                model.CurrentStatus = TermData.Processing;
            }
            int countNumberJob = DataContext.Count(x => x.CreatedDate.Value.Month == DateTime.Now.Month && x.CreatedDate.Value.Year == DateTime.Now.Year);
            model.JobNo = GenerateID.GenerateOPSJobID(Constants.OPS_SHIPMENT, countNumberJob);
            var entity = mapper.Map<OpsTransaction>(model);
            return DataContext.Add(entity);
        }
        public HandleState Delete(Guid id)
        {
            var detail = DataContext.First(x => x.Id == id);
            var result = Delete(x => x.Id == id, false);
            if (result.Success)
            {
                var assigneds = opsStageAssignedRepository.Get(x => x.JobId == id);//((eFMSDataContext)DataContext.DC).OpsStageAssigned.Where(x => x.JobId == id);
                if (assigneds != null)
                {
                    RemoveStageAssigned(assigneds);
                }
                if(detail != null)
                {
                    var surcharges = surchargeRepository.Get(x => x.Hblid == detail.Hblid && x.Soano == null);
                    if (surcharges != null)
                    {
                        RemoveSurcharge(surcharges);
                    }
                }
            }
            SubmitChanges();
            opsStageAssignedRepository.SubmitChanges();
            surchargeRepository.SubmitChanges();
            return result;
        }
        private void RemoveSurcharge(IQueryable<CsShipmentSurcharge> list)
        {
            foreach(var item in list)
            {
                surchargeRepository.Delete(x => x.Id == item.Id, false);
            }
        }
        private void RemoveStageAssigned(IQueryable<OpsStageAssigned> list)
        {
            foreach(var item in list)
            {
                opsStageAssignedRepository.Delete(x => x.Id == item.Id, false);
            }
        }
        public OpsTransactionModel GetDetails(Guid id)
        {
            var details = Get(x => x.Id == id).FirstOrDefault();

            if (details != null)
            {
                var agent = partnerRepository.Get(x => x.Id == details.AgentId).FirstOrDefault();
                details.AgentName = agent?.PartnerNameEn;

                var supplier = partnerRepository.Get(x => x.Id == details.SupplierId).FirstOrDefault();
                details.SupplierName = supplier?.PartnerNameEn; 
            }

            return details;
        }

        public OpsTransactionResult Paging(OpsTransactionCriteria criteria, int page, int size, out int rowsCount)
        {
            var data = Query(criteria);
            rowsCount = data.Count();
            var totalProcessing = data.Count(x => x.CurrentStatus == TermData.Processing);
            var totalfinish = data.Count(x => x.CurrentStatus == TermData.Finish);
            var totalOverdued = data.Count(x => x.CurrentStatus == TermData.Overdue);
            int totalCanceled = 0;
            if (criteria.ServiceDateFrom == null && criteria.ServiceDateTo == null)
            {
                int year = DateTime.Now.Year - 2;
                criteria.ServiceDateFrom = new DateTime(year, 1, 1);
                criteria.ServiceDateTo = new DateTime(DateTime.Now.Year, 12, 31);
            }
            totalCanceled = DataContext.Count(x => x.CurrentStatus == TermData.Canceled && x.ServiceDate >= criteria.ServiceDateFrom && x.ServiceDate <= criteria.ServiceDateTo); //data.Count(x => x.CurrentStatus == DataTypeEx.GetJobStatus(JobStatus.Canceled));
            if (rowsCount == 0) return null;
            if (size > 1)
            {
                data = data.OrderByDescending(x => x.ModifiedDate);
                if (page < 1)
                {
                    page = 1;
                }
                data = data.Skip((page - 1) * size).Take(size);
            }
            var results = new OpsTransactionResult
            {
                OpsTransactions = data,
                ToTalInProcessing = totalProcessing,
                ToTalFinish = totalfinish,
                TotalOverdued = totalOverdued,
                TotalCanceled = totalCanceled
            };
            return results;
        }
        public bool CheckAllowDelete(Guid jobId)
        {
            var query = (from detail in ((eFMSDataContext)DataContext.DC).OpsTransaction
                         where detail.Id == jobId && detail.CurrentStatus != TermData.Canceled
                         join surcharge in ((eFMSDataContext)DataContext.DC).CsShipmentSurcharge on detail.Hblid equals surcharge.Hblid
                         where surcharge.CreditNo != null || surcharge.DebitNo != null || surcharge.Soano != null || surcharge.PaymentRefNo != null
                         select detail);
            if (query.Any())
            {
                return false;
            }
            return true;
        }
        public IQueryable<OpsTransactionModel> Query(OpsTransactionCriteria criteria)
        {
            var data = GetView().AsQueryable();
            var datajoin = data;
            List<OpsTransactionModel> results = new List<OpsTransactionModel>();
            if (data == null)
                return null;

            if(criteria.ClearanceNo != null)
            {
                var listCustomsDeclaration = ((eFMSDataContext)DataContext.DC).CustomsDeclaration.Where(x => x.ClearanceNo.ToLower().Contains(criteria.ClearanceNo.ToLower()));
                if(listCustomsDeclaration.Count() > 0)
                {
                    datajoin = from custom in listCustomsDeclaration
                               join datas in data on custom.JobNo equals datas.JobNo
                               select datas;
                    if(datajoin.Count() > 1)
                    {
                        datajoin = datajoin.GroupBy(x => x.JobNo).SelectMany(x => x).AsQueryable();
                    }
                }
                else
                {
                    return results.AsQueryable();
                }
            }
            if(criteria.CreditDebitInvoice != null)
            {
                var listDebit = ((eFMSDataContext)DataContext.DC).AcctCdnote.Where(x => x.Code.ToLower().Contains(criteria.CreditDebitInvoice.ToLower()));
                if(listDebit.Count() > 0)
                {
                    datajoin = from acctnote in listDebit
                               join datas in data on acctnote.JobId equals datas.ID
                               select datas;
                    if (datajoin.Count() > 1)
                    {
                        datajoin = datajoin.GroupBy(x => x.JobNo).SelectMany(x => x).AsQueryable();
                    }
                }
                else
                {
                    return results.AsQueryable();
                }

            }


            if (criteria.ServiceDateFrom == null && criteria.ServiceDateTo == null)
            {
                int year = DateTime.Now.Year -2;
                DateTime startDay = new DateTime(year, 1, 1);
                DateTime lastDay = new DateTime(DateTime.Now.Year, 12, 31);
                datajoin = datajoin.Where(x => x.ServiceDate >= startDay && x.ServiceDate <= lastDay);
            }
            if (criteria.All == null)
            {
                datajoin = datajoin.Where(x => (x.JobNo ?? "").IndexOf(criteria.JobNo ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.HWBNO ?? "").IndexOf(criteria.Hwbno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.MBLNO ?? "").IndexOf(criteria.Mblno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.ProductService ?? "").IndexOf(criteria.ProductService ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.ServiceMode ?? "").IndexOf(criteria.ServiceMode ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.CustomerID == criteria.CustomerId || string.IsNullOrEmpty(criteria.CustomerId))
                                && (x.FieldOpsID == criteria.FieldOps || string.IsNullOrEmpty(criteria.FieldOps))
                                && (x.ShipmentMode == criteria.ShipmentMode || string.IsNullOrEmpty(criteria.ShipmentMode))
                                && ((x.ServiceDate ?? null) >= criteria.ServiceDateFrom || criteria.ServiceDateFrom == null)
                                && ((x.ServiceDate ?? null) <= criteria.ServiceDateTo || criteria.ServiceDateTo == null)
                            ).OrderByDescending(x => x.ModifiedDate);
            }
            else
            {
                datajoin = datajoin.Where(x => (x.JobNo ?? "").IndexOf(criteria.JobNo ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.HWBNO ?? "").IndexOf(criteria.Hwbno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.MBLNO ?? "").IndexOf(criteria.Mblno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.ProductService ?? "").IndexOf(criteria.ProductService ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.ServiceMode ?? "").IndexOf(criteria.ServiceMode ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.CustomerID == criteria.CustomerId || string.IsNullOrEmpty(criteria.CustomerId))
                                   || (x.FieldOpsID == criteria.FieldOps || string.IsNullOrEmpty(criteria.FieldOps))
                                   || (x.ShipmentMode == criteria.ShipmentMode || string.IsNullOrEmpty(criteria.ShipmentMode))
                               && ((x.ServiceDate ?? null) >= (criteria.ServiceDateFrom ?? null) && (x.ServiceDate ?? null) <= (criteria.ServiceDateTo ?? null))
                               ).OrderByDescending(x => x.ModifiedDate);
            }
            results = mapper.Map<List<OpsTransactionModel>>(datajoin);
            return results.AsQueryable();
        }
        private List<sp_GetOpsTransaction> GetView()
        {
            var list = ((eFMSDataContext)DataContext.DC).ExecuteProcedure<sp_GetOpsTransaction>(null);
            return list;
        }

        public Crystal PreviewCDNOte(AcctCDNoteDetailsModel model)
        {
            if (model == null)
            {
                return null;
            }
            Crystal result = null;
            var parameter = new AcctSOAReportParams
            {
                DBTitle = "DB title",
                DebitNo = model.CDNote.Code,
                TotalDebit = model.TotalDebit?.ToString(),
                TotalCredit = model.TotalCredit?.ToString(),
                DueToTitle = "",
                DueTo = "",
                DueToCredit = "",
                SayWordAll = "",
                CompanyName = "",
                CompanyDescription="",
                CompanyAddress1 = "",
                CompanyAddress2 = "",
                Website = "efms.itlvn.com",
                IbanCode = "",
                AccountName = "",
                BankName = "",
                SwiftAccs = "",
                AccsUSD = "",
                AccsVND = "",
                BankAddress = "",
                Paymentterms = "",
                DecimalNo = null,
                CurrDecimal = null,
                IssueInv = "",
                InvoiceInfo = "",
                Contact = "",


            };
            return result;
        }

        private string SetProductServiveShipment(OpsTransactionClearanceModel model)
        {
            string productService = string.Empty;
            if (model.CustomsDeclaration.ServiceType == "Sea")
            {
                if (model.CustomsDeclaration.CargoType == "FCL")
                {
                    model.CustomsDeclaration.CargoType = "SeaFCL";
                }
                if (model.CustomsDeclaration.CargoType == "LCL")
                {
                    model.CustomsDeclaration.CargoType = "SeaLCL";
                }
                productService = model.CustomsDeclaration.CargoType;
            }
            else
            {
                productService = model.CustomsDeclaration.ServiceType;
            }
            return productService;
        }
        public HandleState ConvertClearanceToJob(OpsTransactionClearanceModel model)
        {
            var result = new HandleState();
            try
            {
                var existedMessage = CheckExist(model.OpsTransaction);
                if (existedMessage != null)
                {
                    return new HandleState(existedMessage);
                }
                if (CheckExistClearance(model.CustomsDeclaration, model.CustomsDeclaration.Id))
                {
                    result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCENO_EXISTED, model.CustomsDeclaration.ClearanceNo].Value);
                    return result;
                }
                string productService = SetProductServiveShipment(model);
                if(productService == null)
                {
                    result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCENO_CARGOTYPE_NOT_ALLOW_EMPTY].Value);
                    return result;
                }
                if (model.CustomsDeclaration.JobNo == null)
                {
                    model.OpsTransaction.Id = Guid.NewGuid();
                    model.OpsTransaction.Hblid = Guid.NewGuid();
                    model.OpsTransaction.CreatedDate = DateTime.Now;
                    model.OpsTransaction.UserCreated = currentUser.UserID; //currentUser.UserID;
                    model.OpsTransaction.ModifiedDate = DateTime.Now;
                    model.OpsTransaction.UserModified = currentUser.UserID;
                    model.OpsTransaction.ProductService = productService;
                    int countNumberJob = DataContext.Count(x => x.CreatedDate.Value.Month == DateTime.Now.Month && x.CreatedDate.Value.Year == DateTime.Now.Year);
                    model.OpsTransaction.JobNo = GenerateID.GenerateOPSJobID(Constants.OPS_SHIPMENT, countNumberJob);
                    var dayStatus = (int)(model.OpsTransaction.ServiceDate.Value.Date - DateTime.Now.Date).TotalDays;
                    if (dayStatus > 0)
                    {
                        model.OpsTransaction.CurrentStatus = TermData.InSchedule;
                    }
                    else
                    {
                        model.OpsTransaction.CurrentStatus = TermData.Processing;
                    }
                    var transaction = mapper.Map<OpsTransaction>(model.OpsTransaction);
                    DataContext.Add(transaction, false);
                }

                var clearance = mapper.Map<CustomsDeclaration>(model.CustomsDeclaration);
                clearance.ConvertTime = DateTime.Now;
                if (clearance.Id > 0)
                {
                    clearance.DatetimeModified = DateTime.Now;
                    clearance.UserModified = currentUser.UserID;
                    clearance.JobNo = model.OpsTransaction.JobNo;
                    customDeclarationRepository.Update(clearance, x => x.Id == clearance.Id, false);
                }
                else
                {
                    clearance.DatetimeCreated = DateTime.Now;
                    clearance.DatetimeModified = DateTime.Now;
                    clearance.UserCreated = model.CustomsDeclaration.UserModified = currentUser.UserID;
                    clearance.Source = Constants.CLEARANCE_FROM_EFMS;
                    clearance.JobNo = model.OpsTransaction.JobNo;
                    customDeclarationRepository.Add(clearance, false);
                }
                DataContext.SubmitChanges();
                customDeclarationRepository.SubmitChanges();
            }
            catch (Exception ex)
            {
                result = new HandleState(ex.Message);
            }
            return result;
        }
        private bool CheckExistClearance(CustomsDeclarationModel model, decimal id)
        {
            if (id == 0)
            {
                if (customDeclarationRepository.Any(x => x.ClearanceNo == model.ClearanceNo && x.ClearanceDate == model.ClearanceDate))
                {
                    return true;
                }
            }
            else
            {
                if (customDeclarationRepository.Any(x => (x.ClearanceNo == model.ClearanceNo && x.Id != id && x.ClearanceDate == model.ClearanceDate)))
                {
                    return true;
                }
            }
            return false;
        }

        public HandleState ConvertExistedClearancesToJobs(List<OpsTransactionClearanceModel> list)
        {
            var result = new HandleState();
            try
            {
                int i = 0;
                foreach (var item in list)
                {
                    var existedMessage = CheckExist(item.OpsTransaction);
                    if (existedMessage != null)
                    {
                        return new HandleState(existedMessage);
                    }
                    if (item.CustomsDeclaration.JobNo == null)
                    {
                        item.OpsTransaction.Id = Guid.NewGuid();
                        item.OpsTransaction.Hblid = Guid.NewGuid();
                        item.OpsTransaction.CreatedDate = DateTime.Now;
                        item.OpsTransaction.UserCreated = currentUser.UserID; //currentUser.UserID;
                        item.OpsTransaction.ModifiedDate = DateTime.Now;
                        item.OpsTransaction.UserModified = currentUser.UserID;
                        int countNumberJob = DataContext.Count(x => x.CreatedDate.Value.Month == DateTime.Now.Month && x.CreatedDate.Value.Year == DateTime.Now.Year);
                        item.OpsTransaction.JobNo = GenerateID.GenerateOPSJobID(Constants.OPS_SHIPMENT, (countNumberJob + i));
                        var dayStatus = (int)(item.OpsTransaction.ServiceDate.Value.Date - DateTime.Now.Date).TotalDays;
                        if (dayStatus > 0)
                        {
                            item.OpsTransaction.CurrentStatus = TermData.InSchedule;
                        }
                        else
                        {
                            item.OpsTransaction.CurrentStatus = TermData.Processing;
                        }
                        string productService = SetProductServiveShipment(item);
                        if (productService == null)
                        {
                            result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCENO_CARGOTYPE_NOT_ALLOW_EMPTY].Value);
                            return result;
                        }
                        item.OpsTransaction.ProductService = productService;
                        var transaction = mapper.Map<OpsTransaction>(item.OpsTransaction);
                        DataContext.Add(transaction, false);
                        item.CustomsDeclaration.JobNo = item.OpsTransaction.JobNo;
                        item.CustomsDeclaration.UserModified = currentUser.UserID;
                        item.CustomsDeclaration.DatetimeModified = DateTime.Now;
                        item.CustomsDeclaration.ConvertTime = DateTime.Now;
                        var clearance = mapper.Map<CustomsDeclaration>(item.CustomsDeclaration);
                        customDeclarationRepository.Update(clearance, x => x.Id == clearance.Id);
                        i = i + 1;
                    }
                }
                DataContext.SubmitChanges();
                customDeclarationRepository.SubmitChanges();
            }
            catch (Exception ex)
            {
                result = new HandleState(ex.Message);
            }
            return result;
        }

        public HandleState SoftDeleteJob(Guid id)
        {
            var result = new HandleState();
            var job = DataContext.First(x => x.Id == id && x.CurrentStatus != TermData.Canceled);
            if(job == null)
            {
                result = new HandleState(stringLocalizer[LanguageSub.MSG_DATA_NOT_FOUND]);
            }
            else
            {
                job.CurrentStatus = TermData.Canceled;
                result = DataContext.Update(job, x => x.Id == id, false);
                if (result.Success)
                {
                    var clearances = customDeclarationRepository.Get(x => x.JobNo == job.JobNo);
                    if (clearances != null)
                    {
                        foreach(var item in clearances)
                        {
                            item.JobNo = null;
                            customDeclarationRepository.Update(item, x => x.Id == item.Id, false);
                        }
                    }
                }
            }
            DataContext.SubmitChanges();
            customDeclarationRepository.SubmitChanges();
            return result;
        }
        public string CheckExist(OpsTransactionModel model)
        {
            var existedHBL = DataContext.Any(x => x.Id != model.Id && x.Hwbno == model.Hwbno && x.CurrentStatus != TermData.Canceled);
            var existedMBL = DataContext.Any(x => x.Id != model.Id && x.Mblno == model.Mblno && x.CurrentStatus != TermData.Canceled);
            if (existedHBL)
            {
                return stringLocalizer[LanguageSub.MSG_HBNO_EXISTED, model.Hwbno].Value;
            }
            if (existedMBL)
            {
                return stringLocalizer[LanguageSub.MSG_MAWB_EXISTED, model.Mblno].Value;
            }
            return null;
        }

        public Crystal PreviewFormPLsheet(Guid id, string currency)
        {
            var shipment = DataContext.First(x => x.Id == id);
            Crystal result = null;
            var parameter = new FormPLsheetReportParameter
            {
                Contact = currentUser.UserName,
                CompanyName = "CompanyName",
                CompanyDescription = "CompanyDescription",
                CompanyAddress1 = "CompanyAddress1",
                CompanyAddress2 = "CompanyAddress2",
                Website = "Website",
                CurrDecimalNo = 2,
                DecimalNo = 2,
                HBLList = shipment.Hwbno
            };

            result = new Crystal
            {
                ReportName = "FormPLsheet.rpt",
                AllowPrint = true,
                AllowExport = true
            };
            var dataSources = new List<FormPLsheetReport>{};
            var agent = partnerRepository.Get(x => x.Id == shipment.AgentId).FirstOrDefault();
            var supplier = partnerRepository.Get(x => x.Id == shipment.SupplierId).FirstOrDefault();
            var surcharges = surchargeService.GetByHB(shipment.Hblid);
            var user = userRepository.Get(x => x.Id == shipment.SalemanId).FirstOrDefault();
            var units = unitRepository.Get();
            var polName = placeRepository.Get(x => x.Id == shipment.Pol).FirstOrDefault()?.NameEn;
            var podName = placeRepository.Get(x => x.Id == shipment.Pod).FirstOrDefault()?.NameEn;
            if(surcharges != null)
            {
                foreach(var item in surcharges)
                {
                    var unitCode = units.FirstOrDefault(x => x.Id == item.UnitId)?.Code;
                    bool isOBH = false;
                    decimal cost = 0;
                    decimal revenue = 0;
                    decimal saleProfit = 0;
                    string partnerName = string.Empty;
                    if (item.Type == "OBH")
                    {
                        isOBH = true;
                        partnerName = item.PayerName;
                    }
                    if(item.Type == "BUY")
                    {
                        cost = item.Total;
                    }
                    if(item.Type == "SELL")
                    {
                        revenue = item.Total;
                    }
                    saleProfit = cost + revenue;

                    var surchargeRpt = new FormPLsheetReport
                    {
                        COSTING = "COSTING Test",
                        TransID = shipment.JobNo,
                        TransDate = (DateTime)shipment.CreatedDate,
                        HWBNO = shipment.Hwbno,
                        MAWB = shipment.Mblno,
                        PartnerName = "PartnerName",
                        ContactName = user?.Username,
                        ShipmentType = "Logistics",
                        NominationParty = string.Empty,
                        Nominated = true,
                        POL = polName,
                        POD = podName,
                        Commodity = string.Empty,
                        Volumne = string.Empty,
                        Carrier = supplier?.PartnerNameEn,
                        Agent = agent?.PartnerNameEn,
                        ContainerNo = item.ContNo,
                        OceanVessel = string.Empty,
                        LocalVessel = string.Empty,
                        FlightNo = shipment.FlightVessel,
                        SeaImpVoy = string.Empty,
                        LoadingDate = ((DateTime)shipment.ServiceDate).ToString("dd' 'MMM' 'yyyy"),
                        ArrivalDate = shipment.FinishDate!= null?((DateTime)shipment.FinishDate).ToString("dd' 'MM' 'yyyy"): null,
                        FreightCustomer = "FreightCustomer",
                        FreightColoader = 128,
                        PayableAccount = item.PartnerName,
                        Description = item.ChargeNameEn,
                        Curr = item.CurrencyId,
                        VAT = (decimal)item.Vatrate,
                        VATAmount = 12,
                        Cost = cost,
                        Revenue = revenue,
                        Exchange = 13,
                        VNDExchange = 12,
                        Paid = true,
                        DatePaid = DateTime.Now,
                        Docs = item.InvoiceNo,
                        Notes = item.Notes,
                        InputData = "InputData",
                        SalesProfit = saleProfit,
                        Quantity = item.Quantity,
                        UnitPrice = (decimal)item.UnitPrice,
                        Unit = unitCode,
                        LastRevised = string.Empty,
                        OBH = isOBH,
                        ExtRateVND = 34,
                        KBck = true,
                        NoInv = true,
                        Approvedby = string.Empty,
                        ApproveDate = DateTime.Now,
                        SalesCurr = currency,
                        GW = shipment.SumGrossWeight ?? 0,
                        MCW = 13,
                        HCW = shipment.SumChargeWeight ?? 0,
                        PaymentTerm = string.Empty,
                        DetailNotes = string.Empty,
                        ExpressNotes = string.Empty,
                        InvoiceNo = "InvoiceNo",
                        CodeVender = "CodeVender",
                        CodeCus = "CodeCus",
                        Freight = true,
                        Collect = true,
                        FreightPayableAt = "FreightPayableAt",
                        PaymentTime = 1,
                        PaymentTimeCus = 1,
                        Noofpieces = 12,
                        UnitPieaces = "UnitPieaces",
                        TpyeofService = "TpyeofService",
                        ShipmentSource = "FREE-HAND",
                        RealCost = true
                    };
                    dataSources.Add(surchargeRpt);
                }
            }
            result.AddDataSource(dataSources);
            result.FormatType = ExportFormatType.PortableDocFormat;
            result.SetParameter(parameter);

            return result;
        }
    }
}
