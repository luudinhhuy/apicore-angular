﻿using System;
using System.Collections.Generic;
using System.Text;
using eFMS.API.Setting.Service.Models;

namespace eFMS.API.Setting.DL.Models
{
    public class SetEcusConnectionModel : SetEcusconnection
    {
        public string username { get; set; }
        public string fullname { get; set; }
        public string userCreatedName { get; set; }
        public string userModifiedName { get; set; }

    }
}
