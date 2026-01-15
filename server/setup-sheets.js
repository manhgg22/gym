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

// Sample data
const WORKOUT_SESSIONS = [
    ["session_id", "session_name", "muscle_groups", "priority"],
    ["S1", "Buổi 1 - Ngực & Tay sau", "chest,triceps", "1"],
    ["S2", "Buổi 2 - Lưng & Tay trước", "back,biceps", "2"],
    ["S3", "Buổi 3 - Vai & Bụng", "shoulders,abs", "3"],
    ["S4", "Buổi 4 - Chân", "legs", "4"],
    ["S5", "Buổi 5 - Full Body", "chest,shoulders,triceps,back,biceps", "5"],
];

const EXERCISES = [
    ["session_id", "order", "exercise_id", "name", "sets", "reps", "rest_sec", "video_url"],
    // Buổi 1 - Ngực & Tay sau
    ["S1", "1", "E101", "Bench Press", "4", "8-10", "120", "https://www.youtube.com/watch?v=rT7DgCr-3pg"],
    ["S1", "2", "E102", "Incline Dumbbell Press", "3", "10-12", "90", "https://www.youtube.com/watch?v=8iPEnn-ltC8"],
    ["S1", "3", "E103", "Cable Flyes", "3", "12-15", "60", "https://www.youtube.com/watch?v=Iwe6AmxVf7o"],
    ["S1", "4", "E104", "Tricep Dips", "3", "10-12", "90", "https://www.youtube.com/watch?v=6kALZikXxLc"],
    ["S1", "5", "E105", "Overhead Tricep Extension", "3", "12-15", "60", "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q"],

    // Buổi 2 - Lưng & Tay trước
    ["S2", "1", "E201", "Pull-ups", "4", "8-10", "120", "https://www.youtube.com/watch?v=eGo4IYlbE5g"],
    ["S2", "2", "E202", "Barbell Rows", "4", "8-10", "120", "https://www.youtube.com/watch?v=FWJR5Ve8bnQ"],
    ["S2", "3", "E203", "Lat Pulldown", "3", "10-12", "90", "https://www.youtube.com/watch?v=CAwf7n6Luuc"],
    ["S2", "4", "E204", "Barbell Curls", "3", "10-12", "90", "https://www.youtube.com/watch?v=kwG2ipFRgfo"],
    ["S2", "5", "E205", "Hammer Curls", "3", "12-15", "60", "https://www.youtube.com/watch?v=zC3nLlEvin4"],

    // Buổi 3 - Vai & Bụng
    ["S3", "1", "E301", "Overhead Press", "4", "8-10", "120", "https://www.youtube.com/watch?v=2yjwXTZQDDI"],
    ["S3", "2", "E302", "Lateral Raises", "3", "12-15", "60", "https://www.youtube.com/watch?v=3VcKaXpzqRo"],
    ["S3", "3", "E303", "Front Raises", "3", "12-15", "60", "https://www.youtube.com/watch?v=YbX7Wd8jQ-Q"],
    ["S3", "4", "E304", "Planks", "3", "60s", "60", "https://www.youtube.com/watch?v=ASdvN_XEl_c"],
    ["S3", "5", "E305", "Hanging Leg Raises", "3", "12-15", "60", "https://www.youtube.com/watch?v=Pr1ieGZ5atk"],

    // Buổi 4 - Chân
    ["S4", "1", "E401", "Squats", "4", "8-10", "180", "https://www.youtube.com/watch?v=ultWZbUMPL8"],
    ["S4", "2", "E402", "Romanian Deadlifts", "4", "8-10", "120", "https://www.youtube.com/watch?v=SHsUIZiNdeY"],
    ["S4", "3", "E403", "Leg Press", "3", "10-12", "90", "https://www.youtube.com/watch?v=IZxyjW7MPJQ"],
    ["S4", "4", "E404", "Leg Curls", "3", "12-15", "60", "https://www.youtube.com/watch?v=ELOCsoDSmrg"],
    ["S4", "5", "E405", "Calf Raises", "4", "15-20", "60", "https://www.youtube.com/watch?v=gwLzBJYoWlI"],

    // Buổi 5 - Full Body
    ["S5", "1", "E501", "Bench Press", "3", "10-12", "90", "https://www.youtube.com/watch?v=rT7DgCr-3pg"],
    ["S5", "2", "E502", "Pull-ups", "3", "8-10", "90", "https://www.youtube.com/watch?v=eGo4IYlbE5g"],
    ["S5", "3", "E503", "Overhead Press", "3", "10-12", "90", "https://www.youtube.com/watch?v=2yjwXTZQDDI"],
    ["S5", "4", "E504", "Barbell Curls", "3", "10-12", "60", "https://www.youtube.com/watch?v=kwG2ipFRgfo"],
    ["S5", "5", "E505", "Tricep Pushdowns", "3", "12-15", "60", "https://www.youtube.com/watch?v=2-LAMcpzODU"],
];

const WORKOUT_LOG_HEADER = [["date", "session_id", "completed", "duration_min", "note"]];
const EXERCISE_CHECK_HEADER = [["date", "session_id", "exercise_id", "checked"]];

async function setupSheets() {
    try {
        console.log("🚀 Starting Google Sheets setup...");
        console.log(`📊 Sheet ID: ${SHEET_ID}`);

        // Get existing sheets
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID,
        });

        const existingSheets = spreadsheet.data.sheets.map((s) => s.properties.title);
        console.log(`📋 Existing sheets: ${existingSheets.join(", ")}`);

        // Create sheets if they don't exist
        const sheetsToCreate = [
            "Workout_Sessions",
            "Exercises",
            "Workout_Log",
            "Exercise_Check",
        ];

        for (const sheetName of sheetsToCreate) {
            if (!existingSheets.includes(sheetName)) {
                console.log(`➕ Creating sheet: ${sheetName}`);
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: SHEET_ID,
                    requestBody: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetName,
                                    },
                                },
                            },
                        ],
                    },
                });
            } else {
                console.log(`✓ Sheet already exists: ${sheetName}`);
            }
        }

        // Clear and populate Workout_Sessions
        console.log("\n📝 Importing Workout_Sessions...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: "Workout_Sessions!A1:Z1000",
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: "Workout_Sessions!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: WORKOUT_SESSIONS },
        });
        console.log(`✅ Imported ${WORKOUT_SESSIONS.length - 1} sessions`);

        // Clear and populate Exercises
        console.log("\n📝 Importing Exercises...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: "Exercises!A1:Z1000",
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: "Exercises!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: EXERCISES },
        });
        console.log(`✅ Imported ${EXERCISES.length - 1} exercises`);

        // Setup Workout_Log (header only)
        console.log("\n📝 Setting up Workout_Log...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: "Workout_Log!A1:Z1000",
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: "Workout_Log!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: WORKOUT_LOG_HEADER },
        });
        console.log("✅ Workout_Log ready");

        // Setup Exercise_Check (header only)
        console.log("\n📝 Setting up Exercise_Check...");
        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: "Exercise_Check!A1:Z1000",
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: "Exercise_Check!A1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: EXERCISE_CHECK_HEADER },
        });
        console.log("✅ Exercise_Check ready");

        console.log("\n🎉 Setup completed successfully!");
        console.log("\n📊 Summary:");
        console.log(`   - 5 workout sessions`);
        console.log(`   - 25 exercises`);
        console.log(`   - 4 sheets created/updated`);
        console.log("\n✅ Your Google Sheet is ready to use!");
        console.log(`🔗 View at: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
    } catch (error) {
        console.error("\n❌ Error during setup:", error.message);
        if (error.message.includes("permission")) {
            console.error("\n💡 Make sure you've shared the sheet with your service account email!");
        }
        process.exit(1);
    }
}

setupSheets();
