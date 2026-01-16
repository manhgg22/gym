import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = process.env.API_BASE || 'http://localhost:4000';
const MODE = Number(process.env.MODE || 4);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram Bot Service Started (Polling Mode)...');

// Handle /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '🏋️ *Workout Bot*\n\nChào bạn! Gõ /today để xem lịch tập hôm nay! 💪', { parse_mode: 'Markdown' });
});

// Handle /help
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, '📖 *Menu*\n\n/today - Bài tập hôm nay\n/checkin - Check-in xong\n/stats - Thống kê', { parse_mode: 'Markdown' });
});

// Handle /today
bot.onText(/\/today/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const res = await fetch(`${API_BASE}/today-plan?mode=${MODE}`);
        const data = await res.json();
        const s = data.session;
        const ex = data.exercises || [];

        let text = `🏋️ *Hôm nay:* *${s.session_name}*\n`;
        text += `🎯 Cơ: ${s.muscle_groups}\n\n`;

        ex.slice(0, 8).forEach((e, idx) => {
            text += `${idx + 1}. *${e.name}* — ${e.sets}x${e.reps}`;
            if (e.video_url) text += ` [Video](${e.video_url})`;
            text += '\n';
        });

        text += '\n✅ Nhớ khởi động & uống nước!';
        text += '\nGõ /checkin khi xong!';

        bot.sendMessage(chatId, text, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi server: ' + error.message);
    }
});

// Handle /checkin
bot.onText(/\/checkin/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const res = await fetch(`${API_BASE}/quick-checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: MODE }),
        });
        const data = await res.json();
        bot.sendMessage(chatId, `✅ *Checking thành công!*\n\nBuổi: ${data.session.session_name}\nTuyệt vời! 💪`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi: ' + error.message);
    }
});

// Handle /stats
bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const month = new Date().toISOString().slice(0, 7);
        const res = await fetch(`${API_BASE}/month-summary?month=${month}`);
        const data = await res.json();
        bot.sendMessage(chatId, `📊 *Thống kê ${month}*\n\n🏋️ Đã tập: *${data.completedCount} buổi*\n🔥 Streak: *${data.streak} ngày*`, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ Lỗi: ' + error.message);
    }
});

// Log errors to prevent crashing
bot.on('polling_error', (error) => {
    console.log('Polling Error:', error.code);
});
