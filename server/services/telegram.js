import fetch from "node-fetch";
import dotenv from "dotenv";

import https from "https";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const agent = new https.Agent({ family: 4 });

export async function sendTelegram(text) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn("⚠️ Telegram credentials not found. Skipping notification.");
        return;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            agent,
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
        }
    } catch (error) {
        console.error("Error sending Telegram message:", error);
    }
}
