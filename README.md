# Workout Tracking System

Hệ thống theo dõi tập luyện với 3 phần chính:
- **Server**: Express.js + Google Sheets API
- **Telegram Bot**: Nhắc nhở hàng ngày
- **Frontend**: React app với Dashboard, Workout checklist, Calendar

## Cấu trúc dự án

```
/server          # Backend API + Telegram notifications
/client          # React frontend
```

## Quick Setup (5 phút)

👉 **Xem `QUICK_SETUP.md` để setup nhanh trong 5 phút!**

Script tự động import data vào Google Sheets:
```bash
cd server
npm install
node setup-sheets.js
```

## Setup Instructions (Chi tiết)

### 1. Google Sheets Setup

Tạo Google Sheet mới với 4 tabs theo schema trong `GOOGLE_SHEETS_SETUP.md`.

**Hoặc dùng auto-import**: Chạy `npm run setup` sau khi có Service Account.

### 2. Server Setup

```bash
cd server
npm install
cp .env.example .env
# Điền thông tin vào .env file
npm run dev
```

### 3. Client Setup

```bash
cd client
npm install
cp .env.example .env
# Điền API_BASE vào .env
npm run dev
```

### 4. Telegram Bot Setup

1. Tạo bot qua [@BotFather](https://t.me/botfather)
2. Gửi `/start` cho bot của bạn
3. Lấy CHAT_ID từ: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Thêm BOT_TOKEN và CHAT_ID vào server `.env`

### 5. Chạy Telegram Notification

```bash
cd server
npm run notify
```

## Deployment

### Railway

```bash
# Deploy server
railway up
railway variables set SHEET_ID=...
railway variables set GOOGLE_SERVICE_ACCOUNT_JSON=...
# ... các env khác
```

### Render

Sử dụng file `render.yaml` để deploy cả server và client.

## Environment Variables

### Server
- `SHEET_ID`: Google Sheets ID
- `GOOGLE_SERVICE_ACCOUNT_JSON`: Service account credentials (JSON string)
- `PORT`: Server port (default: 4000)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Your Telegram chat ID
- `TZ`: Timezone (default: Asia/Bangkok)

### Client
- `VITE_API_BASE`: Server API URL

## Features

- ✅ Tự động tính buổi tập tiếp theo (4-5 buổi/tuần)
- ✅ Checklist bài tập với video links
- ✅ Lưu lịch sử tập luyện vào Google Sheets
- ✅ Nhắc nhở Telegram hàng ngày lúc 19:00
- ✅ Calendar view theo tháng
- ✅ Streak tracking

## Tech Stack

- **Backend**: Node.js, Express, Google Sheets API
- **Frontend**: React, Vite, React Router
- **Notification**: Telegram Bot API, node-cron
- **Database**: Google Sheets
- **Deployment**: Railway / Render

## Support

Xem chi tiết trong `GOOGLE_SHEETS_SETUP.md` để setup Google Sheets và Service Account.
