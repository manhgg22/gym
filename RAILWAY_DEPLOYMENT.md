# 🚀 Deploy to Railway - Complete Guide

## 📋 Chuẩn bị

### 1. Tài khoản cần có:
- ✅ Railway account (https://railway.app)
- ✅ GitHub account
- ✅ Google Service Account JSON
- ✅ Telegram Bot Token (optional)

---

## 🔧 BƯỚC 1: Chuẩn bị code

### 1.1. Tạo file cấu hình Railway

Tạo `railway.json` trong thư mục `server/`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 1.2. Cập nhật `server/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3. Push code lên GitHub:
```bash
# Nếu chưa có git repo
git init
git add .
git commit -m "Initial commit - Workout Tracker"

# Tạo repo mới trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git
git branch -M main
git push -u origin main
```

---

## 🚂 BƯỚC 2: Deploy Backend lên Railway

### 2.1. Tạo project mới:
1. Vào https://railway.app
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repo `workout-tracker`
5. Railway sẽ tự động detect và deploy

### 2.2. Cấu hình Environment Variables:
Click vào service → **Variables** tab → Add:

```env
# Google Sheets
SHEET_ID=1TAmxmsh6q...
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Server
PORT=4000
TZ=Asia/Bangkok

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**⚠️ LƯU Ý:** 
- `GOOGLE_SERVICE_ACCOUNT_JSON` phải là **1 dòng duy nhất**, không xuống dòng
- Copy toàn bộ JSON từ file `.json` của Google

### 2.3. Lấy Backend URL:
Sau khi deploy xong, Railway sẽ tạo URL:
```
https://workout-tracker-production.up.railway.app
```

Copy URL này để dùng cho Frontend!

---

## 🎨 BƯỚC 3: Deploy Frontend lên Railway

### 3.1. Cập nhật `client/.env`:
```env
VITE_API_BASE=https://workout-tracker-production.up.railway.app
```

### 3.2. Tạo `railway.json` trong `client/`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 3.3. Cập nhật `client/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port $PORT",
    "start": "npm run build && npm run preview"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3.4. Deploy Frontend:
1. Push code lên GitHub
2. Railway → **New Project** → **Deploy from GitHub**
3. Chọn **root path**: `client`
4. Railway sẽ build và deploy

### 3.5. Lấy Frontend URL:
```
https://workout-tracker-client.up.railway.app
```

---

## 🤖 BƯỚC 4: Setup Telegram Bot (Optional)

### 4.1. Tạo Telegram Bot:
```
1. Mở Telegram, tìm @BotFather
2. Gửi /newbot
3. Đặt tên bot: "Workout Tracker Bot"
4. Đặt username: "your_workout_bot"
5. Copy Bot Token
```

### 4.2. Lấy Chat ID:
```
1. Gửi tin nhắn cho bot của bạn
2. Mở: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
3. Tìm "chat":{"id":123456789}
4. Copy Chat ID
```

### 4.3. Thêm vào Railway Environment Variables:
```env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=123456789
```

### 4.4. Test Telegram Bot:
```bash
# Trong Railway console hoặc local
npm run bot
```

---

## ✅ BƯỚC 5: Kiểm tra

### 5.1. Test Backend:
```bash
curl https://workout-tracker-production.up.railway.app/today-plan?mode=4
```

### 5.2. Test Frontend:
Mở browser: `https://workout-tracker-client.up.railway.app`

### 5.3. Test Telegram:
Gửi `/start` cho bot

---

## 🔒 BƯỚC 6: Bảo mật

### 6.1. CORS Configuration:
Cập nhật `server/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://workout-tracker-client.up.railway.app'
  ]
}));
```

### 6.2. Environment Variables:
- ✅ Không commit `.env` lên GitHub
- ✅ Dùng Railway Variables
- ✅ Google Service Account JSON phải là 1 dòng

---

## 📊 Monitoring

### Railway Dashboard:
- **Logs**: Xem logs realtime
- **Metrics**: CPU, Memory usage
- **Deployments**: History của các lần deploy

---

## 🐛 Troubleshooting

### Lỗi: "Module not found"
```bash
# Trong Railway console
npm install
```

### Lỗi: "Google Sheets API failed"
- Kiểm tra `GOOGLE_SERVICE_ACCOUNT_JSON` format
- Đảm bảo Service Account có quyền Editor

### Lỗi: "CORS blocked"
- Thêm Frontend URL vào CORS whitelist
- Restart backend service

---

## 💰 Chi phí

Railway Free Tier:
- ✅ $5 credit/month
- ✅ 500 hours execution
- ✅ Đủ cho app nhỏ

---

## 🎉 Hoàn thành!

Bạn đã có:
- ✅ Backend: `https://workout-tracker-production.up.railway.app`
- ✅ Frontend: `https://workout-tracker-client.up.railway.app`
- ✅ Telegram Bot: Hoạt động 24/7

Giờ bạn có thể dùng app từ bất kỳ đâu! 🚀
