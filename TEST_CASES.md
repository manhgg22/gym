# Test Cases & Business Logic Validation

## 🎯 Mục tiêu
Đảm bảo hệ thống không có kẽ hở trong nghiệp vụ và có thông báo đầy đủ

---

## 1. WORKOUT LOGGING

### ✅ Test Cases - Log Workout

#### TC1.1: Log workout thành công
- **Input**: Date, session_id, completed=true
- **Expected**: 
  - ✅ Lưu vào Google Sheets
  - ✅ Notification: "Tuyệt vời! Buổi tập đã được lưu!"
  - ✅ Redirect về Dashboard

#### TC1.2: Duplicate workout - Cùng ngày
- **Input**: Log workout 2 lần trong 1 ngày
- **Expected**:
  - ❌ Backend reject với status 400
  - ⚠️ Notification: "Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi."
  - 🔒 **KHÔNG** lưu vào database

#### TC1.3: Log workout thiếu thông tin
- **Input**: Missing session_id hoặc date
- **Expected**:
  - ❌ Backend reject với status 400
  - ⚠️ Notification: "Thiếu thông tin bắt buộc"

#### TC1.4: Log workout với timezone khác
- **Input**: User ở timezone khác GMT+7
- **Expected**:
  - ✅ Server tự động convert về GMT+7
  - ✅ Log đúng ngày theo GMT+7

---

## 2. QUICK CHECK-IN

### ✅ Test Cases - Quick Check-in

#### TC2.1: Check-in lần đầu trong ngày
- **Input**: Click "Check-in nhanh"
- **Expected**:
  - ✅ Tự động tính session tiếp theo
  - ✅ Lưu vào Google Sheets
  - ✅ Notification: "Check-in thành công! Buổi: [Session Name]"

#### TC2.2: Check-in lần 2 trong cùng ngày
- **Input**: Click "Check-in nhanh" 2 lần
- **Expected**:
  - ❌ Backend reject
  - ⚠️ Notification: "Bạn đã tập rồi hôm nay!"
  - 🔒 **KHÔNG** lưu duplicate

#### TC2.3: Check-in vào 23:59 GMT+7
- **Input**: Check-in vào cuối ngày
- **Expected**:
  - ✅ Log vào ngày hiện tại (GMT+7)
  - ✅ Sau 00:00 → Ngày mới, cho phép check-in lại

---

## 3. CALENDAR & STREAK

### ✅ Test Cases - Calendar Logic

#### TC3.1: Hiển thị ngày đã tập
- **Input**: Có workout log
- **Expected**:
  - ✅ Hiển thị badge xanh + session ID
  - ✅ Không hiển thị cho ngày tương lai

#### TC3.2: Hiển thị ngày nghỉ
- **Input**: Không có workout log
- **Expected**:
  - ✅ Hiển thị badge đỏ + "X"
  - ✅ Chỉ hiển thị cho ngày đã qua

#### TC3.3: Tính streak
- **Input**: Tập liên tiếp nhiều ngày
- **Expected**:
  - ✅ Streak tăng dần
  - ✅ Nghỉ 1 ngày → Streak reset về 0

#### TC3.4: Tính rest streak
- **Input**: Nghỉ nhiều ngày liên tiếp
- **Expected**:
  - ✅ Rest streak tăng dần
  - ✅ Tập 1 ngày → Rest streak reset về 0

---

## 4. WARNINGS & NOTIFICATIONS

### ✅ Test Cases - Warning System

#### TC4.1: Warning - Nghỉ quá 3 ngày
- **Input**: Rest streak > 3
- **Expected**:
  - ⚠️ Alert đỏ: "Bạn đã nghỉ X ngày liên tiếp!"
  - 📱 Push notification (nếu có)

#### TC4.2: Warning - Tập ít trong tháng
- **Input**: Completed < 50% tháng
- **Expected**:
  - ⚠️ Alert vàng: "Bạn chỉ tập X/Y ngày"
  - 💡 Suggestion: "Nên tập ít nhất Z ngày"

#### TC4.3: Congratulation - Streak milestone
- **Input**: Streak = 7, 14, 30 ngày
- **Expected**:
  - 🎉 Notification: "Tuyệt vời! Bạn đã tập X ngày liên tiếp!"
  - 🏆 Badge/Achievement (optional)

---

## 5. SESSION CYCLE

### ✅ Test Cases - Session Planning

#### TC5.1: Mode 4 buổi/tuần
- **Input**: Last session = S4
- **Expected**:
  - ✅ Next session = S1 (cycle: S1→S2→S3→S4→S1)

#### TC5.2: Mode 5 buổi/tuần
- **Input**: Last session = S5
- **Expected**:
  - ✅ Next session = S1 (cycle: S1→S2→S3→S4→S5→S1)

#### TC5.3: Chuyển mode giữa chừng
- **Input**: Đang mode 4, chuyển sang mode 5
- **Expected**:
  - ✅ Tiếp tục từ session hiện tại
  - ✅ Áp dụng cycle mới

---

## 6. EDGE CASES

### ✅ Test Cases - Edge Cases

#### TC6.1: Không có workout log nào
- **Input**: User mới, chưa tập bao giờ
- **Expected**:
  - ✅ Next session = S1
  - ✅ Streak = 0
  - ✅ Rest streak = 0

#### TC6.2: Google Sheets connection fail
- **Input**: Sheets API down
- **Expected**:
  - ❌ Error message rõ ràng
  - 🔄 Retry mechanism (optional)

#### TC6.3: Invalid session_id
- **Input**: session_id không tồn tại
- **Expected**:
  - ❌ Backend reject
  - ⚠️ Notification: "Session không hợp lệ"

#### TC6.4: Concurrent requests
- **Input**: 2 requests cùng lúc
- **Expected**:
  - ✅ Request 1 thành công
  - ❌ Request 2 bị reject (duplicate)

---

## 7. NOTIFICATION REQUIREMENTS

### 📱 Cần thêm Notifications

#### 7.1. Success Notifications
- ✅ Workout logged successfully
- ✅ Check-in successful
- ✅ Streak milestone reached

#### 7.2. Warning Notifications
- ⚠️ Duplicate workout attempt
- ⚠️ Rest streak > 3 days
- ⚠️ Low workout count in month

#### 7.3. Daily Reminders (Telegram)
- 🔔 19:00 GMT+7: "Hôm nay tập [Session Name]"
- 🔔 Nếu chưa check-in: "Nhắc nhở tập luyện"

#### 7.4. Achievement Notifications
- 🏆 7-day streak
- 🏆 30-day streak
- 🏆 100 workouts completed

---

## 8. SECURITY & VALIDATION

### 🔒 Security Checks

#### 8.1. Input Validation
- ✅ Date format: YYYY-MM-DD
- ✅ Session ID: S1-S5 only
- ✅ Mode: 4 or 5 only
- ✅ Completed: boolean

#### 8.2. Authorization
- ✅ Service Account có quyền Editor trên Sheet
- ✅ CORS configured đúng
- ✅ Environment variables secure

#### 8.3. Data Integrity
- ✅ Không duplicate logs
- ✅ Timezone consistent (GMT+7)
- ✅ Session cycle đúng logic

---

## 9. PERFORMANCE

### ⚡ Performance Tests

#### 9.1. API Response Time
- ✅ /today-plan: < 500ms
- ✅ /log: < 1000ms
- ✅ /month-summary: < 1500ms

#### 9.2. Caching
- ✅ Browser cache 304 Not Modified
- ✅ Reduce Google Sheets API calls

---

## 10. CHECKLIST - Kẽ hở cần fix

### ❌ Chưa có
- [ ] Push notification cho mobile
- [ ] Offline mode support
- [ ] Undo workout log
- [ ] Edit workout log
- [ ] Achievement system
- [ ] Social sharing

### ✅ Đã có
- [x] Duplicate workout prevention
- [x] GMT+7 timezone handling
- [x] Rest streak warning
- [x] Calendar visualization
- [x] Session cycle logic
- [x] Modal confirmations

---

## 📝 Recommendations

1. **Thêm Telegram notifications** cho:
   - Duplicate workout attempts
   - Streak milestones
   - Weekly summary

2. **Thêm error logging** để track issues

3. **Thêm analytics** để hiểu user behavior

4. **Thêm backup mechanism** cho Google Sheets data
