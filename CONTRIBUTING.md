# 🤝 Katkıda Bulunma Rehberi

Quiz Uygulaması'na katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, katkı sürecini kolaylaştırmak için hazırlanmıştır.

## 📋 İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim?](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Pull Request Süreci](#pull-request-süreci)
- [Kod Standartları](#kod-standartları)

## 🤝 Davranış Kuralları

Bu proje açık kaynak topluluğunun bir parçasıdır. Lütfen:

- ✅ Saygılı ve yapıcı olun
- ✅ Farklı görüşlere açık olun
- ✅ Yardımsever olun
- ❌ Hakaret veya ayrımcılık yapmayın

## 💡 Nasıl Katkıda Bulunabilirim?

### Bug Bildirimi

Bug buldunuz mu? [Issue açın](https://github.com/kralmustafa2023-lgtm/quiz-app/issues/new) ve şunları ekleyin:

- 🐛 Bug'ın açıklaması
- 📝 Adım adım nasıl tekrarlanır
- 💻 Sistem bilgileri (OS, tarayıcı, Node.js versiyonu)
- 📸 Ekran görüntüsü (varsa)

**Örnek:**
```markdown
## Bug: Kullanıcı girişi çalışmıyor

**Açıklama:** 
Kullanıcı adı ve şifre girdiğimde hata alıyorum.

**Adımlar:**
1. Ana sayfaya git
2. Giriş Yap'a tıkla
3. Kullanıcı adı: test, Şifre: 123456
4. Giriş Yap butonuna tıkla

**Beklenen:** Giriş yapmalı
**Gerçekleşen:** "Kullanıcı bulunamadı" hatası

**Sistem:**
- OS: Windows 11
- Tarayıcı: Chrome 120
- Node.js: v18.0.0
```

### Özellik Önerisi

Yeni özellik mi istiyorsunuz? [Issue açın](https://github.com/kralmustafa2023-lgtm/quiz-app/issues/new) ve şunları ekleyin:

- 💡 Özelliğin açıklaması
- 🎯 Neden gerekli olduğu
- 📋 Nasıl çalışması gerektiği
- 🎨 Mockup/tasarım (varsa)

### Kod Katkısı

1. **Repository'yi fork edin**
2. **Yerel ortamınıza klonlayın**
   ```bash
   git clone https://github.com/KULLANICI_ADINIZ/quiz-app.git
   cd quiz-app
   ```

3. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

4. **Feature branch oluşturun**
   ```bash
   git checkout -b feature/harika-ozellik
   ```

5. **Değişikliklerinizi yapın**

6. **Test edin**
   ```bash
   npm start
   # http://localhost:3005 adresinde test edin
   ```

7. **Commit edin**
   ```bash
   git add .
   git commit -m "feat: Harika özellik eklendi"
   ```

8. **Push edin**
   ```bash
   git push origin feature/harika-ozellik
   ```

9. **Pull Request açın**

## 🛠️ Geliştirme Ortamı

### Gereksinimler

- Node.js 14+
- npm 6+
- Git
- MongoDB (opsiyonel)

### Kurulum

```bash
# Repository'yi klonlayın
git clone https://github.com/kralmustafa2023-lgtm/quiz-app.git
cd quiz-app

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

### Klasör Yapısı

```
quiz-app/
├── models/          # Veritabanı modelleri
├── public/          # Frontend dosyaları
├── server.js        # Express server
└── package.json     # Bağımlılıklar
```

## 🔄 Pull Request Süreci

### PR Checklist

Pull Request açmadan önce kontrol edin:

- [ ] Kod çalışıyor ve test edildi
- [ ] Yeni özellikler dokümante edildi
- [ ] Commit mesajları anlamlı
- [ ] Kod temiz ve okunabilir
- [ ] Güvenlik açıkları kontrol edildi
- [ ] README güncel (gerekirse)

### PR Şablonu

```markdown
## Değişiklikler

- Yeni özellik X eklendi
- Bug Y düzeltildi
- Performans iyileştirmesi Z

## Test

- [ ] Yerel ortamda test edildi
- [ ] Farklı tarayıcılarda test edildi
- [ ] Mobil'de test edildi

## Ekran Görüntüleri

[Varsa ekran görüntüleri ekleyin]

## İlgili Issue

Closes #123
```

### Review Süreci

1. PR açıldıktan sonra maintainer'lar inceleyecek
2. Gerekirse değişiklik isteyebilirler
3. Onaylandıktan sonra merge edilecek

## 📝 Kod Standartları

### JavaScript

```javascript
// ✅ İyi
async function getUserById(userId) {
    try {
        const user = await User.findById(userId);
        return user;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ❌ Kötü
function getUser(id) {
    User.findById(id).then(u => u)
}
```

### Commit Mesajları

Conventional Commits kullanın:

```bash
feat: Yeni özellik eklendi
fix: Bug düzeltildi
docs: Dokümantasyon güncellendi
style: Kod formatı düzenlendi
refactor: Kod yeniden yapılandırıldı
test: Test eklendi
chore: Genel bakım
```

**Örnekler:**
```bash
feat: Quiz kategorileri eklendi
fix: Kullanıcı girişi hatası düzeltildi
docs: README güncellendi
style: Kod formatı düzenlendi
refactor: API endpoint'leri yeniden yapılandırıldı
```

### Dosya İsimlendirme

- Küçük harf kullanın
- Kelimeler arası tire (-) kullanın
- Anlamlı isimler verin

```
✅ user-controller.js
✅ quiz-service.js
❌ UserController.js
❌ qs.js
```

## 🎨 UI/UX Katkıları

### Tasarım Prensipleri

- Modern ve temiz tasarım
- Responsive (mobil uyumlu)
- Erişilebilir (accessibility)
- Tutarlı renkler ve fontlar

### CSS

```css
/* ✅ İyi */
.quiz-card {
    padding: 20px;
    border-radius: 12px;
    background: var(--card-bg);
}

/* ❌ Kötü */
.qc {
    padding: 20px;
}
```

## 🔒 Güvenlik

Güvenlik açığı buldunuz mu?

- ❌ Public issue açmayın
- ✅ Özel olarak bildirin: GitHub Security Advisory
- ✅ Detaylı açıklama yapın

## 📚 Dokümantasyon

Yeni özellik eklediyseniz:

- README'yi güncelleyin
- Kod yorumları ekleyin
- Örnek kullanım gösterin

## 🎓 İlk Katkınız mı?

Harika! İşte başlangıç için kolay konular:

- 📝 Dokümantasyon iyileştirmeleri
- 🐛 Küçük bug düzeltmeleri
- 🎨 UI iyileştirmeleri
- 🌍 Çeviri eklemeleri

[Good First Issue](https://github.com/kralmustafa2023-lgtm/quiz-app/labels/good%20first%20issue) etiketli issue'lara bakın!

## 💬 Sorularınız mı var?

- 📧 Issue açın
- 💬 Discussions kullanın
- 📖 Dokümantasyonu okuyun

## 🙏 Teşekkürler!

Katkılarınız için teşekkür ederiz! Her katkı, projeyi daha iyi hale getirir.

---

**Happy Coding! 🚀**
