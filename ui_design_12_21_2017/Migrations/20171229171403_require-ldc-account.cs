using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace ui_design_12_21_2017.Migrations
{
    public partial class requireldcaccount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LdcAccounts_LdcAccountNumber",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "LdcAccountNumber",
                table: "Invoices",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LdcAccounts_LdcAccountNumber",
                table: "Invoices",
                column: "LdcAccountNumber",
                principalTable: "LdcAccounts",
                principalColumn: "LdcAccountNumber",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_LdcAccounts_LdcAccountNumber",
                table: "Invoices");

            migrationBuilder.AlterColumn<string>(
                name: "LdcAccountNumber",
                table: "Invoices",
                nullable: true,
                oldClrType: typeof(string));

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_LdcAccounts_LdcAccountNumber",
                table: "Invoices",
                column: "LdcAccountNumber",
                principalTable: "LdcAccounts",
                principalColumn: "LdcAccountNumber",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
