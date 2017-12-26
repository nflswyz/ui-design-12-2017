$(document).ready(function () {
    $(".dropdown-toggle").dropdown();


    $("#select2-customer").select2({
        dropdownParent: $("#select2-customer-container"),
        theme: "bootstrap"
    });

    $("#select2-viewby").select2({
        dropdownParent: $("#select2-viewby-container"),
        theme: "bootstrap" 
    });

    $(".bootstrap-multiselect").multiselect({
        buttonWidth: "100%",
        enableFiltering: true,
        includeSelectAllOption: true,
        selectAllJustVisible: true
    });
});