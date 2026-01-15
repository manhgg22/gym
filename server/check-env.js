import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔧 Google Sheets Setup Helper\n");

// Check if .env exists
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
    console.log("❌ File .env không tồn tại!");
    console.log("📝 Tạo file .env từ template...\n");

    const envExample = `# Server Environment Variables

# Google Sheets - ĐIỀN THÔNG TIN CỦA BẠN VÀO ĐÂY
SHEET_ID=
GOOGLE_SERVICE_ACCOUNT_JSON={}

# Server
PORT=4000

# Telegram Bot (Optional - có thể bỏ trống nếu chưa setup)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Timezone (for cron jobs)
TZ=Asia/Bangkok
`;

    fs.writeFileSync(envPath, envExample);
    console.log("✅ Đã tạo file .env\n");
}

// Read .env
const envContent = fs.readFileSync(envPath, "utf-8");
const lines = envContent.split("\n");

let sheetId = "";
let serviceAccountJson = "";

for (const line of lines) {
    if (line.startsWith("SHEET_ID=")) {
        sheetId = line.split("=")[1]?.trim() || "";
    }
    if (line.startsWith("GOOGLE_SERVICE_ACCOUNT_JSON=")) {
        serviceAccountJson = line.substring("GOOGLE_SERVICE_ACCOUNT_JSON=".length).trim();
    }
}

console.log("📋 Kiểm tra cấu hình hiện tại:\n");

// Check SHEET_ID
if (!sheetId || sheetId === "your_google_sheet_id_here") {
    console.log("❌ SHEET_ID: Chưa được điền");
    console.log("   👉 Cần: Sheet ID từ URL Google Sheets");
    console.log("   📖 Ví dụ: https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit");
    console.log("            Sheet ID là: 1a2b3c4d5e6f7g8h9i0j\n");
} else {
    console.log(`✅ SHEET_ID: ${sheetId}\n`);
}

// Check GOOGLE_SERVICE_ACCOUNT_JSON
if (!serviceAccountJson || serviceAccountJson === "{}" || serviceAccountJson === "") {
    console.log("❌ GOOGLE_SERVICE_ACCOUNT_JSON: Chưa được điền");
    console.log("   👉 Cần: JSON credentials từ Service Account");
    console.log("   📖 Các bước:");
    console.log("      1. Vào Google Cloud Console");
    console.log("      2. Tạo Service Account");
    console.log("      3. Download JSON key");
    console.log("      4. Copy TOÀN BỘ nội dung JSON vào biến này");
    console.log("      5. Phải là 1 DÒNG DUY NHẤT (không xuống dòng)\n");
    console.log("   ⚠️  Format đúng:");
    console.log('      GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}\n');
} else {
    try {
        const parsed = JSON.parse(serviceAccountJson);
        if (parsed.type === "service_account" && parsed.client_email) {
            console.log("✅ GOOGLE_SERVICE_ACCOUNT_JSON: Hợp lệ");
            console.log(`   📧 Service Account: ${parsed.client_email}\n`);
        } else {
            console.log("⚠️  GOOGLE_SERVICE_ACCOUNT_JSON: JSON hợp lệ nhưng thiếu fields");
            console.log("   👉 Cần có: type, client_email, private_key\n");
        }
    } catch (e) {
        console.log("❌ GOOGLE_SERVICE_ACCOUNT_JSON: JSON không hợp lệ");
        console.log(`   Lỗi: ${e.message}`);
        console.log("   👉 Kiểm tra lại format JSON\n");
    }
}

// Summary
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n📝 Hướng dẫn setup:\n");
console.log("1️⃣  Tạo Google Sheet mới:");
console.log("   https://sheets.google.com\n");

console.log("2️⃣  Tạo Service Account:");
console.log("   https://console.cloud.google.com/\n");

console.log("3️⃣  Edit file .env:");
console.log("   - Thêm SHEET_ID");
console.log("   - Thêm GOOGLE_SERVICE_ACCOUNT_JSON (toàn bộ JSON trong 1 dòng)\n");

console.log("4️⃣  Share Google Sheet:");
console.log("   - Share cho email trong service account JSON");
console.log("   - Role: Editor\n");

console.log("5️⃣  Chạy setup:");
console.log("   npm run setup\n");

console.log("📖 Xem chi tiết: QUICK_SETUP.md");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

if (!sheetId || !serviceAccountJson || serviceAccountJson === "{}" || serviceAccountJson === "") {
    console.log("⚠️  Chưa thể chạy setup. Vui lòng điền đầy đủ thông tin vào .env\n");
    process.exit(1);
} else {
    try {
        JSON.parse(serviceAccountJson);
        console.log("✅ Cấu hình OK! Bạn có thể chạy: npm run setup\n");
    } catch (e) {
        console.log("❌ JSON không hợp lệ. Vui lòng kiểm tra lại GOOGLE_SERVICE_ACCOUNT_JSON\n");
        process.exit(1);
    }
}
