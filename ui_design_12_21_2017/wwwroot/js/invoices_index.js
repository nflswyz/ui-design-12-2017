var BOOTSTRAP_MULTISELECT_OPTIONS = {
    buttonWidth: "100%",
    enableFiltering: true,
    includeSelectAllOption: true,
    selectAllJustVisible: true
};

var TABLE_HEADERS = {
    contractGroupName: { text: "Contract Group", column: 1 },
    invoiceNumber: { text: "Invoice#", column: 2 },
    ldcAccountNumber: { text: "Ldc Acct#", column: 3 },
    isoName: { text: "ISO", column: 4 },
    dueDate: { text: "Due Date", column: 5 },
    status: { text: "Status", column: 6 },
    amount: { text: "Amount", column: 7 },
    balance: { text: "Balance", column: 8 },
    isApproved: { text: "Action", column: 9 }
};

var TABLE_HEADER_TEXTS = [];
var TABLE_COLUMN_CELLS_TEXT_ARRAYS = {};

Object.keys(TABLE_HEADERS).forEach(function (key, index) {
    TABLE_HEADER_TEXTS[TABLE_HEADERS[key].column - 1] = key;
    TABLE_COLUMN_CELLS_TEXT_ARRAYS[key] = [];
});

//var TABLEROW_HIDE_BITS = [];

function TableColumnFilterBehaviors(dataRowCount) {
    this.filteringStates = [];
    this.rowHideCounts = [];
    for (var i = 0; i < dataRowCount; i++) {
        this.filteringStates[i] = {};
        this.rowHideCounts[i] = 0;
    }
}
TableColumnFilterBehaviors.prototype.addFilter = function (filterId) {
    if (!this.filteringStates[0].hasOwnProperty(filterId)) {
        for (var i = 0; i < this.filteringStates.length; i++) {
            this.filteringStates[i][filterId] = true;
        }
    }
}
TableColumnFilterBehaviors.prototype.hideRow = function (dataRowIndex, filterId) {
    if (this.filteringStates[dataRowIndex][filterId] === true) {
        this.rowHideCounts[dataRowIndex]++;
        this.filteringStates[dataRowIndex][filterId] = false;
        return this.rowHideCounts[dataRowIndex] === 1 ? true : false;
    } else return false;
}
TableColumnFilterBehaviors.prototype.showRow = function (dataRowIndex, filterId) {
    if (this.filteringStates[dataRowIndex][filterId] === false) {
        this.rowHideCounts[dataRowIndex]--;
        this.filteringStates[dataRowIndex][filterId] = true;
        return this.rowHideCounts[dataRowIndex] === 0 ? true : false;
    } else return false;
}

var INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS = null;
var TABLE_COLUMN_VALUE_TEXTBOX_FILTERS = [];

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

    $("#btn-reset").click(function (e) {
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

    $(document).on("click",
        ".dropdown-menu-prevent-close-on-click-inside",
        function(e) {
            e.stopPropagation();
        });
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
    // This approach is not ideal and will be modified in the future.
    var table = $("#invoice-table");
    var firstRow = table[0].rows[0];
    var innerHtml = "";
    var i;
    for (i = 0; i < TABLE_HEADER_TEXTS.length; i++) {
        innerHtml += "<th id='tableheader-" + (i + 1) + "'><div class='row'><div class='col-xs-10'><label>" + TABLE_HEADERS[TABLE_HEADER_TEXTS[i]].text + "</label></div><div class='col-xs-2'><div class='dropdown'><button type='button' class='btn dropdown-toggle' data-toggle='dropdown'><span class='caret table-column-dropdown-caret'></span></button><ul id='table-header-dropdown-menu-" + i + "' class='dropdown-menu dropdown-menu-prevent-close-on-click-inside'></ul></div></div></div><div class='row'><input id='table-column-value-textbox-filter-" + i + "' type='text' class='col-xs-12'></div></th>";
    }
    firstRow.innerHTML += innerHtml;

    for (i = 0; i < TABLE_HEADER_TEXTS.length; i++) {
        var filterId = "table-column-value-textbox-filter-" + i;
        var filterJQueryObj = $("#" + filterId);
        filterJQueryObj.on("input propertychange paste", tableColumnValueTextboxFilterWrapper(filterJQueryObj[0], i));
        TABLE_COLUMN_VALUE_TEXTBOX_FILTERS.push(filterId);
    }

    var headerTextArray = [];
    TABLE_HEADER_TEXTS.forEach(function (value, index) {
        headerTextArray[index] = TABLE_HEADERS[value].text;
    });
    generateCheckboxDropdown($("#filter-dropdown-menu"),
        headerTextArray,
        function (iVal) {
            return "column-selector-" + iVal;
        },
        function (srcElement, iVal) {
            return columnSelectorWrapper(srcElement, iVal);
        });

    /*
    var filterDropdownMenu = $("#filter-dropdown-menu");
    var filterInnerHtml = "";
    for (i = 0; i < TABLE_HEADER_COLUMNS.length; i++) {
        filterInnerHtml += "<li><input id='column-selector-" + i + "' type='checkbox' checked><label>" + TABLE_HEADERS[TABLE_HEADER_COLUMNS[i]].text + "</label></li>";
    }
    filterDropdownMenu[0].innerHTML = filterInnerHtml;
    for (i = 0; i < TABLE_HEADER_COLUMNS.length; i++) {
        $("#column-selector-" + i).change(columnSelectorWrapper(i));
    }
    */
}

function generateCheckboxDropdown(jQueryDropdownMenuObject, checkboxTextArray, inputIdGenerator, changeEventHandler, eventElementCallback) {
    var innerHtml = "";
    var i;
    var idArray = [];
    for (i = 0; i < checkboxTextArray.length; i++) {
        idArray[i] = inputIdGenerator(i);
        innerHtml += "<li><label><input id='" + idArray[i] + "' type='checkbox' checked>" + checkboxTextArray[i] + "</label></li>";
    }
    jQueryDropdownMenuObject[0].innerHTML = innerHtml;
    for (i = 0; i < checkboxTextArray.length; i++) {
        var jQueryObj = $("#" + idArray[i]);
        jQueryObj.change(checkboxDropdownEventHandlerWrapper(jQueryObj[0], i, changeEventHandler));
        if (typeof eventElementCallback != "undefined") eventElementCallback(idArray[i]);
    }
}

function checkboxDropdownEventHandlerWrapper(srcElement, i, changeEventCallback) {
    return changeEventCallback(srcElement, i);
}

function resetTable(withColumnSelectors) {
    if (typeof withColumnSelectors == "undefined") withColumnSelectors = true;
    for (var i = 0; i < TABLE_HEADER_TEXTS.length; i++) {
        $("#table-column-value-textbox-filter-" + i).val("").trigger("input");
        if (withColumnSelectors) $("#column-selector-" + i).prop("checked", true).trigger("change");
        $("table#invoice-table th .dropdown-menu label input[type='checkbox']").prop("checked", true).trigger("change");
        $("table#invoice-table td:first-child input[type='checkbox']").prop("checked", false);
    }
}

function columnSelectorWrapper(srcElement, headerIndex) {
    return function (e) {
        var table = $("#invoice-table");
        var checked = $(srcElement).prop("checked");

        if (checked) {
            table.find("td:nth-child(" + (headerIndex + 2) + ")").show();
            table.find("th:nth-child(" + (headerIndex + 2) + ")").show();
        } else {
            table.find("td:nth-child(" + (headerIndex + 2) + ")").hide();
            table.find("th:nth-child(" + (headerIndex + 2) + ")").hide();
        }
    }
}

function tableColumnValueTextboxFilterWrapper(srcElement, headerIndex) {
    return function (e) {
        if (INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS != null) {
            var keyword = $(this).val();
            tableColumnValueFiltering(function (cellValue) {
                return cellValue.includes(keyword);
            },
                headerIndex,
                srcElement);
        }
    }
}

function tableColumnValueDropdownFilterWrapper(headerIndex) {
    return function(srcElement, iVal) {
        return function(e) {
            var checked = $(srcElement).prop("checked");
            var keyword = $(srcElement).parent().text();
            tableColumnValueFiltering(function(cellValue) {
                    var matched = keyword === cellValue;
                    return checked ? true : !matched;
                },
                headerIndex,
                srcElement);
        }
    }
}

function tableColumnValueFiltering(filterFunction, headerIndex, srcElement) {
    var table = $("#invoice-table");
    var srcElementId = $(srcElement).prop("id");
    for (var i = 1; i < table[0].rows.length; i++) {
        var cell = table[0].rows[i].cells[headerIndex + 1];
        var cellValue;
        if (TABLE_HEADER_TEXTS[headerIndex] === "contractGroupName" || TABLE_HEADER_TEXTS[headerIndex] === "invoiceNumber") {
            cellValue = cell.childNodes[0].text;
        }
        else if (TABLE_HEADER_TEXTS[headerIndex] === "isApproved") {
            cellValue = cell.childNodes[0].value;
        } else {
            cellValue = cell.innerText;
        }
        if (filterFunction(cellValue)) {
            if (INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS.showRow(i - 1, srcElementId)) {
                table.find("tr:nth-child(" + (i + 1) + ")").show();
            }
        } else {
            if (INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS.hideRow(i - 1, srcElementId)) {
                table.find("tr:nth-child(" + (i + 1) + ")").hide();
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
    Object.keys(TABLE_HEADERS).forEach(function (key, index) {
        TABLE_COLUMN_CELLS_TEXT_ARRAYS[key] = [];
    });
    for (i = 0; i < result.length; i++) {
        storeCellText(result[i]);
        tableRows += createTableRow(result[i], i + 1);
    }
    lastTbody.after(tableRows);
    INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS = new TableColumnFilterBehaviors(result.length);
    for (i = 0; i < TABLE_COLUMN_VALUE_TEXTBOX_FILTERS.length; i++) {
        INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS.addFilter(TABLE_COLUMN_VALUE_TEXTBOX_FILTERS[i]);
    }
    createTableHeaderDropdownMenus();
    for (i = 1; i < table[0].rows.length; i++) {
        var eventCells = ["contractGroupName", "invoiceNumber", "isApproved"];
        for (var j = 0; j < eventCells.length; j++) {
            var columnNumber = TABLE_HEADERS[eventCells[j]].column;
            $("#invoice-table").on("click", "#table-event-" + i + "-" + columnNumber, cellClickWrapper(i, columnNumber));
        }
    }
}

function storeCellText(resultObject) {
    for (var property in resultObject) {
        if (TABLE_HEADERS.hasOwnProperty(property)) {
            TABLE_COLUMN_CELLS_TEXT_ARRAYS[property].push(cellValueToString(resultObject[property], property));
        }
    }
}

function cellValueToString(value, propertyName) {
    return propertyName === "isApproved" ? value === true ? "Approved" : "Approve for Payment" : value.toString();
}

function createTableHeaderDropdownMenus() {
    for (var i = 0; i < TABLE_HEADER_TEXTS.length; i++) {
        var dropdownMenu = $("#table-header-dropdown-menu-" + i);
        var cellTextArray = TABLE_COLUMN_CELLS_TEXT_ARRAYS[TABLE_HEADER_TEXTS[i]];
        if (cellTextArray.length > 0) {
            cellTextArray.sort();
            var lastValue = cellTextArray[0];
            var cellTextNoduplicateArray = [cellTextArray[0]];
            for (var j = 1; j < cellTextArray.length; j++) {
                if (cellTextArray[j] !== lastValue) cellTextNoduplicateArray.push(cellTextArray[j]);
                lastValue = cellTextArray[j];
            }
            TABLE_COLUMN_CELLS_TEXT_ARRAYS[TABLE_HEADER_TEXTS[i]] = cellTextNoduplicateArray;
            generateCheckboxDropdown(dropdownMenu,
                cellTextNoduplicateArray,
                dropdownFilterIdWrapper(i),
                tableColumnValueDropdownFilterWrapper(i),
                function (eventElementId) {
                    INVOICE_TABLE_COLUMN_FILTER_BEHAVIORS.addFilter(eventElementId);
                });
        }
    }
}

function dropdownFilterIdWrapper(headerTextIndex) {
    return function(iVal) {
        return "table-column-value-dropdown-filter-" + headerTextIndex + "-" + iVal;
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

        if ($("#invoice-table > tr:nth-child(" + (i + 1) + ")").is(":visible") && table[0].rows[i].childNodes[0].childNodes[0].checked) {
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
                resetTable(false);
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
            resetTable(false);
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

    // This approach is not ideal and will be modified in the future.
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