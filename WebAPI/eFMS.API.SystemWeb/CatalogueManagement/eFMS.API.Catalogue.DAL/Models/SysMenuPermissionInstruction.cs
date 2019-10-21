﻿using System;
using System.Collections.Generic;

namespace eFMS.API.Catalogue.Service.Models
{
    public partial class SysMenuPermissionInstruction
    {
        public short Id { get; set; }
        public string MenuId { get; set; }
        public short PermissionId { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public string UserModified { get; set; }
        public DateTime? DatetimeModified { get; set; }
        public bool? Active { get; set; }
        public DateTime? InActiveOn { get; set; }
    }
}
