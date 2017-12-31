using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace ui_design_12_21_2017.Migrations
{
    public partial class addfiles : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "DetailFile",
                table: "Invoices",
                nullable: false,
                defaultValue: new byte[] {  });

            migrationBuilder.AddColumn<byte[]>(
                name: "ShadowSettlement",
                table: "ContractGroups",
                nullable: false,
                defaultValue: new byte[] {  });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DetailFile",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "ShadowSettlement",
                table: "ContractGroups");
        }
    }
}
