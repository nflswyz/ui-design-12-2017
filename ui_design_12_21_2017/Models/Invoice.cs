using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ui_design_12_21_2017.Models
{
    public class Invoice
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Display(Name = "Invoice Number")]
        public string InvoiceNumber { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [Display(Name = "Due Date")]
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime DueDate { get; set; }
        
        [Required]
        [ForeignKey("LdcAccount")]
        public string LdcAccountNumber { get; set; }
        [Display(Name = "LDC Acct#")]
        public LdcAccount LdcAccount { get; set; }

        [Required]
        [ForeignKey("Status")]
        public int StatusId { get; set; }
        public Status Status { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public decimal Balance { get; set; }

        [ForeignKey("ContractGroup")]
        [Required]
        public string ContractGroupName { get; set; }

        [Display(Name = "Contract Group")]
        public ContractGroup ContractGroup { get; set; }

        [ForeignKey("Customer")]
        [Required]
        public int CustomerId { get; set; }

        [Display(Name = "Customer")]
        public Customer Customer { get; set; }

        [ForeignKey("Iso")]
        [Required]
        public int IsoId { get; set; }

        [Display(Name = "ISO")]
        public Iso Iso { get; set; }

        [Required]
        [Display(Name = "Approved?")]
        public bool IsApproved { get; set; }

        [Required]
        public byte[] DetailFile { get; set; }
    }
}
