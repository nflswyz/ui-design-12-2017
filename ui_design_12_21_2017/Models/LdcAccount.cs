using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ui_design_12_21_2017.Models
{
    public class LdcAccount
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string LdcAccountNumber { get; set; }

        public ICollection<Invoice> Invoices { get; set; }
    }
}
