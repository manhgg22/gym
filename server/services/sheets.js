import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

/**
 * Get data from a range in Google Sheets
 * @param {string} range - Sheet range (e.g., "Workout_Sessions!A1:D99")
 * @returns {Promise<Array>} - 2D array of values
 */
export async function getRange(range) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range,
    });
    return res.data.values || [];
  } catch (error) {
    console.error(`Error getting range ${range}:`, error.message);
    throw error;
  }
}

/**
 * Append a row to a sheet
 * @param {string} range - Sheet range (e.g., "Workout_Log!A1")
 * @param {Array} row - Array of values to append
 */
export async function appendRow(range, row) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
  } catch (error) {
    console.error(`Error appending row to ${range}:`, error.message);
    throw error;
  }
}

/**
 * Convert 2D array to array of objects
 * @param {Array} rows - 2D array with header row first
 * @returns {Array<Object>} - Array of objects
 */
export function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const [header, ...data] = rows;
  return data.map((r) =>
    Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""]))
  );
}

/**
 * Get all workout sessions
 */
export async function getSessions() {
  const rows = await getRange("Workout_Sessions!A1:D99");
  return rowsToObjects(rows);
}

/**
 * Get exercises for a specific session
 */
export async function getExercises(sessionId = null) {
  const rows = await getRange("Exercises!A1:I9999"); // Added column I for animation_url
  const exercises = rowsToObjects(rows);

  if (sessionId) {
    return exercises
      .filter((e) => e.session_id === sessionId)
      .sort((a, b) => Number(a.order) - Number(b.order));
  }

  return exercises;
}

/**
 * Get workout logs
 */
export async function getLogs() {
  const rows = await getRange("Workout_Log!A1:E9999");
  return rowsToObjects(rows);
}

/**
 * Get exercise checks
 */
export async function getExerciseChecks() {
  const rows = await getRange("Exercise_Check!A1:D9999");
  return rowsToObjects(rows);
}

/**
 * Log a workout session
 * CRITICAL: Check for duplicates before logging
 */
export async function logWorkout(date, sessionId, completed, durationMin, note) {
  // Double-check for duplicates (防止 race condition)
  const existingLogs = await getLogs();
  const duplicate = existingLogs.find(
    (log) => log.date === date && String(log.completed).toUpperCase() === "TRUE"
  );

  if (duplicate) {
    throw new Error(`Duplicate workout detected for ${date}. Already logged session: ${duplicate.session_id}`);
  }

  await appendRow("Workout_Log!A1", [
    date,
    sessionId,
    completed ? "TRUE" : "FALSE",
    durationMin ?? "",
    note ?? "",
  ]);
}

/**
 * Log an exercise check
 */
/**
 * Log an exercise check with Weight & Reps
 */
export async function logExerciseCheck(date, sessionId, exerciseId, checked, weight = "", reps = "") {
  await appendRow("Exercise_Check!A1", [
    date,
    sessionId,
    exerciseId,
    checked ? "TRUE" : "FALSE",
    weight,
    reps
  ]);
}

/**
 * Log Bodyweight
 */
export async function logBodyweight(date, weight, note = "") {
  await appendRow("Bodyweight_Log!A1", [date, weight, note]);
}

/**
 * Get Bodyweight history
 */
export async function getBodyweightLogs() {
  const rows = await getRange("Bodyweight_Log!A1:C9999");
  return rowsToObjects(rows);
}

/**
 * Calculate 1RM (Epley Formula)
 */
export function calculate1RM(weight, reps) {
  if (!weight || !reps) return 0;
  if (reps == 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Check for Personal Record (PR)
 */
export async function checkPR(exerciseId, weight, reps) {
  if (!weight || !reps) return false;
  const current1RM = calculate1RM(weight, reps);

  const checks = await getExerciseChecks();
  const history = checks.filter(c => c.exercise_id === exerciseId && c.weight > 0);

  if (history.length === 0) return true; // First time is always a PR!

  const max1RM = Math.max(...history.map(c => calculate1RM(Number(c.weight), Number(c.reps))));

  return current1RM > max1RM;
}
