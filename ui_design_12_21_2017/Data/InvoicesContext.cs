using Microsoft.EntityFrameworkCore;
using ui_design_12_21_2017.Models;

namespace ui_design_12_21_2017.Data
{
    public class InvoicesContext : DbContext
    {
        public InvoicesContext (DbContextOptions<InvoicesContext> options)
            : base(options)
        {
        }

        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<ContractGroup> ContractGroups { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Iso> Isos { get; set; }
        public DbSet<LdcAccount> LdcAccounts { get; set; }
        public DbSet<Status> Statuses { get; set; }

        /*protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Invoice>().ToTable("Invoice");
            modelBuilder.Entity<ContractGroup>().ToTable("ContractGroup");
            modelBuilder.Entity<Customer>().ToTable("Customer");
            modelBuilder.Entity<Iso>().ToTable("Iso");
            modelBuilder.Entity<LdcAccount>().ToTable("LdcAccount");

        }*/
    }
}
