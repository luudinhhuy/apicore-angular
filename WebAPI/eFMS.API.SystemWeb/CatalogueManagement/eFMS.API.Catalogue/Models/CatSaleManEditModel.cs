﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace eFMS.API.Catalogue.Models
{
    public class CatSaleManEditModel
    {
        public string Id { get; set; }
        public string Saleman_EN { get; set; }
        public string Office { get; set; }
        public string Company { get; set; }
        public bool? Status { get; set; }
        public string PartnerId { get; set; }
    }
}
