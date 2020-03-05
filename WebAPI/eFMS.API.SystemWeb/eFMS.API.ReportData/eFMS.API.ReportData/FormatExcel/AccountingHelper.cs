﻿using eFMS.API.Common.Globals;
using eFMS.API.ReportData.Models;
using eFMS.API.ReportData.Models.Accounting;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;

namespace eFMS.API.ReportData.FormatExcel
{
    /// <summary>
    /// Accountant
    /// </summary>
    public class AccountingHelper
    {
        const double minWidth = 0.00;
        const double maxWidth = 500.00;
        const string numberFormat = "_-* #,##0.00_-;-* #,##0.00_-;_-* \"-\"??_-;_-@_-";

        /// <summary>
        /// Generate advance payment excel
        /// </summary>
        /// <param name="listObj"></param>
        /// <param name="stream"></param>
        /// <returns></returns>
        public Stream GenerateAdvancePaymentExcel(List<AdvancePaymentModel> listObj, Stream stream = null)
        {
            List<string> headers = new List<string>()
            {
                "No",
                "Advance No",
                "Amount",
                "Currency",
                "Requester",
                "Request Date",
                "Deadline Date",
                "Modified Date",
                "Status Approval",
                "Status Payment",
                "Payment Menthod",
                "Description"
            };
            try
            {
                int addressStartContent = 4;
                using (var excelPackage = new ExcelPackage(stream ?? new MemoryStream()))
                {
                    excelPackage.Workbook.Worksheets.Add("Advance Payment");
                    var worksheet = excelPackage.Workbook.Worksheets[1];

                    BuildHeader(worksheet, headers, "ADVANCE PAYMENT INFORMATION");

                    for (int i = 0; i < listObj.Count; i++)
                    {
                        var item = listObj[i];
                        worksheet.Cells[i + addressStartContent, 1].Value = i + 1;
                        worksheet.Cells[i + addressStartContent, 2].Value = item.AdvanceNo;
                        worksheet.Cells[i + addressStartContent, 3].Value = item.Amount;
                        worksheet.Cells[i + addressStartContent, 4].Value = item.AdvanceCurrency;
                        worksheet.Cells[i + addressStartContent, 5].Value = item.RequesterName;
                        worksheet.Cells[i + addressStartContent, 6].Value = item.RequestDate.HasValue ? item.RequestDate.Value.ToString("dd/MM/yyyy") : "";
                        worksheet.Cells[i + addressStartContent, 7].Value = item.DeadlinePayment.HasValue ? item.DatetimeModified.Value.ToString("dd/MM/yyyy") : "";
                        worksheet.Cells[i + addressStartContent, 8].Value = item.DatetimeModified.HasValue ? item.DatetimeModified.Value.ToString("dd/MM/yyyy") : "";
                        worksheet.Cells[i + addressStartContent, 9].Value = item.StatusApprovalName;
                        worksheet.Cells[i + addressStartContent, 10].Value = item.AdvanceStatusPayment.Equals("Settled") ? "Settled" : (item.AdvanceStatusPayment.Equals("NotSettled") ? "Not Settled" : "Partial Settlement");
                        worksheet.Cells[i + addressStartContent, 11].Value = item.PaymentMethodName;
                        worksheet.Cells[i + addressStartContent, 12].Value = item.AdvanceNote;

                        //Add border left right for cells
                        AddBorderLeftRightCell(worksheet, headers, addressStartContent, i);

                        //Add border bottom for last cells
                        AddBorderBottomLastCell(worksheet, headers, addressStartContent, i, listObj.Count);
                    }

                    excelPackage.Save();
                    return excelPackage.Stream;
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        /// <summary>
        /// Generate settlement payment excel
        /// </summary>
        /// <param name="listObj"></param>
        /// <param name="stream"></param>
        /// <returns></returns>
        public Stream GenerateSettlementPaymentExcel(List<SettlementPaymentModel> listObj, Stream stream = null)
        {
            List<string> headers = new List<string>()
            {
                "No",
                "Settlement No",
                "Amount",
                "Currency",
                "Requester",
                "Request Date",
                "Status Approval",
                "Payment Menthod",
                "Description"
            };
            try
            {
                int addressStartContent = 4;
                using (var excelPackage = new ExcelPackage(stream ?? new MemoryStream()))
                {
                    excelPackage.Workbook.Worksheets.Add("Settlement Payment");
                    var worksheet = excelPackage.Workbook.Worksheets[1];

                    BuildHeader(worksheet, headers, "SETTLEMENT PAYMENT INFORMATION");

                    for (int i = 0; i < listObj.Count; i++)
                    {
                        var item = listObj[i];
                        worksheet.Cells[i + addressStartContent, 1].Value = i + 1;
                        worksheet.Cells[i + addressStartContent, 2].Value = item.SettlementNo;
                        worksheet.Cells[i + addressStartContent, 3].Value = item.Amount;
                        worksheet.Cells[i + addressStartContent, 4].Value = item.SettlementCurrency;
                        worksheet.Cells[i + addressStartContent, 5].Value = item.RequesterName;
                        worksheet.Cells[i + addressStartContent, 6].Value = item.RequestDate.HasValue ? item.RequestDate.Value.ToString("dd/MM/yyyy") : "";
                        worksheet.Cells[i + addressStartContent, 7].Value = item.StatusApprovalName;
                        worksheet.Cells[i + addressStartContent, 8].Value = item.PaymentMethodName;
                        worksheet.Cells[i + addressStartContent, 9].Value = item.Note;

                        //Add border left right for cells
                        AddBorderLeftRightCell(worksheet, headers, addressStartContent, i);

                        //Add border bottom for last cells
                        AddBorderBottomLastCell(worksheet, headers, addressStartContent, i, listObj.Count);
                    }

                    excelPackage.Save();
                    return excelPackage.Stream;
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        private void AddBorderBottomLastCell(ExcelWorksheet worksheet, List<string> headers, int addressStartContent, int indexDataRow, int totalItem)
        {
            if (indexDataRow == totalItem - 1)
            {
                for (int j = 0; j < headers.Count; j++)
                {
                    worksheet.Cells[indexDataRow + addressStartContent, j + 1].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                }
            }
        }

        private void AddBorderLeftRightCell(ExcelWorksheet worksheet, List<string> headers, int addressStartContent, int indexDataRow)
        {
            for (int j = 0; j < headers.Count; j++)
            {
                worksheet.Cells[indexDataRow + addressStartContent, j + 1].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                worksheet.Cells[indexDataRow + addressStartContent, j + 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
            }
        }

        /// <summary>
        /// Build header
        /// </summary>
        /// <param name="worksheet"></param>
        /// <param name="headers"></param>
        /// <param name="title"></param>
        public void BuildHeader(ExcelWorksheet worksheet, List<String> headers, string title)
        {
            worksheet.Cells[1, 1, 1, headers.Count].Merge = true;
            worksheet.Cells["A1"].Value = title;
            worksheet.Cells["A1"].Style.Font.Size = 16;
            worksheet.Cells["A1"].Style.Font.Bold = true;
            worksheet.Cells["A1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Cells["A1"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            // Tạo header
            for (int i = 0; i < headers.Count; i++)
            {
                worksheet.Cells[3, i + 1].Value = headers[i];

                //worksheet.Column(i + 1).AutoFit();
                worksheet.Cells[3, i + 1].Style.Border.Top.Style = ExcelBorderStyle.Thin;
                worksheet.Cells[3, i + 1].Style.Border.Left.Style = ExcelBorderStyle.Thin;
                worksheet.Cells[3, i + 1].Style.Border.Right.Style = ExcelBorderStyle.Thin;
                worksheet.Cells[3, i + 1].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
                worksheet.Cells[3, i + 1].Style.Font.Bold = true;

                worksheet.Cells[3, i + 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                worksheet.Cells[3, i + 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                worksheet.Column(i + 1).Width = 30;
            }
            worksheet.Cells.AutoFitColumns(minWidth, maxWidth);
            worksheet.Cells["A1:Z1"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }

        #region --- ADVANCE PAYMENT ---
        /// <summary>
        /// Generate detail advance payment excel
        /// </summary>
        /// <param name="advanceExport"></param>
        /// <param name="language"></param>
        /// <param name="stream"></param>
        /// <returns></returns>
        public Stream GenerateDetailAdvancePaymentExcel(AdvanceExport advanceExport, string language, Stream stream = null)
        {
            try
            {
                using (var excelPackage = new ExcelPackage(stream ?? new MemoryStream()))
                {
                    string sheetName = language == "VN" ? "(V)" : "(E)";
                    excelPackage.Workbook.Worksheets.Add("Đề nghị tạm ứng " + sheetName);
                    var workSheet = excelPackage.Workbook.Worksheets[1];
                    BindingDataDetailAdvancePaymentExcel(workSheet, advanceExport, language);
                    excelPackage.Save();
                    return excelPackage.Stream;
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        private void SetWidthColumnExcelDetailAdvancePayment(ExcelWorksheet workSheet)
        {
            workSheet.Column(1).Width = 8; //Cột A
            workSheet.Column(2).Width = 20; //Cột B
            workSheet.Column(3).Width = 30; //Cột C
            workSheet.Column(4).Width = 20; //Cột D
            workSheet.Column(5).Width = 15; //Cột E
            workSheet.Column(8).Width = 15; //Cột H
            workSheet.Column(9).Width = 20; //Cột I
            workSheet.Column(10).Width = 18; //Cột J
            workSheet.Column(11).Width = 20; //Cột K
        }

        private List<string> GetHeaderExcelDetailAdvancePayment(string language)
        {
            List<string> vnHeaders = new List<string>()
            {
                "INDO TRANS LOGISTICS CORPORATION", //0
                "52-54-65 Truong Son St. Tan Binh Dist. HCM City. Vietnam\nTel: (84-8) 3948 6888  Fax: +84 8 38488 570\nE-mail:\nWebsite: www.itlvn.com", //1
                "PHIẾU ĐỀ NGHỊ TẠM ỨNG", //2
                "Người yêu cầu:", //3
                "Ngày:", //4
                "Bộ phận:", //5
                "STT", //6
                "Thông tin chung", //7
                "Qty", //8
                "Số tiền tạm ứng (VND)", //9
                "Số cont - Loại cont", //10
                "C.W (Kgs)", //11
                "Số kiện\n(Pcs)", //12
                "Số CBM\n(CBM)", //13                
                "Định mức", //14
                "Chi phí có hóa đơn", //15
                "Chi phí khác", //16
                "Tổng cộng", //17
                "Số chứng từ:", //18
                "Số lô hàng:", //19
                "Số tờ khai:", //20
                "Số HBL/HAWB:", //21
                "Số MBL/MAWB:", //22
                "Khách hàng:", //23
                "Công ty/cá nhân xuất:", //24
                "Công ty/cá nhân nhập:", //25
                "Số tiền đề nghị tạm ứng:", //26
                "Số tiền viết bằng chữ:", //27
                "Lý do tạm ứng:", //28
                "Thời hạn thanh toán:", //29
                "Người tạm ứng\n(Ký, ghi rõ họ tên)", //30
                "Người chứng từ\n(Ký, ghi rõ họ tên)", //31
                "Trưởng bộ phận\n(Ký, ghi rõ họ tên)", //32
                "Kế toán\n(Ký, ghi rõ họ tên)", //33
                "Giám đốc\n(Ký, ghi rõ họ tên)" //34
            };

            List<string> engHeaders = new List<string>()
            {
                "INDO TRANS LOGISTICS CORPORATION", //0
                "52-54-65 Truong Son St. Tan Binh Dist. HCM City. Vietnam\nTel: (84-8) 3948 6888  Fax: +84 8 38488 570\nE-mail:\nWebsite: www.itlvn.com", //1
                "ADVANCE REQUEST", //2
                "Employee Name:", //3
                "Date requested:", //4
                "Department:", //5
                "No.", //6
                "Shipment's Information", //7
                "Qty", //8
                "Advance Amount (VND)", //9
                "Con't", //10
                "C.W (Kgs)", //11
                "Packages\n(PCS)", //12
                "CBM", //13                
                "Costs according to tariff", //14
                "Costs with reasonable vouchers", //15
                "Others", //16
                "Total", //17
                "Ref No.:", //18
                "Job ID:", //19
                "Customs Clearance No:", //20
                "HBL/HAWB:", //21
                "MBL/MAWB:", //22
                "Customer:", //23
                "Consigner:", //24
                "Consignee:", //25
                "Total advance amount:", //26
                "In words:", //27
                "Advance Reasons:", //28
                "Due date:", //29
                "Employee\n(Name, Signature)", //30
                "Documentation Staff\n(Name, Signature)", //31
                "Head of Department\n(Name, Signature)", //32
                "Chief Accountant\n(Name, Signature)", //33
                "Director\n(Name, Signature)" //34
            };

            List<string> headers = language == "VN" ? vnHeaders : engHeaders;
            return headers;
        }

        private void BindingDataDetailAdvancePaymentExcel(ExcelWorksheet workSheet, AdvanceExport advanceExport, string language)
        {
            SetWidthColumnExcelDetailAdvancePayment(workSheet);

            using (Image image = Image.FromFile(CrystalEx.GetLogoITL()))
            {
                var excelImage = workSheet.Drawings.AddPicture("Logo", image);
                //add the image to row 1, column B
                excelImage.SetPosition(0, 0, 1, 0);
            }

            List<string> headers = GetHeaderExcelDetailAdvancePayment(language);

            workSheet.Cells["H1:K1"].Merge = true;
            workSheet.Cells["H1"].Value = headers[0];
            workSheet.Cells["H1"].Style.Font.SetFromFont(new Font("Arial Black", 12));
            workSheet.Cells["H1"].Style.Font.Italic = true;
            workSheet.Cells["H2:K2"].Merge = true;
            workSheet.Cells["H2:K2"].Style.WrapText = true;
            workSheet.Cells["H2"].Value = headers[1];
            workSheet.Cells["H2"].Style.Font.SetFromFont(new Font("Microsoft Sans Serif", 10));
            workSheet.Row(2).Height = 60;

            workSheet.Cells[4, 1, 100000, 11].Style.Font.Name = "Times New Roman";

            //Title
            workSheet.Cells["A4:K4"].Merge = true;
            workSheet.Cells["A4"].Value = headers[2]; //Phiếu đề nghị tạm ứng
            workSheet.Cells["A4"].Style.Font.Size = 18;
            workSheet.Cells["A4"].Style.Font.Bold = true;
            workSheet.Cells["A4"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells["A4"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells["A5:B5"].Merge = true;
            workSheet.Cells["A5"].Value = headers[3]; //Người yêu cầu
            workSheet.Cells["A5"].Style.Font.SetFromFont(new Font("Times New Roman", 11));
            workSheet.Cells["A5"].Style.Font.Bold = true;
            workSheet.Cells["C5"].Value = advanceExport.InfoAdvance.Requester;

            workSheet.Cells["J5"].Value = headers[4]; //Ngày
            workSheet.Cells["J5"].Style.Font.Bold = true;
            workSheet.Cells["K5"].Value = advanceExport.InfoAdvance.RequestDate.Value.ToString("dd/MM/yyyy");

            workSheet.Cells["J6"].Value = headers[5]; //Bộ phận
            workSheet.Cells["J6"].Style.Font.Bold = true;
            workSheet.Cells["K6"].Value = advanceExport.InfoAdvance.Department;

            //Bôi đen header
            workSheet.Cells["A8:K9"].Style.Font.Bold = true;

            workSheet.Cells[8, 1, 9, 1].Merge = true;
            workSheet.Cells[8, 1, 9, 1].Value = headers[6];//STT
            workSheet.Cells[8, 1, 9, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[8, 1, 9, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[8, 2, 9, 3].Merge = true;
            workSheet.Cells[8, 2, 9, 3].Value = headers[7];//Thông tin chung
            workSheet.Cells[8, 2, 9, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[8, 2, 9, 3].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[8, 4, 8, 7].Merge = true;
            workSheet.Cells[8, 4, 8, 7].Value = headers[8];//Qty
            workSheet.Cells[8, 4, 8, 7].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[8, 4, 8, 7].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            for (int x = 4; x < 8; x++)
            {
                workSheet.Cells[9, x].Style.WrapText = true;
                workSheet.Cells[9, x].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[9, x].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }
            workSheet.Cells[9, 4].Value = headers[10]; //Số cont - Loại cont           
            workSheet.Cells[9, 5].Value = headers[11]; // C.W           
            workSheet.Cells[9, 6].Value = headers[12]; //Số kiện            
            workSheet.Cells[9, 7].Value = headers[13]; //số CBM

            workSheet.Cells[8, 8, 8, 11].Merge = true;
            workSheet.Cells[8, 8, 8, 11].Value = headers[9];//Số tiến tạm ứng           
            workSheet.Cells[8, 8, 8, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[8, 8, 8, 11].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            for (int x = 8; x < 12; x++)
            {
                workSheet.Cells[9, x].Style.WrapText = true;
                workSheet.Cells[9, x].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[9, x].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }
            workSheet.Cells[9, 8].Value = headers[14]; //Định mức           
            workSheet.Cells[9, 9].Value = headers[15]; // Chi phí có hóa đơn           
            workSheet.Cells[9, 10].Value = headers[16]; //Chi phí khác            
            workSheet.Cells[9, 11].Value = headers[17]; //Tổng cộng

            int p = 10;
            int j = 10;
            for (int i = 0; i < advanceExport.ShipmentsAdvance.Count; i++)
            {
                workSheet.Cells[j, 2].Value = headers[18]; //Số chứng từ
                workSheet.Cells[j, 3].Value = advanceExport.InfoAdvance.AdvanceNo;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[19]; //Số lô hàng
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].JobNo;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[20]; //Số tờ khai
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].CustomNo;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[21]; //Số HBL
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].HBL;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[22]; //Số MBL
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].MBL;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[23]; //Khách hàng
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].Customer;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[24]; //Công ty xuất
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].Shipper;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[25]; //Công ty nhập
                workSheet.Cells[j, 3].Value = advanceExport.ShipmentsAdvance[i].Consignee;
                j = j + 1;

                /////
                workSheet.Cells[p, 1, j - 1, 1].Merge = true;
                workSheet.Cells[p, 1, j - 1, 1].Value = i + 1; //Value STT
                workSheet.Cells[p, 1, j - 1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 1, j - 1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                workSheet.Cells[p, 4, j - 1, 4].Merge = true;
                workSheet.Cells[p, 4, j - 1, 4].Value = advanceExport.ShipmentsAdvance[i].Container; //Value Số cont - Loại cont
                workSheet.Cells[p, 4, j - 1, 4].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 4, j - 1, 4].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                for (int x = 5; x < 12; x++)
                {
                    workSheet.Cells[p, x, j - 1, x].Merge = true;
                    workSheet.Cells[p, x, j - 1, x].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    workSheet.Cells[p, x, j - 1, x].Style.Numberformat.Format = numberFormat;
                }
                workSheet.Cells[p, 5, j - 1, 5].Value = advanceExport.ShipmentsAdvance[i].Cw; //Value C.W
                workSheet.Cells[p, 6, j - 1, 6].Value = advanceExport.ShipmentsAdvance[i].Pcs; //Value Số kiện
                workSheet.Cells[p, 7, j - 1, 7].Value = advanceExport.ShipmentsAdvance[i].Cbm; //Value CBM
                workSheet.Cells[p, 8, j - 1, 8].Value = advanceExport.ShipmentsAdvance[i].NormAmount; //Value định mức
                workSheet.Cells[p, 9, j - 1, 9].Value = advanceExport.ShipmentsAdvance[i].InvoiceAmount; //Value chi phí có hóa đơn
                workSheet.Cells[p, 10, j - 1, 10].Value = advanceExport.ShipmentsAdvance[i].OtherAmount; //Value chi phí khác
                workSheet.Cells[p, 11, j - 1, 11].Value = advanceExport.ShipmentsAdvance[i].NormAmount + advanceExport.ShipmentsAdvance[i].InvoiceAmount + advanceExport.ShipmentsAdvance[i].OtherAmount; //Value Tổng cộng

                p = j;
                /////
            }

            ////Tổng cộng
            workSheet.Cells[p, 1, p, 3].Merge = true;
            workSheet.Cells[p, 1, p, 3].Value = headers[17].ToUpper(); //Tổng cộng
            workSheet.Cells[p, 1, p, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 1, p, 3].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[p, 5, p, 5].Value = advanceExport.ShipmentsAdvance.Select(s => s.Cw).Sum(); //Total CW
            workSheet.Cells[p, 6, p, 6].Value = advanceExport.ShipmentsAdvance.Select(s => s.Pcs).Sum(); //Total PCS
            workSheet.Cells[p, 7, p, 7].Value = advanceExport.ShipmentsAdvance.Select(s => s.Cbm).Sum(); //Total CBM
            workSheet.Cells[p, 8, p, 8].Value = advanceExport.ShipmentsAdvance.Select(s => s.NormAmount).Sum(); //Total định mức
            workSheet.Cells[p, 9, p, 9].Value = advanceExport.ShipmentsAdvance.Select(s => s.InvoiceAmount).Sum(); //Total phí có hóa đơn
            workSheet.Cells[p, 10, p, 10].Value = advanceExport.ShipmentsAdvance.Select(s => s.OtherAmount).Sum(); //Total phí khác
            var totalAmount = advanceExport.ShipmentsAdvance.Select(s => s.NormAmount + s.InvoiceAmount + s.OtherAmount).Sum();
            workSheet.Cells[p, 11, p, 11].Value = totalAmount; //Total các phí

            //Bôi đen dòng tổng cộng ở cuối
            workSheet.Cells["A" + p + ":K" + p].Style.Font.Bold = true;
            workSheet.Cells["A" + p + ":K" + p].Style.Numberformat.Format = numberFormat;

            workSheet.Cells[7, 1, 7, 11].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
            workSheet.Cells["A" + p + ":K" + p].Style.Border.Top.Style = ExcelBorderStyle.Medium;
            workSheet.Cells["A" + (p + 1) + ":K" + (p + 1)].Style.Border.Top.Style = ExcelBorderStyle.Medium;

            //All border
            workSheet.Cells[8, 1, p, 11].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            workSheet.Cells[8, 1, p, 11].Style.Border.Right.Style = ExcelBorderStyle.Thin;

            //In đậm border Cột 1
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 3].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            //In đậm border Cột 2
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 7].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            //In đậm border Cột 3
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 11].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            //Clear border Shipment
            int r = 10;
            int c = 16;
            for (var i = 0; i < advanceExport.ShipmentsAdvance.Count; i++)
            {
                workSheet.Cells["B" + r + ":C" + c].Style.Border.Bottom.Style = ExcelBorderStyle.None;//Xóa border bottom
                workSheet.Cells["B" + r + ":B" + c].Style.Border.Right.Style = ExcelBorderStyle.None;//Xóa border right
                workSheet.Cells["B" + r + ":B" + (c + 1)].Style.Border.Right.Style = ExcelBorderStyle.None;//Xóa border right (dư)
                r = r + 8;
                c = c + 8;
            }

            ////Bỏ qua 2 dòng
            p = p + 2;

            workSheet.Cells[p, 1, p, 2].Merge = true;
            workSheet.Cells[p, 1, p, 2].Value = headers[26]; //Số tiền đề nghị tạm ứng
            workSheet.Cells[p, 1, p, 2].Style.Font.Bold = true;
            workSheet.Cells[p, 1, p, 2].Style.Font.UnderLine = true;
            workSheet.Cells[p, 3, p, 3].Value = totalAmount;
            workSheet.Cells[p, 3, p, 3].Style.Font.Bold = true;
            workSheet.Cells[p, 3, p, 3].Style.Numberformat.Format = numberFormat;

            p = p + 1;
            workSheet.Cells[p, 1, p, 2].Merge = true;
            workSheet.Cells[p, 1, p, 2].Value = headers[27];//Số tiền bằng chữ
            workSheet.Cells[p, 3, p, 3].Value = advanceExport.InfoAdvance.AdvanceAmountWord;

            p = p + 1;
            workSheet.Cells[p, 1, p, 2].Merge = true;
            workSheet.Cells[p, 1, p, 2].Value = headers[28];
            workSheet.Cells[p, 3, p, 3].Value = advanceExport.InfoAdvance.AdvanceReason; //Lý do tạm ứng

            p = p + 1;
            workSheet.Cells[p, 1, p, 2].Merge = true;
            workSheet.Cells[p, 1, p, 2].Value = headers[29];
            workSheet.Cells[p, 3, p, 3].Value = advanceExport.InfoAdvance.DealinePayment.Value.ToString("dd/MM/yyyy"); //Thời hạn thanh toán

            p = p + 2;

            for (int x = 2; x < 5; x++)
            {
                workSheet.Cells[p, x].Style.WrapText = true;
                workSheet.Cells[p, x].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, x].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }
            workSheet.Cells[p, 2].Value = headers[30]; //Người tạm ứng           
            workSheet.Cells[p, 3].Value = headers[31]; //Người chứng từ            
            workSheet.Cells[p, 4].Value = headers[32]; //Trưởng bộ phận

            workSheet.Cells[p, 7, p, 8].Merge = true;
            workSheet.Cells[p, 7, p, 8].Style.WrapText = true;
            workSheet.Cells[p, 7, p, 8].Value = headers[33]; //Kế toán
            workSheet.Cells[p, 7, p, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 7, p, 8].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[p, 10, p, 11].Merge = true;
            workSheet.Cells[p, 10, p, 11].Value = headers[34]; //Giám đốc
            workSheet.Cells[p, 10, p, 11].Style.WrapText = true;
            workSheet.Cells[p, 10, p, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 10, p, 11].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            p = p + 5; //Bỏ trống 5 row


            for (int x = 2; x < 5; x++)
            {
                workSheet.Cells[p, x].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, x].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }
            workSheet.Cells[p, 2].Value = advanceExport.InfoAdvance.Requester; //Value Người tạm ứng            
            workSheet.Cells[p, 3].Value = string.Empty; //Value Người chứng từ
            workSheet.Cells[p, 4].Value = advanceExport.InfoAdvance.Manager; //Value Trưởng bộ phận

            workSheet.Cells[p, 7, p, 8].Merge = true;
            workSheet.Cells[p, 7, p, 8].Value = advanceExport.InfoAdvance.Accountant; //Value Kế toán
            workSheet.Cells[p, 7, p, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 7, p, 8].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[p, 10, p, 11].Merge = true;
            workSheet.Cells[p, 10, p, 11].Value = string.Empty; //Giám đốc

            //Set font size từ header table trở xuống
            workSheet.Cells[8, 1, p, 11].Style.Font.Size = 10;
        }
        #endregion --- ADVANCE PAYMENT ---

        public Stream GenerateBravoSOAExcel(List<ExportBravoSOAModel> listObj, Stream stream = null)
        {
            List<string> headers = new List<string>()
            {
                "Ngày chứng từ",
                "Số chứng từ",
                "Mã chứng từ",
                "Diễn giải",
                "Mã khách hàng",
                "TK Nợ",
                "TK Có",
                "Mã loại",
                "Mã tiền tệ",
                "Số tiền",
                "Tỷ giá",
                "Tiền VND",
                "% VAT",
                "TK Nợ VAT",
                "TK Có VAT",
                "Tiền VAT",
                "Tiền VND VAT",
                "Số hóa đơn VAT",
                "Ngày hóa đơn VAT",
                "Số Seri VAT",
                "Mặt hàng VAT",
                "Tên đối tượng VAT",
                "Mã số thuế ĐT VAT",
                "Mã Job",
                "Diễn giải",
                "Đánh dấu",
                "Thời hạn T/T",
                "Mã BP",
                "Số TK",
                "Số H-B/L",
                "ĐVT",
                "Hình thức T/T",
                "Mã ĐT CH",
                "Số Lượng",
                "Mã HĐ",
                "Địa chỉ đối tượng VAT",
                "Số M-B/L",
                "Tình trạng hóa đơn",
                "Email",
                "Ngày phát hành E-Invoice"
            };
            try
            {
                int addressStartContent = 4;
                using (var excelPackage = new ExcelPackage(stream ?? new MemoryStream()))
                {
                    excelPackage.Workbook.Worksheets.Add("SOA");
                    var worksheet = excelPackage.Workbook.Worksheets[1];

                    BuildHeader(worksheet, headers, "SOA");

                    for (int i = 0; i < listObj.Count; i++)
                    {
                        var item = listObj[i];
                        worksheet.Cells[i + addressStartContent, 1].Value = item.ServiceDate;
                        worksheet.Cells[i + addressStartContent, 2].Value = item.SOANo;
                        worksheet.Cells[i + addressStartContent, 3].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 4].Value = item.Service;
                        worksheet.Cells[i + addressStartContent, 5].Value = item.PartnerCode;
                        worksheet.Cells[i + addressStartContent, 6].Value = item.Debit;
                        worksheet.Cells[i + addressStartContent, 7].Value = item.Credit;
                        worksheet.Cells[i + addressStartContent, 8].Value = item.ChargeCode;
                        worksheet.Cells[i + addressStartContent, 9].Value = item.OriginalCurrency;
                        worksheet.Cells[i + addressStartContent, 10].Value = item.OriginalAmount;
                        worksheet.Cells[i + addressStartContent, 11].Value = item.CreditExchange;
                        worksheet.Cells[i + addressStartContent, 12].Value = item.AmountVND;
                        worksheet.Cells[i + addressStartContent, 13].Value = item.VAT;
                        worksheet.Cells[i + addressStartContent, 14].Value = item.AccountDebitNoVAT;
                        worksheet.Cells[i + addressStartContent, 15].Value = item.AccountCreditNoVAT;
                        worksheet.Cells[i + addressStartContent, 16].Value = item.AmountVAT;
                        worksheet.Cells[i + addressStartContent, 17].Value = item.AmountVNDVAT;
                        worksheet.Cells[i + addressStartContent, 18].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 19].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 20].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 21].Value = item.Commodity;
                        worksheet.Cells[i + addressStartContent, 22].Value = item.CustomerName;
                        worksheet.Cells[i + addressStartContent, 23].Value = item.TaxCode;
                        worksheet.Cells[i + addressStartContent, 24].Value = item.JobId;
                        worksheet.Cells[i + addressStartContent, 25].Value = item.ChargeName;
                        worksheet.Cells[i + addressStartContent, 26].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 27].Value = string.Empty; // tạm thời để trống
                        worksheet.Cells[i + addressStartContent, 28].Value = item.TransationType;
                        worksheet.Cells[i + addressStartContent, 29].Value = item.CustomNo;
                        worksheet.Cells[i + addressStartContent, 30].Value = item.HBL;
                        worksheet.Cells[i + addressStartContent, 31].Value = item.Unit;
                        worksheet.Cells[i + addressStartContent, 32].Value = item.Payment;
                        worksheet.Cells[i + addressStartContent, 33].Value = item.TaxCodeOBH;
                        worksheet.Cells[i + addressStartContent, 34].Value = item.Quantity;
                        worksheet.Cells[i + addressStartContent, 35].Value = string.Empty; // tạm thời để trống;
                        worksheet.Cells[i + addressStartContent, 36].Value = item.CustomerAddress;
                        worksheet.Cells[i + addressStartContent, 37].Value = item.MBL;
                        worksheet.Cells[i + addressStartContent, 38].Value = string.Empty; // tạm thời để trống;
                        worksheet.Cells[i + addressStartContent, 39].Value = item.Email;
                        worksheet.Cells[i + addressStartContent, 40].Value = string.Empty; // tạm thời để trống;

                        //Add border left right for cells
                        AddBorderLeftRightCell(worksheet, headers, addressStartContent, i);

                        //Add border bottom for last cells
                        AddBorderBottomLastCell(worksheet, headers, addressStartContent, i, listObj.Count);
                    }

                    excelPackage.Save();
                    return excelPackage.Stream;
                }
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        #region --- SETTLEMENT PAYMENT ---
        /// <summary>
        /// Generate detail settlement payment excel
        /// </summary>
        /// <param name="settlementExport"></param>
        /// <param name="language"></param>
        /// <param name="stream"></param>
        /// <returns></returns>
        public Stream GenerateDetailSettlementPaymentExcel(SettlementExport settlementExport, string language, Stream stream = null)
        {
            try
            {
                using (var excelPackage = new ExcelPackage(stream ?? new MemoryStream()))
                {
                    string sheetName = language == "VN" ? "(V)" : "(E)";
                    excelPackage.Workbook.Worksheets.Add("Đề nghị thanh toán " + sheetName);
                    var workSheet = excelPackage.Workbook.Worksheets[1];
                    BindingDataDetailSettlementPaymentExcel(workSheet, settlementExport, language);
                    excelPackage.Save();
                    return excelPackage.Stream;
                }
            }
            catch (Exception ex)
            {

            }
            return null;
        }

        private void SetWidthColumnExcelDetailSettlementPayment(ExcelWorksheet workSheet)
        {
            workSheet.Column(1).Width = 8; //Cột A
            workSheet.Column(2).Width = 20; //Cột B
            workSheet.Column(3).Width = 30; //Cột C
            workSheet.Column(4).Width = 6; //Cột D
            workSheet.Column(5).Width = 30; //Cột E
            workSheet.Column(6).Width = 20; //Cột F
            workSheet.Column(7).Width = 15; //Cột G
            workSheet.Column(8).Width = 15; //Cột H
            workSheet.Column(9).Width = 20; //Cột I
            workSheet.Column(10).Width = 15; //Cột J
            workSheet.Column(11).Width = 18; //Cột K
        }

        private List<string> GetHeaderExcelDetailSettlementPayment(string language)
        {
            List<string> vnHeaders = new List<string>()
            {
                "INDO TRANS LOGISTICS CORPORATION", //0
                "52-54-65 Truong Son St. Tan Binh Dist. HCM City. Vietnam\nTel: (84-8) 3948 6888  Fax: +84 8 38488 570\nE-mail:\nWebsite: www.itlvn.com", //1
                "ĐỀ NGHỊ THANH TOÁN", //2
                "Người yêu cầu:", //3
                "Ngày:", //4
                "Bộ phận:", //5
                "Số chứng tứ:", //6
                "STT", //7
                "Thông tin chung", //8
                "Diễn giải", //9
                "Số tiền", //10
                "Số hóa đơn", //11
                "Ghi chú", //12
                "Số tiền đã tạm ứng", //13                
                "Ngày tạm ứng", //14
                "Chênh lệch", //15
                "Số lô hàng:", //16
                "Số tờ khai:", //17
                "Số HBL/HAWB:", //18
                "Số MBL/MAWB:", //19
                "Số cont - Loại cont:", //20
                "C.W (Kgs):", //21
                "Số kiện (Pcs):", //22
                "Số CBM (CBM):", //23
                "Khách hàng:", //24
                "Công ty/cá nhân xuất:", //25
                "Công ty/cá nhân nhập:", //26
                "Chi phí có hóa đơn", //27
                "Chi phí không hóa đơn", //28
                "Chi hộ", //29
                "Tổng cộng", //30
                "TỔNG CỘNG", //31
                "Người tạm ứng\n(Ký, ghi rõ họ tên)", //32
                "Người chứng từ\n(Ký, ghi rõ họ tên)", //33
                "Trưởng bộ phận\n(Ký, ghi rõ họ tên)", //34
                "Kế toán\n(Ký, ghi rõ họ tên)", //35
                "Giám đốc\n(Ký, ghi rõ họ tên)" //36
            };

            List<string> engHeaders = new List<string>()
            {
                "INDO TRANS LOGISTICS CORPORATION", //0
                "52-54-65 Truong Son St. Tan Binh Dist. HCM City. Vietnam\nTel: (84-8) 3948 6888  Fax: +84 8 38488 570\nE-mail:\nWebsite: www.itlvn.com", //1
                "PAYMENT REQUEST", //2
                "Employee Name:", //3
                "Date requested:", //4
                "Department:", //5
                "Ref No.:", //6
                "No.", //7
                "Shipment's Information", //8
                "Description", //9
                "Amount", //10
                "Invoice No", //11
                "Remark", //12
                "Advanced Amount", //13                
                "Date Advanced", //14
                "Difference", //15
                "Job ID:", //16
                "Customs Clearance No:", //17
                "HBL/HAWB:", //18
                "MBL/MAWB:", //19
                "Number of cont:", //20
                "C.W (Kgs):", //21
                "Packages (Pcs):", //22
                "Số CBM (CBM):", //23
                "Customer:", //24
                "Consigner:", //25
                "Consignee:", //26
                "Expenses with reasonable vouchers", //27
                "Expenses without reasonable vouchers", //28
                "Payment on behalf", //29
                "Subtotal", //30
                "TOTAL",//31
                "Employee\n(Name, Signature)", //32
                "Documentation Staff\n(Name, Signature)", //33
                "Head of Department\n(Name, Signature)", //34
                "Chief Accountant\n(Name, Signature)", //35
                "Director\n(Name, Signature)" //36
            };

            List<string> headers = language == "VN" ? vnHeaders : engHeaders;
            return headers;
        }

        private void BindingDataDetailSettlementPaymentExcel(ExcelWorksheet workSheet, SettlementExport settlementExport, string language)
        {
            SetWidthColumnExcelDetailSettlementPayment(workSheet);

            using (Image image = Image.FromFile(CrystalEx.GetLogoITL()))
            {
                var excelImage = workSheet.Drawings.AddPicture("Logo", image);
                //add the image to row 1, column A
                excelImage.SetPosition(0, 0, 0, 0);
            }

            List<string> headers = GetHeaderExcelDetailSettlementPayment(language);

            workSheet.Cells["H1:K1"].Merge = true;
            workSheet.Cells["H1"].Value = headers[0];
            workSheet.Cells["H1"].Style.Font.SetFromFont(new Font("Arial Black", 10));
            workSheet.Cells["H1"].Style.Font.Italic = true;
            workSheet.Cells["H2:K2"].Merge = true;
            workSheet.Cells["H2:K2"].Style.WrapText = true;
            workSheet.Cells["H2"].Value = headers[1];
            workSheet.Cells["H2"].Style.Font.SetFromFont(new Font("Microsoft Sans Serif", 8));
            workSheet.Row(2).Height = 50;
            
            //Title
            workSheet.Cells["A3:K3"].Merge = true;
            workSheet.Cells["A3"].Style.Font.SetFromFont(new Font("Times New Roman", 16));
            workSheet.Cells["A3"].Value = headers[2]; //Đề nghị thanh toán
            workSheet.Cells["A3"].Style.Font.Size = 16;
            workSheet.Cells["A3"].Style.Font.Bold = true;
            workSheet.Cells["A3"].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells["A3"].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells["A5:J6"].Style.Font.SetFromFont(new Font("Times New Roman", 11));

            workSheet.Cells["A5:B5"].Merge = true;
            workSheet.Cells["A5"].Value = headers[3]; //Người yêu cầu
            workSheet.Cells["A5"].Style.Font.Bold = true;
            workSheet.Cells["C5"].Value = settlementExport.InfoSettlement.Requester;

            workSheet.Cells["I5"].Value = headers[4]; //Ngày thanh toán
            workSheet.Cells["I5"].Style.Font.Bold = true;
            workSheet.Cells["J5"].Value = settlementExport.InfoSettlement.RequestDate.Value.ToString("dd/MM/yyyy");

            workSheet.Cells["A6:B6"].Merge = true;
            workSheet.Cells["A6"].Value = headers[5]; //Bộ phận
            workSheet.Cells["A6"].Style.Font.Bold = true;
            workSheet.Cells["C6"].Value = settlementExport.InfoSettlement.Department;

            workSheet.Cells["I6"].Value = headers[6]; //Số chứng từ
            workSheet.Cells["I6"].Style.Font.Bold = true;
            workSheet.Cells["J6"].Value = settlementExport.InfoSettlement.Department;


            workSheet.Cells[8, 1, 100000, 11].Style.Font.SetFromFont(new Font("Times New Roman", 10));

            //Bôi đen header
            workSheet.Cells["A8:K8"].Style.Font.Bold = true;
           
            for(var col = 1; col < 12; col++)
            {
                workSheet.Cells[8,col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[8,col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            }
            workSheet.Cells["A8"].Value = headers[7];//STT
            
            workSheet.Cells["B8:C8"].Merge = true;
            workSheet.Cells["B8:C8"].Value = headers[8];//Thông tin chung
            
            workSheet.Cells["D8:E8"].Merge = true;
            workSheet.Cells["D8:E8"].Value = headers[9];//Diễn giải
            
            workSheet.Cells["F8"].Value = headers[10];//Số tiền
            workSheet.Cells["G8"].Value = headers[11];//Số hóa đơn
            workSheet.Cells["H8"].Value = headers[12];//Ghi chú
            workSheet.Cells["I8"].Value = headers[13];//Số tiền đã tạm ứng
            workSheet.Cells["J8"].Value = headers[14];//Ngày tạm ứng
            workSheet.Cells["K8"].Value = headers[15];//Chênh lệch
            workSheet.Row(8).Height = 30;

            decimal? _sumTotalAmount = 0;
            decimal? _sumTotalAdvancedAmount = 0;
            decimal? _sumTotalDifference = 0;

            int p = 9;
            int j = 9;
            int k = 9;
            for (int i = 0; i < settlementExport.ShipmentsSettlement.Count; i++)
            {
                #region --- Diễn giải ---
                int _no = 1;
                var invoiceCharges = settlementExport.ShipmentsSettlement[i].ShipmentCharges.Where(w => w.ChargeType == "INVOICE");
                //Title Chi phí có hóa đơn
                workSheet.Cells[k, 4].Value = headers[27]; //Chi phí có hóa đơn
                workSheet.Cells[k, 4].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Value = invoiceCharges.Select(s => s.ChargeAmount).Sum(); //Value tổng chi phí có hóa đơn
                workSheet.Cells[k, 6].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;
                k += 1;                
                foreach (var invoice in invoiceCharges)
                {
                    workSheet.Cells[k, 4].Value = _no;
                    workSheet.Cells[k, 5].Value = invoice.ChargeName;

                    workSheet.Cells[k, 6].Value = invoice.ChargeAmount;
                    workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;

                    workSheet.Cells[k, 7].Value = invoice.InvoiceNo;
                    workSheet.Cells[k, 8].Value = invoice.ChargeNote;
                    k += 1;
                    _no += 1;
                }
                var noInvoiceCharges = settlementExport.ShipmentsSettlement[i].ShipmentCharges.Where(w => w.ChargeType == "NO_INVOICE");
                //Title Chi phí không hóa đơn
                workSheet.Cells[k, 4].Value = headers[28]; //Chi phí không hóa đơn
                workSheet.Cells[k, 4].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Value = noInvoiceCharges.Select(s => s.ChargeAmount).Sum(); //Value tổng chi phí không hóa đơn
                workSheet.Cells[k, 6].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;
                k += 1;
                foreach (var no_invoice in noInvoiceCharges)
                {
                    workSheet.Cells[k, 4].Value = _no;
                    workSheet.Cells[k, 5].Value = no_invoice.ChargeName;

                    workSheet.Cells[k, 6].Value = no_invoice.ChargeAmount;
                    workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;

                    workSheet.Cells[k, 7].Value = no_invoice.InvoiceNo;
                    workSheet.Cells[k, 8].Value = no_invoice.ChargeNote;
                    k += 1;
                    _no += 1;
                }

                var obhCharges = settlementExport.ShipmentsSettlement[i].ShipmentCharges.Where(w => w.ChargeType == "OBH");
                //Title phí chi hộ
                workSheet.Cells[k, 4].Value = headers[29]; //Chi hộ
                workSheet.Cells[k, 4].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Value = obhCharges.Select(s => s.ChargeAmount).Sum(); //Value tổng phí chi hộ
                workSheet.Cells[k, 6].Style.Font.Bold = true;
                workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;
                k += 1;
                foreach (var obh in obhCharges)
                {
                    workSheet.Cells[k, 4].Value = _no;
                    workSheet.Cells[k, 5].Value = obh.ChargeName;

                    workSheet.Cells[k, 6].Value = obh.ChargeAmount;
                    workSheet.Cells[k, 6].Style.Numberformat.Format = numberFormat;

                    workSheet.Cells[k, 7].Value = obh.InvoiceNo;
                    workSheet.Cells[k, 8].Value = obh.ChargeNote;
                    k += 1;
                    _no += 1;
                }

                

                #endregion

                #region --- Thông tin chung ---
                workSheet.Cells[j, 2].Value = headers[16]; //Số lô hàng
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].JobNo;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[17]; //Số tờ khai
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].CustomNo;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[18]; //Số HBL
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].HBL;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[19]; //Số MBL
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].MBL;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[20]; //Số cont - Loại cont
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Container;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[21]; //C.W
                workSheet.Cells[j, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Cw;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[22]; //Số kiện
                workSheet.Cells[j, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Pcs;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[23]; //Số CBM
                workSheet.Cells[j, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Cbm;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[24]; //Khách hàng
                workSheet.Cells[j, 3].Style.WrapText = true;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Customer;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[25]; //Công ty xuất
                workSheet.Cells[j, 3].Style.WrapText = true;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Shipper;
                j = j + 1;

                workSheet.Cells[j, 2].Value = headers[26]; //Công ty nhập
                workSheet.Cells[j, 3].Style.WrapText = true;
                workSheet.Cells[j, 3].Value = settlementExport.ShipmentsSettlement[i].Consignee;
                j = j + 1;
                #endregion --- Thông tin chung ---

                j = j + 1;
                k = k + 1;
                if (k > j)
                {
                    j = k;
                }
                else
                {
                    k = j;
                }

                //Title Subtotal
                workSheet.Cells[j - 1, 4, j - 1, 5].Merge = true;
                workSheet.Cells[j - 1, 4, j - 1, 5].Value = headers[30];
                workSheet.Cells[j - 1, 4, j - 1, 5].Style.Font.Bold = true;
                workSheet.Cells[j - 1, 4, j - 1, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //Value total amount
                var _totalAmount = settlementExport.ShipmentsSettlement[i].ShipmentCharges.Select(s => s.ChargeAmount).Sum();
                workSheet.Cells[j - 1, 6].Value = _totalAmount;
                workSheet.Cells[j - 1, 6].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[j - 1, 6].Style.Font.Bold = true;
                //Value total advanced amount (số tiền đã tạm ứng)
                var _advanceAmount = settlementExport.ShipmentsSettlement[i].AdvanceAmount ?? 0;
                workSheet.Cells[j - 1, 9].Value = _advanceAmount;
                workSheet.Cells[j - 1, 9].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[j - 1, 9].Style.Font.Bold = true;
                //Value chênh lệch
                workSheet.Cells[j - 1, 11].Value = _totalAmount - _advanceAmount;
                workSheet.Cells[j - 1, 11].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[j - 1, 11].Style.Font.Bold = true;

                ////
                workSheet.Cells[p, 1, j - 1, 1].Merge = true;
                workSheet.Cells[p, 1, j - 1, 1].Value = i + 1; //Value STT
                workSheet.Cells[p, 1, j - 1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 1, j - 1, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                workSheet.Cells[p, 9, j - 2, 9].Merge = true;
                workSheet.Cells[p, 9, j - 2, 9].Value = settlementExport.ShipmentsSettlement[i].AdvanceAmount; //Value Số tiền đã tạm ứng
                workSheet.Cells[p, 9, j - 2, 9].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[p, 9, j - 2, 9].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 9, j - 2, 9].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                workSheet.Cells[p, 10, j - 2, 10].Merge = true;
                workSheet.Cells[p, 10, j - 2, 10].Value = settlementExport.ShipmentsSettlement[i].AdvanceAmount; //Value Ngày tạm ứng
                workSheet.Cells[p, 10, j - 2, 10].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[p, 10, j - 2, 10].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 10, j - 2, 10].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                workSheet.Cells[p, 11, j - 2, 11].Merge = true;
                workSheet.Cells[p, 11, j - 2, 11].Value = string.Empty; //Value Chênh lệch
                workSheet.Cells[p, 11, j - 2, 11].Style.Numberformat.Format = numberFormat;
                workSheet.Cells[p, 11, j - 2, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                workSheet.Cells[p, 11, j - 2, 11].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

                p = j;
                ////
                

                _sumTotalAmount += (settlementExport.ShipmentsSettlement[i].ShipmentCharges.Select(s => s.ChargeAmount).Sum() ?? 0);
                _sumTotalAdvancedAmount += (settlementExport.ShipmentsSettlement[i].AdvanceAmount ?? 0);
                _sumTotalDifference = _sumTotalAmount - _sumTotalAdvancedAmount;
            }

            ////TỖNG CỘNG
            workSheet.Cells[p, 1, p, 5].Merge = true;
            workSheet.Cells[p, 1, p, 5].Value = headers[31]; //Title TỔNG CỘNG
            workSheet.Cells[p, 1, p, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 1, p, 5].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[p, 6].Value = _sumTotalAmount; //Value sum total amount
            workSheet.Cells[p, 6].Style.Numberformat.Format = numberFormat;
            workSheet.Cells[p, 9].Value = _sumTotalAdvancedAmount; //Value sum total advanced amount
            workSheet.Cells[p, 9].Style.Numberformat.Format = numberFormat;
            workSheet.Cells[p, 11].Value = _sumTotalDifference; //Value sum total difference
            workSheet.Cells[p, 11].Style.Numberformat.Format = numberFormat;

            //Bôi đen dòng tổng cộng ở cuối
            workSheet.Cells["A" + p + ":K" + p].Style.Font.Bold = true;
            workSheet.Cells["A" + p + ":K" + p].Style.Numberformat.Format = numberFormat;

            workSheet.Cells[7, 1, 7, 11].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
            workSheet.Cells["A" + p + ":K" + p].Style.Border.Top.Style = ExcelBorderStyle.Medium;
            workSheet.Cells["A" + (p + 1) + ":K" + (p + 1)].Style.Border.Top.Style = ExcelBorderStyle.Medium;

            //All border
            workSheet.Cells[8, 1, p, 11].Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            workSheet.Cells[8, 1, p, 11].Style.Border.Right.Style = ExcelBorderStyle.Thin;
        
            //In đậm border Cột 1
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 3].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            //In đậm border Cột 2
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 8].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            //In đậm border Cột 3
            for (var i = 8; i < p + 1; i++)
            {
                workSheet.Cells[i, 11].Style.Border.Right.Style = ExcelBorderStyle.Medium;
            }

            
            int r = 9;
            int c = 19;
            int l = 18;
            for (var i = 0; i < settlementExport.ShipmentsSettlement.Count; i++)
            {
                //Clear border Shipment
                workSheet.Cells["B" + r + ":C" + c].Style.Border.Bottom.Style = ExcelBorderStyle.None;//Xóa border bottom
                workSheet.Cells["B" + r + ":B" + c].Style.Border.Right.Style = ExcelBorderStyle.None;//Xóa border right
                workSheet.Cells["B" + r + ":B" + (c + 1)].Style.Border.Right.Style = ExcelBorderStyle.None;//Xóa border right (dư)
                //Change border diễn giải
                workSheet.Cells["D" + r + ":H" + l].Style.Border.Bottom.Style = ExcelBorderStyle.Dotted;
                r = r + 12;
                c = c + 12;
                l = l + 12;
            }
            
            p = p + 3;
            
            workSheet.Cells[p, 2].Style.WrapText = true;
            workSheet.Cells[p, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 2].Style.VerticalAlignment = ExcelVerticalAlignment.Center;           
            workSheet.Cells[p, 2].Value = headers[32]; //Người tạm ứng    

            workSheet.Cells[p, 3].Style.WrapText = true;
            workSheet.Cells[p, 3].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 3].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            workSheet.Cells[p, 3].Value = headers[33]; //Người chứng từ 

            workSheet.Cells[p, 4, p, 5].Merge = true;
            workSheet.Cells[p, 4, p, 5].Style.WrapText = true;
            workSheet.Cells[p, 4, p, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 4, p, 5].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
            workSheet.Cells[p, 4, p, 5].Value = headers[34]; //Trưởng bộ phận

            workSheet.Cells[p, 6, p, 8].Merge = true;
            workSheet.Cells[p, 6, p, 8].Style.WrapText = true;
            workSheet.Cells[p, 6, p, 8].Value = headers[35]; //Kế toán
            workSheet.Cells[p, 6, p, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 6, p, 8].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            workSheet.Cells[p, 9, p, 11].Merge = true;
            workSheet.Cells[p, 9, p, 11].Value = headers[36]; //Giám đốc
            workSheet.Cells[p, 9, p, 11].Style.WrapText = true;
            workSheet.Cells[p, 9, p, 11].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            workSheet.Cells[p, 9, p, 11].Style.VerticalAlignment = ExcelVerticalAlignment.Center;

            p = p + 5;

            workSheet.Cells[p, 2].Style.WrapText = true;
            workSheet.Cells[p, 2].Value = settlementExport.InfoSettlement.Requester; //Value Người tạm ứng    
            workSheet.Cells[p, 2].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            
            workSheet.Cells[p, 3].Style.WrapText = true;
            workSheet.Cells[p, 3].Value = string.Empty; //Value Người chứng từ 

            workSheet.Cells[p, 4, p, 5].Merge = true;
            workSheet.Cells[p, 4, p, 5].Style.WrapText = true;
            workSheet.Cells[p, 4, p, 5].Value = settlementExport.InfoSettlement.Manager; //Value Trưởng bộ phận
            workSheet.Cells[p, 4, p, 5].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            
            workSheet.Cells[p, 6, p, 8].Merge = true;
            workSheet.Cells[p, 6, p, 8].Style.WrapText = true;
            workSheet.Cells[p, 6, p, 8].Value = settlementExport.InfoSettlement.Accountant; //Value Kế toán
            workSheet.Cells[p, 6, p, 8].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            
            workSheet.Cells[p, 9, p, 11].Merge = true;
            workSheet.Cells[p, 9, p, 11].Value = string.Empty; //Value Giám đốc
        }
        #endregion --- SETTLEMENT PAYMENT ---
    }
}
