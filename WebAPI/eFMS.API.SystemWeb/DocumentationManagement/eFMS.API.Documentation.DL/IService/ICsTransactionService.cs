﻿using eFMS.API.Common;
using eFMS.API.Common.Globals;
using eFMS.API.Documentation.DL.Models;
using eFMS.API.Documentation.DL.Models.Criteria;
using eFMS.API.Documentation.Service.Models;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using System;
using System.Collections.Generic;
using System.Linq;

namespace eFMS.API.Documentation.DL.IService
{
    public interface ICsTransactionService : IRepositoryBase<CsTransaction, CsTransactionModel>
    {
        IQueryable<CsTransactionModel> Query(CsTransactionCriteria criteria);
        List<CsTransactionModel> Paging(CsTransactionCriteria criteria, int page, int size, out int rowsCount);
        CsTransactionModel GetById(Guid id);
        object AddCSTransaction(CsTransactionEditModel model);
        ResultHandle ImportCSTransaction(CsTransactionEditModel model);
        HandleState UpdateCSTransaction(CsTransactionEditModel model);
        bool CheckAllowDelete(Guid jobId);
        HandleState DeleteCSTransaction(Guid jobId);
        HandleState SoftDeleteJob(Guid jobId);
        List<object> GetListTotalHB(Guid JobId);
        Crystal PreviewSIFFormPLsheet(Guid jobId, string currency);
    }
}
