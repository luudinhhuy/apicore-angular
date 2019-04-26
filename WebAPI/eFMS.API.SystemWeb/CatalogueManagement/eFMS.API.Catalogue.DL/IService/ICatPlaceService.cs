﻿using eFMS.API.Catalogue.DL.Models;
using eFMS.API.Catalogue.DL.Models.Criteria;
using eFMS.API.Catalogue.DL.ViewModels;
using eFMS.API.Catalogue.Service.Models;
using eFMS.API.Catalogue.Service.ViewModels;
using eFMS.API.Common.Globals;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eFMS.API.Catalogue.DL.IService
{
    public interface ICatPlaceService : IRepositoryBase<CatPlace, CatPlaceModel>
    {
        IQueryable<vw_catPlace> Query(CatPlaceCriteria criteria);
        List<CatPlaceViewModel> GetBy(CatPlaceTypeEnum placeType, string modeOfTransport, bool? inactive);
        List<CatPlaceViewModel> Paging(CatPlaceCriteria criteria, int page, int size, out int rowsCount);
        List<vw_catProvince> GetProvinces(short? countryId);
        List<vw_catDistrict> GetDistricts(Guid? provinceId);
        List<ModeOfTransport> GetModeOfTransport();
        List<CatPlaceImportModel> CheckValidImport(List<CatPlaceImportModel> list, CatPlaceTypeEnum placeType);
        HandleState Import(List<CatPlaceImportModel> data);
        //HandleState Add(CatPlaceModel model);
        HandleState Update(CatPlaceModel model);
        HandleState Delete(Guid id);
    }
}
