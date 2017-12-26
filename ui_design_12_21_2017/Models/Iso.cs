using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ui_design_12_21_2017.Models
{
    public class Iso
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<Invoice> Invoices { get; set; }
    }
}
