﻿using AutoMapper;
using eFMS.API.Common;
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
using System.Diagnostics.Contracts;

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
        private readonly IContextBase<AcctCdnote> acctCdNoteRepository;
        private readonly IContextBase<CsMawbcontainer> csMawbcontainerRepository;
        private readonly IContextBase<SysAuthorization> authorizationRepository;
        private readonly ICsMawbcontainerService mawbcontainerService;


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
            IContextBase<CustomsDeclaration> customDeclarationRepo,
            IContextBase<AcctCdnote> acctCdNoteRepo,
            IContextBase<CsMawbcontainer> csMawbcontainerRepo,
            ICsMawbcontainerService containerService, 
            IContextBase<SysAuthorization> authorizationRepo) : base(repository, mapper)
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
            acctCdNoteRepository = acctCdNoteRepo;
            csMawbcontainerRepository = csMawbcontainerRepo;
            mawbcontainerService = containerService;
            authorizationRepository = authorizationRepo;
        }
        public override HandleState Add(OpsTransactionModel model)
        {
            model.Id = Guid.NewGuid();
            model.DatetimeCreated = DateTime.Now;
            model.UserCreated = currentUser.UserID;
            model.DatetimeModified = model.DatetimeCreated;
            model.UserModified = model.UserCreated;
            model.CurrentStatus = "InSchedule";
            model.GroupId = currentUser.GroupId;
            model.DepartmentId = currentUser.DepartmentId;
            model.OfficeId = currentUser.OfficeID;
            model.CompanyId = currentUser.CompanyID;
            var dayStatus = (int)(model.ServiceDate.Value.Date - DateTime.Now.Date).TotalDays;
            if(dayStatus > 0)
            {
                model.CurrentStatus = TermData.InSchedule;
            }
            else
            {
                model.CurrentStatus = TermData.Processing;
            }
            int countNumberJob = DataContext.Count(x => x.DatetimeCreated.Value.Month == DateTime.Now.Month && x.DatetimeCreated.Value.Year == DateTime.Now.Year);
            model.JobNo = GenerateID.GenerateOPSJobID(DocumentConstants.OPS_SHIPMENT, countNumberJob);
            var entity = mapper.Map<OpsTransaction>(model);
            return DataContext.Add(entity);
        }
        public HandleState Delete(Guid id)
        {
            var detail = DataContext.First(x => x.Id == id);
            var result = Delete(x => x.Id == id, false);
            if (result.Success)
            {
                var assigneds = opsStageAssignedRepository.Get(x => x.JobId == id);
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

        public int CheckDetailPermission(Guid id)
        {
            var detail = GetBy(id);
            var permissionRange = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Delete);
            int code = GetPermissionToUpdate(new ModelUpdate { BillingOpsId = detail.BillingOpsId, UserCreated = detail.UserCreated, CompanyId = detail.CompanyId, OfficeId = detail.OfficeId, DepartmentId = detail.DepartmentId, GroupId = detail.GroupId }, permissionRange);
            return code;
        }
        private OpsTransactionModel GetBy(Guid id)
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
        OpsTransaction IOpsTransactionService.GetDetails(Guid id)
        {
            var detail = GetBy(id);
            if (detail == null) return null;
            List<string> authorizeUserIds = authorizationRepository.Get(x => x.AssignTo == currentUser.UserID
                                                                 && (x.Active == true)
                                                                 && (x.EndDate.Value >= DateTime.Now.Date || x.EndDate == null)
                                                                 && x.Services.Contains("CL")
                                                                 )?.Select(x => x.UserId).ToList();
            var permissionRangeWrite = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Write);
            var permissionRangeDelete = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Delete);
            detail.Permission = new PermissionAllowBase
            {
                AllowUpdate = GetPermissionDetail(permissionRangeWrite, authorizeUserIds, detail),
                AllowDelete = GetPermissionDetail(permissionRangeDelete, authorizeUserIds, detail)
            };
            var specialActions = currentUser.UserMenuPermission.SpecialActions;
            if (specialActions.Count > 0)
            {
                if(specialActions.Any(x => x.Action.Contains("Lock")))
                {
                    detail.Permission.AllowLock = true;
                }
                if (specialActions.Any(x => x.Action.Contains("Add Charge")))
                {
                    detail.Permission.AllowAddCharge = true;
                }
                if (specialActions.Any(x => x.Action.Contains("Update Charge")))
                {
                    detail.Permission.AllowUpdateCharge = true;
                }
            }
            return detail;
        }

        private bool GetPermissionDetail(PermissionRange permissionRangeWrite, List<string> authorizeUserIds, OpsTransactionModel detail)
        {
            bool result = false;
            switch (permissionRangeWrite)
            {
                case PermissionRange.All:
                    result = true;
                    break;
                case PermissionRange.Owner:
                    if (detail.BillingOpsId == currentUser.UserID || authorizeUserIds.Contains(detail.BillingOpsId))
                    {
                        result = true;
                    }
                    else
                    {
                        result = false;
                    }
                    break;
                case PermissionRange.Group:
                    if ((detail.GroupId == currentUser.GroupId && detail.DepartmentId == currentUser.DepartmentId && detail.OfficeId == currentUser.OfficeID && detail.CompanyId == currentUser.CompanyID)
                        || authorizeUserIds.Contains(detail.BillingOpsId))
                    {
                        result = true;
                    }
                    else
                    {
                        result = false;
                    }
                    break;
                case PermissionRange.Department:
                    if ((detail.DepartmentId == currentUser.DepartmentId && detail.OfficeId == currentUser.OfficeID && detail.CompanyId == currentUser.CompanyID) || authorizeUserIds.Contains(detail.BillingOpsId))
                    {
                        result = true;
                    }
                    else
                    {
                        result = false;
                    }
                    break;
                case PermissionRange.Office:
                    if ((detail.OfficeId == currentUser.OfficeID && detail.CompanyId == currentUser.CompanyID) || authorizeUserIds.Contains(detail.BillingOpsId))
                    {
                        result = true;
                    }
                    else
                    {
                        result = false;
                    }
                    break;
                case PermissionRange.Company:
                    if (detail.CompanyId == currentUser.CompanyID || authorizeUserIds.Contains(detail.BillingOpsId))
                    {
                        result = true;
                    }
                    else
                    {
                        result = false;
                    }
                    break;
            }
            return result;
        }

        public OpsTransactionResult Paging(OpsTransactionCriteria criteria, int page, int size, out int rowsCount)
        {
            criteria.RangeSearch = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.List);
            var data = Query(criteria);
            rowsCount = data.Select(x => x.Id).Count();
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
                data = data.OrderByDescending(x => x.DatetimeModified);
                if (page < 1)
                {
                    page = 1;
                }
                data = data.Skip((page - 1) * size).Take(size);
                var customers = partnerRepository.Get(x => x.PartnerGroup.Contains("CUSTOMER"));
                var ports = placeRepository.Get(x => x.PlaceTypeId == "Port");
                data.ToList().ForEach(x => {
                    x.CustomerName = customers.FirstOrDefault(cus => cus.Id == x.CustomerId)?.ShortName;
                    x.POLName = ports.FirstOrDefault(pol => pol.Id == x.Pol)?.NameEn;
                    x.PODName = ports.FirstOrDefault(pod => pod.Id == x.Pod)?.NameEn;
                });
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
            var detail = DataContext.Get(x => x.Id == jobId && x.CurrentStatus != TermData.Canceled)?.FirstOrDefault();
            if (detail == null) return false;
            else
            {
                var permissionRange = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Delete);
                int code = GetPermissionToUpdate(new ModelUpdate { BillingOpsId = detail.BillingOpsId, UserCreated = detail.UserCreated, CompanyId = detail.CompanyId, OfficeId = detail.OfficeId, DepartmentId = detail.DepartmentId, GroupId = detail.GroupId }, permissionRange);
                if (code == 403) return false;
            }
            var query = surchargeRepository.Get(x => x.Hblid == detail.Id && (x.CreditNo != null || x.DebitNo != null || x.Soano != null || x.PaymentRefNo != null));
            if (query.Any())
            {
                return false;
            }
            return true;
        }
        private IQueryable<OpsTransaction> QueryByPermission(PermissionRange range)
        {
            IQueryable<OpsTransaction> data = null;
            List<string> authorizeUserIds = authorizationRepository.Get(x => x.AssignTo == currentUser.UserID
                                                                 && (x.EndDate.Value >= DateTime.Now.Date || x.EndDate == null)
                                                                 && x.Services.Contains("CL")
                                                                 )?.Select(x => x.UserId).ToList();
            switch (range)
            {
                case PermissionRange.All:
                    data = DataContext.Get(x => x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null);
                    break;
                case PermissionRange.Owner:
                    data = DataContext.Get(x => (x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null)
                                                && (x.BillingOpsId == currentUser.UserID || x.SalemanId == currentUser.UserID
                                                 || authorizeUserIds.Contains(x.BillingOpsId) || authorizeUserIds.Contains(x.SalemanId)
                                                 || authorizeUserIds.Contains(x.UserCreated)
                                                 || x.UserCreated == currentUser.UserID));
                    break;
                case PermissionRange.Group:
                    data = DataContext.Get(x => (x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null)
                                                && ((x.GroupId == currentUser.GroupId && x.DepartmentId == currentUser.DepartmentId && x.OfficeId == currentUser.OfficeID && x.CompanyId == currentUser.CompanyID)
                                                || authorizeUserIds.Contains(x.BillingOpsId)
                                                || authorizeUserIds.Contains(x.SalemanId)
                                                || authorizeUserIds.Contains(x.UserCreated)
                                                || x.UserCreated == currentUser.UserID));
                    break;
                case PermissionRange.Department:
                    data = DataContext.Get(x => (x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null)
                                                && ((x.DepartmentId == currentUser.DepartmentId && x.OfficeId == currentUser.OfficeID && x.CompanyId == currentUser.CompanyID)
                                                || authorizeUserIds.Contains(x.BillingOpsId)
                                                || authorizeUserIds.Contains(x.SalemanId) || authorizeUserIds.Contains(x.UserCreated)
                                                || x.UserCreated == currentUser.UserID));
                    break;
                case PermissionRange.Office:
                    data = DataContext.Get(x => (x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null)
                                                && ((x.OfficeId == currentUser.OfficeID && x.CompanyId == currentUser.CompanyID)
                                                || authorizeUserIds.Contains(x.BillingOpsId)
                                                || authorizeUserIds.Contains(x.SalemanId) || authorizeUserIds.Contains(x.UserCreated)
                                                || x.UserCreated == currentUser.UserID));
                    break;
                case PermissionRange.Company:
                    data = DataContext.Get(x => (x.CurrentStatus != TermData.Canceled || x.CurrentStatus == null)
                                                && (x.CompanyId == currentUser.CompanyID || authorizeUserIds.Contains(x.BillingOpsId)
                                                || authorizeUserIds.Contains(x.SalemanId) || authorizeUserIds.Contains(x.UserCreated)
                                                || x.UserCreated == currentUser.UserID));
                    break;
            }
            return data;
        }
        public IQueryable<OpsTransactionModel> Query(OpsTransactionCriteria criteria)
        {
            var data = QueryByPermission(criteria.RangeSearch);
            if (data == null)
                return null;
            List<OpsTransactionModel> results = new List<OpsTransactionModel>();
            IQueryable<OpsTransaction> datajoin = data;
            if (criteria.ClearanceNo != null)
            {
                var listCustomsDeclaration = customDeclarationRepository.Get(x => x.ClearanceNo.ToLower().Contains(criteria.ClearanceNo.ToLower()));
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
                var listDebit = acctCdNoteRepository.Get(x => x.Code.ToLower().Contains(criteria.CreditDebitInvoice.ToLower()));
                if(listDebit.Count() > 0)
                {
                    datajoin = from acctnote in listDebit
                               join datas in data on acctnote.JobId equals datas.Id
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
                                && (x.Hwbno ?? "").IndexOf(criteria.Hwbno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.Mblno ?? "").IndexOf(criteria.Mblno ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.ProductService ?? "").IndexOf(criteria.ProductService ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.ServiceMode ?? "").IndexOf(criteria.ServiceMode ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.CustomerId == criteria.CustomerId || string.IsNullOrEmpty(criteria.CustomerId))
                                && (x.FieldOpsId == criteria.FieldOps || string.IsNullOrEmpty(criteria.FieldOps))
                                && (x.ShipmentMode == criteria.ShipmentMode || string.IsNullOrEmpty(criteria.ShipmentMode))
                                && ((x.ServiceDate ?? null) >= criteria.ServiceDateFrom || criteria.ServiceDateFrom == null)
                                && ((x.ServiceDate ?? null) <= criteria.ServiceDateTo || criteria.ServiceDateTo == null)
                            ).OrderByDescending(x => x.DatetimeModified);
            }
            else
            {
                datajoin = datajoin.Where(x => (x.JobNo ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.Hwbno ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.Mblno ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.ProductService ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.ServiceMode ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                   || (x.CustomerId == criteria.All || string.IsNullOrEmpty(criteria.All))
                                   || (x.FieldOpsId == criteria.All || string.IsNullOrEmpty(criteria.All))
                                   || (x.ShipmentMode == criteria.All || string.IsNullOrEmpty(criteria.All))
                               && ((x.ServiceDate ?? null) >= (criteria.ServiceDateFrom ?? null) && (x.ServiceDate ?? null) <= (criteria.ServiceDateTo ?? null))
                               ).OrderByDescending(x => x.DatetimeModified);
            }
            results = mapper.Map<List<OpsTransactionModel>>(datajoin);
            return results.AsQueryable();
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

        private string SetProductServiceShipment(OpsTransactionClearanceModel model)
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
                string productService = SetProductServiceShipment(model);
                if (model.CustomsDeclaration.CargoType == null && model.CustomsDeclaration.ServiceType == "Sea")
                {
                    result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCE_CARGOTYPE_NOT_ALLOW_EMPTY].Value);
                    return result;
                }
                if (productService == null)
                {
                    result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCE_CARGOTYPE_MUST_HAVE_SERVICE_TYPE].Value);
                    return result;
                }
                if (model.CustomsDeclaration.JobNo == null)
                {
                    model.OpsTransaction.Id = Guid.NewGuid();
                    model.OpsTransaction.Hblid = Guid.NewGuid();
                    model.OpsTransaction.DatetimeCreated = DateTime.Now;
                    model.OpsTransaction.UserCreated = currentUser.UserID; //currentUser.UserID;
                    model.OpsTransaction.DatetimeModified = DateTime.Now;
                    model.OpsTransaction.UserModified = currentUser.UserID;
                    model.OpsTransaction.ProductService = productService;
                    int countNumberJob = DataContext.Count(x => x.DatetimeCreated.Value.Month == DateTime.Now.Month && x.DatetimeCreated.Value.Year == DateTime.Now.Year);
                    model.OpsTransaction.JobNo = GenerateID.GenerateOPSJobID(DocumentConstants.OPS_SHIPMENT, countNumberJob);
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
                    clearance.Source = DocumentConstants.CLEARANCE_FROM_EFMS;
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
                        item.OpsTransaction.DatetimeCreated = DateTime.Now;
                        item.OpsTransaction.UserCreated = currentUser.UserID; //currentUser.UserID;
                        item.OpsTransaction.DatetimeModified = DateTime.Now;
                        item.OpsTransaction.UserModified = currentUser.UserID;
                        int countNumberJob = DataContext.Count(x => x.DatetimeCreated.Value.Month == DateTime.Now.Month && x.DatetimeCreated.Value.Year == DateTime.Now.Year);
                        item.OpsTransaction.JobNo = GenerateID.GenerateOPSJobID(DocumentConstants.OPS_SHIPMENT, (countNumberJob + i));
                        var dayStatus = (int)(item.OpsTransaction.ServiceDate.Value.Date - DateTime.Now.Date).TotalDays;
                        if (dayStatus > 0)
                        {
                            item.OpsTransaction.CurrentStatus = TermData.InSchedule;
                        }
                        else
                        {
                            item.OpsTransaction.CurrentStatus = TermData.Processing;
                        }
                        string productService = SetProductServiceShipment(item);
                        if (item.CustomsDeclaration.CargoType == null && item.CustomsDeclaration.ServiceType == "Sea")
                        {
                            result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCE_CARGOTYPE_NOT_ALLOW_EMPTY].Value);
                            return result;
                        }
                        if (productService == null)
                        {
                            result = new HandleState(stringLocalizer[LanguageSub.MSG_CLEARANCE_CARGOTYPE_MUST_HAVE_SERVICE_TYPE].Value);
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
            if (job == null)
            {
                result = new HandleState(stringLocalizer[LanguageSub.MSG_DATA_NOT_FOUND]);
            }
            else
            {
                var permissionRange = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Delete);
                int code = GetPermissionToUpdate(new ModelUpdate { BillingOpsId = job.BillingOpsId, UserCreated = job.UserCreated, CompanyId = job.CompanyId, OfficeId = job.OfficeId, DepartmentId = job.DepartmentId, GroupId = job.GroupId }, permissionRange);
                if (code == 403) return new HandleState(403);
                job.CurrentStatus = TermData.Canceled;
                job.DatetimeModified = DateTime.Now;
                job.UserModified = currentUser.UserID;
                result = DataContext.Update(job, x => x.Id == id, false);
                if (result.Success)
                {
                    var clearances = customDeclarationRepository.Get(x => x.JobNo == job.JobNo);
                    if (clearances != null)
                    {
                        foreach(var item in clearances)
                        {
                            item.JobNo = null;
                            item.ConvertTime = null;
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
                    if (item.Type == DocumentConstants.CHARGE_OBH_TYPE)
                    {
                        isOBH = true;
                        partnerName = item.PayerName;
                    }
                    if(item.Type == DocumentConstants.CHARGE_BUY_TYPE)
                    {
                        cost = item.Total;
                    }
                    if(item.Type == DocumentConstants.CHARGE_SELL_TYPE)
                    {
                        revenue = item.Total;
                    }
                    saleProfit = cost + revenue;

                    var surchargeRpt = new FormPLsheetReport
                    {
                        COSTING = "COSTING Test",
                        TransID = shipment.JobNo?.ToUpper(),
                        TransDate = (DateTime)shipment.DatetimeCreated,
                        HWBNO = shipment.Hwbno?.ToUpper(),
                        MAWB = shipment.Mblno?.ToUpper(),
                        PartnerName = "PartnerName",
                        ContactName = user?.Username,
                        ShipmentType = "Logistics",
                        NominationParty = string.Empty,
                        Nominated = true,
                        POL = polName?.ToUpper(),
                        POD = podName?.ToUpper(),
                        Commodity = string.Empty,
                        Volumne = string.Empty,
                        Carrier = supplier?.PartnerNameEn?.ToUpper(),
                        Agent = agent?.PartnerNameEn?.ToUpper(),
                        ContainerNo = item.ContNo,
                        OceanVessel = string.Empty,
                        LocalVessel = string.Empty,
                        FlightNo = shipment.FlightVessel?.ToUpper(),
                        SeaImpVoy = string.Empty,
                        LoadingDate = ((DateTime)shipment.ServiceDate).ToString("dd' 'MMM' 'yyyy"),
                        ArrivalDate = shipment.FinishDate!= null?((DateTime)shipment.FinishDate).ToString("dd' 'MM' 'yyyy"): null,
                        FreightCustomer = "FreightCustomer",
                        FreightColoader = 128,
                        PayableAccount = item.PartnerName?.ToUpper(),
                        Description = item.ChargeNameEn,
                        Curr = item.CurrencyId,
                        VAT = item.Vatrate ?? 0,
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
                        UnitPrice = item.UnitPrice ?? 0,
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
        public HandleState Update(OpsTransactionModel model)
        {
            var permissionRange = PermissionEx.GetPermissionRange(currentUser.UserMenuPermission.Write);
            int code = GetPermissionToUpdate(new ModelUpdate { BillingOpsId = model.BillingOpsId, UserCreated = model.UserCreated, CompanyId = model.CompanyId,  OfficeId = model.OfficeId, DepartmentId = model.DepartmentId, GroupId = model.GroupId }, permissionRange);
            if (code == 403) return new HandleState(403);
            var hs = Update(model, x => x.Id == model.Id);
            if (hs.Success)
            {
                if (model.CsMawbcontainers != null && model.CsMawbcontainers.Count > 0)
                {
                    var hsContainer = mawbcontainerService.UpdateMasterBill(model.CsMawbcontainers, model.Id);
                }
            }
            return hs;
        }
        private int GetPermissionToUpdate(ModelUpdate model, PermissionRange permissionRange)
        {
            List<string> authorizeUserIds = authorizationRepository.Get(x => x.AssignTo == currentUser.UserID
                                                                 && x.EndDate.Value >= DateTime.Now.Date
                                                                 && x.Services.Contains("CL")
                                                                 )?.Select(x => x.UserId).ToList();
            int code = PermissionEx.GetPermissionToUpdate(model, permissionRange, currentUser, authorizeUserIds);
            return code;
        }
    }
}
