﻿using eFMS.IdentityServer.DL.IService;
using IdentityModel;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace eFMS.IdentityServer
{
    public class ProfileService : IProfileService
    {
        private IAuthenUserService authenUserService;
        public ProfileService(IAuthenUserService service)
        {
            authenUserService = service;
        }
        public Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            var subjectId = context.Subject.GetSubjectId();
            var user = authenUserService.GetUserById(subjectId);

            var claims = new List<Claim>
                {
                    new Claim(JwtClaimTypes.Subject, user.Id.ToString()),
                    new Claim(JwtClaimTypes.Email, user.Email),
                    new Claim(JwtClaimTypes.EmailVerified, "true", ClaimValueTypes.Boolean)
                };

            context.IssuedClaims = claims;
            return Task.FromResult(0);
        }

        public Task IsActiveAsync(IsActiveContext context)
        {
            var user = authenUserService.GetUserById(context.Subject.GetSubjectId());
            context.IsActive = (user != null);// && !user.InActive;
            return Task.FromResult(0);
        }
    }
}
