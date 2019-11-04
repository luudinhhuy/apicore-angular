﻿using AutoMapper;
using eFMS.API.Common;
using eFMS.API.Common.Globals;
using eFMS.API.System.DL.Common;
using eFMS.API.System.DL.IService;
using eFMS.API.System.DL.Models;
using eFMS.API.System.DL.Models.Criteria;
using eFMS.API.System.DL.ViewModels;
using eFMS.API.System.Service.Models;
using eFMS.IdentityServer.DL.UserManager;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using ITL.NetCore.Connection.EF;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;

namespace eFMS.API.System.DL.Services
{
    public class SysPermissionSampleService : RepositoryBase<SysPermissionSample, SysPermissionSampleModel>, ISysPermissionSampleService
    {
        private readonly IContextBase<SysRole> roleRepository;
        private readonly ISysPermissionSampleGeneralService permissionSampleGeneralService;
        private readonly IContextBase<SysPermissionSampleGeneral> permissioSampleGeneralRepository;
        private readonly ISysPermissionSampleSpecialService permissionSampleSpecialService;
        private readonly IContextBase<SysPermissionSampleSpecial> permissioSampleSpecialRepository;
        private readonly IStringLocalizer stringLocalizer;
        private readonly ICurrentUser currentUser;

        public SysPermissionSampleService(IContextBase<SysPermissionSample> repository, 
            IMapper mapper, 
            IContextBase<SysRole> roleRepo,
            ISysPermissionSampleGeneralService perSampleGeneralService,
            IContextBase<SysPermissionSampleGeneral> permissionSampleGeneralRepo,
            ISysPermissionSampleSpecialService perSampleSpecialService,
            IContextBase<SysPermissionSampleSpecial> permissioSampleSpecialRepo,
            IStringLocalizer<LanguageSub> localizer,
            ICurrentUser currUser) : base(repository, mapper)
        {
            roleRepository = roleRepo;
            permissionSampleGeneralService = perSampleGeneralService;
            permissioSampleGeneralRepository = permissionSampleGeneralRepo;
            permissionSampleSpecialService = perSampleSpecialService;
            permissioSampleSpecialRepository = permissioSampleSpecialRepo;
            stringLocalizer = localizer;
            currentUser = currUser;
        }

        public SysPermissionSampleModel GetBy(Guid? id)
        {
            var data = DataContext.Get(x => x.Id == id).FirstOrDefault();
            var result = new SysPermissionSampleModel();
            if (data != null)
            {
                result = mapper.Map<SysPermissionSampleModel>(data);
            }
            result.SysPermissionSampleGenerals = permissionSampleGeneralService.GetBy(id);
            result.SysPermissionSampleSpecials = permissionSampleSpecialService.GetBy(id);
            return result;
        }

        public IQueryable<SysPermissionSampleModel> Query(SysPermissionGeneralCriteria criteria)
        {
            IQueryable<SysPermissionSample> data = null;
            data = DataContext.Get(x => (x.Name ?? "").IndexOf(criteria.Name ?? "", StringComparison.OrdinalIgnoreCase) > -1
                                && (x.RoleId == criteria.RoleId || criteria.RoleId == null)
                                && (x.Active == criteria.Active || criteria.Active == null)
                            );
            if (data == null) return null;
            var roles = roleRepository.Get();
            var results = data.Join(roles, x => x.RoleId, y => y.Id, (x, y) => new SysPermissionSampleModel {
                                    Id = x.Id,
                                    Name = x.Name,
                                    RoleId = x.RoleId,
                                    Type = x.Type,
                                    Active = x.Active,
                                    RoleName = y.Name
                                    });
            return results;
        }

        public override HandleState Add(SysPermissionSampleModel entity)
        {
            var permision = mapper.Map<SysPermissionSample>(entity);
            permision.UserCreated = currentUser.UserID;
            permision.DatetimeCreated = permision.DatetimeModified = DateTime.Now;
            permision.Id = Guid.NewGuid();
            var result = DataContext.Add(permision, false);
            if (result.Success)
            {
                foreach(var item in entity.SysPermissionSampleGenerals)
                {
                    var listGeneral = mapper.Map<List<SysPermissionSampleGeneral>>(item.SysPermissionGenerals);
                    foreach(var general in listGeneral)
                    {
                        general.PermissionId = permision.Id;
                        permissioSampleGeneralRepository.Add(general, false);
                    }
                }
                foreach (var item in entity.SysPermissionSampleSpecials)
                {
                    foreach (var per in item.SysPermissionSpecials)
                    {
                        foreach (var s in per.PermissionSpecialActions)
                        {
                            var peritem = new SysPermissionSampleSpecial
                            {
                                Id = s.Id,
                                IsAllow = s.IsAllow,
                                MenuId = s.MenuId,
                                ModuleId = s.ModuleId,
                                ActionName = s.NameEn,
                                PermissionId = permision.Id
                            };
                            permissioSampleSpecialRepository.Add(peritem, false);
                        }
                    }
                }
                permissioSampleSpecialRepository.SubmitChanges();
                DataContext.SubmitChanges();
                permissioSampleGeneralRepository.SubmitChanges();
            }
            return result;
        }

        public HandleState Update(SysPermissionSampleModel entity)
        {
            var permission = mapper.Map<SysPermissionSample>(entity);
            permission.UserModified = currentUser.UserID;
            permission.DatetimeModified = DateTime.Now;
            var result = DataContext.Update(permission, x => x.Id == entity.Id, false);
            if (result.Success)
            {
                foreach(var item in entity.SysPermissionSampleGenerals)
                {
                    var list = mapper.Map<List<SysPermissionSampleGeneral>>(item.SysPermissionGenerals);
                    foreach(var general in list)
                    {
                        general.UserModified = currentUser.UserID;
                        permissioSampleGeneralRepository.Update(general, x => x.Id == general.Id, false);
                    }
                }
                foreach(var item in entity.SysPermissionSampleSpecials)
                {
                    foreach(var per in item.SysPermissionSpecials)
                    {
                        foreach(var s in per.PermissionSpecialActions)
                        {
                            if(s.Id == 0)
                            {
                                var peritem = mapper.Map<SysPermissionSampleSpecial>(s);
                                peritem.Id = s.Id;
                                peritem.IsAllow = s.IsAllow;
                                peritem.MenuId = s.MenuId;
                                peritem.ModuleId = s.ModuleId;
                                peritem.ActionName = s.NameEn;
                                peritem.PermissionId = entity.Id;
                                permissioSampleSpecialRepository.Add(peritem, false);
                            }
                            else
                            {
                                var peritem = permissioSampleSpecialRepository.First(x => x.Id == s.Id);
                                peritem.IsAllow = s.IsAllow;
                                peritem.UserModified = currentUser.UserID;
                                var t = permissioSampleSpecialRepository.Update(peritem, x => x.Id == s.Id, false);
                            }
                        }
                    }
                }
                DataContext.SubmitChanges();
                permissioSampleGeneralRepository.SubmitChanges();
                permissioSampleSpecialRepository.SubmitChanges();
            }
            return result;
        }

        public HandleState Delete(Guid id)
        {
            try
            {
                var hs = DataContext.Delete(x => x.Id == id, false);
                if (hs.Success)
                {
                    var perGenerals = permissioSampleGeneralRepository.Get(x => x.PermissionId == id);
                    foreach(var item in perGenerals)
                    {
                        permissioSampleGeneralRepository.Delete(x => x.Id == item.Id, false);
                    }
                    var perSpecials = permissioSampleSpecialRepository.Get(x => x.PermissionId == id);
                    foreach(var item in perSpecials)
                    {
                        permissioSampleSpecialRepository.Delete(x => x.Id == item.Id, false);
                    }
                    DataContext.SubmitChanges();
                    permissioSampleGeneralRepository.SubmitChanges();
                    permissioSampleSpecialRepository.SubmitChanges();
                }
                return hs;
            }
            catch (Exception ex)
            {
                var hs = new HandleState(ex.Message);
                return hs;
            }
        }

        public List<Common.CommonData> GetLevelPermissions()
        {
            var results = new List<Common.CommonData>
            {
                new Common.CommonData { Value = "Owner", DisplayName = "Owner" },
                new Common.CommonData { Value = "Group", DisplayName = "Group" },
                new Common.CommonData { Value = "Department", DisplayName = "Department" },
                new Common.CommonData { Value = "Office", DisplayName = "Office" },
                new Common.CommonData { Value = "Company", DisplayName = "Company" },
                new Common.CommonData { Value = "All", DisplayName = "All"}
            };
            return results;
        }
    }
}
