﻿using System;

namespace eFMS.API.Catalogue.Service.Models
{
    public partial class CatSaleMan
    {
        public CatSaleMan()
        {
            
        }
        public string Id { get; set; }
        public string Saleman_EN { get; set; }
        public string Office { get; set; }
        public string Company { get; set; }
        public bool? Status { get; set; }
        public string PartnerId { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
