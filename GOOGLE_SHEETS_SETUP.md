# Google Sheets Setup Guide

## 1. Tạo Google Sheet

Tạo Google Sheet mới với tên "Workout Tracker" và tạo 4 tabs sau:

### Tab 1: Workout_Sessions

| session_id | session_name | muscle_groups | priority |
|------------|--------------|---------------|----------|
| S1 | Buổi 1 - Ngực & Tay sau | chest,triceps | 1 |
| S2 | Buổi 2 - Lưng & Tay trước | back,biceps | 2 |
| S3 | Buổi 3 - Vai & Bụng | shoulders,abs | 3 |
| S4 | Buổi 4 - Chân | legs | 4 |
| S5 | Buổi 5 - Full Body | chest,shoulders,triceps,back,biceps | 5 |

### Tab 2: Exercises

| session_id | order | exercise_id | name | sets | reps | rest_sec | video_url |
|------------|-------|-------------|------|------|------|----------|-----------|
| S1 | 1 | E101 | Bench Press | 4 | 8-10 | 120 | https://youtube.com/... |
| S1 | 2 | E102 | Incline Dumbbell Press | 3 | 10-12 | 90 | https://youtube.com/... |
| S1 | 3 | E103 | Cable Flyes | 3 | 12-15 | 60 | https://youtube.com/... |
| S1 | 4 | E104 | Tricep Dips | 3 | 10-12 | 90 | https://youtube.com/... |
| S1 | 5 | E105 | Overhead Tricep Extension | 3 | 12-15 | 60 | https://youtube.com/... |
| S2 | 1 | E201 | Pull-ups | 4 | 8-10 | 120 | https://youtube.com/... |
| S2 | 2 | E202 | Barbell Rows | 4 | 8-10 | 120 | https://youtube.com/... |
| S2 | 3 | E203 | Lat Pulldown | 3 | 10-12 | 90 | https://youtube.com/... |
| S2 | 4 | E204 | Barbell Curls | 3 | 10-12 | 90 | https://youtube.com/... |
| S2 | 5 | E205 | Hammer Curls | 3 | 12-15 | 60 | https://youtube.com/... |
| S3 | 1 | E301 | Overhead Press | 4 | 8-10 | 120 | https://youtube.com/... |
| S3 | 2 | E302 | Lateral Raises | 3 | 12-15 | 60 | https://youtube.com/... |
| S3 | 3 | E303 | Front Raises | 3 | 12-15 | 60 | https://youtube.com/... |
| S3 | 4 | E304 | Planks | 3 | 60s | 60 | https://youtube.com/... |
| S3 | 5 | E305 | Hanging Leg Raises | 3 | 12-15 | 60 | https://youtube.com/... |
| S4 | 1 | E401 | Squats | 4 | 8-10 | 180 | https://youtube.com/... |
| S4 | 2 | E402 | Romanian Deadlifts | 4 | 8-10 | 120 | https://youtube.com/... |
| S4 | 3 | E403 | Leg Press | 3 | 10-12 | 90 | https://youtube.com/... |
| S4 | 4 | E404 | Leg Curls | 3 | 12-15 | 60 | https://youtube.com/... |
| S4 | 5 | E405 | Calf Raises | 4 | 15-20 | 60 | https://youtube.com/... |
| S5 | 1 | E501 | Bench Press | 3 | 10-12 | 90 | https://youtube.com/... |
| S5 | 2 | E502 | Pull-ups | 3 | 8-10 | 90 | https://youtube.com/... |
| S5 | 3 | E503 | Overhead Press | 3 | 10-12 | 90 | https://youtube.com/... |
| S5 | 4 | E504 | Barbell Curls | 3 | 10-12 | 60 | https://youtube.com/... |
| S5 | 5 | E505 | Tricep Pushdowns | 3 | 12-15 | 60 | https://youtube.com/... |

### Tab 3: Workout_Log

Header row:

| date | session_id | completed | duration_min | note |
|------|------------|-----------|--------------|------|

(Để trống, data sẽ được thêm tự động qua API)

### Tab 4: Exercise_Check

Header row:

| date | session_id | exercise_id | checked |
|------|------------|-------------|---------|

(Để trống, data sẽ được thêm tự động qua API)

## 2. Tạo Service Account

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable **Google Sheets API**:
   - Vào "APIs & Services" > "Library"
   - Tìm "Google Sheets API"
   - Click "Enable"

4. Tạo Service Account:
   - Vào "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Đặt tên: `workout-tracker-service`
   - Click "Create and Continue"
   - Skip optional steps, click "Done"

5. Tạo Key:
   - Click vào service account vừa tạo
   - Tab "Keys" > "Add Key" > "Create new key"
   - Chọn JSON format
   - Download file JSON

## 3. Share Google Sheet

1. Mở file JSON vừa download
2. Copy email trong field `client_email` (dạng: `...@....iam.gserviceaccount.com`)
3. Mở Google Sheet của bạn
4. Click "Share" button
5. Paste email service account
6. Chọn role: **Editor**
7. Bỏ tick "Notify people" (không cần gửi email)
8. Click "Share"

## 4. Lấy Sheet ID

Từ URL Google Sheet:
```
https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
                                      ^^^^^^^^^^^^^^^^^
                                      Đây là SHEET_ID
```

## 5. Setup Environment Variables

### Server .env

```env
SHEET_ID=1a2b3c4d5e6f7g8h9i0j
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Lưu ý**: 
- `GOOGLE_SERVICE_ACCOUNT_JSON` phải là **1 dòng duy nhất** (không xuống dòng)
- Copy toàn bộ nội dung file JSON vào biến này
- Trên Railway/Render, paste trực tiếp JSON string vào environment variable

## 6. Test Connection

Sau khi setup xong, chạy server và test:

```bash
curl http://localhost:4000/today-plan?mode=4
```

Nếu thành công, bạn sẽ nhận được JSON với session và exercises từ Google Sheets.

## Troubleshooting

### Error: "The caller does not have permission"
- Kiểm tra lại đã share sheet cho service account email chưa
- Đảm bảo role là **Editor**, không phải Viewer

### Error: "Unable to parse range"
- Kiểm tra tên các tabs trong Google Sheet khớp chính xác:
  - `Workout_Sessions`
  - `Exercises`
  - `Workout_Log`
  - `Exercise_Check`

### Error: "Invalid credentials"
- Kiểm tra `GOOGLE_SERVICE_ACCOUNT_JSON` có đúng format JSON không
- Đảm bảo không có ký tự xuống dòng trong JSON string
- Thử copy lại toàn bộ nội dung file JSON

### Error: "API not enabled"
- Vào Google Cloud Console
- Enable "Google Sheets API" cho project
