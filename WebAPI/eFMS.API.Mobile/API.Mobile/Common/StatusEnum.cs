﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Mobile.Common
{
    public class StatusEnum
    {
        public enum StageStatus
        {
            Overdued = 1,
            WillOverdue = 2,
            Processing = 3,
            InSchedule = 4,
            Pending = 5,
            Done = 6
        }

        public enum CommentType
        {
            Progressing = 1,
            Pending = 2,
            Done = 3
        }

        public enum JobStatus
        {
            Overdued = 1,
            WillOverDue = 2,
            Processing = 3,
            NotStart = 4,
            Pending = 5,
            Finish = 6,
            Canceled = 7
        }
        public enum JobStatusSearch
        {
            All = 0,
            InProgess = 1,
            Finish = 2
        }
    }
}
