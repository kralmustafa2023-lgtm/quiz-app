# 🔧 Git Kurulum ve GitHub Yükleme Rehberi

## 1️⃣ Git Kurulumu

### Windows için Git İndirme

1. **Git'i indirin:**
   - https://git-scm.com/download/win
   - "64-bit Git for Windows Setup" indirin
   - Dosyayı çalıştırın

2. **Kurulum Ayarları:**
   - "Next" ile devam edin
   - Tüm varsayılan ayarları kabul edin
   - "Install" tıklayın

3. **Kurulum Tamamlandı:**
   - "Finish" tıklayın
   - Bilgisayarı yeniden başlatın (önerilir)

### Git Kurulumunu Kontrol

PowerShell veya CMD'de:
```bash
git --version
```

Çıktı: `git version 2.x.x` görmelisiniz.

---

## 2️⃣ Git Yapılandırması

PowerShell'de şu komutları çalıştırın:

```bash
# İsminizi ayarlayın
git config --global user.name "İsminiz Soyisminiz"

# Email'inizi ayarlayın (GitHub email'iniz)
git config --global user.email "email@example.com"

# Kontrol edin
git config --global user.name
git config --global user.email
```

---

## 3️⃣ GitHub'da Repository Oluşturma

### A) GitHub'a Giriş
1. https://github.com adresine gidin
2. Giriş yapın

### B) Yeni Repository
1. Sağ üstte **"+"** → **"New repository"**
2. Ayarlar:
   - **Repository name:** `quiz-app`
   - **Description:** `Modern Quiz Uygulaması - Kendi quiz'lerinizi oluşturun ve paylaşın`
   - **Public** seçin (herkes görebilir)
   - **Add a README file:** HAYIR (bizde zaten var)
   - **Add .gitignore:** HAYIR (bizde zaten var)
   - **Choose a license:** MIT License (opsiyonel)
3. **"Create repository"** tıklayın

### C) Repository URL'ini Kopyalayın
Sayfada göreceğiniz URL'i kopyalayın:
```
https://github.com/KULLANICI_ADINIZ/quiz-app.git
```

---

## 4️⃣ Projeyi GitHub'a Yükleme

### PowerShell'de quiz-app klasörüne gidin:
```bash
cd C:\Users\pcx\Desktop\python\quiz-app
```

### Git komutlarını çalıştırın:

```bash
# 1. Git repository başlat
git init

# 2. Tüm dosyaları ekle
git add .

# 3. İlk commit
git commit -m "Initial commit: Quiz uygulaması tamamlandı"

# 4. Ana branch'i main yap
git branch -M main

# 5. GitHub'a bağla (URL'i kendi URL'inizle değiştirin)
git remote add origin https://github.com/KULLANICI_ADINIZ/quiz-app.git

# 6. GitHub'a yükle
git push -u origin main
```

### İlk kez push yapıyorsanız:
GitHub kullanıcı adı ve şifrenizi soracak (veya token).

**Personal Access Token oluşturma:**
1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. Scope: `repo` seçin
5. Token'ı kopyalayın (bir daha göremezsiniz!)
6. Şifre yerine bu token'ı kullanın

---

## 5️⃣ Başarılı! ✅

GitHub'da repository'nizi kontrol edin:
```
https://github.com/KULLANICI_ADINIZ/quiz-app
```

Tüm dosyalarınız orada olmalı!

---

## 6️⃣ Güncelleme Yapma

Kodda değişiklik yaptıktan sonra:

```bash
# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Güncelleme açıklaması"

# GitHub'a yükle
git push
```

---

## 🐛 Sorun Giderme

### "git: command not found"
- Git kurulumu yapın (yukarıdaki adımlar)
- Bilgisayarı yeniden başlatın

### "Permission denied"
- Personal Access Token kullanın
- SSH key ekleyin (alternatif)

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/KULLANICI_ADINIZ/quiz-app.git
```

### "Updates were rejected"
```bash
git pull origin main --rebase
git push origin main
```

---

## 📞 Yardım

Sorun mu var? Hata mesajını paylaşın!
