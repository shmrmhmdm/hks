/**
 * Haritha Mithram Puduppady GP - Google Apps Script Backend
 * 
 * ഈ കോഡ് ഗൂഗിൾ ഷീറ്റിൽ Extensions > Apps Script തുറന്ന് പേസ്റ്റ് ചെയ്ത് Deploy ചെയ്യുക.
 * തിരുത്തലുകളും (Edit) ഡിലീറ്റും (Delete) കൃത്യമായി ഈ കോഡ് കൈകാര്യം ചെയ്യും.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Collection") || ss.insertSheet("Collection");
    
    // ആദ്യത്തെ വരിയിൽ ഹെഡ്ഡറുകൾ ചേർക്കുക
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Date",
        "Time",
        "HKS Member Name",
        "HKS Member Mobile",
        "Ward",
        "Customer Number",
        "Customer Name",
        "Customer Type",
        "Door Number",
        "Building Name",
        "Status",
        "Amount (₹)",
        "Waste Status",
        "Payment Mode",
        "Remarks / Reason",
        "Customer Phone",
        "QR Code"
      ]);
      sheet.getRange(1, 1, 1, 18).setFontWeight("bold").setBackground("#dcfce7");
      sheet.setFrozenRows(1);
    }
    
    var data = JSON.parse(e.postData.contents);
    var now = new Date();
    var dateStr = Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy");
    var timeStr = Utilities.formatDate(now, "Asia/Kolkata", "hh:mm:ss a");
    var targetDate = data.dateString || dateStr;
    var targetCustId = String(data.customerId || "").trim();

    var lastRow = sheet.getLastRow();
    var existingRowIndex = -1;

    // ഷീറ്റിൽ ഈ കസ്റ്റമറുടെ ഇന്നത്തെ എൻട്രി ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു (Customer No: Col 7, Date: Col 2)
    if (lastRow > 1 && targetCustId) {
      var rangeValues = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
      for (var i = 0; i < rangeValues.length; i++) {
        var rowDate = rangeValues[i][1];
        var rowCustId = String(rangeValues[i][6]).trim();
        if (rowCustId === targetCustId) {
          existingRowIndex = i + 2; // 1-indexed (row 1 is header)
          break;
        }
      }
    }

    // 1. ഡിലീറ്റ് ചെയ്യാനുള്ള റിക്വസ്റ്റ് (Action: DELETE)
    if (data.action === "DELETE") {
      if (existingRowIndex > 0) {
        sheet.deleteRow(existingRowIndex);
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          action: "deleted",
          message: "Row deleted from Collection sheet"
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          action: "not_found",
          message: "No existing row to delete"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 2. സേവ് / തിരുത്തൽ (Action: SAVE / UPDATE)
    var rowData = [
      now,
      targetDate,
      timeStr,
      data.collectorName || "",
      data.collectorMob || "",
      data.ward || "",
      data.customerId || "",
      data.customerName || "",
      data.customerType || "",
      data.door || "",
      data.building || "",
      data.status || (data.amount > 0 ? "PAID" : "UNPAID"),
      data.amount || 0,
      data.wasteStatus || "",
      data.payMode || "",
      data.remarks || "",
      data.phone || "",
      data.qr || ""
    ];

    if (existingRowIndex > 0) {
      // നിലവിലുള്ള വരി തിരുത്തുന്നു (Update in place)
      sheet.getRange(existingRowIndex, 1, 1, 18).setValues([rowData]);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "updated",
        row: existingRowIndex
      })).setMimeType(ContentService.MimeType.JSON);
    } else {
      // പുതിയ വരിയായി ചേർക്കുന്നു (Append new row)
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        action: "inserted"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Haritha Mithram Puduppady GP Collection Webhook is Running"
  })).setMimeType(ContentService.MimeType.JSON);
}
