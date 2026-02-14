# 🎯 Quiz Uygulaması

Modern, güzel tasarımlı bir Quiz/Test uygulaması. Arkadaşlarınızla yarışın, puanları takip edin!

## ✨ Özellikler

### 👥 Kullanıcı Özellikleri
- ✅ İsim-soyisim ile hızlı giriş
- ✅ Çoktan seçmeli sorular
- ✅ Anlık puan sistemi
- ✅ Doğru/yanlış geri bildirimi
- ✅ Kişisel istatistikler
- ✅ Sıralama tablosu (Leaderboard)

### 👨‍💼 Admin Özellikleri
- ✅ Özel şifreli admin girişi
- ✅ Soru ekleme/silme
- ✅ Tüm kullanıcıları görüntüleme
- ✅ Puanları ve istatistikleri izleme
- ✅ Sıralama tablosunu görüntüleme

## 🚀 Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin (Bir kez)
```bash
npm install
```

### 2. Uygulamayı Başlatın
```bash
npm start
```

### 3. Tarayıcıda Açın
Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

## 🔐 Admin Girişi

**Kullanıcı Adı:** `admin`  
**Şifre:** `admin123`

> ⚠️ **Önemli:** Ürün ortamında şifreyi mutlaka değiştirin!

## 📱 Kullanım Kılavuzu

### Kullanıcı Girişi
1. Ana sayfada "👤 Kullanıcı Girişi" sekmesinde
2. İsim ve soyisminizi girin
3. "🚀 Teste Başla" butonuna tıklayın

### Admin Girişi
1. Ana sayfada "👨‍💼 Admin Girişi" sekmesine geçin
2. Admin kullanıcı adı ve şifresini girin
3. "🔐 Admin Girişi" butonuna tıklayın

### Soru Ekleme (Admin)
1. Admin panelinde "📝 Sorular" sekmesinde
2. Soru metnini ve A, B, C, D şıklarını doldurun
3. Doğru cevabı seçin
4. Puan değerini belirleyin (varsayılan: 10)
5. "✅ Soruyu Ekle" butonuna tıklayın

### Test Çözme (Kullanıcı)
1. Kullanıcı panelinde "📝 Test" sekmesinde
2. Her soruya A, B, C veya D şıklarından birini seçin
3. Seçiminiz hemen kaydedilir ve sonuç gösterilir
4. "📊 Sonuçlarım" sekmesinden istatistiklerinizi görün
5. "🏆 Sıralama" sekmesinden sıralamadaki yerinizi görün

## 💾 Veri Saklama

Tüm veriler `quiz-data.json` dosyasında saklanır:
- Admin bilgileri
- Kullanıcı bilgileri
- Sorular
- Test sonuçları

## 🎨 Tasarım Özellikleri

- ✨ Modern gradient arka planlar
- 🎭 Glassmorphism efektleri
- 🌊 Yumuşak animasyonlar
- 📱 Responsive tasarım (mobil uyumlu)
- 🎯 Premium kullanıcı deneyimi

## 🛠️ Teknolojiler

- **Backend:** Node.js + Express
- **Veritabanı:** JSON dosya tabanlı (basit ve hızlı)
- **Frontend:** Vanilla JavaScript
- **Stil:** Modern CSS3 (gradients, animations, flexbox, grid)

## 📊 Sıralama Sistemi

Kullanıcılar toplam puanlarına göre sıralanır:
- 🥇 1. sıra: Altın madalya
- 🥈 2. sıra: Gümüş madalya
- 🥉 3. sıra: Bronz madalya

## 🔧 Sorun Giderme

### Port 3000 kullanımda hatası
Farklı bir port kullanmak için `server.js` dosyasındaki `PORT` değişkenini değiştirin.

### Veritabanı sıfırlama
`quiz-data.json` dosyasını silin ve sunucuyu yeniden başlatın.

## 📝 Notlar

- Uygulama localhost:3000 üzerinde çalışır
- Aynı anda birden fazla kullanıcı test çözebilir
- Veriler dosya sisteminde saklanır (basit hosting için idealdir)

## 🎉 Hazır!

Artık Quiz uygulamanız kullanıma hazır! Arkadaşlarınızla eğlenceli testler oluşturun! 🚀
