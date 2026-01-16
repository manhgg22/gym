import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.API_BASE || "http://localhost:4000";
const MODE = Number(process.env.MODE || 4);

async function sendMessage(chatId, text, options = {}) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
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
        return await response.json();
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

async function handleToday(chatId) {
    try {
        const res = await fetch(`${API_BASE}/today-plan?mode=${MODE}`);
        const data = await res.json();
        const s = data.session;
        const ex = data.exercises || [];

        const lines = [];
        lines.push(`🏋️ *Hôm nay tập:* *${s.session_name}*`);
        lines.push(`🎯 Nhóm cơ: ${s.muscle_groups}`);
        lines.push(`📌 Bài tập (${ex.length}):\n`);

        ex.slice(0, 8).forEach((e, idx) => {
            lines.push(`${idx + 1}. *${e.name}* — ${e.sets}x${e.reps} (nghỉ ${e.rest_sec}s)`);
            if (e.video_url) lines.push(`   ▶️ ${e.video_url}`);
        });

        lines.push("\n✅ Nhớ khởi động 5–8 phút và uống nước.");
        lines.push("💪 Giữ form trước, tạ sau!\n");
        lines.push("Gõ /checkin khi tập xong nhé!");

        await sendMessage(chatId, lines.join("\n"));
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi server: " + error.message);
    }
}

async function handleCheckin(chatId) {
    try {
        const res = await fetch(`${API_BASE}/quick-checkin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: MODE }),
        });
        const data = await res.json();
        await sendMessage(chatId, `✅ *${data.message}*\n\n🏋️ Buổi: ${data.session.session_name}\n🎯 Cơ: ${data.session.muscle_groups}\n\nTuyệt vời! 💪`);
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi check-in: " + error.message);
    }
}

async function handleStats(chatId) {
    try {
        const month = new Date().toISOString().slice(0, 7);
        const res = await fetch(`${API_BASE}/month-summary?month=${month}`);
        const data = await res.json();
        await sendMessage(chatId, `📊 *Thống kê tháng ${month}*\n\n🏋️ Đã tập: *${data.completedCount} buổi*\n🔥 Streak: *${data.streak} ngày*\n\nCố lên! 💪`);
    } catch (error) {
        await sendMessage(chatId, "❌ Lỗi lấy thống kê: " + error.message);
    }
}

async function handleHelp(chatId) {
    await sendMessage(chatId, `📖 *Help*\n\n/today - Bài tập hôm nay\n/checkin - Điểm danh xong\n/stats - Xem thống kê\n/help - Hướng dẫn`);
}

async function handleStart(chatId) {
    await sendMessage(chatId, `🏋️ *Workout Bot*\n\nChào bạn! Gõ /today để xem bài tập nhé! 💪`);
}

async function startBot() {
    console.log("🤖 Bot started...");
    let offset = 0;

    while (true) {
        try {
            const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=30`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.ok && data.result.length > 0) {
                for (const update of data.result) {
                    offset = update.update_id + 1;
                    if (!update.message || !update.message.text) continue;

                    const chatId = update.message.chat.id;
                    const text = update.message.text.trim();
                    console.log(`📩 ${chatId}: ${text}`);

                    if (text === "/start") await handleStart(chatId);
                    else if (text === "/today") await handleToday(chatId);
                    else if (text === "/checkin") await handleCheckin(chatId);
                    else if (text === "/stats") await handleStats(chatId);
                    else if (text === "/help") await handleHelp(chatId);
                    else await sendMessage(chatId, "❓ Gõ /help để xem lệnh.");
                }
            }
        } catch (error) {
            console.error("⚠️ Connection error, retrying in 5s...", error.code);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

startBot();
