import { getRange, appendRow, rowsToObjects } from "./sheets.js";
import { google } from "googleapis";

const CONFIG_SHEET = "Love_Config!A1:B20";
const QUOTES_SHEET = "Love_Quotes!A1:B999";
const MESSAGES_SHEET = "Love_Messages!A1:D9999";
const TIMELINE_SHEET = "Love_Timeline!A1:D999";
const DREAMLIST_SHEET = "Love_DreamList!A1:D999";
const MAILBOX_SHEET = "Love_Mailbox!A1:F9999";

const SHEET_ID = process.env.SHEET_ID;

// Helper to update a cell (for checking checkboxes)
async function updateCell(range, value) {
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[value]] }
    });
}

/**
 * Get Love Configuration
 */
export async function getConfig() {
    const rows = await getRange(CONFIG_SHEET);
    if (!rows || rows.length === 0) return {};
    const config = {};
    rows.forEach(row => {
        if (row[0] && row[1]) {
            config[row[0].trim()] = row[1];
        }
    });
    return config;
}

/**
 * Get random quote
 */
export async function getRandomQuote() {
    const rows = await getRange(QUOTES_SHEET);
    const quotes = rowsToObjects(rows);
    if (quotes.length === 0) return null;
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    return random;
}

/**
 * Get Messages
 */
export async function getMessages(limit = 50) {
    const rows = await getRange(MESSAGES_SHEET);
    const messages = rowsToObjects(rows);
    return messages.slice(-limit);
}

/**
 * Send Message
 */
export async function sendMessage(sender, content, type = "text") {
    const timestamp = new Date().toISOString();
    await appendRow("Love_Messages!A1", [timestamp, sender, content, type]);
    return { timestamp, sender, content, type };
}

/**
 * Get Timeline
 */
export async function getTimeline() {
    const rows = await getRange(TIMELINE_SHEET);
    return rowsToObjects(rows).sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Add Timeline Event
 */
export async function addTimelineEvent(date, title, description, image_url = "") {
    await appendRow("Love_Timeline!A1", [date, title, description, image_url]);
    return { date, title, description, image_url };
}

/**
 * Get Dream List
 */
export async function getDreamList() {
    const rows = await getRange(DREAMLIST_SHEET);
    return rowsToObjects(rows);
}

/**
 * Add Dream
 */
export async function addDream(task, image_url = "") {
    const id = Date.now().toString();
    await appendRow("Love_DreamList!A1", [id, task, "FALSE", image_url]);
    return { id, task, is_completed: "FALSE", image_url };
}

/**
 * Toggle Dream Status
 * This is tricky with append-only helper. We need to find the row.
 * For now, let's just re-implement a simple find-and-update or skip if too complex for this turn.
 * Actually, we can just read all, update memory, and write back (inefficient but works for small lists).
 * Or use the 'id' to find the row index.
 */
export async function toggleDream(id, status) {
    // 1. Get all data to find index
    const rows = await getRange(DREAMLIST_SHEET);
    const header = rows[0]; // ["id", "task", "is_completed", ...]
    const idIndex = header.indexOf("id");

    // Find row number (1-based)
    // rows includes header, so row 1 is header. data starts row 2.
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i][idIndex] === id) {
            rowIndex = i + 1; // 1-based index
            break;
        }
    }

    if (rowIndex > -1) {
        // Update column C (is_completed) which is index 2 (A=0, B=1, C=2)
        // Range: Love_DreamList!C{rowIndex}
        await updateCell(`Love_DreamList!C${rowIndex}`, status ? "TRUE" : "FALSE");
        return true;
    }
    return false;
}

/**
 * Get Mailbox
 */
export async function getMailbox() {
    const rows = await getRange(MAILBOX_SHEET);
    return rowsToObjects(rows).reverse(); // Newest first
}

/**
 * Send Mail
 */
export async function sendMail(sender, title, content) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    await appendRow("Love_Mailbox!A1", [id, timestamp, sender, title, content, "FALSE"]);
    return { id, timestamp, sender, title, content, is_read: "FALSE" };
}
