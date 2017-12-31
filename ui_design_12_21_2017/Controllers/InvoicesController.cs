using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ui_design_12_21_2017.Data;
using ui_design_12_21_2017.Models;

namespace ui_design_12_21_2017.Controllers
{
    public class InvoicesController : Controller
    {
        private readonly InvoicesContext _context;

        public InvoicesController(InvoicesContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            ViewData["CustomerList"] = new SelectList(_context.Customers, "Name", "Name");
            ViewData["DueDateList"] = new SelectList(GetDueDates());
            ViewData["IsoList"] = new SelectList(_context.Isos, "Name", "Name");
            ViewData["ContractList"] = new SelectList(_context.ContractGroups, "Name", "Name");
            ViewData["LdcAccountList"] = new SelectList(_context.LdcAccounts, "LdcAccountNumber", "LdcAccountNumber");
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SearchInvoices(InvoiceSearch model)
        {
            var dateSet = new HashSet<string>(model.Months);
            var isoSet = new HashSet<string>(model.Isos);
            var contractSet = new HashSet<string>(model.Contracts);
            var ldcAccountSet = new HashSet<string>(model.LdcAccounts);
            var invoices = from invoice in _context.Invoices
                           where invoice.Customer.Name == model.Customer && dateSet.Contains($"{invoice.DueDate:M/d/yyyy}") &&
                                 isoSet.Contains(invoice.Iso.Name) && contractSet.Contains(invoice.ContractGroupName) &&
                                 ldcAccountSet.Contains(invoice.LdcAccountNumber)
                           select new
                           {
                               invoice.InvoiceNumber,
                               DueDate = $"{invoice.DueDate:M/d/yyyy}",
                               invoice.LdcAccountNumber,
                               Status = invoice.Status.Name,
                               invoice.Amount,
                               invoice.Balance,
                               invoice.ContractGroupName,
                               CustomerName = invoice.Customer.Name,
                               IsoName = invoice.Iso.Name,
                               invoice.IsApproved
                           };
            return Json(invoices);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> TableUpdateRequest(TableRequest tableRequest)
        {
            if (tableRequest.InvoiceNumbers == null || tableRequest.InvoiceNumbers.Length == 0) return null;
            if (tableRequest.RequestType == "approval")
            {
                var targetInvoiceNumbers = new HashSet<string>(tableRequest.InvoiceNumbers);
                var targetInvoices = from invoice in _context.Invoices
                                     where targetInvoiceNumbers.Contains(invoice.InvoiceNumber)
                                     select invoice;
                foreach (var invoice in targetInvoices)
                {
                    invoice.IsApproved = true;
                }

                await _context.SaveChangesAsync();
                return Accepted();
            }

            return null;
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public FileContentResult TableFileRequests(TableRequest tableRequest)
        {
            if (tableRequest.InvoiceNumbers == null || tableRequest.InvoiceNumbers.Length == 0) return null;


            FileContentResult fileContentResult = null;

            if (tableRequest.RequestType == "invoiceDetail")
            {
                if (tableRequest.InvoiceNumbers.Length == 1)
                {
                    var targetInvoice = tableRequest.InvoiceNumbers[0];
                    IEnumerable<byte[]> detailFiles = from invoice in _context.Invoices
                                                      where invoice.InvoiceNumber == targetInvoice
                                                      select invoice.DetailFile;
                    fileContentResult = new FileContentResult(detailFiles.First(), "application/pdf") { FileDownloadName = FileNameValidation($"{targetInvoice}_detail.pdf") };
                }
                else
                {
                    var targetInvoices = new HashSet<string>(tableRequest.InvoiceNumbers);
                    var files = from invoice in _context.Invoices
                                where (targetInvoices.Contains(invoice.InvoiceNumber))
                                select new FileContent() { Name = $"{invoice.InvoiceNumber}_details.pdf", Content = invoice.DetailFile };
                    fileContentResult = new FileContentResult(ZipFiles(files), "application/zip") { FileDownloadName = "invoices_detail.zip" };
                }
            }
            else if (tableRequest.RequestType == "shadowSettlement")
            {
                if (tableRequest.InvoiceNumbers.Length == 1)
                {
                    var targetInvoice = tableRequest.InvoiceNumbers[0];
                    IEnumerable<byte[]> shadowSettlements = from invoice in _context.Invoices
                                                            where invoice.InvoiceNumber == targetInvoice
                                                            select invoice.ContractGroup.ShadowSettlement;
                    fileContentResult = new FileContentResult(shadowSettlements.First(), "text/csv")
                    {
                        FileDownloadName = FileNameValidation($"{targetInvoice}_shadow_settlement.csv")
                    };
                }
                else
                {
                    var targetInvoices = new HashSet<string>(tableRequest.InvoiceNumbers);
                    IEnumerable<string> contractGroupNames = from invoice in _context.Invoices
                                                             where targetInvoices.Contains(invoice.InvoiceNumber)
                                                             select invoice.ContractGroupName;
                    var targetContractGroupNames = new HashSet<string>(contractGroupNames);
                    IEnumerable<FileContent> shadowSettlements = from contractGroup in _context.ContractGroups
                                                                 where targetContractGroupNames.Contains(contractGroup.Name)
                                                                 select new FileContent()
                                                                 {
                                                                     Name = FileNameValidation($"{contractGroup.Name}_shadow_settlement.csv"),
                                                                     Content = contractGroup.ShadowSettlement
                                                                 };
                    fileContentResult =
                        new FileContentResult(ZipFiles(shadowSettlements), "application/zip")
                        {
                            FileDownloadName = "shadow_settlements.zip"
                        };
                }
            }


            return fileContentResult;

        }

        public class FileContent
        {
            public string Name { get; set; }
            public byte[] Content { get; set; }
        }

        private static string FileNameValidation(string fileName)
        {
            return string.Join("_", fileName.Split(Path.GetInvalidFileNameChars()));
        }

        private static byte[] ZipFiles(IEnumerable<FileContent> files)
        {
            /*
            //modified from https://stackoverflow.com/questions/36752349/create-zip-file-from-listbyte-in-memory

                var ms = new MemoryStream();
                var archive = new ZipArchive(ms, ZipArchiveMode.Create, false);
                foreach (var file in files)
                {
                    var entry = archive.CreateEntry(file.Name, CompressionLevel.Fastest);
                    using (var stream = entry.Open())
                    {
                        stream.Write(file.Content, 0, file.Content.Length);
                        stream.Seek(0, SeekOrigin.Begin);
                        stream.Close();
                    }
                }
                return ms.ToArray();
                */



            //modified from https://stackoverflow.com/questions/17217077/create-zip-file-from-byte
            using (var compressedFileStream = new MemoryStream())
            {
                //Create an archive and store the stream in memory.
                using (var zipArchive = new ZipArchive(compressedFileStream, ZipArchiveMode.Create, false))
                {
                    foreach (var file in files)
                    {
                        //Create a zip entry for each attachment
                        var zipEntry = zipArchive.CreateEntry(file.Name);

                        //Get the stream of the attachment
                        using (var originalFileStream = new MemoryStream(file.Content))
                        {
                            using (var zipEntryStream = zipEntry.Open())
                            {
                                //Copy the attachment stream to the zip entry stream
                                originalFileStream.CopyTo(zipEntryStream);
                            }
                        }
                    }


                }
                return compressedFileStream.ToArray();
            }
        }



        public class TableRequest
        {
            public string[] InvoiceNumbers { get; set; }
            public string RequestType { get; set; }
        }

        public class InvoiceSearch
        {
            public string Customer { set; get; }
            public string[] Months { set; get; }
            public string[] Isos { set; get; }
            public string[] Contracts { set; get; }
            public string[] LdcAccounts { set; get; }
        }

        private IEnumerable<string> GetDueDates()
        {
            var dates = from invoice in _context.Invoices select $"{invoice.DueDate:M/d/yyyy}";
            return dates.Distinct().OrderBy(date => date);
        }

        // GET: Invoices/Crud
        public async Task<IActionResult> Crud()
        {
            var invoicesContext = _context.Invoices.Include(i => i.ContractGroup).Include(i => i.Customer).Include(i => i.Iso).Include(i => i.LdcAccount).Include(i => i.Status);
            return View(await invoicesContext.ToListAsync());
        }

        // GET: Invoices/Details/5
        public async Task<IActionResult> Details(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var invoice = await _context.Invoices
                .Include(i => i.ContractGroup)
                .Include(i => i.Customer)
                .Include(i => i.Iso)
                .Include(i => i.LdcAccount)
                .Include(i => i.Status)
                .SingleOrDefaultAsync(m => m.InvoiceNumber == id);
            if (invoice == null)
            {
                return NotFound();
            }

            return View(invoice);
        }

        // GET: Invoices/Create
        public IActionResult Create()
        {
            ViewData["ContractGroupName"] = new SelectList(_context.ContractGroups, "Name", "Name");
            ViewData["CustomerId"] = new SelectList(_context.Customers, "Id", "Name");
            ViewData["IsoId"] = new SelectList(_context.Isos, "Id", "Name");
            ViewData["LdcAccountNumber"] = new SelectList(_context.LdcAccounts, "LdcAccountNumber", "LdcAccountNumber");
            ViewData["StatusId"] = new SelectList(_context.Statuses, "Id", "Name");
            return View();
        }

        // POST: Invoices/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("InvoiceNumber,DueDate,LdcAccountNumber,StatusId,Amount,Balance,ContractGroupName,CustomerId,IsoId,IsApproved")] Invoice invoice)
        {
            if (ModelState.IsValid)
            {
                _context.Add(invoice);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Crud));
            }
            ViewData["ContractGroupName"] = new SelectList(_context.ContractGroups, "Name", "Name", invoice.ContractGroupName);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "Id", "Name", invoice.CustomerId);
            ViewData["IsoId"] = new SelectList(_context.Isos, "Id", "Name", invoice.IsoId);
            ViewData["LdcAccountNumber"] = new SelectList(_context.LdcAccounts, "LdcAccountNumber", "LdcAccountNumber", invoice.LdcAccountNumber);
            ViewData["StatusId"] = new SelectList(_context.Statuses, "Id", "Name", invoice.StatusId);
            return View(invoice);
        }

        // GET: Invoices/Edit/5
        public async Task<IActionResult> Edit(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var invoice = await _context.Invoices.SingleOrDefaultAsync(m => m.InvoiceNumber == id);
            if (invoice == null)
            {
                return NotFound();
            }
            ViewData["ContractGroupName"] = new SelectList(_context.ContractGroups, "Name", "Name", invoice.ContractGroupName);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "Id", "Name", invoice.CustomerId);
            ViewData["IsoId"] = new SelectList(_context.Isos, "Id", "Name", invoice.IsoId);
            ViewData["LdcAccountNumber"] = new SelectList(_context.LdcAccounts, "LdcAccountNumber", "LdcAccountNumber", invoice.LdcAccountNumber);
            ViewData["StatusId"] = new SelectList(_context.Statuses, "Id", "Name", invoice.StatusId);
            return View(invoice);
        }

        // POST: Invoices/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(string id, [Bind("InvoiceNumber,DueDate,LdcAccountNumber,StatusId,Amount,Balance,ContractGroupName,CustomerId,IsoId,IsApproved")] Invoice invoice)
        {
            if (id != invoice.InvoiceNumber)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(invoice);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!InvoiceExists(invoice.InvoiceNumber))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Crud));
            }
            ViewData["ContractGroupName"] = new SelectList(_context.ContractGroups, "Name", "Name", invoice.ContractGroupName);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "Id", "Name", invoice.CustomerId);
            ViewData["IsoId"] = new SelectList(_context.Isos, "Id", "Name", invoice.IsoId);
            ViewData["LdcAccountNumber"] = new SelectList(_context.LdcAccounts, "LdcAccountNumber", "LdcAccountNumber", invoice.LdcAccountNumber);
            ViewData["StatusId"] = new SelectList(_context.Statuses, "Id", "Name", invoice.StatusId);
            return View(invoice);
        }

        // GET: Invoices/Delete/5
        public async Task<IActionResult> Delete(string id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var invoice = await _context.Invoices
                .Include(i => i.ContractGroup)
                .Include(i => i.Customer)
                .Include(i => i.Iso)
                .Include(i => i.LdcAccount)
                .Include(i => i.Status)
                .SingleOrDefaultAsync(m => m.InvoiceNumber == id);
            if (invoice == null)
            {
                return NotFound();
            }

            return View(invoice);
        }

        // POST: Invoices/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(string id)
        {
            var invoice = await _context.Invoices.SingleOrDefaultAsync(m => m.InvoiceNumber == id);
            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Crud));
        }

        private bool InvoiceExists(string id)
        {
            return _context.Invoices.Any(e => e.InvoiceNumber == id);
        }
    }
}
