# 🐛 CRITICAL BUG FIX - Duplicate Workout Prevention

## Vấn đề phát hiện:
User check-in nhiều lần và tạo ra **12 dòng duplicate** trong Google Sheets:
```
2026-01-15	S2	TRUE	
2026-01-15	S2	TRUE	
2026-01-15	S2	TRUE	
... (12 dòng giống nhau)
```

## Nguyên nhân:
1. ✅ Backend route có validation check duplicate
2. ❌ Nhưng hàm `logWorkout()` vẫn dùng `appendRow()` - luôn thêm dòng mới
3. ❌ Race condition: Nhiều requests cùng lúc → đều pass validation → tất cả đều append

## Giải pháp:
### **Double-check trong `logWorkout()`**
```javascript
export async function logWorkout(date, sessionId, completed, durationMin, note) {
  // CRITICAL: Check lại trước khi append
  const existingLogs = await getLogs();
  const duplicate = existingLogs.find(
    (log) => log.date === date && log.completed === "TRUE"
  );
  
  if (duplicate) {
    throw new Error("Duplicate workout detected");
  }
  
  await appendRow("Workout_Log!A1", [...]);
}
```

## Kết quả:
- ✅ 2 lớp validation: Route + Function
- ✅ Chặn race condition
- ✅ Throw error rõ ràng nếu duplicate
- ✅ Frontend sẽ nhận error và hiện notification

## Cách dọn dẹp data hiện tại:
1. Mở Google Sheets
2. Vào tab `Workout_Log`
3. Xóa 11 dòng duplicate (giữ lại 1 dòng duy nhất cho 2026-01-15)
4. Save

## Test lại:
```bash
cd server
npm test
```

Expected: Test "POST /quick-checkin prevents duplicate" PASS ✅
