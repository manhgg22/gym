# 🔧 Fix Error Messages - Show Server Errors

## Vấn đề:
Frontend hiển thị **"Failed to check-in"** thay vì message thực từ server:
- ❌ Generic: "Failed to check-in"
- ✅ Cần: "Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi."

## Nguyên nhân:
API functions trong `api.js` throw generic error thay vì parse server response:

```javascript
// SAI ❌
if (!r.ok) throw new Error("Failed to check-in");

// ĐÚNG ✅
const data = await r.json();
if (!r.ok) throw new Error(data.error || "Failed to check-in");
```

## Đã fix:
✅ `postLog()` - Parse error từ server
✅ `quickCheckin()` - Parse error từ server  
✅ `postExerciseCheck()` - Parse error từ server

## Kết quả:
Giờ notification sẽ hiển thị:
- ✅ "Bạn đã tập rồi hôm nay! Mỗi ngày chỉ được tập 1 buổi."
- ✅ "Duplicate workout detected for 2026-01-15"
- ✅ Message rõ ràng từ backend

## ⚠️ Vẫn còn duplicate trong DB:
Bạn cần **XÓA THỦCÔNG** các dòng duplicate trong Google Sheets:
1. Mở Google Sheets
2. Tab "Workout_Log"
3. Xóa dòng duplicate (giữ 1 dòng duy nhất cho mỗi ngày)
4. Save

Backend giờ đã chặn được duplicate mới!
