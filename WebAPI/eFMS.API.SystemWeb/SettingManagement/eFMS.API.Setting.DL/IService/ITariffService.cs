﻿using eFMS.API.Setting.DL.Models;
using eFMS.API.Setting.DL.Models.Criteria;
using eFMS.API.Setting.Service.Models;
using ITL.NetCore.Connection.BL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace eFMS.API.Setting.DL.IService
{
    public interface ITariffService :  IRepositoryBase<SetTariff, SetTariffModel>
    {
        List<TariffViewModel> Query(TariffCriteria tariff);
        IQueryable<TariffViewModel> Paging(TariffCriteria criteria, int pageNumber, int pageSize, out int rowsCount);

    }
}
