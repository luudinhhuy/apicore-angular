﻿using AutoMapper;
using eFMS.API.Documentation.DL.IService;
using eFMS.API.Documentation.DL.Models;
using eFMS.API.Documentation.Service.Models;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using System;
using System.Collections.Generic;
using System.Text;
using System.Linq;
using ITL.NetCore.Common;
using eFMS.API.Common.Globals;
using eFMS.API.Documentation.DL.Models.ReportResults;
using eFMS.API.Documentation.Service.Contexts;

namespace eFMS.API.Documentation.DL.Services
{
    public class CsShippingInstructionService : RepositoryBase<CsShippingInstruction, CsShippingInstructionModel>, ICsShippingInstructionService
    {
        private readonly IContextBase<CatPartner> partnerRepository;
        private readonly IContextBase<CatPlace> placeRepository;
        private readonly IContextBase<SysUser> userRepository;
        public CsShippingInstructionService(IContextBase<CsShippingInstruction> repository, 
            IMapper mapper,
            IContextBase<CatPartner> partnerRepo,
            IContextBase<CatPlace> placeRepo,
            IContextBase<SysUser> userRepo) : base(repository, mapper)
        {
            partnerRepository = partnerRepo;
            placeRepository = placeRepo;
            userRepository = userRepo;
        }

        public HandleState AddOrUpdate(CsShippingInstructionModel model)
        {
            var result = new HandleState();
            var modelUpdate = mapper.Map<CsShippingInstruction>(model);
            if(DataContext.Any(x => x.JobId == model.JobId))
            {
                result = DataContext.Update(modelUpdate, x => x.JobId == model.JobId);
            }
            else
            {
                result = DataContext.Add(modelUpdate);
            }
            return result;
        }

        public CsShippingInstructionModel GetById(Guid jobId)
        {
            var result = Get(x => x.JobId == jobId).FirstOrDefault();
            if (result == null) return null;
            var partners = partnerRepository.Get();
            var places = placeRepository.Get();
            var users = userRepository.Get();
            result.IssuedUserName = users?.FirstOrDefault(x => x.Id == result.IssuedUser)?.Username;
            result.SupplierName = partners?.FirstOrDefault(x => x.Id == result.Supplier)?.PartnerNameEn;
            result.ConsigneeName = partners?.FirstOrDefault(x => x.Id == result.ConsigneeId)?.PartnerNameEn;
            result.PolName = places?.FirstOrDefault(x => x.Id == result.Pol)?.NameEn;
            result.PodName = places?.FirstOrDefault(x => x.Id == result.Pod)?.NameEn;
            result.ActualShipperName = partners?.FirstOrDefault(x => x.Id == result.ActualShipperId)?.PartnerNameEn;
            result.ActualConsigneeName = partners?.FirstOrDefault(x => x.Id == result.ActualConsigneeId)?.PartnerNameEn;
            return result;
        }
        public Crystal PreviewFCLShippingInstruction(CsShippingInstructionReportModel model)
        {
            Crystal result = new Crystal();
            var instructions = new List<SeaShippingInstruction>();
            var parameter = new SeaShippingInstructionParameter
            {
                CompanyName = "itl",
                CompanyAddress1 = "52 Trường Sơn",
                CompanyAddress2 = "54 Trường Sơn",
                CompanyDescription = "itl company",
                Contact = model.IssuedUserName,
                Tel = string.Empty,
                Website = string.Empty,
                DecimalNo = 2
            };
            if (model.CsTransactionDetails != null)
            {
                foreach(var item in model.CsTransactionDetails)
                {
                    var instruction = new SeaShippingInstruction
                    {
                        Attn = item.NotifyParty,
                        ToPartner = model.SupplierName,
                        Re = model.BookingNo,
                        DatePackage = model.InvoiceDate == null? model.InvoiceDate: null,
                        ShipperDf = model.ActualShipperDescription,
                        GoodsDelivery = model.ConsigneeDescription,
                        NotitfyParty = item.NotifyParty,
                        PortofLoading = model.PolName,
                        PortofDischarge = model.PodName,
                        PlaceDelivery = model.PoDelivery,
                        Vessel = model.VoyNo,
                        Etd = model.LoadingDate?.ToString("dd/MM/yyyy"),
                        ShippingMarks = item.ShippingMark,
                        Containers = item.ContainerNames,
                        ContSealNo = item.OceanVoyNo,
                        NoofPeace = item.PackageContainer,
                        SIDescription = model.GoodsDescription,
                        GrossWeight = (decimal)model?.GrossWeight,
                        CBM = 200,
                        Qty = "200",
                        RateRequest = model.Remark,
                        Payment = model.PaymenType,
                        ShippingMarkImport = string.Empty
                    };
                    instructions.Add(instruction);
                }
            }
            result = new Crystal
            {
                ReportName = "SeaShippingInstructionNew.rpt",
                AllowPrint = true,
                AllowExport = true
            };
            result.AddDataSource(instructions);
            result.FormatType = ExportFormatType.PortableDocFormat;
            //result.AddSubReport("FreightManifest", freightManifests);
            result.SetParameter(parameter);
            return result;
        }

        public Crystal PreviewOCL(CsShippingInstructionReportModel model)
        {
            var result = new Crystal();
            var oclList = new List<OnBoardContainerReportResult>
                {
                    new OnBoardContainerReportResult {
                        POD = model.PodName,
                        POL = model.PolName,
                        VoyNo = model.VoyNo,
                        FDestination = model.PoDelivery
                    }
                };
            var oclContainerList = new List<OCLContainerReportResult>();
            if (model.CsMawbcontainers != null)
            {
                int i = 0;
                foreach (var container in model.CsMawbcontainers)
                {
                    i = i + 1;
                    decimal? cbm = container.Cbm;
                    decimal? gw = container.Gw;
                    var item = new OCLContainerReportResult
                    {
                        STT = i,
                        CBM = cbm != null ? (decimal)cbm : 0,
                        GW = gw != null ? (decimal)gw : 0,
                        ContainerNo = container.ContainerNo,
                        SealNo = container.SealNo
                    };
                    oclContainerList.Add(item);
                }
            }
            result.ReportName = "rptOnBoardContainerList.rpt";
            result.AddDataSource(oclList);
            result.FormatType = ExportFormatType.PortableDocFormat;
            result.AddSubReport("OnBoardContainerList", oclContainerList);
            return result;
        }
    }
}
