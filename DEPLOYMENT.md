# Deployment Guide

## Railway Deployment

### 1. Deploy Server

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and initialize:
```bash
railway login
railway init
```

3. Deploy:
```bash
railway up
```

4. Set environment variables:
```bash
railway variables set SHEET_ID="your_sheet_id"
railway variables set GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
railway variables set TELEGRAM_BOT_TOKEN="your_bot_token"
railway variables set TELEGRAM_CHAT_ID="your_chat_id"
railway variables set TZ="Asia/Bangkok"
```

5. Get your server URL from Railway dashboard

### 2. Deploy Client

Option A: Deploy to Vercel/Netlify
```bash
cd client
npm run build
# Upload dist folder to Vercel/Netlify
```

Option B: Deploy client to Railway as well
- Create new Railway project for client
- Set `VITE_API_BASE` to your server URL
- Deploy

---

## Render Deployment

### Using render.yaml (Recommended)

1. Push code to GitHub
2. Connect Render to your GitHub repo
3. Render will auto-detect `render.yaml`
4. Set environment variables in Render dashboard:
   - `SHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

Render will automatically deploy:
- Server (web service)
- Notification worker (background worker)
- Client (static site)

---

## Local Development

### 1. Setup Google Sheets
Follow instructions in `GOOGLE_SHEETS_SETUP.md`

### 2. Setup Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Server runs on http://localhost:4000

### 3. Setup Client
```bash
cd client
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE=http://localhost:4000
npm run dev
```

Client runs on http://localhost:5173

### 4. Setup Telegram Notifications (Optional)

1. Create bot via [@BotFather](https://t.me/botfather):
   - Send `/newbot`
   - Follow instructions
   - Copy BOT_TOKEN

2. Get your CHAT_ID:
   - Send `/start` to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Copy `chat.id` from response

3. Add to server `.env`:
```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

4. Run notification service:
```bash
cd server
npm run notify
```

To test immediately:
```bash
node notify.js --test
```

---

## Environment Variables Reference

### Server (.env)
```env
SHEET_ID=                          # Google Sheets ID from URL
GOOGLE_SERVICE_ACCOUNT_JSON=       # Service account JSON (one line)
PORT=4000                          # Server port
TELEGRAM_BOT_TOKEN=                # From BotFather
TELEGRAM_CHAT_ID=                  # Your Telegram chat ID
TZ=Asia/Bangkok                    # Timezone for cron
```

### Client (.env)
```env
VITE_API_BASE=http://localhost:4000   # Server URL
```

---

## Troubleshooting

### Server won't start
- Check Google Sheets credentials
- Verify SHEET_ID is correct
- Ensure all environment variables are set

### Client can't connect to server
- Check VITE_API_BASE is correct
- Verify server is running
- Check CORS settings (should allow all origins)

### Telegram notifications not working
- Verify BOT_TOKEN and CHAT_ID
- Check server can reach Telegram API
- Test with `node notify.js --test`
- Verify cron timezone matches your location

### Google Sheets errors
- Ensure sheet is shared with service account email
- Check sheet tab names match exactly
- Verify Google Sheets API is enabled

---

## Production Checklist

- [ ] Google Sheets created with 4 tabs
- [ ] Service account created and sheet shared
- [ ] Telegram bot created
- [ ] Server deployed and environment variables set
- [ ] Client deployed with correct API_BASE
- [ ] Test `/today-plan` endpoint
- [ ] Test logging a workout
- [ ] Verify Telegram notification works
- [ ] Check cron schedule (19:00 daily)
