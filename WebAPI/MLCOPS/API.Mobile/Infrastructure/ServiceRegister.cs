﻿using API.Mobile.Repository;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Mobile.Infrastructure
{
    public static class ServiceRegister
    {
        public static void Register(IServiceCollection services)
        {
            services.AddTransient<IStageRepository, StageRepositoryImpl>();
            services.AddTransient<ICommentRepository, CommentRepositoryImpl>();
            services.AddTransient<IJobRepository, JobRepositoryImpl>();
        }
    }
}
