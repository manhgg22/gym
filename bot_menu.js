import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import http from 'http';
import https from 'https';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const MODE = Number(process.env.MODE || 4);

// Cấu hình Polling IPv4
const bot = new TelegramBot(token, {
    polling: {
        interval: 300,
        autoStart: true,
        params: { timeout: 10 }
    },
    request: {
        agentOptions: {
            keepAlive: true,
            family: 4
        }
    }
});

console.log('🤖 Telegram Bot (Advanced Menu) Started...');

// Menu Keyboard
const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: "🏋️ Hôm nay tập gì?" }, { text: "✅ Check-in" }],
            [{ text: "📊 Thống kê" }, { text: "⚖️ Cân nặng" }]
        ],
        resize_keyboard: true,
        persistent: true
    }
};

bot.on('polling_error', (error) => {
    if (error.code !== 'ETIMEDOUT') console.log('Polling Error:', error.code);
});

// --- COMMAND HANDLERS ---

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '👋 Chào đại ca! Đã nâng cấp lên bản Pro.\nChọn món bên dưới nhé 👇', mainMenu);
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, '💡 Các lệnh:\n\n/today - Xem bài tập\n/checkin - Điểm danh\n/stats - Thống kê\n/weigh <kg> - Cập nhật cân nặng (VD: /weigh 70.5)', mainMenu);
});

// Chức năng: WEIGH
bot.onText(/\/weigh(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const weight = match[1] ? match[1] : 72; // Default 72kg
    const date = new Date().toISOString().slice(0, 10);

    try {
        await fetch(`${API_BASE}/bodyweight`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, weight })
        });
        bot.sendMessage(chatId, `⚖️ Đã lưu cân nặng: *${weight}kg*`, { parse_mode: 'Markdown' });
    } catch (e) {
        bot.sendMessage(chatId, '❌ Lỗi: ' + e.message);
    }
});

// Logic chung
async function sendTodayPlan(chatId) {
    try {
        const res = await fetch(`${API_BASE}/today-plan?mode=${MODE}`);
        const data = await res.json();
        const s = data.session;
        const ex = data.exercises || [];

        let text = `🏋️ *Lịch tập: ${s.session_name}*\n`;
        text += `🎯 Nhóm cơ: ${s.muscle_groups}\n\n`;

        ex.slice(0, 8).forEach((e, idx) => {
            text += `${idx + 1}. *${e.name}* — ${e.sets}x${e.reps}\n`;
        });

        text += '\n💪 Chiến thôi!';
        bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi server: ' + error.message);
    }
}

async function doCheckin(chatId) {
    try {
        const res = await fetch(`${API_BASE}/quick-checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: MODE }),
        });
        const data = await res.json();
        const msg = data.ok
            ? `✅ *Check-in thành công!*\nBuổi: ${data.session.session_name}`
            : `⚠️ ${data.error}`;
        bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi: ' + error.message);
    }
}

async function sendStats(chatId) {
    try {
        const month = new Date().toISOString().slice(0, 7);
        const res = await fetch(`${API_BASE}/month-summary?month=${month}`);
        const data = await res.json();
        bot.sendMessage(chatId, `📊 *Thống kê tháng ${month}*\n✅ Đã tập: *${data.completedCount} buổi*\n🔥 Streak: *${data.streak} ngày*`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi: ' + error.message);
    }
}

// --- BUTTON TRIGGERS ---

bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (!text || text.startsWith('/')) return; // Ignore commands handled by onText

    if (text.includes("Hôm nay tập gì")) await sendTodayPlan(chatId);
    else if (text.includes("Check-in")) await doCheckin(chatId);
    else if (text.includes("Thống kê")) await sendStats(chatId);
    else if (text.includes("Cân nặng")) {
        bot.sendMessage(chatId, '⚖️ Để lưu cân nặng, hãy gõ:\n`/weigh 70.5` (thay số kg của bạn)', { parse_mode: 'Markdown' });
    }
});
