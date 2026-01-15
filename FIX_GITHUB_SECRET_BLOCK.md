# 🔒 FIX: GitHub Secret Scanning Block

## ⚠️ Vấn đề:
GitHub phát hiện **Google Service Account JSON** trong commit history và chặn push.

## ✅ Giải pháp: Reset Git History

### Bước 1: Xóa Git history cũ
```powershell
# Xóa folder .git
Remove-Item -Recurse -Force .git
```

### Bước 2: Khởi tạo Git mới
```powershell
git init
git add .
git commit -m "Initial commit - Workout Tracker (no secrets)"
```

### Bước 3: Force push lên GitHub
```powershell
git remote add origin https://github.com/manhgg22/gym.git
git branch -M main
git push -f origin main
```

**Lưu ý**: `-f` (force) sẽ ghi đè lên remote repository

---

## 🔐 Quan trọng: Google Service Account

### ❌ KHÔNG bao giờ commit file JSON!

Thay vào đó, dùng **Environment Variables** trên Railway:

1. Copy toàn bộ nội dung file JSON
2. Minify thành 1 dòng: https://codebeautify.org/jsonminifier
3. Paste vào Railway Environment Variables:
   ```
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
   ```

### ✅ File .gitignore đã được update:
```gitignore
# Google Service Account (CRITICAL!)
*.json
!package.json
!package-lock.json
!tsconfig.json
!railway.json
```

---

## 📝 Checklist:

- [ ] Xóa `.git` folder
- [ ] Init Git mới
- [ ] Commit (không có secrets)
- [ ] Force push
- [ ] Verify trên GitHub (không có JSON file)
- [ ] Deploy lên Railway với Environment Variables

---

## 🚀 Sau khi push thành công:

Tiếp tục deploy lên Railway theo file `RAILWAY_DEPLOYMENT.md`
