﻿using AutoMapper;
using eFMS.API.Accounting.DL.Common;
using eFMS.API.Accounting.DL.IService;
using eFMS.API.Accounting.DL.Models;
using eFMS.API.Accounting.DL.Models.Criteria;
using eFMS.API.Accounting.Service.Models;
using eFMS.API.Common.Globals;
using eFMS.API.Common.Models;
using eFMS.API.Infrastructure.Extensions;
using eFMS.IdentityServer.DL.UserManager;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace eFMS.API.Accounting.DL.Services
{
    public class AcctSOAService : RepositoryBase<AcctSoa, AcctSoaModel>, IAcctSOAService
    {
        private readonly ICurrentUser currentUser;
        readonly IContextBase<CsShipmentSurcharge> csShipmentSurchargeRepo;
        readonly IContextBase<CatCurrencyExchange> catCurrencyExchangeRepo;
        readonly IContextBase<OpsTransaction> opsTransactionRepo;
        readonly IContextBase<CsTransaction> csTransactionRepo;
        readonly IContextBase<CsTransactionDetail> csTransactionDetailRepo;
        readonly IContextBase<CatCharge> catChargeRepo;
        readonly IContextBase<CatUnit> catUnitRepo;
        readonly IContextBase<CustomsDeclaration> customsDeclarationRepo;
        readonly IContextBase<AcctCdnote> acctCdnoteRepo;
        readonly IContextBase<CatPartner> catPartnerRepo;
        readonly IContextBase<SysUser> sysUserRepo;
        readonly IContextBase<CatChargeDefaultAccount> chargeDefaultRepo;


        public AcctSOAService(IContextBase<AcctSoa> repository,
            IMapper mapper,
            ICurrentUser user,
            IContextBase<CsShipmentSurcharge> csShipmentSurcharge,
            IContextBase<CatCurrencyExchange> catCurrencyExchange,
            IContextBase<OpsTransaction> opsTransaction,
            IContextBase<CsTransaction> csTransaction,
            IContextBase<CsTransactionDetail> csTransactionDetail,
            IContextBase<CatCharge> catCharge,
            IContextBase<CatUnit> catUnit,
            IContextBase<CustomsDeclaration> customsDeclaration,
            IContextBase<AcctCdnote> acctCdnote,
            IContextBase<CatPartner> catPartner,
            IContextBase<SysUser> sysUser,
            IContextBase<CatChargeDefaultAccount> chargeDefault ) : base(repository, mapper)
        {
            currentUser = user;
            csShipmentSurchargeRepo = csShipmentSurcharge;
            catCurrencyExchangeRepo = catCurrencyExchange;
            opsTransactionRepo = opsTransaction;
            csTransactionRepo = csTransaction;
            csTransactionDetailRepo = csTransactionDetail;
            catChargeRepo = catCharge;
            catUnitRepo = catUnit;
            customsDeclarationRepo = customsDeclaration;
            acctCdnoteRepo = acctCdnote;
            catPartnerRepo = catPartner;
            sysUserRepo = sysUser;
            chargeDefaultRepo = chargeDefault;
        }

        #region -- Insert & Update SOA
        public HandleState AddSOA(AcctSoaModel model)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Write);
            if (permissionRange == PermissionRange.None) return new HandleState(403, "");

            try
            {
                var userCurrent = currentUser.UserID;

                model.Status = AccountingConstants.STATUS_SOA_NEW;
                model.DatetimeCreated = model.DatetimeModified = DateTime.Now;
                model.UserCreated = model.UserModified = userCurrent;
                model.Currency = model.Currency.Trim();
                model.GroupId = currentUser.GroupId;
                model.DepartmentId = currentUser.DepartmentId;
                model.OfficeId = currentUser.OfficeID;
                model.CompanyId = currentUser.CompanyID;

                using (var trans = DataContext.DC.Database.BeginTransaction())
                {
                    try
                    {
                        //Tính phí AmountDebit, AmountCredit của SOA (tỉ giá được exchange dựa vào ngày Modified của SOA, nếu tìm ko thấy sẽ lấy ngày mới nhất)
                        var amountDebitCreditShipment = GetDebitCreditAmountAndTotalShipment(model);
                        model.TotalShipment = amountDebitCreditShipment.TotalShipment;
                        model.DebitAmount = amountDebitCreditShipment.DebitAmount;
                        model.CreditAmount = amountDebitCreditShipment.CreditAmount;

                        var soa = mapper.Map<AcctSoa>(model);
                        soa.Soano = model.Soano = CreateSoaNo();

                        var hs = DataContext.Add(soa);

                        if (hs.Success)
                        {
                            //Lấy ra những charge có type là BUY hoặc OBH-BUY mà chưa tồn tại trong 1 SOA nào cả
                            var surchargeCredit = csShipmentSurchargeRepo.Get(x => model.Surcharges != null
                                                                           && model.Surcharges.Any(c => c.surchargeId == x.Id && (c.type == AccountingConstants.TYPE_CHARGE_BUY || c.type == AccountingConstants.TYPE_CHARGE_OBH_BUY))
                                                                           && (x.Soano == null || x.Soano == string.Empty)).ToList();

                            //Lấy ra những charge có type là SELL hoặc OBH-SELL mà chưa tồn tại trong 1 SOA nào cả
                            var surchargeDebit = csShipmentSurchargeRepo.Get(x => model.Surcharges != null
                                                                           && model.Surcharges.Any(c => c.surchargeId == x.Id && (c.type == AccountingConstants.TYPE_CHARGE_SELL || c.type == AccountingConstants.TYPE_CHARGE_OBH_SELL))
                                                                           && (x.Soano == null || x.Soano == string.Empty)).ToList();

                            if (surchargeCredit.Count() > 0)
                            {
                                //Update PaySOANo cho CsShipmentSurcharge có type BUY hoặc OBH-BUY(Payer)
                                //Change request: Cập nhật lại ngày ExchangeDate (23/09/2019)
                                //surchargeCredit.ForEach(a =>
                                //    {
                                //        a.PaySoano = soa.Soano;
                                //        a.UserModified = userCurrent;
                                //        a.DatetimeModified = a.ExchangeDate = DateTime.Now;
                                //    }
                                //);
                                //dc.CsShipmentSurcharge.UpdateRange(surchargeCredit);
                                foreach (var item in surchargeCredit)
                                {
                                    item.PaySoano = soa.Soano;
                                    item.UserModified = userCurrent;
                                    item.DatetimeModified = item.ExchangeDate = DateTime.Now;
                                    var hsUpdateSurchargeCredit = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                                }
                            }

                            if (surchargeDebit.Count() > 0)
                            {
                                //Update SOANo cho CsShipmentSurcharge có type là SELL hoặc OBH-SELL(Receiver)
                                //Change request: Cập nhật lại ngày ExchangeDate (23/09/2019)
                                //surchargeDebit.ForEach(a =>
                                //    {
                                //        a.Soano = soa.Soano;
                                //        a.UserModified = userCurrent;
                                //        a.DatetimeModified = a.ExchangeDate = DateTime.Now;
                                //    }
                                //);
                                //dc.CsShipmentSurcharge.UpdateRange(surchargeDebit);
                                foreach (var item in surchargeDebit)
                                {
                                    item.Soano = soa.Soano;
                                    item.UserModified = userCurrent;
                                    item.DatetimeModified = item.ExchangeDate = DateTime.Now;
                                    var hsUpdateSurChargeDebit = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                                }
                            }
                        }
                        //dc.SaveChanges();
                        trans.Commit();
                        return hs;

                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        return new HandleState(ex.Message);
                    }
                    finally
                    {
                        trans.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                var hs = new HandleState(ex.Message);
                return hs;
            }
        }

        public HandleState UpdateSOA(AcctSoaModel model)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Write);
            if (permissionRange == PermissionRange.None) return new HandleState(403, "");

            try
            {
                var userCurrent = currentUser.UserID;
                using (var trans = DataContext.DC.Database.BeginTransaction())
                {
                    try
                    {
                        //Gỡ bỏ các charge có SOANo = model.Soano và PaySOANo = model.Soano
                        var surcharge = csShipmentSurchargeRepo.Get(x => x.Soano == model.Soano || x.PaySoano == model.Soano).ToList();
                        foreach (var item in surcharge)
                        {
                            //Update SOANo = NULL & PaySOANo = NULL to CsShipmentSurcharge
                            item.Soano = null;
                            item.PaySoano = null;
                            item.UserModified = currentUser.UserID;
                            item.DatetimeModified = DateTime.Now;
                            var hsUpdateSurchargeSOANoEqualNull = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                        }

                        model.DatetimeModified = DateTime.Now;
                        model.UserModified = userCurrent;
                        model.Currency = model.Currency.Trim();

                        //Tính phí AmountDebit, AmountCredit của SOA (tỉ giá được exchange dựa vào ngày Modified của SOA, nếu tìm ko thấy sẽ lấy ngày mới nhất)
                        var amountDebitCreditShipment = GetDebitCreditAmountAndTotalShipment(model);
                        model.TotalShipment = amountDebitCreditShipment.TotalShipment;
                        model.DebitAmount = amountDebitCreditShipment.DebitAmount;
                        model.CreditAmount = amountDebitCreditShipment.CreditAmount;

                        var soa = mapper.Map<AcctSoa>(model);
                        var soaCurrent = DataContext.Get(x => x.Id == soa.Id).FirstOrDefault();
                        soa.GroupId = soaCurrent.GroupId;
                        soa.DepartmentId = soaCurrent.DepartmentId;
                        soa.OfficeId = soaCurrent.OfficeId;
                        soa.CompanyId = soaCurrent.CompanyId;

                        //Update các thông tin của SOA
                        var hs = DataContext.Update(soa, x => x.Id == soa.Id);

                        if (hs.Success)
                        {
                            //Lấy ra những charge có type là BUY hoặc OBH-BUY mà chưa tồn tại trong 1 SOA nào cả
                            var surchargeCredit = csShipmentSurchargeRepo.Get(x => model.Surcharges != null
                                                                           && model.Surcharges.Any(c => c.surchargeId == x.Id && (c.type == AccountingConstants.TYPE_CHARGE_BUY || c.type == AccountingConstants.TYPE_CHARGE_OBH_BUY))
                                                                           && (x.Soano == null || x.Soano == string.Empty)).ToList();

                            //Lấy ra những charge có type là SELL hoặc OBH-SELL mà chưa tồn tại trong 1 SOA nào cả
                            var surchargeDebit = csShipmentSurchargeRepo.Get(x => model.Surcharges != null
                                                                           && model.Surcharges.Any(c => c.surchargeId == x.Id && (c.type == AccountingConstants.TYPE_CHARGE_SELL || c.type == AccountingConstants.TYPE_CHARGE_OBH_SELL))
                                                                           && (x.Soano == null || x.Soano == string.Empty)).ToList();

                            if (surchargeCredit.Count() > 0)
                            {
                                //Update PaySOANo cho CsShipmentSurcharge có type BUY hoặc OBH-BUY(Payer)
                                //Change request: Cập nhật lại ngày ExchangeDate (23/09/2019)
                                //surchargeCredit.ForEach(a =>
                                //{
                                //    a.PaySoano = soa.Soano;
                                //    a.UserModified = userCurrent;
                                //    a.DatetimeModified = a.ExchangeDate = DateTime.Now;
                                //}
                                //);
                                //dc.CsShipmentSurcharge.UpdateRange(surchargeCredit);
                                foreach (var item in surchargeCredit)
                                {
                                    item.PaySoano = soa.Soano;
                                    item.UserModified = userCurrent;
                                    item.DatetimeModified = item.ExchangeDate = DateTime.Now;
                                    var hsUpdateSurchargeCredit = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                                }
                            }

                            if (surchargeDebit.Count() > 0)
                            {
                                //Update SOANo cho CsShipmentSurcharge có type là SELL hoặc OBH-SELL(Receiver)
                                //Change request: Cập nhật lại ngày ExchangeDate (23/09/2019)
                                //surchargeDebit.ForEach(a =>
                                //{
                                //    a.Soano = soa.Soano;
                                //    a.UserModified = userCurrent;
                                //    a.DatetimeModified = a.ExchangeDate = DateTime.Now;
                                //}
                                //);
                                //dc.CsShipmentSurcharge.UpdateRange(surchargeDebit);
                                foreach (var item in surchargeDebit)
                                {
                                    item.Soano = soa.Soano;
                                    item.UserModified = userCurrent;
                                    item.DatetimeModified = item.ExchangeDate = DateTime.Now;
                                    var hsUpdateSurchargeDebit = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                                }
                            }
                        }
                        trans.Commit();
                        return hs;
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        return new HandleState(ex.Message);
                    }
                    finally
                    {
                        trans.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                var hs = new HandleState(ex.Message);
                return hs;
            }
        }

        public bool CheckUpdatePermission(string soaNo)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Write);
            if (permissionRange == PermissionRange.None)
                return false;

            var detail = DataContext.Get(x => x.Soano == soaNo)?.FirstOrDefault();
            if (detail == null) return false;

            BaseUpdateModel baseModel = new BaseUpdateModel
            {
                UserCreated = detail.UserCreated,
                CompanyId = detail.CompanyId,
                DepartmentId = detail.DepartmentId,
                OfficeId = detail.OfficeId,
                GroupId = detail.GroupId
            };
            int code = PermissionExtention.GetPermissionCommonItem(baseModel, permissionRange, _user);

            if (code == 403) return false;

            return true;
        }

        public bool CheckDeletePermission(string soaNo)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Delete);
            if (permissionRange == PermissionRange.None)
                return false;

            var detail = DataContext.Get(x => x.Soano == soaNo)?.FirstOrDefault();
            if (detail == null) return false;

            BaseUpdateModel baseModel = new BaseUpdateModel
            {
                UserCreated = detail.UserCreated,
                CompanyId = detail.CompanyId,
                DepartmentId = detail.DepartmentId,
                OfficeId = detail.OfficeId,
                GroupId = detail.GroupId
            };
            int code = PermissionExtention.GetPermissionCommonItem(baseModel, permissionRange, _user);

            if (code == 403) return false;

            return true;
        }

        public HandleState DeleteSOA(string soaNo)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Delete);
            if (permissionRange == PermissionRange.None) return new HandleState(403, "");

            var hs = DataContext.Delete(x => x.Soano == soaNo);
            return hs;
        }

        public HandleState UpdateSOASurCharge(string soaNo)
        {
            try
            {
                using (var trans = DataContext.DC.Database.BeginTransaction())
                {
                    try
                    {
                        var surcharge = csShipmentSurchargeRepo.Get(x => x.Soano == soaNo || x.PaySoano == soaNo).ToList();
                        if (surcharge.Count() > 0)
                        {
                            //Update SOANo = NULL & PaySOANo = NULL to CsShipmentSurcharge
                            foreach (var item in surcharge)
                            {
                                item.Soano = null;
                                item.PaySoano = null;
                                item.UserModified = currentUser.UserID;
                                item.DatetimeModified = DateTime.Now;
                                var hsUpdateSOANoSurcharge = csShipmentSurchargeRepo.Update(item, x => x.Id == item.Id);
                            }
                        }
                        trans.Commit();
                        return new HandleState();
                    }
                    catch (Exception ex)
                    {
                        trans.Rollback();
                        return new HandleState(ex.Message);
                    }
                    finally
                    {
                        trans.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                var hs = new HandleState(ex.Message);
                return hs;
            }
        }

        private AcctSoa GetDebitCreditAmountAndTotalShipment(AcctSoaModel model)
        {
            //Tính phí AmountDebit, AmountCredit của SOA (tỉ giá được exchange dựa vào ngày Modified của SOA, nếu tìm ko thấy sẽ lấy ngày mới nhất)
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();
            Expression<Func<ChargeSOAResult, bool>> query = x => model.Surcharges.Where(c => c.surchargeId == x.ID && c.type == x.Type).Any();
            var charge = GetChargeShipmentDocAndOperation(query);
            var today = DateTime.Now;
            var dataResult = charge.Select(chg => new
            {
                AmountDebit = (GetRateCurrencyExchange(today, chg.Currency, model.Currency) > 0
                            ?
                                GetRateCurrencyExchange(today, chg.Currency, model.Currency)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, model.Currency)) * (chg.Debit != null ? chg.Debit.Value : 0),
                AmountCredit = (GetRateCurrencyExchange(today, chg.Currency, model.Currency) > 0
                            ?
                                GetRateCurrencyExchange(today, chg.Currency, model.Currency)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, model.Currency)) * (chg.Credit != null ? chg.Credit.Value : 0),
            });
            //Count number shipment (HBL)
            var totalShipment = charge.Select(s => s.HBL).Distinct().Count();
            //Debit Amount
            var debitAmount = dataResult.Sum(s => s.AmountDebit);
            //Credit Amount
            var creditAmount = dataResult.Sum(s => s.AmountCredit);
            return new AcctSoa { TotalShipment = totalShipment, DebitAmount = debitAmount, CreditAmount = creditAmount };
        }

        private string CreateSoaNo()
        {
            var prefix = (DateTime.Now.Year.ToString()).Substring(2, 2);
            string stt;
            //Lấy ra dòng cuối cùng của table acctSOA
            var rowLast = DataContext.Get().LastOrDefault();
            if (rowLast == null)
            {
                stt = "00001";
            }
            else
            {
                var soaCurrent = rowLast.Soano;
                var prefixCurrent = soaCurrent.Substring(0, 2);
                //Reset về 1 khi qua năm mới
                if (prefixCurrent != prefix)
                {
                    stt = "00001";
                }
                else
                {
                    stt = (Convert.ToInt32(soaCurrent.Substring(2, 5)) + 1).ToString();
                    stt = stt.PadLeft(5, '0');
                }
            }
            return prefix + stt;
        }
        #endregion -- Insert & Update SOA             

        #region -- List Status SOA --
        public object GetListStatusSoa()
        {
            return Common.CustomData.StatusSoa;
        }
        #endregion -- List Status SOA --

        #region -- Get Rate Exchange --
        private decimal GetRateLatestCurrencyExchange(List<CatCurrencyExchange> currencyExchange, string currencyFrom, string currencyTo)
        {
            if (currencyExchange.Count == 0) return 0;

            currencyFrom = !string.IsNullOrEmpty(currencyFrom) ? currencyFrom.Trim() : currencyFrom;
            currencyTo = !string.IsNullOrEmpty(currencyTo) ? currencyTo.Trim() : currencyTo;

            if (currencyFrom != currencyTo)
            {
                var get1 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyFrom && x.CurrencyToId.Trim() == currencyTo).OrderByDescending(x => x.Rate).FirstOrDefault();
                if (get1 != null)
                {
                    return get1.Rate;
                }
                else
                {
                    var get2 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyTo && x.CurrencyToId.Trim() == currencyFrom).OrderByDescending(x => x.Rate).FirstOrDefault();
                    if (get2 != null)
                    {
                        return 1 / get2.Rate;
                    }
                    else
                    {
                        var get3 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyFrom || x.CurrencyFromId.Trim() == currencyTo).OrderByDescending(x => x.Rate).ToList();
                        if (get3.Count > 1)
                        {
                            if (get3[0].CurrencyFromId.Trim() == currencyFrom && get3[1].CurrencyFromId.Trim() == currencyTo)
                            {
                                return get3[0].Rate / get3[1].Rate;
                            }
                            else
                            {
                                return get3[1].Rate / get3[0].Rate;
                            }
                        }
                        else
                        {
                            //Nến không tồn tại Currency trong Exchange thì return về 0
                            return 0;
                        }
                    }
                }
            }
            return 1;
        }

        private decimal GetRateCurrencyExchange(DateTime? datetime, string currencyFrom, string currencyTo)
        {
            if (datetime == null) return 0;
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == datetime.Value.Date);

            if (currencyExchange.Count() == 0) return 0;

            currencyFrom = !string.IsNullOrEmpty(currencyFrom) ? currencyFrom.Trim() : currencyFrom;
            currencyTo = !string.IsNullOrEmpty(currencyTo) ? currencyTo.Trim() : currencyTo;

            if (currencyFrom != currencyTo)
            {
                var get1 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyFrom && x.CurrencyToId.Trim() == currencyTo).OrderByDescending(x => x.Rate).FirstOrDefault();
                if (get1 != null)
                {
                    return get1.Rate;
                }
                else
                {
                    var get2 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyTo && x.CurrencyToId.Trim() == currencyFrom).OrderByDescending(x => x.Rate).FirstOrDefault();
                    if (get2 != null)
                    {
                        return 1 / get2.Rate;
                    }
                    else
                    {
                        var get3 = currencyExchange.Where(x => x.CurrencyFromId.Trim() == currencyFrom || x.CurrencyFromId.Trim() == currencyTo).OrderByDescending(x => x.Rate).ToList();
                        if (get3.Count > 1)
                        {
                            if (get3[0].CurrencyFromId.Trim() == currencyFrom && get3[1].CurrencyFromId.Trim() == currencyTo)
                            {
                                return get3[0].Rate / get3[1].Rate;
                            }
                            else
                            {
                                return get3[1].Rate / get3[0].Rate;
                            }
                        }
                        else
                        {
                            //Nến không tồn tại Currency trong Exchange thì return về 0
                            return 0;
                        }
                    }
                }
            }
            return 1;
        }
        #endregion -- Get Rate Exchange --

        #region -- Get Data Charge Master --
        private IQueryable<ChargeSOAResult> GetChargeBuySell(Expression<Func<ChargeSOAResult, bool>> query)
        {
            //Chỉ lấy những phí từ shipment (IsFromShipment = true)
            var surcharge = csShipmentSurchargeRepo.Get(x => x.IsFromShipment == true && (x.Type == AccountingConstants.TYPE_CHARGE_BUY || x.Type == AccountingConstants.TYPE_CHARGE_SELL));
            var opst = opsTransactionRepo.Get(x => x.Hblid != Guid.Empty && x.CurrentStatus != null && x.CurrentStatus != TermData.Canceled);
            var csTrans = csTransactionRepo.Get(x => x.CurrentStatus != TermData.Canceled);
            var csTransDe = csTransactionDetailRepo.Get();
            var creditNote = acctCdnoteRepo.Get();
            var debitNote = acctCdnoteRepo.Get();
            var charge = catChargeRepo.Get();

            //BUY & SELL
            var queryBuySellOperation = from sur in surcharge
                                        join ops in opst on sur.Hblid equals ops.Hblid
                                        join creditN in creditNote on sur.CreditNo equals creditN.Code into creditN2
                                        from creditN in creditN2.DefaultIfEmpty()
                                        join debitN in debitNote on sur.DebitNo equals debitN.Code into debitN2
                                        from debitN in debitN2.DefaultIfEmpty()
                                        join chg in charge on sur.ChargeId equals chg.Id into chg2
                                        from chg in chg2.DefaultIfEmpty()
                                        select new ChargeSOAResult
                                        {
                                            ID = sur.Id,
                                            HBLID = sur.Hblid,
                                            ChargeID = sur.ChargeId,
                                            ChargeCode = chg.Code,
                                            ChargeName = chg.ChargeNameEn,
                                            JobId = ops.JobNo,
                                            HBL = ops.Hwbno,
                                            MBL = ops.Mblno,
                                            Type = sur.Type,
                                            Debit = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? (decimal?)sur.Total : null,
                                            Credit = sur.Type == AccountingConstants.TYPE_CHARGE_BUY ? (decimal?)sur.Total : null,
                                            SOANo = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? sur.Soano : sur.PaySoano,
                                            IsOBH = false,
                                            Currency = sur.CurrencyId,
                                            InvoiceNo = sur.InvoiceNo,
                                            Note = sur.Notes,
                                            CustomerID = sur.PaymentObjectId,
                                            ServiceDate = ops.ServiceDate,
                                            CreatedDate = ops.DatetimeCreated,
                                            InvoiceIssuedDate = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? debitN.DatetimeCreated : creditN.DatetimeCreated,
                                            TransactionType = null,
                                            UserCreated = ops.UserCreated,
                                            Quantity = sur.Quantity,
                                            UnitId = sur.UnitId,
                                            UnitPrice = sur.UnitPrice,
                                            VATRate = sur.Vatrate,
                                            CreditDebitNo = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? sur.DebitNo : sur.CreditNo,
                                            DatetimeModified = sur.DatetimeModified,
                                            CommodityGroupID = ops.CommodityGroupId,

                                            Service = "CL",
                                            CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo
                                        };
            queryBuySellOperation = queryBuySellOperation.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryBuySellDocument = from sur in surcharge
                                       join cstd in csTransDe on sur.Hblid equals cstd.Id
                                       join cst in csTrans on cstd.JobId equals cst.Id
                                       join creditN in creditNote on sur.CreditNo equals creditN.Code into creditN2
                                       from creditN in creditN2.DefaultIfEmpty()
                                       join debitN in debitNote on sur.DebitNo equals debitN.Code into debitN2
                                       from debitN in debitN2.DefaultIfEmpty()
                                       join chg in charge on sur.ChargeId equals chg.Id into chg2
                                       from chg in chg2.DefaultIfEmpty()
                                       select new ChargeSOAResult
                                       {
                                           ID = sur.Id,
                                           HBLID = sur.Hblid,
                                           ChargeID = sur.ChargeId,
                                           ChargeCode = chg.Code,
                                           ChargeName = chg.ChargeNameEn,
                                           JobId = cst.JobNo,
                                           HBL = cstd.Hwbno,
                                           MBL = cst.Mawb,
                                           Type = sur.Type,
                                           Debit = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? (decimal?)sur.Total : null,
                                           Credit = sur.Type == AccountingConstants.TYPE_CHARGE_BUY ? (decimal?)sur.Total : null,
                                           SOANo = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? sur.Soano : sur.PaySoano,
                                           IsOBH = false,
                                           Currency = sur.CurrencyId,
                                           InvoiceNo = sur.InvoiceNo,
                                           Note = sur.Notes,
                                           CustomerID = sur.PaymentObjectId,
                                           ServiceDate = (cst.TransactionType == "AI" || cst.TransactionType == "SFI" || cst.TransactionType == "SLI" || cst.TransactionType == "SCI" ? cst.Eta : cst.Etd),
                                           CreatedDate = cst.DatetimeCreated,
                                           InvoiceIssuedDate = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? debitN.DatetimeCreated : creditN.DatetimeCreated,
                                           TransactionType = cst.TransactionType,
                                           UserCreated = cst.UserCreated,
                                           Quantity = sur.Quantity,
                                           UnitId = sur.UnitId,
                                           UnitPrice = sur.UnitPrice,
                                           VATRate = sur.Vatrate,
                                           CreditDebitNo = sur.Type == AccountingConstants.TYPE_CHARGE_SELL ? sur.DebitNo : sur.CreditNo,
                                           DatetimeModified = sur.DatetimeModified,
                                           CommodityGroupID = null,
                                           Service = cst.TransactionType,
                                           CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo,
                                           Commodity = cst.Commodity
                                       };
            queryBuySellDocument = queryBuySellDocument.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryBuySell = queryBuySellOperation.Union(queryBuySellDocument);
            return queryBuySell;
        }

        private IQueryable<ChargeSOAResult> GetChargeOBHSell(Expression<Func<ChargeSOAResult, bool>> query)
        {
            //Chỉ lấy những phí từ shipment (IsFromShipment = true)
            var surcharge = csShipmentSurchargeRepo.Get(x => x.IsFromShipment == true && x.Type == AccountingConstants.TYPE_CHARGE_OBH);
            var opst = opsTransactionRepo.Get(x => x.Hblid != Guid.Empty && x.CurrentStatus != null && x.CurrentStatus != TermData.Canceled);
            var csTrans = csTransactionRepo.Get(x => x.CurrentStatus != TermData.Canceled);
            var csTransDe = csTransactionDetailRepo.Get();
            var debitNote = acctCdnoteRepo.Get();
            var charge = catChargeRepo.Get();
            var partner = catPartnerRepo.Get();

            //OBH Receiver (SELL - Credit)
            var queryObhSellOperation = from sur in surcharge
                                        join ops in opst on sur.Hblid equals ops.Hblid
                                        join debitN in debitNote on sur.DebitNo equals debitN.Code into debitN2
                                        from debitN in debitN2.DefaultIfEmpty()
                                        join chg in charge on sur.ChargeId equals chg.Id into chg2
                                        from chg in chg2.DefaultIfEmpty()
                                        join pat in partner on sur.PaymentObjectId equals pat.Id into pat2
                                        from pat in pat2.DefaultIfEmpty()
                                        select new ChargeSOAResult
                                        {
                                            ID = sur.Id,
                                            HBLID = sur.Hblid,
                                            ChargeID = sur.ChargeId,
                                            ChargeCode = chg.Code,
                                            ChargeName = chg.ChargeNameEn,
                                            JobId = ops.JobNo,
                                            HBL = ops.Hwbno,
                                            MBL = ops.Mblno,
                                            Type = sur.Type + "-SELL",
                                            Debit = sur.Total,
                                            Credit = null,
                                            SOANo = sur.Soano,
                                            IsOBH = true,
                                            Currency = sur.CurrencyId,
                                            InvoiceNo = sur.InvoiceNo,
                                            Note = sur.Notes,
                                            CustomerID = sur.PaymentObjectId,
                                            ServiceDate = ops.ServiceDate,
                                            CreatedDate = ops.DatetimeCreated,
                                            InvoiceIssuedDate = debitN.DatetimeCreated,
                                            TransactionType = null,
                                            UserCreated = ops.UserCreated,
                                            Quantity = sur.Quantity,
                                            UnitId = sur.UnitId,
                                            UnitPrice = sur.UnitPrice,
                                            VATRate = sur.Vatrate,
                                            CreditDebitNo = sur.DebitNo,
                                            DatetimeModified = sur.DatetimeModified,
                                            CommodityGroupID = ops.CommodityGroupId,
                                            Service = "CL",
                                            CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo,
                                            TaxCodeOBH  = pat.TaxCode
                                        };
            queryObhSellOperation = queryObhSellOperation.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryObhSellDocument = from sur in surcharge
                                       join cstd in csTransDe on sur.Hblid equals cstd.Id
                                       join cst in csTrans on cstd.JobId equals cst.Id
                                       join debitN in debitNote on sur.DebitNo equals debitN.Code into debitN2
                                       from debitN in debitN2.DefaultIfEmpty()
                                       join chg in charge on sur.ChargeId equals chg.Id into chg2
                                       from chg in chg2.DefaultIfEmpty()
                                       select new ChargeSOAResult
                                       {
                                           ID = sur.Id,
                                           HBLID = sur.Hblid,
                                           ChargeID = sur.ChargeId,
                                           ChargeCode = chg.Code,
                                           ChargeName = chg.ChargeNameEn,
                                           JobId = cst.JobNo,
                                           HBL = cstd.Hwbno,
                                           MBL = cst.Mawb,
                                           Type = sur.Type + "-SELL",
                                           Debit = sur.Total,
                                           Credit = null,
                                           SOANo = sur.Soano,
                                           IsOBH = true,
                                           Currency = sur.CurrencyId,
                                           InvoiceNo = sur.InvoiceNo,
                                           Note = sur.Notes,
                                           CustomerID = sur.PaymentObjectId,
                                           ServiceDate = (cst.TransactionType == "AI" || cst.TransactionType == "SFI" || cst.TransactionType == "SLI" || cst.TransactionType == "SCI" ? cst.Eta : cst.Etd),
                                           CreatedDate = cst.DatetimeCreated,
                                           InvoiceIssuedDate = debitN.DatetimeCreated,
                                           TransactionType = cst.TransactionType,
                                           UserCreated = cst.UserCreated,
                                           Quantity = sur.Quantity,
                                           UnitId = sur.UnitId,
                                           UnitPrice = sur.UnitPrice,
                                           VATRate = sur.Vatrate,
                                           CreditDebitNo = sur.DebitNo,
                                           DatetimeModified = sur.DatetimeModified,
                                           CommodityGroupID = null,
                                           Service = cst.TransactionType,
                                           CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo,
                                           Commodity = cst.Commodity
                                       };
            queryObhSellDocument = queryObhSellDocument.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryObhSell = queryObhSellOperation.Union(queryObhSellDocument);
            return queryObhSell;
        }

        private IQueryable<ChargeSOAResult> GetChargeOBHBuy(Expression<Func<ChargeSOAResult, bool>> query)
        {
            //Chỉ lấy những phí từ shipment (IsFromShipment = true)
            var surcharge = csShipmentSurchargeRepo.Get(x => x.IsFromShipment == true && x.Type == AccountingConstants.TYPE_CHARGE_OBH);
            var opst = opsTransactionRepo.Get(x => x.Hblid != Guid.Empty && x.CurrentStatus != null && x.CurrentStatus != TermData.Canceled);
            var csTrans = csTransactionRepo.Get(x => x.CurrentStatus != TermData.Canceled);
            var csTransDe = csTransactionDetailRepo.Get();
            var custom = customsDeclarationRepo.Get();
            var creditNote = acctCdnoteRepo.Get();
            var charge = catChargeRepo.Get();
            //OBH Payer (BUY - Credit)
            var queryObhBuyOperation = from sur in surcharge
                                       join ops in opst on sur.Hblid equals ops.Hblid
                                       join creditN in creditNote on sur.CreditNo equals creditN.Code into creditN2
                                       from creditN in creditN2.DefaultIfEmpty()
                                       join chg in charge on sur.ChargeId equals chg.Id into chg2
                                       from chg in chg2.DefaultIfEmpty()
                                       select new ChargeSOAResult
                                       {
                                           ID = sur.Id,
                                           HBLID = sur.Hblid,
                                           ChargeID = sur.ChargeId,
                                           ChargeCode = chg.Code,
                                           ChargeName = chg.ChargeNameEn,
                                           JobId = ops.JobNo,
                                           HBL = ops.Hwbno,
                                           MBL = ops.Mblno,
                                           Type = sur.Type + "-BUY",
                                           Debit = null,
                                           Credit = sur.Total,
                                           SOANo = sur.PaySoano,
                                           IsOBH = true,
                                           Currency = sur.CurrencyId,
                                           InvoiceNo = sur.InvoiceNo,
                                           Note = sur.Notes,
                                           CustomerID = sur.PayerId,
                                           ServiceDate = ops.ServiceDate,
                                           CreatedDate = ops.DatetimeCreated,
                                           InvoiceIssuedDate = creditN.DatetimeCreated,
                                           TransactionType = null,
                                           UserCreated = ops.UserCreated,
                                           Quantity = sur.Quantity,
                                           UnitId = sur.UnitId,
                                           UnitPrice = sur.UnitPrice,
                                           VATRate = sur.Vatrate,
                                           CreditDebitNo = sur.CreditNo,
                                           DatetimeModified = sur.DatetimeModified,
                                           CommodityGroupID = ops.CommodityGroupId,
                                           Service = "CL",
                                           CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo
                                       };
            queryObhBuyOperation = queryObhBuyOperation.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryObhBuyDocument = from sur in surcharge
                                      join cstd in csTransDe on sur.Hblid equals cstd.Id
                                      join cst in csTrans on cstd.JobId equals cst.Id
                                      join creditN in creditNote on sur.CreditNo equals creditN.Code into creditN2
                                      from creditN in creditN2.DefaultIfEmpty()
                                      join chg in charge on sur.ChargeId equals chg.Id into chg2
                                      from chg in chg2.DefaultIfEmpty()
                                      select new ChargeSOAResult
                                      {
                                          ID = sur.Id,
                                          HBLID = sur.Hblid,
                                          ChargeID = sur.ChargeId,
                                          ChargeCode = chg.Code,
                                          ChargeName = chg.ChargeNameEn,
                                          JobId = cst.JobNo,
                                          HBL = cstd.Hwbno,
                                          MBL = cst.Mawb,
                                          Type = sur.Type + "-BUY",
                                          Debit = null,
                                          Credit = sur.Total,
                                          SOANo = sur.PaySoano,
                                          IsOBH = true,
                                          Currency = sur.CurrencyId,
                                          InvoiceNo = sur.InvoiceNo,
                                          Note = sur.Notes,
                                          CustomerID = sur.PayerId,
                                          ServiceDate = (cst.TransactionType == "AI" || cst.TransactionType == "SFI" || cst.TransactionType == "SLI" || cst.TransactionType == "SCI" ? cst.Eta : cst.Etd),
                                          CreatedDate = cst.DatetimeCreated,
                                          InvoiceIssuedDate = creditN.DatetimeCreated,
                                          TransactionType = cst.TransactionType,
                                          UserCreated = cst.UserCreated,
                                          Quantity = sur.Quantity,
                                          UnitId = sur.UnitId,
                                          UnitPrice = sur.UnitPrice,
                                          VATRate = sur.Vatrate,
                                          CreditDebitNo = sur.CreditNo,
                                          DatetimeModified = sur.DatetimeModified,
                                          CommodityGroupID = null,
                                          Service = cst.TransactionType,
                                          CDNote = !string.IsNullOrEmpty(sur.CreditNo) ? sur.CreditNo : sur.DebitNo,
                                          Commodity = cst.Commodity
                                      };
            queryObhBuyDocument = queryObhBuyDocument.Where(x => !string.IsNullOrEmpty(x.Service)).Where(query);

            var queryObhBuy = queryObhBuyOperation.Union(queryObhBuyDocument);
            return queryObhBuy;
        }

        private string GetTopClearanceNoByJobNo(string JobNo)
        {
            var custom = customsDeclarationRepo.Get();
            var clearanceNo = custom.Where(x => x.JobNo != null && x.JobNo == JobNo)
                .OrderBy(x => x.JobNo)
                .OrderByDescending(x => x.ClearanceDate)
                .FirstOrDefault()?.ClearanceNo;
            return clearanceNo;
        }

        public IQueryable<ChargeSOAResult> GetChargeShipmentDocAndOperation(Expression<Func<ChargeSOAResult, bool>> query)
        {
            var charge = catChargeRepo.Get();
            var unit = catUnitRepo.Get();

            //BUY & SELL
            var queryBuySell = GetChargeBuySell(query);

            //OBH Receiver (SELL - Credit)
            var queryObhSell = GetChargeOBHSell(query);

            //OBH Payer (BUY - Credit)
            var queryObhBuy = GetChargeOBHBuy(query);

            //Merge data
            var dataMerge = queryBuySell.Union(queryObhBuy).Union(queryObhSell);

            var queryData = from data in dataMerge
                            join uni in unit on data.UnitId equals uni.Id into uni2
                            from uni in uni2.DefaultIfEmpty()
                            select new ChargeSOAResult
                            {
                                ID = data.ID,
                                HBLID = data.HBLID,
                                ChargeID = data.ChargeID,
                                ChargeCode = data.ChargeCode,
                                ChargeName = data.ChargeName,
                                JobId = data.JobId,
                                HBL = data.HBL,
                                MBL = data.MBL,
                                Type = data.Type,
                                Debit = data.Debit,
                                Credit = data.Credit,
                                SOANo = data.SOANo,
                                IsOBH = data.IsOBH,
                                Currency = data.Currency.Trim(),
                                InvoiceNo = data.InvoiceNo,
                                Note = data.Note,
                                CustomerID = data.CustomerID,
                                ServiceDate = data.ServiceDate,
                                CreatedDate = data.CreatedDate,
                                InvoiceIssuedDate = data.InvoiceIssuedDate,
                                TransactionType = data.TransactionType,
                                UserCreated = data.UserCreated,
                                Quantity = data.Quantity,
                                UnitId = data.UnitId,
                                Unit = uni.UnitNameEn,
                                UnitPrice = data.UnitPrice,
                                VATRate = data.VATRate,
                                CreditDebitNo = data.CreditDebitNo,
                                DatetimeModified = data.DatetimeModified,
                                CommodityGroupID = data.CommodityGroupID,
                                Service = data.Service,
                                CustomNo = GetTopClearanceNoByJobNo(data.JobId),
                                CDNote = data.CDNote
                            };
            queryData = queryData.ToArray().OrderBy(x => x.Service).AsQueryable();
            return queryData;
        }
        #endregion -- Get Data Charge Master --

        #region -- Get List Charges Shipment By Criteria --
        private IQueryable<ChargeShipmentModel> GetChargesShipmentByCriteria(ChargeShipmentCriteria criteria)
        {
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();

            Expression<Func<ChargeSOAResult, bool>> query = null;

            //var charge = GetChargeShipmentDocAndOperation().Where(chg =>
            //        string.IsNullOrEmpty(chg.SOANo)
            //    && chg.CustomerID == criteria.CustomerID
            //    && chg.IsOBH == (criteria.IsOBH == true ? chg.IsOBH : criteria.IsOBH)
            //);
            //query = chg =>
            //        string.IsNullOrEmpty(chg.SOANo)
            //    && chg.CustomerID == criteria.CustomerID
            //    && chg.IsOBH == (criteria.IsOBH == true ? chg.IsOBH : criteria.IsOBH);
            query = chg =>
                    string.IsNullOrEmpty(chg.SOANo)
                && chg.CustomerID == criteria.CustomerID
                && chg.IsOBH == criteria.IsOBH;

            if (string.IsNullOrEmpty(criteria.DateType) || criteria.DateType == "CreatedDate")
            {
                //charge = charge.Where(chg =>
                //    chg.CreatedDate.HasValue ? chg.CreatedDate.Value.Date >= criteria.FromDate.Date && chg.CreatedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.CreatedDate.HasValue ? chg.CreatedDate.Value.Date >= criteria.FromDate.Date && chg.CreatedDate.Value.Date <= criteria.ToDate.Date : false);
            }
            else if (criteria.DateType == "ServiceDate")
            {
                //charge = charge.Where(chg =>
                //    chg.ServiceDate.HasValue ? chg.ServiceDate.Value.Date >= criteria.FromDate.Date && chg.ServiceDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.ServiceDate.HasValue ? chg.ServiceDate.Value.Date >= criteria.FromDate.Date && chg.ServiceDate.Value.Date <= criteria.ToDate.Date : false);
            }
            else if (criteria.DateType == "InvoiceIssuedDate")
            {
                //charge = charge.Where(chg =>
                //    chg.InvoiceIssuedDate.HasValue ? chg.InvoiceIssuedDate.Value.Date >= criteria.FromDate.Date && chg.InvoiceIssuedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.InvoiceIssuedDate.HasValue ? chg.InvoiceIssuedDate.Value.Date >= criteria.FromDate.Date && chg.InvoiceIssuedDate.Value.Date <= criteria.ToDate.Date : false);
            }

            if (!string.IsNullOrEmpty(criteria.Type))
            {
                //charge = charge.Where(chg =>
                //       (criteria.Type == "Debit" || chg.Type == Constants.TYPE_CHARGE_OBH_SELL) ? chg.Debit.HasValue :
                //       ((criteria.Type == "Credit" || chg.Type == Constants.TYPE_CHARGE_OBH_BUY) ? chg.Credit.HasValue : (chg.Debit.HasValue || chg.Credit.HasValue))
                //);
                if (criteria.Type == "Debit")
                {
                    query = query.And(chg => chg.Debit.HasValue);
                }
                if (criteria.Type == "Credit")
                {
                    query = query.And(chg => chg.Credit.HasValue);
                }
            }

            if (!string.IsNullOrEmpty(criteria.StrCreators) && criteria.StrCreators != "All")
            {
                var listCreator = criteria.StrCreators.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listCreator.Contains(chg.UserCreated));
                query = query.And(chg => listCreator.Contains(chg.UserCreated));
            }

            if (!string.IsNullOrEmpty(criteria.StrCharges) && criteria.StrCharges != "All")
            {
                var listCharge = criteria.StrCharges.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listCharge.Contains(chg.ChargeCode));
                query = query.And(chg => listCharge.Contains(chg.ChargeCode));
            }

            if (!string.IsNullOrEmpty(criteria.StrServices) && criteria.StrServices != "All")
            {
                var listService = criteria.StrServices.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listService.Contains(chg.Service));
                query = query.And(chg => listService.Contains(chg.Service));
            }

            if (criteria.CommodityGroupID != null)
            {
                //charge = charge.Where(chg => criteria.CommodityGroupID == chg.CommodityGroupID);
                query = query.And(chg => criteria.CommodityGroupID == chg.CommodityGroupID);
            }

            if (criteria.JobIds != null && criteria.JobIds.Count > 0)
            {
                //charge = charge.Where(chg => criteria.JobIds.Contains(chg.JobId));
                query = query.And(chg => criteria.JobIds.Contains(chg.JobId));
            }

            if (criteria.Hbls != null && criteria.Hbls.Count > 0)
            {
                //charge = charge.Where(chg => criteria.Hbls.Contains(chg.HBL));
                query = query.And(chg => criteria.Hbls.Contains(chg.HBL));
            }

            if (criteria.Mbls != null && criteria.Mbls.Count > 0)
            {
                //charge = charge.Where(chg => criteria.Mbls.Contains(chg.MBL));
                query = query.And(chg => criteria.Mbls.Contains(chg.MBL));
            }

            var charge = GetChargeShipmentDocAndOperation(query);

            var data = charge.Select(chg => new ChargeShipmentModel
            {
                ID = chg.ID,
                ChargeCode = chg.ChargeCode,
                ChargeName = chg.ChargeName,
                JobId = chg.JobId,
                HBL = chg.HBL,
                MBL = chg.MBL,
                CustomNo = chg.CustomNo,
                Type = chg.Type,
                InvoiceNo = chg.InvoiceNo,
                ServiceDate = chg.ServiceDate,
                Note = chg.Note,
                Debit = chg.Debit,
                Credit = chg.Credit,
                Currency = chg.Currency,
                CurrencyToLocal = criteria.CurrencyLocal,
                CurrencyToUSD = AccountingConstants.CURRENCY_USD,
                AmountDebitLocal =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, criteria.CurrencyLocal)) * (chg.Debit != null ? chg.Debit.Value : 0),
                AmountCreditLocal =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, criteria.CurrencyLocal)) * (chg.Credit != null ? chg.Credit.Value : 0),
                AmountDebitUSD =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Debit != null ? chg.Debit.Value : 0),
                AmountCreditUSD =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Credit != null ? chg.Credit.Value : 0),
                SOANo = chg.SOANo,
                DatetimeModifiedSurcharge = chg.DatetimeModified,
                CDNote = chg.CDNote
            });
            //Sort Array sẽ nhanh hơn
            data = data.ToArray().OrderByDescending(x => x.DatetimeModifiedSurcharge).AsQueryable();
            return data;
        }

        public ChargeShipmentResult GetListChargeShipment(ChargeShipmentCriteria criteria)
        {
            var chargeShipmentList = GetChargesShipmentByCriteria(criteria);
            var result = new ChargeShipmentResult
            {
                ChargeShipments = chargeShipmentList.Take(30).ToList(),
                TotalShipment = chargeShipmentList.Where(x => x.HBL != null).GroupBy(x => x.HBL).Count(),
                TotalCharge = chargeShipmentList.Count(),
                AmountDebitLocal = chargeShipmentList.Sum(x => x.AmountDebitLocal),
                AmountCreditLocal = chargeShipmentList.Sum(x => x.AmountCreditLocal),
                AmountDebitUSD = chargeShipmentList.Sum(x => x.AmountDebitUSD),
                AmountCreditUSD = chargeShipmentList.Sum(x => x.AmountCreditUSD),
            };
            return result;
        }
        #endregion -- Get List Charges Shipment By Criteria --

        #region -- Get List More Charges & Add More Charge Shipment By Criteria --
        private IQueryable<ChargeShipmentModel> GetMoreChargesShipmentByCriteria(MoreChargeShipmentCriteria criteria)
        {
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();

            Expression<Func<ChargeSOAResult, bool>> query = null;

            //var charge = GetChargeShipmentDocAndOperation().Where(chg =>
            //       chg.CustomerID == criteria.CustomerID
            //    && chg.IsOBH == (criteria.IsOBH == true ? chg.IsOBH : criteria.IsOBH)
            //    && (criteria.InSoa == true ? !string.IsNullOrEmpty(chg.SOANo) : string.IsNullOrEmpty(chg.SOANo))
            //);

            query = chg =>
                   chg.CustomerID == criteria.CustomerID
                && chg.IsOBH == criteria.IsOBH;

            if (criteria.InSoa == true)
            {
                query = query.Or(chg => !string.IsNullOrEmpty(chg.SOANo));
            }
            else
            {
                query = query.And(chg => string.IsNullOrEmpty(chg.SOANo));
            }

            if (string.IsNullOrEmpty(criteria.DateType) || criteria.DateType == "CreatedDate")
            {
                //charge = charge.Where(chg =>
                //    chg.CreatedDate.HasValue ? chg.CreatedDate.Value.Date >= criteria.FromDate.Date && chg.CreatedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.CreatedDate.HasValue ? chg.CreatedDate.Value.Date >= criteria.FromDate.Date && chg.CreatedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                );
            }
            else if (criteria.DateType == "ServiceDate")
            {
                //charge = charge.Where(chg =>
                //    chg.ServiceDate.HasValue ? chg.ServiceDate.Value.Date >= criteria.FromDate.Date && chg.ServiceDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.ServiceDate.HasValue ? chg.ServiceDate.Value.Date >= criteria.FromDate.Date && chg.ServiceDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                );
            }
            else if (criteria.DateType == "InvoiceIssuedDate")
            {
                //charge = charge.Where(chg =>
                //    chg.InvoiceIssuedDate.HasValue ? chg.InvoiceIssuedDate.Value.Date >= criteria.FromDate.Date && chg.InvoiceIssuedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                //);
                query = query.And(chg =>
                    chg.InvoiceIssuedDate.HasValue ? chg.InvoiceIssuedDate.Value.Date >= criteria.FromDate.Date && chg.InvoiceIssuedDate.Value.Date <= criteria.ToDate.Date : 1 == 2
                );
            }

            if (!string.IsNullOrEmpty(criteria.Type))
            {
                //charge = charge.Where(chg =>
                //       (criteria.Type == "Debit" || chg.Type == Constants.TYPE_CHARGE_OBH_SELL) ? chg.Debit.HasValue :
                //       ((criteria.Type == "Credit" || chg.Type == Constants.TYPE_CHARGE_OBH_BUY) ? chg.Credit.HasValue : (chg.Debit.HasValue || chg.Credit.HasValue))
                //);
                if (criteria.Type == "Debit")
                {
                    query = query.And(chg => chg.Debit.HasValue);
                }
                if (criteria.Type == "Credit")
                {
                    query = query.And(chg => chg.Credit.HasValue);
                }
            }

            if (!string.IsNullOrEmpty(criteria.StrCreators) && criteria.StrCreators != "All")
            {
                var listCreator = criteria.StrCreators.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listCreator.Contains(chg.UserCreated));
                query = query.And(chg => listCreator.Contains(chg.UserCreated));
            }

            if (!string.IsNullOrEmpty(criteria.StrCharges) && criteria.StrCharges != "All")
            {
                var listCharge = criteria.StrCharges.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listCharge.Contains(chg.ChargeCode));
                query = query.And(chg => listCharge.Contains(chg.ChargeCode));
            }

            if (!string.IsNullOrEmpty(criteria.JobId))
            {
                //charge = charge.Where(chg => chg.JobId == criteria.JobId);
                query = query.And(chg => chg.JobId == criteria.JobId);
            }

            if (!string.IsNullOrEmpty(criteria.Hbl))
            {
                //charge = charge.Where(chg => chg.HBL == criteria.Hbl);
                query = query.And(chg => chg.HBL == criteria.Hbl);
            }

            if (!string.IsNullOrEmpty(criteria.Mbl))
            {
                //charge = charge.Where(chg => chg.MBL == criteria.Mbl);
                query = query.And(chg => chg.MBL == criteria.Mbl);
            }

            if (!string.IsNullOrEmpty(criteria.CDNote))
            {
                //charge = charge.Where(chg => chg.CreditDebitNo == criteria.CDNote);
                query = query.And(chg => chg.CreditDebitNo == criteria.CDNote);
            }

            if (!string.IsNullOrEmpty(criteria.StrServices) && criteria.StrServices != "All")
            {
                var listService = criteria.StrServices.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                //charge = charge.Where(chg => listService.Contains(chg.Service));
                query = query.And(chg => listService.Contains(chg.Service));
            }

            if (criteria.CommodityGroupID != null)
            {
                //charge = charge.Where(chg => criteria.CommodityGroupID == chg.CommodityGroupID);
                query = query.And(chg => criteria.CommodityGroupID == chg.CommodityGroupID);
            }

            var charge = GetChargeShipmentDocAndOperation(query);

            var data = charge.Select(chg => new ChargeShipmentModel
            {
                ID = chg.ID,
                ChargeCode = chg.ChargeCode,
                ChargeName = chg.ChargeName,
                JobId = chg.JobId,
                HBL = chg.HBL,
                MBL = chg.MBL,
                CustomNo = chg.CustomNo,
                Type = chg.Type,
                InvoiceNo = chg.InvoiceNo,
                ServiceDate = chg.ServiceDate,
                Note = chg.Note,
                Debit = chg.Debit,
                Credit = chg.Credit,
                Currency = chg.Currency,
                CurrencyToLocal = criteria.CurrencyLocal,
                CurrencyToUSD = AccountingConstants.CURRENCY_USD,
                AmountDebitLocal =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, criteria.CurrencyLocal)) * (chg.Debit != null ? chg.Debit.Value : 0),
                AmountCreditLocal =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, criteria.CurrencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, criteria.CurrencyLocal)) * (chg.Credit != null ? chg.Credit.Value : 0),
                AmountDebitUSD =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Debit != null ? chg.Debit.Value : 0),
                AmountCreditUSD =
                            (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Credit != null ? chg.Credit.Value : 0),
                SOANo = chg.SOANo,
                DatetimeModifiedSurcharge = chg.DatetimeModified
            });
            //Sort Array sẽ nhanh hơn
            data = data.ToArray().OrderByDescending(x => x.DatetimeModifiedSurcharge).AsQueryable();
            return data;
        }

        public IQueryable<ChargeShipmentModel> GetListMoreCharge(MoreChargeShipmentCriteria criteria)
        {
            var moreChargeShipmentList = GetMoreChargesShipmentByCriteria(criteria);

            List<Surcharge> Surcharges = new List<Surcharge>();
            if (criteria.ChargeShipments != null)
            {
                foreach (var item in criteria.ChargeShipments.Where(x => string.IsNullOrEmpty(x.SOANo)).ToList())
                {
                    Surcharges.Add(new Surcharge { surchargeId = item.ID, type = item.Type });
                }
            }

            //Lấy ra các charge chưa tồn tại trong list criteria.Surcharges(Các Id của charge đã có trong kết quả search ở form info)
            var charge = moreChargeShipmentList.Where(x => Surcharges != null
                                                         && !Surcharges.Where(c => c.surchargeId == x.ID && c.type == x.Type).Any());
            return charge;
        }

        public AcctSOADetailResult AddMoreCharge(AddMoreChargeCriteria criteria)
        {
            var data = new AcctSOADetailResult();
            if (criteria != null)
            {
                if (criteria.ChargeShipmentsCurrent != null)
                {
                    if (criteria.ChargeShipmentsAddMore != null)
                    {
                        foreach (var item in criteria.ChargeShipmentsAddMore)
                        {
                            criteria.ChargeShipmentsCurrent.Add(item);
                        }
                    }
                    data.Shipment = criteria.ChargeShipmentsCurrent.Where(x => x.HBL != null).GroupBy(x => x.HBL).Count();
                    data.TotalCharge = criteria.ChargeShipmentsCurrent.Count();
                    data.ChargeShipments = criteria.ChargeShipmentsCurrent;
                    data.AmountDebitLocal = criteria.ChargeShipmentsCurrent.Sum(x => x.AmountDebitLocal);
                    data.AmountCreditLocal = criteria.ChargeShipmentsCurrent.Sum(x => x.AmountCreditLocal);
                    data.AmountDebitUSD = criteria.ChargeShipmentsCurrent.Sum(x => x.AmountDebitUSD);
                    data.AmountCreditUSD = criteria.ChargeShipmentsCurrent.Sum(x => x.AmountCreditUSD);
                }
            }
            return data;
        }
        #endregion -- Get List More Charges & Add More Charge Shipment By Criteria --

        #region -- Get List & Paging SOA By Criteria --
        private IQueryable<AcctSOAResult> QueryDataListSOA(IQueryable<AcctSoa> soas)
        {
            var partner = catPartnerRepo.Get();
            var resultData = from s in soas
                             join pat in partner on s.Customer equals pat.Id into pat2
                             from pat in pat2.DefaultIfEmpty()
                             join ucreate in sysUserRepo.Get() on s.UserCreated equals ucreate.Id into ucreate2
                             from ucreate in ucreate2.DefaultIfEmpty()
                             join umodifies in sysUserRepo.Get() on s.UserModified equals umodifies.Id into umodifies2
                             from umodifies in umodifies2.DefaultIfEmpty()
                             select new AcctSOAResult
                             {
                                 Id = s.Id,
                                 Soano = s.Soano,
                                 Shipment = s.TotalShipment,
                                 PartnerName = pat.ShortName,
                                 Currency = s.Currency.Trim(),
                                 CreditAmount = s.CreditAmount,
                                 DebitAmount = s.DebitAmount,
                                 TotalAmount = s.DebitAmount - s.CreditAmount,
                                 Status = s.Status,
                                 DatetimeCreated = s.DatetimeCreated,
                                 UserCreated = ucreate.Username,
                                 DatetimeModified = s.DatetimeModified,
                                 UserModified = umodifies.Username,
                             };
            //Sort Array sẽ nhanh hơn
            resultData = resultData.ToArray().OrderByDescending(x => x.DatetimeModified).AsQueryable();
            return resultData;
        }

        private IQueryable<AcctSoa> GetSoasPermission()
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            PermissionRange _permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.List);
            if (_permissionRange == PermissionRange.None) return null;

            IQueryable<AcctSoa> soas = null;
            switch (_permissionRange)
            {
                case PermissionRange.None:
                    break;
                case PermissionRange.All:
                    soas = DataContext.Get();
                    break;
                case PermissionRange.Owner:
                    soas = DataContext.Get(x => x.UserCreated == _user.UserID);
                    break;
                case PermissionRange.Group:
                    soas = DataContext.Get(x => x.GroupId == _user.GroupId
                                            && x.DepartmentId == _user.DepartmentId
                                            && x.OfficeId == _user.OfficeID
                                            && x.CompanyId == _user.CompanyID);
                    break;
                case PermissionRange.Department:
                    soas = DataContext.Get(x => x.DepartmentId == _user.DepartmentId
                                            && x.OfficeId == _user.OfficeID
                                            && x.CompanyId == _user.CompanyID);
                    break;
                case PermissionRange.Office:
                    soas = DataContext.Get(x => x.OfficeId == _user.OfficeID
                                            && x.CompanyId == _user.CompanyID);
                    break;
                case PermissionRange.Company:
                    soas = DataContext.Get(x => x.CompanyId == _user.CompanyID);
                    break;
            }
            return soas;
        }

        private IQueryable<AcctSOAResult> GetDatas(AcctSOACriteria criteria, IQueryable<AcctSoa> soas)
        {
            if (soas == null) return null;

            if (!string.IsNullOrEmpty(criteria.StrCodes))
            {
                //Chỉ lấy ra những charge có SOANo (Để hạn chế việc join & get data không cần thiết)
                var listCode = criteria.StrCodes.Split(',').Where(x => x.ToString() != string.Empty).ToList();
                List<string> refNo = new List<string>();
                refNo = (from s in soas
                         join chg in csShipmentSurchargeRepo.Get() on s.Soano equals (chg.PaySoano ?? chg.Soano) into chg2
                         from chg in chg2.DefaultIfEmpty()
                         where
                             listCode.Contains(s.Soano) || listCode.Contains(chg.JobNo) || listCode.Contains(chg.Mblno) || listCode.Contains(chg.Hblno)
                         select s.Soano).ToList();
                soas = soas.Where(x => refNo.Contains(x.Soano));
            }

            if (!string.IsNullOrEmpty(criteria.CustomerID))
            {
                soas = soas.Where(x => x.Customer == criteria.CustomerID);
            }

            if (criteria.SoaFromDateCreate != null && criteria.SoaToDateCreate != null)
            {
                soas = soas.Where(x =>
                    x.DatetimeCreated.HasValue ? x.DatetimeCreated.Value.Date >= criteria.SoaFromDateCreate.Value.Date && x.DatetimeCreated.Value.Date <= criteria.SoaToDateCreate.Value.Date : 1 == 2
                );
            }

            if (!string.IsNullOrEmpty(criteria.SoaStatus))
            {
                soas = soas.Where(x => x.Status == criteria.SoaStatus);
            }

            if (!string.IsNullOrEmpty(criteria.SoaCurrency))
            {
                soas = soas.Where(x => x.Currency == criteria.SoaCurrency);
            }

            if (!string.IsNullOrEmpty(criteria.SoaUserCreate))
            {
                soas = soas.Where(x => x.UserCreated == criteria.SoaUserCreate);
            }

            var dataResult = QueryDataListSOA(soas);
            return dataResult;
        }

        public IQueryable<AcctSOAResult> QueryDataPermission(AcctSOACriteria criteria)
        {
            var settlements = GetSoasPermission();
            return GetDatas(criteria, settlements);
        }

        public IQueryable<AcctSOAResult> QueryData(AcctSOACriteria criteria)
        {
            var soas = DataContext.Get();
            return GetDatas(criteria, soas);
        }

        public IQueryable<AcctSOAResult> Paging(AcctSOACriteria criteria, int page, int size, out int rowsCount)
        {
            var data = QueryDataPermission(criteria);
            if (data == null)
            {
                rowsCount = 0;
                return null;
            }

            var _totalItem = data.Select(s => s.Id).Count();
            rowsCount = (_totalItem > 0) ? _totalItem : 0;
            if (size > 0)
            {
                if (page < 1)
                {
                    page = 1;
                }
                data = data.Skip((page - 1) * size).Take(size);
            }

            return data;
        }
        #endregion -- Get List & Paging SOA By Criteria --

        #region -- Details Soa --
        public bool CheckDetailPermission(string soaNo)
        {
            ICurrentUser _user = PermissionExtention.GetUserMenuPermission(currentUser, Menu.acctSOA);
            var permissionRange = PermissionExtention.GetPermissionRange(_user.UserMenuPermission.Detail);
            if (permissionRange == PermissionRange.None)
                return false;

            var detail = DataContext.Get(x => x.Soano == soaNo)?.FirstOrDefault();
            if (detail == null) return false;

            BaseUpdateModel baseModel = new BaseUpdateModel
            {
                UserCreated = detail.UserCreated,
                CompanyId = detail.CompanyId,
                DepartmentId = detail.DepartmentId,
                OfficeId = detail.OfficeId,
                GroupId = detail.GroupId
            };
            int code = PermissionExtention.GetPermissionCommonItem(baseModel, permissionRange, _user);

            if (code == 403) return false;

            return true;
        }

        private AcctSOADetailResult GetSoaBySoaNo(string soaNo)
        {
            var soa = DataContext.Get(x => x.Soano == soaNo);
            var partner = catPartnerRepo.Get();
            var resultData = from s in soa
                             join pat in partner on s.Customer equals pat.Id into pat2
                             from pat in pat2.DefaultIfEmpty()
                             select new AcctSOADetailResult
                             {
                                 Id = s.Id,
                                 Soano = s.Soano,
                                 Shipment = s.TotalShipment,
                                 PartnerName = pat.PartnerNameEn,
                                 Currency = s.Currency,
                                 CreditAmount = s.CreditAmount,
                                 DebitAmount = s.DebitAmount,
                                 TotalAmount = s.DebitAmount - s.CreditAmount,
                                 Status = s.Status,
                                 DatetimeCreated = s.DatetimeCreated,
                                 UserCreated = s.UserCreated,
                                 DatetimeModified = s.DatetimeModified,
                                 UserModified = s.UserModified,
                                 SoaformDate = s.SoaformDate,
                                 SoatoDate = s.SoatoDate,
                                 Note = s.Note,
                                 Type = s.Type,
                                 Obh = s.Obh,
                                 ServiceTypeId = s.ServiceTypeId,
                                 Customer = s.Customer,
                                 DateType = s.DateType,
                                 CreatorShipment = s.CreatorShipment
                             };
            var result = resultData.FirstOrDefault();
            if (result != null)
            {
                result.UserNameCreated = sysUserRepo.Get(x => x.Id == result.UserCreated).FirstOrDefault()?.Username;
                result.UserNameModified = sysUserRepo.Get(x => x.Id == result.UserModified).FirstOrDefault()?.Username;
            }
            return result;
        }

        private IQueryable<ChargeShipmentModel> GetListChargeOfSoa(IQueryable<ChargeSOAResult> charge, List<CatCurrencyExchange> currencyExchange, string soaNo, string currencyLocal)
        {
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var query = from chg in charge
                        select new ChargeShipmentModel
                        {
                            SOANo = chg.SOANo,
                            ID = chg.ID,
                            ChargeCode = chg.ChargeCode,
                            ChargeName = chg.ChargeName,
                            JobId = chg.JobId,
                            HBL = chg.HBL,
                            MBL = chg.MBL,
                            CustomNo = chg.CustomNo,
                            Type = chg.Type,
                            Debit = chg.Debit,
                            Credit = chg.Credit,
                            Currency = chg.Currency,
                            InvoiceNo = chg.InvoiceNo,
                            ServiceDate = chg.ServiceDate,
                            Note = chg.Note,
                            CurrencyToLocal = currencyLocal,
                            CurrencyToUSD = AccountingConstants.CURRENCY_USD,
                            AmountDebitLocal = (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, currencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, currencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, currencyLocal)) * (chg.Debit != null ? chg.Debit.Value : 0),
                            AmountCreditLocal = (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, currencyLocal) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, currencyLocal)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, currencyLocal)) * (chg.Credit != null ? chg.Credit.Value : 0),
                            AmountDebitUSD = (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Debit != null ? chg.Debit.Value : 0),
                            AmountCreditUSD = (GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD) > 0
                            ?
                                GetRateCurrencyExchange(chg.CreatedDate, chg.Currency, AccountingConstants.CURRENCY_USD)
                            :
                                GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, AccountingConstants.CURRENCY_USD)) * (chg.Credit != null ? chg.Credit.Value : 0),
                        };
            return query;
        }

        public AcctSOADetailResult GetDetailBySoaNoAndCurrencyLocal(string soaNo, string currencyLocal)
        {
            var data = new AcctSOADetailResult();
            var soaDetail = GetSoaBySoaNo(soaNo);
            if (soaDetail == null)
            {
                return data;
            }
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();
            //Chỉ lấy ra những charge có SOANo == soaNo (Để hạn chế việc join & get data không cần thiết)
            Expression<Func<ChargeSOAResult, bool>> query = chg => chg.SOANo == soaNo;
            var charge = GetChargeShipmentDocAndOperation(query);
            var chargeShipments = GetListChargeOfSoa(charge, currencyExchange, soaNo, currencyLocal).ToList();
            data = soaDetail;
            data.ChargeShipments = chargeShipments;
            data.AmountDebitLocal = Math.Round(chargeShipments.Sum(x => x.AmountDebitLocal), 3);
            data.AmountCreditLocal = Math.Round(chargeShipments.Sum(x => x.AmountCreditLocal), 3);
            data.AmountDebitUSD = Math.Round(chargeShipments.Sum(x => x.AmountDebitUSD), 3);
            data.AmountCreditUSD = Math.Round(chargeShipments.Sum(x => x.AmountCreditUSD), 3);
            //Thông tin các Service Name của SOA
            data.ServicesNameSoa = GetServiceNameOfSoa(data.ServiceTypeId).ToString();
            return data;
        }

        private string GetServiceNameOfSoa(string serviceTypeId)
        {
            var serviceName = string.Empty;

            if (!string.IsNullOrEmpty(serviceTypeId))
            {
                //Tách chuỗi servicetype thành mảng
                string[] arrayStrServiceTypeId = serviceTypeId.Split(';').Where(x => x.ToString() != string.Empty).ToArray();

                //Xóa các serviceTypeId trùng
                string[] arrayGrpServiceTypeId = arrayStrServiceTypeId.Distinct<string>().ToArray();

                foreach (var item in arrayGrpServiceTypeId)
                {
                    //Lấy ra DisplayName của serviceTypeId
                    serviceName += Common.CustomData.Services.Where(x => x.Value == item).FirstOrDefault() != null ?
                                Common.CustomData.Services.Where(x => x.Value == item).FirstOrDefault().DisplayName.Trim() + ";"
                                : string.Empty;
                }
                serviceName = (serviceName + ")").Replace(";)", string.Empty);
            }
            return serviceName;
        }
        #endregion --Details Soa--

        #region -- Data Export Details --
        public IQueryable<ExportSOAModel> GetDateExportDetailSOA(string soaNo)
        {
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();
            var soa = DataContext.Get(x => x.Soano == soaNo);

            Expression<Func<ChargeSOAResult, bool>> query = chg => chg.SOANo == soaNo;
            var charge = GetChargeShipmentDocAndOperation(query);
            var partner = catPartnerRepo.Get();
            var dataResult = from s in soa
                             join chg in charge on s.Soano equals chg.SOANo into chg2
                             from chg in chg2.DefaultIfEmpty()
                             join pat in partner on s.Customer equals pat.Id into pat2
                             from pat in pat2.DefaultIfEmpty()
                             select new ExportSOAModel
                             {
                                 SOANo = s.Soano,
                                 CustomerName = pat.PartnerNameEn,
                                 TaxCode = pat.TaxCode,
                                 CustomerAddress = pat.AddressEn,
                                 ServiceDate = chg.ServiceDate,
                                 JobId = chg.JobId,
                                 HBL = chg.HBL,
                                 MBL = chg.MBL,
                                 CustomNo = chg.CustomNo,
                                 ChargeCode = chg.ChargeCode,
                                 ChargeName = chg.ChargeName,
                                 CreditDebitNo = chg.CreditDebitNo,
                                 Debit = chg.Debit,
                                 Credit = chg.Credit,
                                 CurrencySOA = s.Currency,
                                 CurrencyCharge = chg.Currency,
                                 CreditExchange = (GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency) > 0
                                 ?
                                     GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency)
                                 :
                                     GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, s.Currency)) * (chg.Credit != null ? chg.Credit.Value : 0),
                                 DebitExchange = (GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency) > 0
                                 ?
                                     GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency)
                                 :
                                     GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, s.Currency)) * (chg.Debit != null ? chg.Debit.Value : 0),
                             };
            return dataResult;
        }

        public ExportSOADetailResult GetDataExportSOABySOANo(string soaNo, string currencyLocal)
        {
            var data = GetDateExportDetailSOA(soaNo);
            var result = new ExportSOADetailResult
            {
                ListCharges = data.ToList(),
                TotalDebitExchange = data.Where(x => x.DebitExchange != null).Sum(x => x.DebitExchange),
                TotalCreditExchange = data.Where(x => x.CreditExchange != null).Sum(x => x.CreditExchange)
            };
            return result;
        }

        #endregion -- Data Export Details --

        public IQueryable<ExportImportBravoFromSOAResult> GetDataExportImportBravoFromSOA(string soaNo)
        {
            //Lấy danh sách Currency Exchange của ngày hiện tại
            var currencyExchange = catCurrencyExchangeRepo.Get(x => x.DatetimeModified.Value.Date == DateTime.Now.Date).ToList();
            var soa = DataContext.Get(x => x.Soano == soaNo);
            Expression<Func<ChargeSOAResult, bool>> query = chg => chg.SOANo == soaNo;
            var chargeDefaults = chargeDefaultRepo.Get(x=>x.Type =="Công Nợ");
            var charge = GetChargeShipmentDocAndOperation(query);
            var partner = catPartnerRepo.Get();
            var dataResult = from s in soa
                             join chg in charge on s.Soano equals chg.SOANo into chg2
                             from chg in chg2.DefaultIfEmpty()
                             join pat in partner on s.Customer equals pat.Id into pat2
                             from pat in pat2.DefaultIfEmpty()
                             join cd in chargeDefaults on chg.ID equals cd.ChargeId into defaults
                             from cd in defaults.DefaultIfEmpty()
          
                             select new ExportImportBravoFromSOAResult
                             {
                                 ServiceDate = chg.ServiceDate,
                                 SOANo = s.Soano,
                                 Service = GetServiceNameOfSoa(s.ServiceTypeId).ToString(),
                                 PartnerCode = pat.TaxCode,
                                 Debit = chg.Debit,
                                 Credit = chg.Credit,
                                 ChargeCode = chg.ChargeCode,
                                 OriginalCurrency = chg.Currency,
                                 OriginalAmount = chg.Debit - chg.Credit,
                                 CreditExchange = (GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency) > 0
                                 ?
                                     GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency)
                                 :
                                     GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, s.Currency)) * (chg.Credit != null ? chg.Credit.Value : 0),
                                 AmountVND = chg.Credit * (chg.Debit - chg.Credit),
                                 VAT = chg.VATRate,
                                 AccountDebitNoVAT = cd.DebitAccountNo,
                                 AccountCreditNoVAT = cd.CreditAccountNo,
                                 AmountVAT = (chg.Debit - chg.Credit) * chg.VATRate,
                                 AmountVNDVAT = (chg.Credit * (chg.Debit - chg.Credit)) * chg.VATRate,
                                 Commodity = chg.Commodity,
                                 CustomerName = pat.PartnerNameVn,
                                 TaxCode = pat.TaxCode,
                                 JobId = chg.JobId,
                                 ChargeName = chg.ChargeName,
                                 TransationType = chg.TransactionType,
                                 HBL = chg.HBL,
                                 Unit = chg.Unit,
                                 Payment = "TM/CK",
                                 Quantity = chg.Quantity,
                                 CustomerAddress = pat.AddressVn,
                                 MBL = chg.MBL,
                                 Email = pat.Email,
                                 TaxCodeOBH = chg.TaxCodeOBH,
                                 CustomNo = chg.CustomNo
                                 //CustomNo = chg.CustomNo,
                                 //CreditDebitNo = chg.CreditDebitNo,
                                 //CurrencySOA = s.Currency,
                                 //DebitExchange = (GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency) > 0
                                 //?
                                 //    GetRateCurrencyExchange(s.DatetimeModified, chg.Currency, s.Currency)
                                 //:
                                 //    GetRateLatestCurrencyExchange(currencyExchange, chg.Currency, s.Currency)) * (chg.Debit != null ? chg.Debit.Value : 0),
                             };


            return dataResult;
        }

    }
}
