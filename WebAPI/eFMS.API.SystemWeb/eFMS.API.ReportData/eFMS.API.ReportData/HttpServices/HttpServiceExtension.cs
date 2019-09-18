﻿using eFMS.API.ReportData.Models;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace eFMS.API.ReportData.HttpServices
{
    public static class HttpServiceExtension
    {
        public async static Task<HttpResponseMessage> GetDataFromApi(Object obj, string url)
        {
            try
            {
                HttpClient client = new HttpClient();
                // Add an Accept header for JSON format.
                client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
                string json = JsonConvert.SerializeObject(obj, Formatting.Indented);
                var content = new StringContent(json.ToString(), Encoding.UTF8, "application/json");
                HttpResponseMessage response = await client.PostAsync(url, content);
                return response;
            }
            catch(Exception ex)
            {

            }
            return null;
        }
    }
}
