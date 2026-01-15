# Quick Setup Guide - 5 Phút Setup Xong!

## Bước 1: Tạo Google Sheet (1 phút)

1. Vào [Google Sheets](https://sheets.google.com)
2. Tạo sheet mới (blank)
3. Copy **Sheet ID** từ URL:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                         ^^^^^^^^^^^^^^^^^^^
                                         Đây là SHEET_ID
   ```

## Bước 2: Tạo Service Account (2 phút)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới (hoặc chọn existing)
3. Enable **Google Sheets API**:
   - Sidebar → "APIs & Services" → "Library"
   - Tìm "Google Sheets API" → Click "Enable"

4. Tạo Service Account:
   - Sidebar → "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Tên: `workout-tracker` → Create
   - Skip optional steps → Done

5. Tạo Key:
   - Click vào service account vừa tạo
   - Tab "Keys" → "Add Key" → "Create new key"
   - Chọn **JSON** → Create
   - File JSON sẽ tự động download

## Bước 3: Share Sheet (30 giây)

1. Mở file JSON vừa download
2. Copy email trong field `client_email`:
   ```json
   "client_email": "workout-tracker@....iam.gserviceaccount.com"
   ```
3. Mở Google Sheet của bạn
4. Click nút **Share**
5. Paste email service account
6. Role: **Editor**
7. Bỏ tick "Notify people"
8. Click **Share**

## Bước 4: Setup Environment (1 phút)

1. Copy file JSON content (toàn bộ):
   ```json
   {"type":"service_account","project_id":"...","private_key":"..."}
   ```

2. Tạo file `server/.env`:
   ```bash
   cd server
   cp .env.example .env
   ```

3. Edit `server/.env`:
   ```env
   SHEET_ID=1a2b3c4d5e6f7g8h9i0j
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
   PORT=4000
   TZ=Asia/Bangkok
   ```

   **Lưu ý**: `GOOGLE_SERVICE_ACCOUNT_JSON` phải là **1 dòng duy nhất**!

## Bước 5: Auto Import Data (30 giây)

```bash
cd server
npm install
node setup-sheets.js
```

Script sẽ tự động:
- ✅ Tạo 4 tabs: Workout_Sessions, Exercises, Workout_Log, Exercise_Check
- ✅ Import 5 workout sessions
- ✅ Import 25 bài tập với video links
- ✅ Setup headers cho log sheets

Xong! 🎉

## Bước 6: Test Server (30 giây)

```bash
npm run dev
```

Mở browser: http://localhost:4000/today-plan?mode=4

Nếu thấy JSON với session và exercises → **Thành công!** ✅

## Bước 7: Chạy Client (30 giây)

Terminal mới:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Mở browser: http://localhost:5173

Bạn sẽ thấy Dashboard với buổi tập hôm nay! 🏋️

---

## Telegram Notification (Optional)

### 1. Tạo Bot (1 phút)

1. Mở Telegram, tìm [@BotFather](https://t.me/botfather)
2. Gửi: `/newbot`
3. Đặt tên bot: `My Workout Coach`
4. Đặt username: `my_workout_coach_bot` (phải unique)
5. Copy **BOT_TOKEN**

### 2. Lấy Chat ID (30 giây)

1. Gửi `/start` cho bot của bạn
2. Mở browser:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Copy `chat.id` từ JSON response

### 3. Update .env

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

### 4. Test Notification

```bash
node notify.js --test
```

Bạn sẽ nhận được message Telegram! 📱

### 5. Chạy Cron (Auto nhắc 19:00 hàng ngày)

```bash
npm run notify
```

---

## Troubleshooting

### ❌ Error: "The caller does not have permission"
→ Chưa share sheet cho service account email. Quay lại Bước 3.

### ❌ Error: "Unable to parse range"
→ Sheet tabs chưa được tạo. Chạy lại `node setup-sheets.js`

### ❌ Error: "Invalid credentials"
→ JSON trong .env bị sai format. Đảm bảo là 1 dòng duy nhất, không xuống dòng.

### ❌ Client không kết nối được server
→ Check `client/.env` có `VITE_API_BASE=http://localhost:4000`

---

## 🎯 Tổng thời gian: ~5-6 phút

- ✅ Google Sheet setup: 3 phút
- ✅ Auto import data: 30 giây
- ✅ Test local: 1 phút
- ✅ Telegram (optional): 2 phút

**Xong! Bắt đầu tập thôi!** 💪
