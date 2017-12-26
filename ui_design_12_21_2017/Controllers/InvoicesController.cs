using System;
using System.Collections.Generic;
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
            return View();
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
