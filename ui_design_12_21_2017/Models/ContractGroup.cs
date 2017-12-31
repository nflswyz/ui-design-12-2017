using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ui_design_12_21_2017.Models
{
    public class ContractGroup
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string Name { get; set; }

        public ICollection<Invoice> Invoices { get; set; }

        [Required] public byte[] ShadowSettlement { get; set; }
    }
}
