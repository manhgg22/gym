# Telegram Bot Setup - 2 Phút

## Bước 1: Tạo Bot (1 phút)

1. Mở Telegram, tìm [@BotFather](https://t.me/botfather)
2. Gửi: `/newbot`
3. Đặt tên bot: `My Workout Coach`
4. Đặt username: `my_workout_coach_bot` (phải unique, thử tên khác nếu bị trùng)
5. Copy **BOT_TOKEN** (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Bước 2: Lấy Chat ID (30 giây)

1. Gửi `/start` cho bot của bạn
2. Mở browser, paste URL này (thay YOUR_BOT_TOKEN):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Tìm `"chat":{"id":123456789` → Copy số `123456789` (đây là CHAT_ID)

## Bước 3: Update .env (30 giây)

Mở file `server/.env` và thêm:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

## Bước 4: Chạy Bot (30 giây)

```bash
cd server
npm run bot
```

Bạn sẽ thấy:
```
🤖 Telegram Bot started
📱 Mode: 4 buổi/tuần
⏳ Waiting for messages...
```

## Test Bot

Gửi các lệnh sau cho bot:

- `/start` - Xem hướng dẫn
- `/today` - Xem buổi tập hôm nay
- `/checkin` - Check-in đã tập xong
- `/stats` - Xem thống kê tháng
- `/help` - Xem danh sách lệnh

## Bot Commands

### `/today` - Xem buổi tập hôm nay
Bot sẽ trả về:
- Tên buổi tập
- Nhóm cơ
- Danh sách bài tập (tối đa 8 bài)
- Link video cho từng bài
- Tips khởi động

### `/checkin` - Check-in nhanh
- Tự động log buổi tập hôm nay
- Không cần tick từng bài tập
- Nhanh gọn, tiện lợi

### `/stats` - Xem thống kê
- Số buổi tập trong tháng
- Streak (số ngày liên tiếp)
- Đánh giá tiến độ

### `/help` - Hướng dẫn
- Danh sách commands
- Cách sử dụng bot

## Chạy cùng lúc với Server

Terminal 1 - Server:
```bash
cd server
npm run dev
```

Terminal 2 - Bot:
```bash
cd server
npm run bot
```

Terminal 3 - Notification (optional):
```bash
cd server
npm run notify
```

## Lưu ý

- Bot chạy 24/7 để nhận lệnh bất cứ lúc nào
- Notification (notify.js) chỉ gửi nhắc nhở lúc 19:00
- Bot (bot.js) phản hồi ngay khi bạn gửi lệnh

## Troubleshooting

### ❌ "TELEGRAM_BOT_TOKEN not set"
→ Chưa thêm BOT_TOKEN vào .env

### ❌ Bot không phản hồi
→ Kiểm tra bot đang chạy (`npm run bot`)
→ Kiểm tra BOT_TOKEN đúng chưa

### ❌ "Error khi check-in"
→ Server chưa chạy hoặc API_BASE sai
→ Kiểm tra server: `npm run dev`

---

**Xong! Bây giờ bạn có thể check-in qua:**
- ✅ Frontend (web app)
- ✅ Telegram Bot (bất cứ lúc nào)

💪 Tập luyện thôi!
