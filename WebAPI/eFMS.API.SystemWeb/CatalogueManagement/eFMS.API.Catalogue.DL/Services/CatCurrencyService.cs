﻿using AutoMapper;
using eFMS.API.Catalogue.DL.Helpers;
using eFMS.API.Catalogue.DL.IService;
using eFMS.API.Catalogue.DL.Models;
using eFMS.API.Catalogue.DL.Models.Criteria;
using eFMS.API.Catalogue.Service.Models;
using eFMS.API.Common.Globals;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;


namespace eFMS.API.Catalogue.DL.Services
{
    public class CatCurrencyService : RepositoryBase<CatCurrency, CatCurrencyModel>, ICatCurrencyService
    {
        private readonly IMongoDatabase mongodb;
        public CatCurrencyService(IContextBase<CatCurrency> repository, IMapper mapper) : base(repository, mapper)
        {
            mongodb = MongoDbHelper.GetDatabase();
            SetChildren<CatCharge>("Id", "CurrencyId");
            SetChildren<CatCurrencyExchange>("Id", "CurrencyFromId");
            SetChildren<CatCurrencyExchange>("Id", "CurrencyToId");
        }

        public HandleState AddNew(CatCurrencyModel model)
        {
            var result = Add(model);
            if (result.Success)
            {
                MongoDbHelper.Insert("catCurrency", new { id = Guid.NewGuid(), currency = model, actionType = Crud.Insert, DatetimeModified = DateTime.Now });
            }
            return result;
        }

        public List<CatCurrency> Paging(CatCurrrencyCriteria criteria, int pageNumber, int pageSize, out int rowsCount)
        {
            var list = Query(criteria);
            rowsCount = list.Count;
            if (pageSize > 1)
            {
                if (pageNumber < 1)
                {
                    pageNumber = 1;
                }
                list = list.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            }
            return list;
        }


        public List<CatCurrency> Query(CatCurrrencyCriteria criteria)
        {
            var list = DataContext.Get();
            if (criteria.All == null)
            {
                list = list.Where(x => ((x.Id ?? "").IndexOf(criteria.Id ?? "", StringComparison.OrdinalIgnoreCase) >= 0)
                && ((x.CurrencyName ?? "").IndexOf(criteria.CurrencyName ?? "", StringComparison.OrdinalIgnoreCase) >= 0));              
            }
            else
            {

                list = list.Where(x => ((x.Id ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) >= 0)
                || ((x.CurrencyName ?? "").IndexOf(criteria.All ?? "", StringComparison.OrdinalIgnoreCase) >= 0));
            }
            return list.ToList();
        }

        public HandleState Update(CatCurrencyModel model)
        {
            var result = Update(model, x => x.Id == model.Id);
            MongoDbHelper.Insert("catCurrency", new { id = Guid.NewGuid(), currency = model, actionType = Crud.Update, DatetimeModified = DateTime.Now });
            if (result.Success)
            {
                if (model.IsDefault)
                {
                    var listDefaults = DataContext.Get(x => x.Id != model.Id && x.IsDefault == true);
                    foreach (var item in listDefaults)
                    {
                        item.IsDefault = false;
                        DataContext.DC.Update(item);
                        MongoDbHelper.Insert("catCurrency", new { id = Guid.NewGuid(), currency = item, actionType = Crud.Update, DatetimeModified = DateTime.Now });
                    }
                    ((eFMSDataContext)DataContext.DC).SaveChanges();
                }
            }
            return result;
        }
    }
}
