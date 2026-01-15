import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send notification to Telegram
 */
export async function sendTelegramNotification(message, options = {}) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.log("⚠️  Telegram not configured, skipping notification");
        return;
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                ...options,
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API error:", data);
        } else {
            console.log("✅ Telegram notification sent");
        }

        return data;
    } catch (error) {
        console.error("Error sending Telegram notification:", error);
    }
}

/**
 * Notification templates
 */
export const NotificationTemplates = {
    // Success notifications
    workoutLogged: (sessionName) =>
        `✅ *Tuyệt vời!*\n\nBuổi tập *${sessionName}* đã được lưu thành công!\n\nTiếp tục phát huy nhé! 💪`,

    checkinSuccess: (sessionName, date) =>
        `✅ *Check-in thành công!*\n\n📅 Ngày: ${date}\n🏋️ Buổi: *${sessionName}*\n\nGood job! 🎉`,

    // Warning notifications
    duplicateWorkout: (sessionName, date) =>
        `⚠️ *Cảnh báo*\n\nBạn đã tập rồi hôm nay (${date})!\nBuổi: ${sessionName}\n\nMỗi ngày chỉ được tập 1 buổi nhé.`,

    restStreakWarning: (days) =>
        `🚨 *Cảnh báo nghỉ quá lâu!*\n\nBạn đã nghỉ *${days} ngày* liên tiếp!\n\nHãy quay lại tập luyện ngay hôm nay! 💪`,

    lowWorkoutCount: (completed, total, expected) =>
        `⚠️ *Tập ít trong tháng*\n\nBạn chỉ tập ${completed}/${total} ngày trong tháng.\nNên tập ít nhất ${expected} ngày!\n\nCố lên! 🔥`,

    // Achievement notifications
    streakMilestone: (days) => {
        const emoji = days >= 30 ? "🏆" : days >= 14 ? "🥈" : "🥉";
        return `${emoji} *Thành tích mới!*\n\nBạn đã tập *${days} ngày* liên tiếp!\n\nTuyệt vời! Tiếp tục duy trì nhé! 💪🔥`;
    },

    weeklyProgress: (workouts, streak) =>
        `📊 *Báo cáo tuần*\n\n🏋️ Số buổi tập: ${workouts}\n🔥 Streak: ${streak} ngày\n\nTiếp tục cố gắng tuần sau! 💪`,

    // Daily reminder
    dailyReminder: (sessionName, exercises) =>
        `🔔 *Nhắc nhở tập luyện*\n\n⏰ 19:00 - Đã đến giờ tập!\n\n🏋️ Hôm nay: *${sessionName}*\n📋 Số bài tập: ${exercises}\n\nBắt đầu thôi! 💪`,
};

/**
 * Send notification based on event type
 */
export async function notifyEvent(eventType, data) {
    let message;

    switch (eventType) {
        case "WORKOUT_LOGGED":
            message = NotificationTemplates.workoutLogged(data.sessionName);
            break;

        case "CHECKIN_SUCCESS":
            message = NotificationTemplates.checkinSuccess(data.sessionName, data.date);
            break;

        case "DUPLICATE_WORKOUT":
            message = NotificationTemplates.duplicateWorkout(data.sessionName, data.date);
            break;

        case "REST_STREAK_WARNING":
            message = NotificationTemplates.restStreakWarning(data.days);
            break;

        case "LOW_WORKOUT_COUNT":
            message = NotificationTemplates.lowWorkoutCount(
                data.completed,
                data.total,
                data.expected
            );
            break;

        case "STREAK_MILESTONE":
            message = NotificationTemplates.streakMilestone(data.days);
            break;

        case "WEEKLY_PROGRESS":
            message = NotificationTemplates.weeklyProgress(data.workouts, data.streak);
            break;

        case "DAILY_REMINDER":
            message = NotificationTemplates.dailyReminder(
                data.sessionName,
                data.exercises
            );
            break;

        default:
            console.log("Unknown event type:", eventType);
            return;
    }

    await sendTelegramNotification(message);
}
