# Hướng dẫn Test - Workout Tracker

## 🧪 Cách test nhanh

### 1. Test Duplicate Workout (Quan trọng nhất!)

**Mục đích**: Đảm bảo không thể tập 2 buổi/ngày

```bash
# Bước 1: Check-in lần 1
1. Mở http://localhost:5173
2. Click "Check-in nhanh"
3. ✅ Kết quả: Thành công, hiện Modal "Check-in thành công!"

# Bước 2: Check-in lần 2 (cùng ngày)
4. Click "Check-in nhanh" lần nữa
5. ✅ Kết quả: Lỗi "Bạn đã tập rồi hôm nay!"
6. ✅ Telegram nhận cảnh báo duplicate
```

---

### 2. Test Timezone GMT+7

**Mục đích**: Đảm bảo dùng đúng múi giờ Việt Nam

```bash
# Test vào 23:50 GMT+7
1. Đợi đến 23:50 tối
2. Click "Check-in nhanh"
3. ✅ Log vào ngày hôm nay

# Test vào 00:10 GMT+7 (ngày mới)
4. Đợi qua 00:00
5. Click "Check-in nhanh" lại
6. ✅ Cho phép check-in (ngày mới)
```

---

### 3. Test Calendar Colors

**Mục đích**: Kiểm tra màu sắc hiển thị đúng

```bash
1. Mở http://localhost:5173/calendar
2. ✅ Ngày đã tập: Badge xanh
3. ✅ Ngày nghỉ: Badge đỏ
4. ✅ Ngày tương lai: Không có màu
```

---

### 4. Test Rest Streak Warning

**Mục đích**: Cảnh báo khi nghỉ quá 3 ngày

```bash
# Giả lập: Nghỉ 4 ngày
1. Vào Calendar
2. ✅ Thấy Alert đỏ: "Bạn đã nghỉ X ngày liên tiếp!"
3. ✅ Card "Nghỉ liên tiếp" màu đỏ
```

---

### 5. Test Session Cycle

**Mục đích**: Kiểm tra chu kỳ S1→S2→S3→S4

```bash
# Mode 4 buổi/tuần
1. Check-in → Session S1
2. Check-in ngày sau → Session S2
3. Check-in ngày sau → Session S3
4. Check-in ngày sau → Session S4
5. Check-in ngày sau → Session S1 (lặp lại)
✅ Chu kỳ đúng
```

---

### 6. Test Telegram Notifications

**Mục đích**: Kiểm tra thông báo Telegram

```bash
# Setup
1. Thêm TELEGRAM_BOT_TOKEN và TELEGRAM_CHAT_ID vào .env
2. Restart server

# Test
3. Check-in → ✅ Nhận thông báo Telegram
4. Check-in lần 2 → ✅ Nhận cảnh báo duplicate
5. Nghỉ >3 ngày → ✅ Nhận cảnh báo nghỉ lâu
```

---

## 📋 Checklist Test nhanh (5 phút)

- [ ] Check-in 1 lần → Thành công
- [ ] Check-in 2 lần cùng ngày → Bị chặn
- [ ] Calendar hiển thị đúng màu (xanh/đỏ)
- [ ] Workout page hiển thị đúng exercises
- [ ] Progress bar hoạt động
- [ ] Modal confirmations xuất hiện
- [ ] Telegram notification (nếu có setup)

---

## 🐛 Các lỗi thường gặp

### Lỗi 1: "Failed to fetch"
**Nguyên nhân**: Server chưa chạy
**Fix**: `cd server && npm run dev`

### Lỗi 2: "SyntaxError in .env"
**Nguyên nhân**: GOOGLE_SERVICE_ACCOUNT_JSON sai format
**Fix**: Xem file `FIX_ENV_ERROR.md`

### Lỗi 3: Calendar không có màu
**Nguyên nhân**: Chưa có workout logs
**Fix**: Check-in ít nhất 1 lần

### Lỗi 4: Duplicate vẫn được phép
**Nguyên nhân**: Backend validation chưa hoạt động
**Fix**: Kiểm tra console log server

---

## ✅ Test thành công khi:

1. ✅ Không thể check-in 2 lần/ngày
2. ✅ Calendar hiển thị đúng màu
3. ✅ Warnings xuất hiện khi cần
4. ✅ Session cycle đúng logic
5. ✅ Telegram notifications hoạt động (nếu có)

---

**Thời gian test**: ~5-10 phút
**Quan trọng nhất**: Test duplicate workout prevention!
