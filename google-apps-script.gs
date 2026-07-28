const SHEET_ID = "YOUR_GOOGLE_SHEET_ID";
const SCRIPT_VERSION = "2026-06-01-sheets-only-local-tz";
const LOCAL_TIMEZONE = "Asia/Kolkata";

  const HEADERS = [
    "id",
    "title",
    "type",
    "lang",
    "content",
    "rawContent",
    "notes",
    "status",
    "platforms",
    "tags",
    "createdAt",
    "updatedAt",
    "deletedAt",
  ];

  function doPost(e) {
    try {
      const body = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");

      if (body.action === "load") {
        return jsonOut({
          ok: true,
          version: SCRIPT_VERSION,
          vault: readRowsAsObjects_("vault"),
          archive: readRowsAsObjects_("archive"),
        });
      }

      if (body.action === "save") {
        writeObjectsAsRows_("vault", Array.isArray(body.vault) ? body.vault : []);
        writeObjectsAsRows_("archive", Array.isArray(body.archive) ? body.archive : []);
        return jsonOut({ ok: true, version: SCRIPT_VERSION });
      }

      if (body.action === "debug_headers") {
        return jsonOut({
          ok: true,
          version: SCRIPT_VERSION,
          vaultHeaders: getHeaderRow_("vault"),
          archiveHeaders: getHeaderRow_("archive"),
        });
      }

      return jsonOut({ ok: false, error: "Invalid action" });
    } catch (err) {
      return jsonOut({ ok: false, error: String(err) });
    }
  }

  function readRowsAsObjects_(name) {
    const sheet = getOrCreateSheet_(name);
    const headerMap = ensureHeaders_(sheet);
    validateRequiredHeaders_(headerMap, name);

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];

    const lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);
    const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    return values
      .filter((row) => row.some((v) => String(v).trim() !== ""))
      .map((row) => rowToObject_(row, name, headerMap));
  }

  function writeObjectsAsRows_(name, records) {
    const sheet = getOrCreateSheet_(name);
    const headerMap = ensureHeaders_(sheet);
    validateRequiredHeaders_(headerMap, name);

    const clean = normalizeRecords_(records, name);
    const rows = clean.map((r) => objectToRow_(r, headerMap));
    const width = Math.max(sheet.getLastColumn(), HEADERS.length);

    const maxRows = sheet.getMaxRows();
    if (maxRows > 1) {
      sheet.getRange(2, 1, maxRows - 1, width).clearContent();
    }

    if (!rows.length) return;
    sheet.getRange(2, 1, rows.length, width).setValues(rows);
  }

  function normalizeRecords_(records, tabName) {
    const now = new Date();
    return records.map((r) => {
      const out = {
        id: String(r.id || ""),
        title: String(r.title || ""),
        type: String(r.type || "poem"),
        lang: String(r.lang || "hi"),
        content: String(r.content || ""),
        rawContent: String(r.rawContent || stripHtml_(r.content || "")),
        notes: String(r.notes || ""),
        status: String(r.status || "draft"),
        platforms: Array.isArray(r.platforms) ? r.platforms : [],
        tags: String(r.tags || ""),
        createdAt: normalizeDateForStorage_(r.createdAt, now),
        updatedAt: normalizeDateForStorage_(r.updatedAt, now),
        deletedAt: normalizeDateForStorage_(r.deletedAt, null),
      };

      if (tabName === "vault") out.deletedAt = "";
      if (tabName === "archive" && !out.deletedAt) out.deletedAt = formatDateTime_(now);
      return out;
    });
  }

  function objectToRow_(r, headerMap) {
    const width = Math.max(Object.keys(headerMap).length, HEADERS.length);
    const row = new Array(width).fill("");
    setByHeader_(row, headerMap, "id", r.id);
    setByHeader_(row, headerMap, "title", r.title);
    setByHeader_(row, headerMap, "type", r.type);
    setByHeader_(row, headerMap, "lang", r.lang);
    setByHeader_(row, headerMap, "content", r.content);
    setByHeader_(row, headerMap, "rawContent", r.rawContent);
    setByHeader_(row, headerMap, "notes", r.notes);
    setByHeader_(row, headerMap, "status", r.status);
    setByHeader_(row, headerMap, "platforms", Array.isArray(r.platforms) ? r.platforms.join(",") : "");
    setByHeader_(row, headerMap, "tags", r.tags);
    setByHeader_(row, headerMap, "createdAt", String(r.createdAt || ""));
    setByHeader_(row, headerMap, "updatedAt", String(r.updatedAt || ""));
    setByHeader_(row, headerMap, "deletedAt", String(r.deletedAt || ""));
    return row;
  }

  function rowToObject_(row, tabName, headerMap) {
    const content = String(getByHeader_(row, headerMap, "content") || "");
    const rawFromSheet = getByHeader_(row, headerMap, "rawContent");
    const rawContent = String(rawFromSheet || stripHtml_(content));
    const platforms = String(getByHeader_(row, headerMap, "platforms") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    const obj = {
      id: String(getByHeader_(row, headerMap, "id") || ""),
      title: String(getByHeader_(row, headerMap, "title") || ""),
      type: String(getByHeader_(row, headerMap, "type") || "poem"),
      lang: String(getByHeader_(row, headerMap, "lang") || "hi"),
      content,
      rawContent,
      notes: String(getByHeader_(row, headerMap, "notes") || ""),
      status: String(getByHeader_(row, headerMap, "status") || "draft"),
      platforms,
      tags: String(getByHeader_(row, headerMap, "tags") || ""),
      createdAt: normalizeDateForStorage_(getByHeader_(row, headerMap, "createdAt"), null),
      updatedAt: normalizeDateForStorage_(getByHeader_(row, headerMap, "updatedAt"), null),
    };

    const deletedAt = normalizeDateForStorage_(getByHeader_(row, headerMap, "deletedAt"), null);
    if (tabName === "archive" && deletedAt) obj.deletedAt = deletedAt;
    return obj;
  }

  function normalizeDateForStorage_(value, fallbackDate) {
    if (value === 0 || value === "0") {
      return fallbackDate instanceof Date ? formatDateTime_(fallbackDate) : "";
    }
    const parsed = parseAnyDate_(value);
    if (parsed) return formatDateTime_(parsed);
    if (fallbackDate instanceof Date) return formatDateTime_(fallbackDate);
    return "";
  }

  function parseAnyDate_(value) {
    if (value === null || value === undefined || value === "") return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (typeof value === "number") {
      if (!isFinite(value) || value <= 0) return null;
      // ms timestamp
      if (value > 100000000000) return new Date(value);
      // sec timestamp
      if (value > 1000000000) return new Date(value * 1000);
      return null;
    }
    const s = String(value).trim();
    if (!s) return null;
    if (/^\d{13}$/.test(s)) return new Date(Number(s));
    if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);

    // Supports dd/mm/yyyy hh:mm:ss without relying on regex literals.
    if (s.indexOf("/") > -1) {
      const parts = s.split(" ");
      const dmy = parts[0].split("/");
      if (dmy.length === 3) {
        const d = Number(dmy[0]);
        const mo = Number(dmy[1]) - 1;
        const y = Number(dmy[2]);
        let hh = 0, mm = 0, ss = 0;
        if (parts.length > 1) {
          const t = parts[1].split(":");
          hh = Number(t[0] || 0);
          mm = Number(t[1] || 0);
          ss = Number(t[2] || 0);
        }
        const dt = new Date(y, mo, d, hh, mm, ss);
        if (!isNaN(dt.getTime())) return dt;
      }
    }

    const dt = new Date(s);
    if (isNaN(dt.getTime())) return null;
    // Guard against Sheets zero-date artifacts.
    if (dt.getFullYear() < 1971) return null;
    return dt;
  }

  function formatDateTime_(date) {
    return Utilities.formatDate(date, LOCAL_TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  }

  function ensureHeaders_(sheet) {
    // Absolute header lock:
    // NEVER modify header row during load/save.
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      throw new Error("Sheet has no headers. Run initHeaders_() once manually.");
    }
    const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const map = buildHeaderMap_(headerRow);
    // Ensure rawContent exists as requested (append only this optional column).
    if (map.rawContent === undefined) {
      sheet.getRange(1, lastCol + 1).setValue("rawContent");
      map.rawContent = lastCol;
    }
    // Keep existing columns as text to avoid Sheets coercion (e.g. 30/12/1899).
    sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), sheet.getLastColumn()).setNumberFormat("@");
    return map;
  }

  function getOrCreateSheet_(name) {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    return sheet;
  }

  function jsonOut(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
  }

  function stripHtml_(html) {
    return String(html || "")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(div|p|li|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  function normalizeHeaderName_(name) {
    return String(name || "").trim().toLowerCase().replace(/\s+/g, "");
  }

  function canonicalHeader_(name) {
    const n = normalizeHeaderName_(name);
    if (n === "rawcontent" || n === "rawecontent") return "rawContent";
    if (n === "createdat") return "createdAt";
    if (n === "updatedat") return "updatedAt";
    if (n === "deletedat") return "deletedAt";
    if (n === "id" || n === "title" || n === "type" || n === "lang" || n === "content" || n === "notes" || n === "status" || n === "platforms" || n === "tags") return n;
    return "";
  }

  function buildHeaderMap_(headerRow) {
    const map = {};
    for (let i = 0; i < headerRow.length; i++) {
      const key = canonicalHeader_(headerRow[i]);
      if (key && map[key] === undefined) map[key] = i;
    }
    return map;
  }

  function getByHeader_(row, headerMap, key) {
    const i = headerMap[key];
    if (i === undefined) return "";
    return row[i];
  }

  function setByHeader_(row, headerMap, key, value) {
    const i = headerMap[key];
    if (i === undefined) return;
    row[i] = value === undefined || value === null ? "" : value;
  }

  function validateRequiredHeaders_(headerMap, tabName) {
    const required = ["id", "title", "type", "lang", "content", "notes", "status", "platforms", "tags", "createdAt", "updatedAt", "deletedAt"];
    for (var i = 0; i < required.length; i++) {
      if (headerMap[required[i]] === undefined) {
        throw new Error("Missing required column '" + required[i] + "' in sheet '" + tabName + "'. Please add it in row 1.");
      }
    }
    // rawContent is optional for backward compatibility.
  }

  function getHeaderRow_(tabName) {
    const sheet = getOrCreateSheet_(tabName);
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // Run this manually once only if you want script-generated headers.
  function initHeaders_() {
    const tabs = ["vault", "archive"];
    for (var i = 0; i < tabs.length; i++) {
      const sheet = getOrCreateSheet_(tabs[i]);
      if (sheet.getLastColumn() === 0) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      }
      const lc = Math.max(sheet.getLastColumn(), HEADERS.length);
      sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), lc).setNumberFormat("@");
    }
  }
