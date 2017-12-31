using System;
using System.IO;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using ui_design_12_21_2017.Models;

namespace ui_design_12_21_2017.Data
{
    public class DbInitializer
    {


        public static void Initialize(IServiceProvider services)
        {
            InvoicesContext context = services.GetRequiredService<InvoicesContext>();
            //context.Database.EnsureCreated();

            var sampleShadowSettlement =
                File.ReadAllBytes(
                    @"C:\Users\Wangyuzhi\OneDrive\Documents\Projects\UI Design\sample_shadow_settlement.csv");

            var sampleInvoiceDetail =
                File.ReadAllBytes(
                    @"C:\Users\Wangyuzhi\OneDrive\Documents\Projects\UI Design\sample_invoice_detail.pdf");


            //Look for any invoices.
            if (context.Invoices.Any()) return;
            var contractGroups = new []
            {
                new ContractGroup {Name = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18", ShadowSettlement = sampleShadowSettlement},
                new ContractGroup {Name = "ESCO-OH-DAYTON-DAY-APR/17-APR/18", ShadowSettlement = sampleShadowSettlement},
                new ContractGroup {Name = "ESCO-OH-DAYTON-DAY-MAY/17-MAY/18", ShadowSettlement = sampleShadowSettlement}
            };
            foreach (var c in contractGroups)
            {
                context.ContractGroups.Add(c);
            }
            context.SaveChanges();

            var customers = new []
            {
                new Customer {Name = "HOME CENTERS INC"},
                new Customer {Name = "CUSTOMER 2"},
                new Customer {Name = "CUSTOMER 3"}
            };
            foreach (var c in customers)
            {
                context.Customers.Add(c);
            }
            context.SaveChanges();

            var isos = new []
            {
                new Iso {Name = "ISO1"},
                new Iso {Name = "ISO2"},
                new Iso {Name = "ISO3"}
            };
            foreach (var i in isos)
            {
                context.Isos.Add(i);
            }

            context.SaveChanges();

            var ldcAccounts = new []
            {
                new LdcAccount {LdcAccountNumber = "10001234"},
                new LdcAccount {LdcAccountNumber = "10001235"},
                new LdcAccount {LdcAccountNumber = "10001236"}
            };
            foreach (var l in ldcAccounts)
            {
                context.LdcAccounts.Add(l);
            }

            context.SaveChanges();

            var statuses = new []
            {
                new Status {Name = "Paid"},
                new Status {Name = "Paid Pending Dispute"},
                new Status {Name = "UnPaid"},
                new Status {Name = "Unpaid Pending Dispute"}
            };
            foreach (var s in statuses)
            {
                context.Statuses.Add(s);
            }

            context.SaveChanges();


            var invoices = new []
            {
                new Invoice
                {
                    InvoiceNumber = "8888881",
                    DueDate = DateTime.Parse("2017-4-10"),
                    LdcAccountNumber = "10001234",
                    StatusId = 1,
                    Amount = 209298.33m,
                    Balance = 209298.33m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18",
                    CustomerId = 1,
                    IsoId = 1,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "8888882",
                    DueDate = DateTime.Parse("2017-6-10"),
                    LdcAccountNumber = "10001234",
                    StatusId = 2,
                    Amount = 230124.23m,
                    Balance = 230124.23m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18",
                    CustomerId = 1,
                    IsoId = 1,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "8888883",
                    DueDate = DateTime.Parse("2017-7-10"),
                    LdcAccountNumber = "10001234",
                    StatusId = 4,
                    Amount = 245239.56m,
                    Balance = 245239.56m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18",
                    CustomerId = 1,
                    IsoId = 1,
                    IsApproved = false,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "8888884",
                    DueDate = DateTime.Parse("2017-4-10"),
                    LdcAccountNumber = "10001235",
                    StatusId = 3,
                    Amount = 255134.23m,
                    Balance = 255134.23m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18",
                    CustomerId = 1,
                    IsoId = 1,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "8888885",
                    DueDate = DateTime.Parse("2017-4-10"),
                    LdcAccountNumber = "10001236",
                    StatusId = 1,
                    Amount = 263233.11m,
                    Balance = 263233.11m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAR/17-MAR/18",
                    CustomerId = 1,
                    IsoId = 1,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "7777776",
                    DueDate = DateTime.Parse("2017-3-10"),
                    LdcAccountNumber = "10001234",
                    StatusId = 1,
                    Amount = 263233.11m,
                    Balance = 263233.11m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-APR/17-APR/18",
                    CustomerId = 2,
                    IsoId = 2,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                },
                new Invoice
                {
                    InvoiceNumber = "6666665",
                    DueDate = DateTime.Parse("2017-8-10"),
                    LdcAccountNumber = "10001235",
                    StatusId = 3,
                    Amount = 263233.11m,
                    Balance = 263233.11m,
                    ContractGroupName = "ESCO-OH-DAYTON-DAY-MAY/17-MAY/18",
                    CustomerId = 3,
                    IsoId = 3,
                    IsApproved = true,
                    DetailFile = sampleInvoiceDetail
                }
            };
            foreach (var i in invoices)
            {
                context.Invoices.Add(i);
            }
            context.SaveChanges();
        }
    }
}
