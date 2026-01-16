import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SHEET_ID = process.env.SHEET_ID;

// Auth
const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

async function migrate() {
    console.log("🚀 Starting Sheet Migration...");

    try {
        const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
        const sheetList = spreadsheet.data.sheets.map(s => s.properties.title);

        // 1. Create Bodyweight_Log if not exists
        if (!sheetList.includes("Bodyweight_Log")) {
            console.log("Creating 'Bodyweight_Log' sheet...");
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: { title: "Bodyweight_Log" }
                            }
                        }
                    ]
                }
            });
            // Add Header
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: "Bodyweight_Log!A1:C1",
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [["date", "weight", "note"]] }
            });
            console.log("✅ Created Bodyweight_Log.");
        } else {
            console.log("ℹ️ Bodyweight_Log already exists.");
        }

        // 2. Add Headers 'weight', 'reps' to Exercise_Check if missing
        // Assuming Exercise_Check headers are at A1:D1 (date, session_id, exercise_id, checked)
        // We want to add weight (E1) and reps (F1)

        // Read current headers
        const headerRes = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "Exercise_Check!A1:Z1"
        });
        const headers = headerRes.data.values ? headerRes.data.values[0] : [];

        const updates = [];
        if (!headers.includes("weight")) updates.push("weight");
        if (!headers.includes("reps")) updates.push("reps");

        if (updates.length > 0) {
            console.log(`Adding columns: ${updates.join(", ")} to Exercise_Check...`);
            const startColIndex = headers.length;
            // Convert index to letter (simplistic A-Z, assuming < 26 columns)
            const startLetter = String.fromCharCode(65 + startColIndex);
            const endLetter = String.fromCharCode(65 + startColIndex + updates.length - 1);

            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `Exercise_Check!${startLetter}1:${endLetter}1`,
                valueInputOption: "USER_ENTERED",
                requestBody: { values: [updates] }
            });
            console.log("✅ Columns added.");
        } else {
            console.log("ℹ️ Columns 'weight' and 'reps' already exist.");
        }

        console.log("🎉 Migration Completed Successfully!");

    } catch (error) {
        console.error("❌ Migration Failed:", error.message);
    }
}

migrate();
