﻿using AutoMapper;
using eFMS.API.Catalogue.DL.IService;
using eFMS.API.Catalogue.DL.Models;
using eFMS.API.Catalogue.Service.Models;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using System;
using System.Collections.Generic;
using System.Linq;
using eFMS.API.Catalogue.DL.Common;
using ITL.NetCore.Common;
using Microsoft.Extensions.Localization;
using ITL.NetCore.Connection.NoSql;

namespace eFMS.API.Catalogue.DL.Services
{
    public class CatChargeDefaultService:RepositoryBase<CatChargeDefaultAccount,CatChargeDefaultAccountModel>,ICatChargeDefaultAccountService
    {
        private readonly IStringLocalizer stringLocalizer;
        public CatChargeDefaultService(IContextBase<CatChargeDefaultAccount> repository,IMapper mapper, IStringLocalizer<LanguageSub> localizer) : base(repository, mapper)
        {
            stringLocalizer = localizer;
        }

        public List<CatChargeDefaultAccountImportModel> CheckValidImport(List<CatChargeDefaultAccountImportModel> list)
        {
            eFMSDataContext dc = (eFMSDataContext)DataContext.DC;
            var defaultAccount = dc.CatChargeDefaultAccount.ToList();
            list.ForEach(item =>
            {
                if (string.IsNullOrEmpty(item.ChargeCode))
                {
                    item.ChargeCode = stringLocalizer[LanguageSub.MSG_CHARGE_DEFAULT_CODE_EMPTY];
                    item.IsValid = false;
                }
                else
                {
                    var charge = dc.CatCharge.FirstOrDefault(x => x.Code == item.ChargeCode);
                    if (charge == null)
                    {
                        item.ChargeCode = string.Format(stringLocalizer[LanguageSub.MSG_CHARGE_DEFAULT_CODE_NOT_FOUND], item.ChargeCode);
                        item.IsValid = false;
                    }
                }

                if (string.IsNullOrEmpty(item.Type)){
                    item.Type = stringLocalizer[LanguageSub.MSG_CHARGE_DEFAULT_VOUCHER_TYPE_EMPTY];
                    item.IsValid = false;
                }
                if (string.IsNullOrEmpty(item.DebitAccountNo.ToString()))
                {
                    item.DebitAccountNo = stringLocalizer[LanguageSub.MSG_CHARGE_DEFAULT_ACCOUNT_DEBIT_EMPTY];
                    item.IsValid = false;
                }
                if (string.IsNullOrEmpty(item.CreditAccountNo.ToString()))
                {
                    item.CreditAccountNo = stringLocalizer[LanguageSub.MSG_CHARGE_DEFAULT_ACCOUNT_CREDIT_EMPTY];
                    item.IsValid = false;
                }
                if (item.DebitVat == null)
                {
                    item.DebitVat = -1;
                    item.IsValid = false;
                }
                if(item.CreditVat == null)
                {
                    item.CreditVat = -1;
                    item.IsValid = false;
                }
            });
            return list;
        }

        public HandleState Import(List<CatChargeDefaultAccountImportModel> data)
        {
            try
            {
                eFMSDataContext dc = (eFMSDataContext)DataContext.DC;
                foreach(var item in data)                {
                    var charge = dc.CatCharge.FirstOrDefault(x => x.Code == item.ChargeCode);
                    var listChargeDefaultAcc = dc.CatChargeDefaultAccount.Where(x => x.ChargeId == charge.Id).ToList();
                    var defaultAccount = new CatChargeDefaultAccount
                    {
                        ChargeId = charge.Id,
                        Inactive = (item.Status==null)?false:item.Status.ToString().ToLower() == "active" ? false : true,
                        UserCreated = ChangeTrackerHelper.currentUser,
                        DatetimeCreated = DateTime.Now,                        
                        Type = item.Type,
                        DebitAccountNo = item.DebitAccountNo,
                        CreditAccountNo = item.CreditAccountNo,
                        DebitVat = item.DebitVat,
                        CreditVat = item.CreditVat                        
                    };
                    foreach(var acc in listChargeDefaultAcc)
                    {
                        if (acc.Type != defaultAccount.Type)
                        {
                            dc.CatChargeDefaultAccount.Add(defaultAccount);
                        }
                    }
                }
                dc.SaveChanges();
                return new HandleState();
            }
            catch(Exception ex)
            {
                return new HandleState(ex.Message);
            }
            
        }

 
    }
}
