# Fix Lỗi "SyntaxError: Expected property name" - Hướng dẫn nhanh

## Vấn đề
File `.env` của bạn có biến `GOOGLE_SERVICE_ACCOUNT_JSON` chưa được điền đúng format.

## Giải pháp - 3 Bước

### Bước 1: Tạo Service Account (nếu chưa có)

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới (hoặc chọn existing)
3. Enable **Google Sheets API**:
   - Menu → "APIs & Services" → "Library"
   - Tìm "Google Sheets API" → Enable

4. Tạo Service Account:
   - Menu → "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Tên: `workout-tracker`
   - Click "Create" → Skip optional steps → "Done"

5. Tạo JSON Key:
   - Click vào service account vừa tạo
   - Tab "Keys" → "Add Key" → "Create new key"
   - Chọn **JSON**
   - File JSON sẽ download về máy

### Bước 2: Edit file `.env`

Mở file `server/.env` và điền thông tin:

```env
# Google Sheets
SHEET_ID=your_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"workout-tracker@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# Server
PORT=4000

# Telegram (có thể bỏ trống)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Timezone
TZ=Asia/Bangkok
```

**QUAN TRỌNG:**
- `GOOGLE_SERVICE_ACCOUNT_JSON` phải là **1 DÒNG DUY NHẤT**
- Copy **TOÀN BỘ** nội dung file JSON vào (từ `{` đến `}`)
- Không được xuống dòng
- Không được có khoảng trắng thừa

**Cách copy đúng:**
1. Mở file JSON vừa download bằng Notepad
2. Ctrl+A → Ctrl+C (copy toàn bộ)
3. Paste vào sau dấu `=` trong file `.env`
4. Xóa hết các dấu xuống dòng (phải thành 1 dòng duy nhất)

### Bước 3: Lấy Sheet ID

1. Tạo Google Sheet mới: https://sheets.google.com
2. Copy Sheet ID từ URL:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                         ^^^^^^^^^^^^^^^^^^^
                                         Đây là SHEET_ID
   ```
3. Paste vào `SHEET_ID=` trong file `.env`

### Bước 4: Share Google Sheet

1. Mở file JSON, tìm field `client_email`:
   ```json
   "client_email": "workout-tracker@your-project.iam.gserviceaccount.com"
   ```
2. Copy email này
3. Mở Google Sheet → Click "Share"
4. Paste email → Role: **Editor** → Share

### Bước 5: Kiểm tra lại

```bash
npm run check
```

Nếu thấy:
- ✅ SHEET_ID: [your-id]
- ✅ GOOGLE_SERVICE_ACCOUNT_JSON: Hợp lệ

→ **OK! Chạy tiếp:**

```bash
npm run setup
```

## Ví dụ file `.env` đúng

```env
SHEET_ID=1a2b3c4d5e6f7g8h9i0jk1l2m3n4o5p6q7r8s9t0
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"my-project-123456","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"workout-tracker@my-project-123456.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/workout-tracker%40my-project-123456.iam.gserviceaccount.com"}
PORT=4000
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TZ=Asia/Bangkok
```

**Chú ý:** JSON phải là 1 dòng duy nhất, không xuống dòng!

## Troubleshooting

### ❌ Vẫn lỗi "SyntaxError"
→ JSON chưa đúng format. Kiểm tra:
- Có phải 1 dòng duy nhất không?
- Có dấu `{` mở đầu và `}` kết thúc không?
- Copy đủ toàn bộ nội dung file JSON chưa?

### ❌ "The caller does not have permission"
→ Chưa share sheet cho service account email

### ❌ "Cannot find SHEET_ID"
→ Sheet ID sai hoặc chưa điền

## Sau khi setup xong

```bash
npm run setup   # Import data vào Google Sheets
npm run dev     # Chạy server
```

Xong! 🎉
