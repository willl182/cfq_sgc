/**
 * ============================================================================
 * FORMULADOR CFQ — Google Apps Script Backend
 * ============================================================================
 *
 * HOW TO DEPLOY:
 * 1. Create a new Google Spreadsheet (or open an existing one).
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any existing code in the editor and paste this entire file.
 * 4. Click the floppy-disk icon (or Ctrl+S) to save.
 * 5. Go to Deploy > New deployment.
 * 6. Click the gear icon next to "Select type" and choose "Web app".
 * 7. Set:
 *      - Description: "Formulador CFQ API"
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 8. Click "Deploy".
 * 9. Authorize the script when prompted.
 * 10. Copy the Web app URL — this is your API endpoint.
 *
 * SHEETS (auto-created on first request):
 *   • catalogo_mp  — Raw-material catalogue
 *   • formulas     — Saved formulations
 *
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Constants — column headers for each sheet
// ---------------------------------------------------------------------------

var CATALOGO_MP_HEADERS = [
  'ID_PROD', 'COD', 'PRODUCTO', 'PROVEEDOR', 'Cprov', 'CLASE', 'TIPO', 'NOMBRE', 'EXTRAS',
  'C', 'N', 'N_NH4', 'N_NO3', 'N_org', 'N_ur',
  'P', 'K', 'CaO', 'MgO', 'S',
  'B', 'Co', 'Cu', 'Fe', 'Mn', 'Mo', 'SiO2', 'Zn', 'Na'
];

var SPREADSHEET_ID = '1byEDPlKWmgLYGpnuwbygVwBGanSflybKBA9VVdITgPE';

var FORMULAS_HEADERS = [
  'ID', 'FECHA', 'COD_PROD_DESTINO', 'NOMBRE_DESTINO', 'TOTAL_PROD',
  'MP1_COD', 'MP1_NOMBRE', 'MP1_CANTIDAD', 'MP1_LOTES',
  'MP2_COD', 'MP2_NOMBRE', 'MP2_CANTIDAD', 'MP2_LOTES',
  'MP3_COD', 'MP3_NOMBRE', 'MP3_CANTIDAD', 'MP3_LOTES',
  'MP4_COD', 'MP4_NOMBRE', 'MP4_CANTIDAD', 'MP4_LOTES',
  'MP5_COD', 'MP5_NOMBRE', 'MP5_CANTIDAD', 'MP5_LOTES',
  'MP6_COD', 'MP6_NOMBRE', 'MP6_CANTIDAD', 'MP6_LOTES',
  'MP7_COD', 'MP7_NOMBRE', 'MP7_CANTIDAD', 'MP7_LOTES',
  'MP8_COD', 'MP8_NOMBRE', 'MP8_CANTIDAD', 'MP8_LOTES',
  'MP9_COD', 'MP9_NOMBRE', 'MP9_CANTIDAD', 'MP9_LOTES',
  'MP10_COD', 'MP10_NOMBRE', 'MP10_CANTIDAD', 'MP10_LOTES',
  'MP11_COD', 'MP11_NOMBRE', 'MP11_CANTIDAD', 'MP11_LOTES',
  'T_C', 'T_N', 'T_N_NH4', 'T_N_NO3', 'T_N_org', 'T_N_ur',
  'T_P', 'T_K', 'T_CaO', 'T_MgO', 'T_S',
  'T_B', 'T_Co', 'T_Cu', 'T_Fe', 'T_Mn', 'T_Mo', 'T_SiO2', 'T_Zn', 'T_Na',
  'ESTADO', 'FECHA_CREACION', 'FECHA_MODIFICACION'
];

// ---------------------------------------------------------------------------
// Helper: build a JSON response
// ---------------------------------------------------------------------------

/**
 * Creates a ContentService JSON text output.
 * Google Apps Script web-app responses don't support custom HTTP headers,
 * but the JSONP / CORS handling is managed by the Apps Script runtime when
 * deployed as "Anyone" access.
 *
 * @param {Object} data - The object to serialise.
 * @returns {ContentService.TextOutput}
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Helper: get or create a sheet with the given headers
// ---------------------------------------------------------------------------

/**
 * Returns the sheet with the given name. If it doesn't exist it is created
 * and the first row is populated with the supplied headers.
 *
 * @param {string} name - Sheet name.
 * @param {string[]} headers - Column headers for the first row.
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

// ---------------------------------------------------------------------------
// Helper: convert sheet data → array of objects
// ---------------------------------------------------------------------------

/**
 * Reads all data rows (excluding the header) and returns an array of objects
 * keyed by the header names.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object[]}
 */
function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return []; // only header or empty

  var headers = data[0];
  var rows = data.slice(1);

  return rows.map(function (row) {
    var obj = {};
    headers.forEach(function (header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function getSheetHeaders(sheet) {
  var lastColumn = sheet.getLastColumn();
  if (!lastColumn) return [];
  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (h) {
    return String(h || '').trim();
  });
}

function ensureHeaders(sheet, desiredHeaders) {
  var current = getSheetHeaders(sheet);
  if (!current.length) {
    sheet.getRange(1, 1, 1, desiredHeaders.length).setValues([desiredHeaders]);
    sheet.setFrozenRows(1);
    return desiredHeaders.slice();
  }
  return current;
}

// ---------------------------------------------------------------------------
// Helper: convert an object → row array aligned with headers
// ---------------------------------------------------------------------------

/**
 * Maps the properties of `obj` into an array whose indices match `headers`.
 * Missing properties default to an empty string.
 *
 * @param {Object} obj
 * @param {string[]} headers
 * @returns {any[]}
 */
function objectToRow(obj, headers) {
  return headers.map(function (h) {
    return obj.hasOwnProperty(h) ? obj[h] : '';
  });
}

// ---------------------------------------------------------------------------
// Helper: generate a unique ID (timestamp + random suffix)
// ---------------------------------------------------------------------------

/**
 * @returns {string} e.g. "F-1716770400000-A3F"
 */
function generateId() {
  var ts = new Date().getTime();
  var rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return 'F-' + ts + '-' + rand;
}

// ---------------------------------------------------------------------------
// Helper: find a row index (1-based) by matching the first column value
// ---------------------------------------------------------------------------

/**
 * Searches for `id` in the first column of `sheet`.
 * Returns the 1-based row index or -1 if not found.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string} id
 * @returns {number}
 */
function findRowById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i + 1; // +1 because getValues() is 0-indexed, rows are 1-indexed
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Initialise sheets (called lazily on every request)
// ---------------------------------------------------------------------------

/**
 * Ensures both sheets exist with the correct headers.
 */
function initSheets() {
  getOrCreateSheet('catalogo_mp', CATALOGO_MP_HEADERS);
  getOrCreateSheet('formulas', FORMULAS_HEADERS);
}

// ---------------------------------------------------------------------------
// GET handler
// ---------------------------------------------------------------------------

/**
 * Handles HTTP GET requests.
 *
 * Supported actions (passed as query parameter `action`):
 *   - ping          → { status: "ok" }
 *   - getMP         → returns all rows from catalogo_mp
 *   - getFormulas   → returns all rows from formulas
 *   - getFormula    → returns a single formula (requires `id` param)
 *
 * @param {Object} e - The event object provided by Apps Script.
 * @returns {ContentService.TextOutput}
 */
function doGet(e) {
  try {
    initSheets();

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';

    switch (action) {

      // --- Ping / health check ---
      case 'ping':
        return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });

      // --- Get all raw materials ---
      case 'getMP':
        var mpSheet = getOrCreateSheet('catalogo_mp', CATALOGO_MP_HEADERS);
        var mpData = sheetToObjects(mpSheet);
        return jsonResponse({ success: true, data: mpData, count: mpData.length });

      // --- Get all formulas ---
      case 'getFormulas':
        var fSheet = getOrCreateSheet('formulas', FORMULAS_HEADERS);
        var fData = sheetToObjects(fSheet);
        return jsonResponse({ success: true, data: fData, count: fData.length });

      // --- Get a single formula by ID ---
      case 'getFormula':
        var formulaId = e.parameter.id;
        if (!formulaId) {
          return jsonResponse({ error: 'Missing required parameter: id' });
        }
        var fSheetSingle = getOrCreateSheet('formulas', FORMULAS_HEADERS);
        var allFormulas = sheetToObjects(fSheetSingle);
        var found = allFormulas.filter(function (f) {
          return String(f.ID) === String(formulaId);
        });
        if (found.length === 0) {
          return jsonResponse({ error: 'Formula not found', id: formulaId });
        }
        return jsonResponse({ success: true, data: found[0] });

      // --- Unknown / missing action ---
      default:
        return jsonResponse({
          error: 'Unknown or missing action',
          hint: 'Use action=ping | getMP | getFormulas | getFormula&id=X'
        });
    }

  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * Handles HTTP POST requests.
 *
 * The POST body must be a JSON string. The `action` field determines the
 * operation:
 *   - saveMP         → Bulk-replace catalogo_mp with the supplied array
 *   - saveFormula    → Append a new formula row
 *   - updateFormula  → Update an existing formula by ID
 *   - deleteFormula  → Delete a formula row by ID
 *   - cloneFormula   → Clone an existing formula with a new ID
 *
 * @param {Object} e - The event object provided by Apps Script.
 * @returns {ContentService.TextOutput}
 */
function doPost(e) {
  try {
    initSheets();

    // Parse the incoming JSON body
    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        body = {};
      }
    }

    if ((!body || !body.action) && e && e.parameter) {
      if (e.parameter.payload) {
        try {
          body = JSON.parse(e.parameter.payload);
        } catch (payloadErr) {
          body = {};
        }
      } else if (e.parameter.action) {
        body = { action: e.parameter.action };
        if (e.parameter.id) body.id = e.parameter.id;
        if (e.parameter.data) {
          try {
            body.data = JSON.parse(e.parameter.data);
          } catch (dataErr) {
            body.data = e.parameter.data;
          }
        }
      }
    }

    var action = body.action || '';

    switch (action) {

      // =====================================================================
      // saveMP — bulk save raw-material catalogue
      // =====================================================================
      case 'saveMP':
        return handleSaveMP(body);

      // =====================================================================
      // saveFormula — create a new formula
      // =====================================================================
      case 'saveFormula':
        return handleSaveFormula(body);

      // =====================================================================
      // updateFormula — update an existing formula
      // =====================================================================
      case 'updateFormula':
        return handleUpdateFormula(body);

      // =====================================================================
      // deleteFormula — remove a formula by ID
      // =====================================================================
      case 'deleteFormula':
        return handleDeleteFormula(body);

      // =====================================================================
      // cloneFormula — duplicate a formula with a fresh ID
      // =====================================================================
      case 'cloneFormula':
        return handleCloneFormula(body);

      // =====================================================================
      // Unknown action
      // =====================================================================
      default:
        return jsonResponse({
          error: 'Unknown or missing action',
          hint: 'Use action = saveMP | saveFormula | updateFormula | deleteFormula | cloneFormula'
        });
    }

  } catch (err) {
    return jsonResponse({ error: err.message, stack: err.stack });
  }
}

// ---------------------------------------------------------------------------
// POST action handlers
// ---------------------------------------------------------------------------

/**
 * Bulk-replaces all data in `catalogo_mp` with the supplied array of objects.
 * Clears existing data rows (keeps the header) then writes the new data.
 *
 * Expected body: { action: "saveMP", data: [ {ID_PROD, COD, ...}, ... ] }
 */
function handleSaveMP(body) {
  var items = body.data;
  if (!Array.isArray(items)) {
    return jsonResponse({ error: '"data" must be an array of objects' });
  }

  var sheet = getOrCreateSheet('catalogo_mp', CATALOGO_MP_HEADERS);
  var headers = ensureHeaders(sheet, CATALOGO_MP_HEADERS);

  items = items.map(function (item, idx) {
    if (!item.ID_PROD) item.ID_PROD = item.COD ? String(item.COD) : ('MP-' + (idx + 1));
    if (!item.COD) item.COD = item.ID_PROD;
    if (!item.PRODUCTO) item.PRODUCTO = item.NOMBRE || item.COD;
    if (!item.NOMBRE) item.NOMBRE = item.PRODUCTO || item.COD;
    if (!item.CLASE) item.CLASE = 'MP';
    if (!item.TIPO) item.TIPO = '';
    if (!item.PROVEEDOR) item.PROVEEDOR = '';
    if (!item.Cprov) item.Cprov = '';
    if (!item.EXTRAS) item.EXTRAS = '';
    return item;
  });

  // Clear everything below the header
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  // Write new rows
  if (items.length > 0) {
    var rows = items.map(function (item) {
      return objectToRow(item, headers);
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return jsonResponse({ success: true, message: 'Saved ' + items.length + ' raw materials', count: items.length });
}

/**
 * Appends a new formula row. Auto-generates an ID if none is provided.
 * Sets FECHA_CREACION and FECHA_MODIFICACION to the current timestamp.
 *
 * Expected body: { action: "saveFormula", data: { FECHA, COD_PROD_DESTINO, ... } }
 */
function handleSaveFormula(body) {
  var formula = body.data;
  if (!formula || typeof formula !== 'object') {
    return jsonResponse({ error: '"data" must be a formula object' });
  }

  var sheet = getOrCreateSheet('formulas', FORMULAS_HEADERS);
  var now = new Date().toISOString();

  // Auto-generate ID if missing
  if (!formula.ID) {
    formula.ID = generateId();
  }

  // Timestamps
  formula.FECHA_CREACION = formula.FECHA_CREACION || now;
  formula.FECHA_MODIFICACION = now;

  var row = objectToRow(formula, FORMULAS_HEADERS);
  sheet.appendRow(row);

  return jsonResponse({ success: true, message: 'Formula saved', id: formula.ID });
}

/**
 * Updates an existing formula row in place. The `data` object must include
 * an `ID` property to locate the row.
 *
 * Expected body: { action: "updateFormula", data: { ID: "...", ... } }
 */
function handleUpdateFormula(body) {
  var formula = body.data;
  if (!formula || !formula.ID) {
    return jsonResponse({ error: '"data" must include an ID field' });
  }

  var sheet = getOrCreateSheet('formulas', FORMULAS_HEADERS);
  var rowIndex = findRowById(sheet, formula.ID);

  if (rowIndex === -1) {
    return jsonResponse({ error: 'Formula not found', id: formula.ID });
  }

  // Preserve original creation date
  var existingRow = sheet.getRange(rowIndex, 1, 1, FORMULAS_HEADERS.length).getValues()[0];
  var existingObj = {};
  FORMULAS_HEADERS.forEach(function (h, i) {
    existingObj[h] = existingRow[i];
  });

  // Merge: new values override existing ones
  FORMULAS_HEADERS.forEach(function (h) {
    if (formula.hasOwnProperty(h)) {
      existingObj[h] = formula[h];
    }
  });

  // Update modification timestamp, keep original creation date
  existingObj.FECHA_MODIFICACION = new Date().toISOString();

  var newRow = objectToRow(existingObj, FORMULAS_HEADERS);
  sheet.getRange(rowIndex, 1, 1, FORMULAS_HEADERS.length).setValues([newRow]);

  return jsonResponse({ success: true, message: 'Formula updated', id: formula.ID });
}

/**
 * Deletes a formula row by ID.
 *
 * Expected body: { action: "deleteFormula", id: "..." }
 */
function handleDeleteFormula(body) {
  var id = body.id;
  if (!id) {
    return jsonResponse({ error: 'Missing required field: id' });
  }

  var sheet = getOrCreateSheet('formulas', FORMULAS_HEADERS);
  var rowIndex = findRowById(sheet, id);

  if (rowIndex === -1) {
    return jsonResponse({ error: 'Formula not found', id: id });
  }

  sheet.deleteRow(rowIndex);

  return jsonResponse({ success: true, message: 'Formula deleted', id: id });
}

/**
 * Clones an existing formula. The original remains untouched; the clone
 * receives a new auto-generated ID and fresh timestamps.
 *
 * Expected body: { action: "cloneFormula", id: "..." }
 */
function handleCloneFormula(body) {
  var sourceId = body.id;
  if (!sourceId) {
    return jsonResponse({ error: 'Missing required field: id' });
  }

  var sheet = getOrCreateSheet('formulas', FORMULAS_HEADERS);
  var allFormulas = sheetToObjects(sheet);
  var source = null;

  for (var i = 0; i < allFormulas.length; i++) {
    if (String(allFormulas[i].ID) === String(sourceId)) {
      source = allFormulas[i];
      break;
    }
  }

  if (!source) {
    return jsonResponse({ error: 'Source formula not found', id: sourceId });
  }

  // Create the clone
  var clone = {};
  FORMULAS_HEADERS.forEach(function (h) {
    clone[h] = source[h];
  });

  var now = new Date().toISOString();
  clone.ID = generateId();
  clone.FECHA_CREACION = now;
  clone.FECHA_MODIFICACION = now;
  clone.ESTADO = 'BORRADOR'; // Reset status to draft

  var row = objectToRow(clone, FORMULAS_HEADERS);
  sheet.appendRow(row);

  return jsonResponse({
    success: true,
    message: 'Formula cloned',
    sourceId: sourceId,
    newId: clone.ID
  });
}
