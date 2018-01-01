var BOOTSTRAP_MULTISELECT_OPTIONS = {
    buttonWidth: "100%",
    enableFiltering: true,
    includeSelectAllOption: true,
    selectAllJustVisible: true
};

var TABLE_HEADERS = [
    ["contract-group", "Contract Group"], ["invoice-number", "Invoice#"], ["ldc-account-number", "Ldc Acct#"],
    ["iso", "ISO"], ["due-date", "Due Date"], ["status", "Status"], ["amount", "Amount"], ["balance", "Balance"],
    ["action", "Action"]
];

var TABLEROW_HIDE_BITS = [];

$(document).ready(function () {

    tableHeaderInit();

    $("#search-invoices-form").on("submit",
        function (e) {
            e.preventDefault();
            invoiceSearch();
        });

    $("#invoice-table-form").on("submit",
        function (e) {
            e.preventDefault();
        });

    $("#btn-approve-for-payment").on("click",
        function (e) {
            tableRequest("approval");
        });

    $("#btn-download-invoices").on("click",
        function (e) {
            tableRequest("invoiceDetail");
        });

    $("#btn-download-shadow-settlements").on("click",
        function (e) {
            tableRequest("shadowSettlement");
        });

    $("#btn-reset").click(function(e) {
        resetTable(true);
    });


    $(".dropdown-toggle").dropdown();


    $("#select-customer").select2({
        dropdownParent: $("#select-customer-container"),
        theme: "bootstrap"
    });

    $("#select-view-by-month").select2({
        dropdownParent: $("#select-view-by-month-container"),
        theme: "bootstrap"
    });
    /*$(".bootstrap-multiselect").select2({
        theme: "bootstrap"
    });
    */

    $(".bootstrap-multiselect").multiselect(BOOTSTRAP_MULTISELECT_OPTIONS);
    $(".bootstrap-multiselect").multiselect("selectAll", false);
    $(".bootstrap-multiselect").multiselect("updateButtonText");
    //$("select#select-view-by-month").val($("select#select-view-by-month option")[$("select#select-view-by-month option").length - 1]);
    var viewByMonthSelect = document.getElementById("select-view-by-month");
    var viewByMonthSelectOptions = viewByMonthSelect.options;
    var viewByMonthSelectLastOption = viewByMonthSelectOptions[viewByMonthSelectOptions.length - 1].value;
    $("#select-view-by-month").val(viewByMonthSelectLastOption).trigger("change");


});

function addAntiForgeryToken(data) {
    data.__RequestVerificationToken = $("#__AjaxAntiForgeryForm input[name=__RequestVerificationToken]").val();
}

function invoiceSearch() {
    var form = $("#search-invoices-form");

    //var formData = {};
    /*
    formData[$("#select-customer").attr("name")] = $("#select-customer").val();
    formData[$("#multiselect-month").attr("name")] = retrieveMultiselectOptions($("#multiselect-month"));
    formData[$("#multiselect-iso").attr("name")] = retrieveMultiselectOptions($("#multiselect-iso"));
    formData[$("#multiselect-contract").attr("name")] = retrieveMultiselectOptions($("#multiselect-contract"));
    formData[$("#multiselect-ldc-accounts").attr("name")] = retrieveMultiselectOptions($("#multiselect-ldc-accounts"));
    */

    var formData = {
        Customer: $("#select-customer").val(),
        Months: retrieveMultiselectOptions($("#multiselect-month")),
        Isos: retrieveMultiselectOptions($("#multiselect-iso")),
        Contracts: retrieveMultiselectOptions($("#multiselect-contract")),
        LdcAccounts: retrieveMultiselectOptions($("#multiselect-ldc-accounts"))
    };

    addAntiForgeryToken(formData);

    $.ajax({
        url: form.attr("action"),
        type: form.attr("method"),
        dataType: "json",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: formData,
        success: updateTable
    });
}

function tableHeaderInit() {
    var table = $("#invoice-table");
    var firstRow = table[0].rows[0];
    var innerHtml = "";
    var i;
    for (i = 0; i < TABLE_HEADERS.length; i++) {
        innerHtml += "<th id='tableheader-" + (i + 1) + "'><div class='row'><label class='col-sm-12'>" + TABLE_HEADERS[i][1] + "</label></div><div class='row'><input id='text-filter-" + i  + "' type='text' class='col-sm-12'></div></th>";
    }
    firstRow.innerHTML += innerHtml;

    for (i = 0; i < TABLE_HEADERS.length; i++) {
        $("#text-filter-" + i).on("input propertychange paste", textFilterWrapper(i));
    }

    var filterDropdownMenu = $("#filter-dropdown-menu");
    var filterInnerHtml = "";
    for (i = 0; i < TABLE_HEADERS.length; i++) {
        filterInnerHtml += "<li><input id='column-selector-" + i + "' type='checkbox' checked><label>" + TABLE_HEADERS[i][1] + "</label></li>";
    }
    filterDropdownMenu[0].innerHTML = filterInnerHtml;
    for (i = 0; i < TABLE_HEADERS.length; i++) {
        $("#column-selector-" + i).change(columnSelectorWrapper(i));
    }
}

function resetTable(withColumnFilters) {
    for (var i = 0; i < TABLE_HEADERS.length; i++) {
        $("#text-filter-" + i ).val("").trigger("input");
        if (withColumnFilters) $("#column-selector-" + i).prop("checked", true).trigger("change");
        $("table#invoice-table td:first-child input[type='checkbox']").prop("checked", false);
    }
}

function columnSelectorWrapper(i) {
    return function (e) {
        var table = $("#invoice-table");
        var checked = $(this).prop("checked");

        if (checked) {
            table.find("td:nth-child(" + (i + 2) + ")").show();
            table.find("th:nth-child(" + (i + 2) + ")").show();
        } else {
            table.find("td:nth-child(" + (i + 2) + ")").hide();
            table.find("th:nth-child(" + (i + 2) + ")").hide();
        }
    }
}

function textFilterWrapper(i) {
    return function (e) {
        var table = $("#invoice-table");
        var keyword = $(this).val();
        for (var j = 1; j < table[0].rows.length; j++) {
            var cell = table[0].rows[j].cells[i + 1];
            var cellValue;
            if (i === 0 || i === 1) {
                cellValue = cell.childNodes[0].text;
            }
            else if (i === 8) {
                cellValue = cell.childNodes[0].value;
            } else {
                cellValue = cell.innerText;
            }
            if (keyword === "" || cellValue.includes(keyword)) {
                if (TABLEROW_HIDE_BITS[j - 1] > 0) {
                    TABLEROW_HIDE_BITS[j - 1] &= ~ (1 << i);
                    if (TABLEROW_HIDE_BITS[j - 1] === 0) table.find("tr:nth-child(" + (j + 1) + ")").show();
                }
            } else {
                TABLEROW_HIDE_BITS[j - 1] |= 1 << i;
                table.find("tr:nth-child(" + (j + 1) + ")").hide();
            }
        }
    }
}

function updateTable(result) {
    resetTable(false);
    console.log("Data received:");
    console.log(result);
    var table = $("table#invoice-table");
    table.find("tr:not(:first)").remove();
    var lastTbody = $("#invoice-table > tbody:last-child");
    var tableRows = "";
    var i;
    for (i = 0; i < result.length; i++) {
        tableRows += createTableRow(result[i], i + 1);
    }
    lastTbody.after(tableRows);
    TABLEROW_HIDE_BITS = [];
    for (i = 1; i < table[0].rows.length; i++) {
        var row = table[0].rows[i];
        var eventCells = [1, 2, 9];
        for (var j = 0; j < eventCells.length; j++) {
            $("#invoice-table").on("click", "#table-event-" + i + "-" + eventCells[j], cellClickWrapper(i, eventCells[j]));
        }
    }
}

function cellClickWrapper(i, j) {
    return function (e) {
        tablecellRequest(i, j);
    }
}

function tableRequest(requestType) {
    var form;
    if (requestType === "approval") {
        form = $("#invoice-table-update-form");
    } else {
        form = $("#invoice-table-form");
    }
    var table = $("#invoice-table");
    var invoiceNumbers = [];
    var checkedRows = [];
    for (var i = 1; i < table[0].rows.length; i++) {

        if (table[0].rows[i].childNodes[0].childNodes[0].checked) {
            checkedRows.push(i);
            var row = table[0].rows[i];
            var invoiceCol = row.childNodes[2];
            var innerElement = invoiceCol.childNodes[0];
            var val = innerElement.innerText;
            if (requestType !== "approval" || !row.childNodes[9].childNodes[0].classList.contains("btn-approved"))
                invoiceNumbers.push(val);
        }
    }
    if (invoiceNumbers.length > 0) {
        var formData = {
            invoiceNumbers: invoiceNumbers,
            requestType: requestType
        };

        addAntiForgeryToken(formData);

        var formDataObj = generateUrlSearchParams(formData);

        var oReq = new XMLHttpRequest();
        oReq.open(form.attr("method"), form.attr("action"), true);
        if (requestType === "approval") {

            oReq.responseType = "text";
            oReq.onload = function (oEvent) {
                for (var j = 1; j < checkedRows.length; j++) {
                    approve(checkedRows[j]);
                }
            };
        } else {

            oReq.responseType = "blob";
            oReq.onload = function (oEvent) {
                var fileName;
                if (requestType === "shadowSettlement") {
                    if (invoiceNumbers.length === 1)
                        fileName = "shadow_settlement.csv";
                    else fileName = "shadow_settlements.zip";
                } else {
                    if (invoiceNumbers.length === 1)
                        fileName = "invoice_detail.pdf";
                    else fileName = "invoice_details.zip";
                }
                var blob = oReq.response;
                downloadBlob(blob, fileName);
            };
        }
        oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");
        oReq.send(formDataObj);
        /*$.ajax({
            url: form.attr("action"),
            type: form.attr("method"),
            dataType: "binary",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            data: formData,
            success: function(result) {
                var url = URL.createObjectURL(result);
                var $a = $("<a />",
                    {
                        "href": url,
                        "download": "file.pdf",
                        "text": "click"
                    }).hide().appendTo("body")[0].click();
            }
        });*/
    }
}



function tablecellRequest(row, col) {
    var form;
    var table = $("#invoice-table");
    var invoiceNumber = table[0].rows[row].childNodes[2].childNodes[0].innerText;
    var requestType = null;
    if (col === 1) {
        requestType = "shadowSettlement";
    }
    else if (col === 2) {
        requestType = "invoiceDetail";
    }
    else if (col === 9) {
        requestType = "approval";
    }
    if (requestType === "approval") {
        if (table[0].rows[row].childNodes[9].childNodes[0].classList.contains("btn-approved")) return;
        form = $("#invoice-table-update-form");
    } else {
        form = $("#invoice-table-form");
    }

    var formData = {
        invoiceNumbers: [invoiceNumber],
        requestType: requestType
    }

    addAntiForgeryToken(formData);

    var formDataObj = generateUrlSearchParams(formData);

    var oReq = new XMLHttpRequest();
    oReq.open(form.attr("method"), form.attr("action"), true);
    if (requestType === "approval") {
        oReq.responseType = "text";
        oReq.onload = function (oEvent) {
            approve(row);
        };
    } else {
        oReq.responseType = "blob";
        oReq.onload = function (oEvent) {
            var fileName;
            if (requestType === "shadowSettlement") {
                fileName = "shadow_settlement.csv";
            }
            else {
                fileName = "invoice_detail.pdf";
            }
            var blob = oReq.response;
            downloadBlob(blob, fileName);
        };
    }
    oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=utf-8");

    oReq.send(formDataObj);
    /*$.ajax({
        url: form.attr["action"],
        type: form.attr["method"],
        dataType: "binary",
        contentType: "application/x-www-form-urlencoded; charset=utf-8",
        data: formData,
        success: function(result) {
            var url = URL.createObjectURL(result);
            var $a = $("<a />",
                {
                    "href": url,
                    "download": "file.pdf",
                    "text": "click"
                }).hide().appendTo("body")[0].click();
        }
    });*/
}

function approve(row) {
    var element = $("#invoice-table")[0].rows[row].childNodes[9].childNodes[0];
    element.value = "Approved";
    element.classList.remove("btn-not-approved");
    element.classList.add("btn-approved");
}

function downloadBlob(blob, fileName) {
    var url = window.URL.createObjectURL(blob);
    var a = $("#__fileDownload")[0];
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

function generateUrlSearchParams(formData) {
    var urlSearchParams = new URLSearchParams();
    for (var property in formData) {
        if (formData.hasOwnProperty(property)) {
            var propertyObj = formData[property];
            if (!Array.isArray(propertyObj))
                urlSearchParams.append(property, formData[property]);
            else {
                var propertyName = property + "[]";
                for (var i = 0; i < propertyObj.length; i++) {
                    urlSearchParams.append(propertyName, propertyObj[i]);
                }
            }
        }
    }
    return urlSearchParams;
}

function createTableRow(value, rowNumber) {
    var tableRows = "<tr id=\"table-row-" + rowNumber + "\">";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-0\"><input type='checkbox'/></td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-1\"><a id='table-event-" + rowNumber + "-1' href='#'>" + value.contractGroupName + "</a></td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-2\"><a id='table-event-" + rowNumber + "-2' href='#'>" + value.invoiceNumber + "</a></td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-3\">" + value.ldcAccountNumber + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-4\">" + value.isoName + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-5\">" + value.dueDate + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-6\">" + value.status + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-7\">" + value.amount + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-8\">" + value.balance + "</td>";
    tableRows += "<td id=\"tablecell-" + rowNumber + "-9\"><input type='button' id='table-event-" + rowNumber + "-9' href='#' class='" + (value.isApproved ? "btn-approved" : "btn-not-approved") + "' value='" + (value.isApproved ? "Approved" : "Approve for Payment") + "'/></td>";
    tableRows += "</tr>";
    return tableRows;
}


function retrieveMultiselectOptions(selectboxJqueryObj) {
    var brands = selectboxJqueryObj.find("option:selected");
    var selected = [];
    $(brands).each(function (index, brand) {
        selected.push($(this).val());
    });
    return selected;
}


function setAvailableMonths(monthViewBy) {
    if (typeof monthViewBy === "string") {
        var i;
        var viewByMonthSelect = $("select#select-view-by-month");
        var monthMultiSelect = $("select#multiselect-month");
        var monthMultiSelectLength = monthMultiSelect[0].options.length;
        for (i = 0; i < monthMultiSelectLength; i++) {
            monthMultiSelect[0].remove(0);
        }
        for (i = 0; i < viewByMonthSelect[0].options.length; i++) {
            var month = viewByMonthSelect[0].options[i].value;
            var newOption = document.createElement("option");
            newOption.text = month;
            newOption.value = month;
            monthMultiSelect[0].add(newOption);
            if (month === monthViewBy) break;
        }
        //Refresh Bootstrap-multiselect plugin's options
        monthMultiSelect.multiselect("destroy");
        monthMultiSelect.multiselect(BOOTSTRAP_MULTISELECT_OPTIONS);
        monthMultiSelect.multiselect("selectAll", false);
        monthMultiSelect.multiselect("updateButtonText");
    }
}