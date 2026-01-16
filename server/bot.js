import fetch from "node-fetch";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.API_BASE || "http://localhost:4000";
const MODE = Number(process.env.MODE || 4);

const agent = new https.Agent({ family: 4 });

/**
 * Send message to Telegram
 */
async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            agent,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                ...options,
            }),
        });
        const data = await response.json();
        if (!data.ok) {
            console.error("Telegram API error:", data);
        }
        return data;
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}

/**
 * Handle /start command
 */
async function handleStart(chatId) {
    const text = `🏋️ *Workout Tracker Bot*

Chào mừng! Tôi sẽ giúp bạn theo dõi lịch tập luyện.

*Commands:*
/today - Xem buổi tập hôm nay
/checkin - Check-in đã tập xong
/stats - Xem thống kê tháng này
/help - Xem hướng dẫn

Bắt đầu nào! 💪`;

    await sendMessage(chatId, text);
}

/**
 * Handle /today command
 */
async function handleToday(chatId) {
    try {
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
            lines.push(`${idx + 1}. *${e.name}* — ${e.sets}x${e.reps} (nghỉ ${e.rest_sec}s)`);
            if (e.video_url && e.video_url.trim()) {
                lines.push(`   ▶️ ${e.video_url}`);
            }
        });

        lines.push("");
        lines.push("✅ Nhớ khởi động 5–8 phút và uống nước.");
        lines.push("💪 Giữ form trước, tạ sau!");
        lines.push("");
        lines.push("Gõ /checkin khi tập xong nhé!");

        await sendMessage(chatId, lines.join("\n"));
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi khi lấy thông tin buổi tập: " + error.message);
    }
}

/**
 * Handle /checkin command
 */
async function handleCheckin(chatId) {
    try {
        const res = await fetch(`${API_BASE}/quick-checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: MODE }),
        });
        const data = await res.json();

        const text = `✅ *${data.message}*

📅 Ngày: ${data.date}
🏋️ Buổi: ${data.session.session_name}
🎯 Nhóm cơ: ${data.session.muscle_groups}

Tuyệt vời! Tiếp tục phát huy nhé! 💪

Gõ /stats để xem thống kê tháng này.`;

        await sendMessage(chatId, text);
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi khi check-in: " + error.message);
    }
}

/**
 * Handle /stats command
 */
async function handleStats(chatId) {
    try {
        const month = new Date().toISOString().slice(0, 7);
        const res = await fetch(`${API_BASE}/month-summary?month=${month}`);
        const data = await res.json();

        const text = `📊 *Thống kê tháng ${month}*

🏋️ Số buổi tập: *${data.completedCount}*
🔥 Streak: *${data.streak} ngày*

${data.completedCount >= 16 ? "🎉 Xuất sắc!" : data.completedCount >= 12 ? "💪 Tốt lắm!" : "⚡ Cố lên!"}

Gõ /today để xem buổi tập hôm nay.`;

        await sendMessage(chatId, text);
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi khi lấy thống kê: " + error.message);
    }
}

/**
 * Handle /help command
 */
async function handleHelp(chatId) {
    const text = `📖 *Hướng dẫn sử dụng*

*Commands:*
/today - Xem buổi tập hôm nay với danh sách bài tập
/checkin - Check-in nhanh khi đã tập xong
/stats - Xem số buổi tập và streak trong tháng
/help - Xem hướng dẫn này

*Cách dùng:*
1. Gõ /today để xem hôm nay tập gì
2. Sau khi tập xong, gõ /checkin
3. Gõ /stats để xem tiến độ

Bot sẽ tự động nhắc bạn lúc 19:00 hàng ngày! ⏰`;

    await sendMessage(chatId, text);
}

/**
 * Handle incoming updates
 */
async function handleUpdate(update) {
    if (!update.message || !update.message.text) return;

    const chatId = update.message.chat.id;
    const text = update.message.text.trim();

    console.log(`📩 Message from ${chatId}: ${text}`);

    // Normalize command - remove "/" if present and convert to lowercase
    const command = text.trim().toLowerCase().replace(/^\//, '');

    if (command === "start") {
        await handleStart(chatId);
    } else if (command === "today") {
        await handleToday(chatId);
    } else if (command === "checkin") {
        await handleCheckin(chatId);
    } else if (command === "stats") {
        await handleStats(chatId);
    } else if (command === "help" || command === "menu") {
        await handleHelp(chatId);
    } else {
        await sendMessage(
            chatId,
            "❓ Lệnh không hợp lệ. Gõ *help* hoặc *menu* để xem danh sách lệnh."
        );
    }
}

/**
 * Setup bot commands menu
 */
async function setupBotCommands() {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`;
    try {
        await fetch(url, {
            agent,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commands: [
                    { command: "start", description: "Bắt đầu sử dụng bot" },
                    { command: "today", description: "Xem buổi tập hôm nay" },
                    { command: "checkin", description: "Check-in đã tập xong" },
                    { command: "stats", description: "Xem thống kê tháng này" },
                    { command: "help", description: "Xem hướng dẫn" },
                    { command: "menu", description: "Hiện menu lệnh" }
                ]
            })
        });
        console.log("✅ Bot menu commands setup successfully");
    } catch (error) {
        console.error("❌ Error setting up bot commands:", error);
    }
}

/**
 * Start long polling
 */
async function startBot() {
    console.log("🤖 Telegram Bot started");
    console.log(`📱 Mode: ${MODE} buổi/tuần`);
    console.log(`🔗 API Base: ${API_BASE}`);
    console.log("\n⏳ Waiting for messages...\n");

    // Setup bot menu commands
    await setupBotCommands();

    let offset = 0;

    while (true) {
        try {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
            const response = await fetch(url, { agent });
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    await handleUpdate(update);
                    offset = update.update_id + 1;
                }
            }
        } catch (error) {
            console.error("Error in bot loop:", error);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }
}

// Start bot if BOT_TOKEN is set
if (BOT_TOKEN && BOT_TOKEN !== "") {
    startBot();
} else {
    console.error("❌ TELEGRAM_BOT_TOKEN not set in .env");
    console.log("📖 See README.md for setup instructions");
    process.exit(1);
}
