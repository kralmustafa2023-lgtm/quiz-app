# 🎯 Quiz Uygulaması - Test & Sınav Sistemi

![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=flat-square&logo=node.js)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![Status](https://img.shields.io/badge/status-active-success?style=flat-square)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=flat-square)

Modern, kullanıcı dostu quiz oluşturma ve paylaşma platformu. Kendi quiz'lerinizi oluşturun, arkadaşlarınızla paylaşın!

**🌐 GitHub:** [https://github.com/kralmustafa2023-lgtm/quiz-app](https://github.com/kralmustafa2023-lgtm/quiz-app)

## ✨ Özellikler

### 👤 Kullanıcı Özellikleri
- ✅ Güvenli kayıt ve giriş sistemi
- 📝 Sınırsız quiz oluşturma
- 🔑 Her quiz için benzersiz 6 haneli paylaşım kodu
- ➕ Quiz'lere soru ekleme/silme
- 👥 Katılımcıları ve sonuçları görüntüleme
- 🏆 Quiz bazlı sıralama tablosu
- 📊 Detaylı istatistikler

### 🎯 Katılımcı Özellikleri
- 🚀 Quiz kodunu girerek hızlı katılım
- ✅ Çoktan seçmeli sorular
- 📊 Anlık sonuç görüntüleme
- 🏅 Puan ve başarı oranı hesaplama
- 🎨 Modern ve kullanıcı dostu arayüz

## 🚀 Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MongoDB (opsiyonel - LocalDB ile de çalışır)

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Uygulamayı başlatın:**
```bash
npm start
```

3. **Tarayıcınızda açın:**
```
http://localhost:3005
```

## 📖 Kullanım Kılavuzu

### Quiz Oluşturmak

1. Ana sayfada **"Kayıt Ol"** sekmesinden kayıt olun
2. **"Giriş Yap"** ile sisteme giriş yapın
3. **"Yeni Quiz"** sekmesinden quiz bilgilerini girin
4. Quiz kodunuzu not edin (örn: **ABC123**)
5. **"Quiz'lerim"** sekmesinden quiz'inize tıklayın
6. **"Sorular"** sekmesinden sorularınızı ekleyin
7. Quiz kodunu arkadaşlarınızla paylaşın! 🎉

### Quiz'e Katılmak

1. Ana sayfada **"Quiz'e Katıl"** sekmesine tıklayın
2. İsminizi ve quiz kodunu girin
3. Soruları cevaplayın
4. **"Quiz'i Tamamla"** ile bitirin
5. Sonuçlarınızı görüntüleyin! 🏆

## 🗂️ Proje Yapısı

```
quiz-app/
├── models/              # Veritabanı modelleri
│   ├── User.js         # Kullanıcı modeli
│   ├── Quiz.js         # Quiz modeli
│   ├── Result.js       # Sonuç modeli
│   └── LocalDB.js      # LocalDB implementasyonu
├── public/             # Frontend dosyaları
│   ├── index.html      # Ana sayfa
│   ├── app.js          # Frontend JavaScript
│   └── style.css       # Stiller
├── server.js           # Express server
├── package.json        # Bağımlılıklar
├── README.md           # Bu dosya
└── SECURITY.md         # Güvenlik dokümantasyonu
```

## 🔒 Güvenlik

Uygulama aşağıdaki güvenlik önlemlerini içerir:

- ✅ Şifre hash'leme (bcrypt)
- ✅ Input validation ve sanitization
- ✅ Rate limiting (100 req/min)
- ✅ Request size limiting (1MB)
- ✅ XSS koruması
- ✅ Quiz cevaplarının gizlenmesi
- ✅ Regex tabanlı input kontrolü

Detaylı güvenlik bilgisi için [SECURITY.md](SECURITY.md) dosyasına bakın.

## 🛠️ Teknolojiler

### Backend
- Node.js
- Express.js
- MongoDB / LocalDB (fallback)
- bcryptjs

### Frontend
- Vanilla JavaScript
- Modern CSS3
- Responsive Design

## 💾 Veri Saklama

### MongoDB Modu
MongoDB kurulu ise otomatik olarak MongoDB kullanılır.

### LocalDB Modu
MongoDB yoksa uygulama otomatik olarak LocalDB moduna geçer:
- Veriler `local_db_*.json` dosyalarında saklanır
- Tam MongoDB uyumlu API
- Küçük projeler için idealdir

## 📊 Özellik Limitleri

- Maksimum quiz başlığı: **200 karakter**
- Maksimum açıklama: **500 karakter**
- Maksimum soru metni: **500 karakter**
- Maksimum soru sayısı: **50 soru/quiz**
- Maksimum katılımcı ismi: **100 karakter**
- Puan aralığı: **1-100 puan/soru**
- Rate limit: **100 istek/dakika**

## 🔧 Yapılandırma

### Environment Variables

`.env` dosyası oluşturun (opsiyonel):

```env
PORT=3005
MONGODB_URI=mongodb://localhost:27017/quiz-app
NODE_ENV=development
```

## 🐛 Sorun Giderme

### Port zaten kullanımda
```bash
# Farklı port kullanın
PORT=3006 npm start
```

### MongoDB bağlantı hatası
Uygulama otomatik olarak LocalDB moduna geçer. Veri `local_db_*.json` dosyalarında saklanır.

### Bağımlılık hataları
```bash
# Node modules'ü temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Türkçe karakter sorunu
LocalDB UTF-8 encoding kullanır. Sorun devam ederse dosyaları UTF-8 olarak kaydedin.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Quiz Management
- `GET /api/creator/:userId/quizzes` - Kullanıcının quiz'leri
- `POST /api/creator/quizzes` - Yeni quiz oluştur
- `GET /api/creator/quiz/:code` - Quiz detayı
- `GET /api/creator/quiz/:code/questions` - Quiz soruları
- `POST /api/creator/quiz/:code/questions` - Soru ekle
- `DELETE /api/creator/quiz/:code/questions/:id` - Soru sil
- `GET /api/creator/quiz/:code/participants` - Katılımcılar
- `GET /api/creator/quiz/:code/leaderboard` - Sıralama

### Public Access
- `GET /api/public/quiz/:code` - Quiz'e katıl
- `POST /api/public/quiz/:code/submit` - Cevapları gönder

## 🎨 Tasarım Özellikleri

- ✨ Modern gradient arka planlar
- 🎭 Glassmorphism efektleri
- 🌊 Yumuşak animasyonlar
- 📱 Responsive tasarım (mobil uyumlu)
- 🎯 Premium kullanıcı deneyimi
- 🎨 Renkli badge'ler ve ikonlar

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! İşte nasıl katkıda bulunabilirsiniz:

### Katkı Adımları

1. **Fork yapın**
   ```bash
   # GitHub'da "Fork" butonuna tıklayın
   ```

2. **Feature branch oluşturun**
   ```bash
   git checkout -b feature/harika-ozellik
   ```

3. **Değişikliklerinizi commit edin**
   ```bash
   git commit -m 'Harika özellik eklendi'
   ```

4. **Branch'inizi push edin**
   ```bash
   git push origin feature/harika-ozellik
   ```

5. **Pull Request açın**
   - GitHub'da repository'nize gidin
   - "Pull Request" butonuna tıklayın
   - Değişikliklerinizi açıklayın

### Katkı Kuralları

- ✅ Kod temiz ve okunabilir olmalı
- ✅ Yeni özellikler dokümante edilmeli
- ✅ Güvenlik önlemleri göz önünde bulundurulmalı
- ✅ Türkçe veya İngilizce commit mesajları

### Önerilen Geliştirmeler

- [ ] JWT authentication
- [ ] Email verification
- [ ] Quiz kategorileri
- [ ] Zamanlı quiz'ler
- [ ] Soru bankası
- [ ] İstatistik grafikleri
- [ ] Dark mode
- [ ] Çoklu dil desteği

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

**Bu ne anlama gelir?**
- ✅ Ücretsiz kullanabilirsiniz
- ✅ Değiştirebilirsiniz
- ✅ Ticari projelerinizde kullanabilirsiniz
- ✅ Dağıtabilirsiniz
- ⚠️ Lisans metnini korumalısınız

## 👨‍💻 Geliştirici

**Mustafa Kral** - [@kralmustafa2023-lgtm](https://github.com/kralmustafa2023-lgtm)

## 🌟 Yıldız Verin!

Bu projeyi beğendiyseniz GitHub'da ⭐ vermeyi unutmayın!

## 📞 İletişim

- 🐛 **Bug Report:** [Issues](https://github.com/kralmustafa2023-lgtm/quiz-app/issues)
- 💡 **Feature Request:** [Issues](https://github.com/kralmustafa2023-lgtm/quiz-app/issues)
- 📧 **Email:** [GitHub Profile](https://github.com/kralmustafa2023-lgtm)

## 🙏 Teşekkürler

Bu projeyi kullandığınız ve katkıda bulunduğunuz için teşekkürler!

### Katkıda Bulunanlar

<!-- Buraya otomatik olarak katkıda bulunanlar eklenecek -->

---

**⭐ Bu projeyi faydalı buldunuz mu? GitHub'da yıldız verin!**

**🔗 Paylaşın:** [Twitter](https://twitter.com/intent/tweet?text=Harika%20bir%20açık%20kaynak%20quiz%20uygulaması!&url=https://github.com/kralmustafa2023-lgtm/quiz-app) | [LinkedIn](https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/kralmustafa2023-lgtm/quiz-app) | [Facebook](https://www.facebook.com/sharer/sharer.php?u=https://github.com/kralmustafa2023-lgtm/quiz-app)

---

**⚠️ Önemli Not:** Production ortamında kullanmadan önce [SECURITY.md](SECURITY.md) dosyasındaki önerileri uygulayın.

## 🎉 Hazır!

Artık Quiz uygulamanız kullanıma hazır! Kendi quiz'lerinizi oluşturun ve arkadaşlarınızla paylaşın! 🚀
