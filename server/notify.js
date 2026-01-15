import cron from "node-cron";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_BASE = process.env.API_BASE || "http://localhost:4000";
const MODE = process.env.MODE || 4;

/**
 * Send message to Telegram
 */
async function sendTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: "Markdown",
                disable_web_page_preview: true,
            }),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error("Telegram API error:", data);
        } else {
            console.log("✅ Telegram message sent successfully");
        }
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

/**
 * Push daily workout reminder
 */
async function pushDailyReminder() {
    try {
        console.log("📤 Fetching today's workout plan...");
        const res = await fetch(`${API_BASE}/today-plan?mode=${MODE}`);
        const data = await res.json();

        const s = data.session;
        const ex = data.exercises || [];

        const lines = [];
        lines.push(`🏋️ *Hôm nay tập:* *${s.session_name}*`);
        lines.push(`🎯 Nhóm cơ: ${s.muscle_groups}`);
        lines.push(`📌 Bài tập (${ex.length}):`);
        lines.push("");

        ex.slice(0, 8).forEach((e, idx) => {
            lines.push(
                `${idx + 1}. *${e.name}* — ${e.sets}x${e.reps} (nghỉ ${e.rest_sec}s)`
            );
            if (e.video_url && e.video_url.trim()) {
                lines.push(`   ▶️ ${e.video_url}`);
            }
        });

        lines.push("");
        lines.push("✅ Nhớ khởi động 5–8 phút và uống nước.");
        lines.push("💪 Giữ form trước, tạ sau!");

        await sendTelegram(lines.join("\n"));
    } catch (error) {
        console.error("Error in pushDailyReminder:", error);
    }
}

// Schedule: 19:00 every day (Asia/Bangkok timezone)
// Cron format: minute hour day month weekday
cron.schedule("0 19 * * *", () => {
    console.log(`⏰ [${new Date().toISOString()}] Running daily reminder...`);
    pushDailyReminder();
});

console.log("🤖 Telegram notification service started");
console.log(`⏰ Scheduled: 19:00 daily (${process.env.TZ || "system timezone"})`);
console.log(`📱 Chat ID: ${CHAT_ID}`);
console.log(`🔗 API Base: ${API_BASE}`);
console.log(`🏋️  Mode: ${MODE} buổi/tuần`);

// Optional: Send test message on startup
if (process.argv.includes("--test")) {
    console.log("🧪 Sending test message...");
    pushDailyReminder();
}
