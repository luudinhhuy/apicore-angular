﻿using eFMSWindowService.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using System.Timers;

namespace eFMSWindowService
{
    public partial class UpdateExchangeRate : ServiceBase
    {
        Timer _aTimer;
        DateTime _scheduleTime;

        public UpdateExchangeRate()
        {
            InitializeComponent();
            _aTimer = new System.Timers.Timer(30000);
            _scheduleTime = DateTime.Today.AddDays(1);
        }
        public void Start()
        {
            _aTimer.Start();
            _aTimer.Enabled = true;
            double tillNextInterval = _scheduleTime.Subtract(DateTime.Now).TotalSeconds * 1000;
            if (tillNextInterval < 0) tillNextInterval += new TimeSpan(24, 0, 0).TotalSeconds * 1000;
            _aTimer.Interval = tillNextInterval;
            _aTimer.Elapsed += _aTimer_Elapsed;
        }
        //Custom method to Stop the timer
        public new void Stop()
        {
            WriteToFile("Service update exchange rate is stopped at " + DateTime.Now);
            _aTimer.Stop();
            _aTimer.Dispose();
        }
        private void _aTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            WriteToFile("Service update exchange rate is recall at " + DateTime.Now);
            eFMSTestEntities db = new eFMSTestEntities();
            var newestExchanges = db.vw_catCurrencyExchangeNewest;
            foreach (var item in newestExchanges)
            {
                if (item.DatetimeCreated.Value.Date < DateTime.Now.Date)
                {
                    var exchange = new catCurrencyExchange
                    {
                        CurrencyFromID = item.CurrencyFromID,
                        DatetimeCreated = DateTime.Now.Date,
                        DatetimeModified = DateTime.Now.Date,
                        UserCreated = "system",
                        UserModified = "system",
                        Rate = item.Rate,
                        Active = true,
                        CurrencyToID = item.CurrencyToID
                    };
                    db.catCurrencyExchanges.Add(exchange);
                }
            }
            db.SaveChanges();
        }

        protected override void OnStart(string[] args)
        {
            WriteToFile("Service update exchange rate is started at " + DateTime.Now);
            this.Start();
        }

        protected override void OnStop()
        {
            this.Stop();
        }
        public void WriteToFile(string Message)
        {
            string path = AppDomain.CurrentDomain.BaseDirectory + "\\Logs";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            string filepath = AppDomain.CurrentDomain.BaseDirectory + "\\Logs\\ServiceLog_" + DateTime.Now.Date.ToShortDateString().Replace('/', '_') + ".txt";
            if (!File.Exists(filepath))
            {
                // Create a file to write to.   
                using (StreamWriter sw = File.CreateText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
            else
            {
                using (StreamWriter sw = File.AppendText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
        }
    }
}
