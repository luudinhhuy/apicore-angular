﻿using eFMS.API.Operation.DL.Common;
using eFMS.API.Operation.DL.Models;
using eFMS.API.Operation.Service.Models;
using eFMS.API.Provider.Models;
using ITL.NetCore.Common;
using ITL.NetCore.Connection.BL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace eFMS.API.Operation.DL.IService
{
    public interface IOpsStageAssignedService : IRepositoryBase<OpsStageAssigned, OpsStageAssignedModel>
    {
        OpsStageAssignedModel GetBy(Guid id);
        List<OpsStageAssignedModel> GetByJob(Guid jobId);
        List<OpsStageAssignedModel> GetNotAssigned(Guid jobId);
        HandleState AddMultipleStage(List<OpsStageAssignedEditModel> models, Guid jobId);
        HandleState Update(OpsStageAssignedEditModel model);
    }
}
