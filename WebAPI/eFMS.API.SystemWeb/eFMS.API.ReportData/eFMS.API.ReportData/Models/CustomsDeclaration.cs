﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace eFMS.API.ReportData.Models
{
    public class CustomsDeclaration
    {
        public string CleareanceNo { get; set; }
        public string Type { get; set; }
        public string GatewayName { get; set; }
        public string CustomerName { get; set; }
        public string ImportCountryName { get; set; }
    }
}
