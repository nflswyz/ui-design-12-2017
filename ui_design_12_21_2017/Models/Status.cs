using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ui_design_12_21_2017.Models
{
    public class Status
    {
        [Key] public int Id { get; set; }
        [Required] public string Name { get; set; }
    }
}
