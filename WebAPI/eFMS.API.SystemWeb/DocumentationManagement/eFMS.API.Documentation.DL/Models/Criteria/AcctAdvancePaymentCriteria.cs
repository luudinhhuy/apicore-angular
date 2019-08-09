﻿using System;
using System.Collections.Generic;

namespace eFMS.API.Documentation.DL.Models.Criteria
{
    public class AcctAdvancePaymentCriteria
    {
        public List<string> ReferenceNos { get; set; }
        public string Requester { get; set; }        
        public DateTime? RequestDateFrom { get; set; }
        public DateTime? RequestDateTo { get; set; }
        public DateTime? AdvanceModifiedDateFrom { get; set; }
        public DateTime? AdvanceModifiedDateTo { get; set; }
        public string PaymentMethod { get; set; }
        public string StatusApproval { get; set; }
        public string StatusPayment { get; set; }
    }
}
