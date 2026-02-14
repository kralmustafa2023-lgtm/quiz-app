# Güvenlik Özellikleri

## Uygulanan Güvenlik Önlemleri

### 1. Input Validation (Giriş Doğrulama)
- Tüm kullanıcı girdileri doğrulanır
- Maksimum karakter uzunlukları kontrol edilir
- Quiz kodları regex ile doğrulanır (6 haneli alfanumerik)
- Kullanıcı adları sadece harf, rakam ve _ içerebilir

### 2. Rate Limiting (İstek Sınırlama)
- IP bazlı rate limiting uygulanmıştır
- 1 dakikada maksimum 100 istek
- Aşırı istek durumunda 429 hatası döner

### 3. Password Security (Şifre Güvenliği)
- Şifreler bcrypt ile hash'lenir (10 rounds)
- Minimum şifre uzunluğu: 6 karakter
- Şifreler asla düz metin olarak saklanmaz

### 4. Data Sanitization (Veri Temizleme)
- Kullanıcı girdileri trim() ile temizlenir
- XSS saldırılarına karşı frontend'de HTML escape yapılır

### 5. Quiz Security (Quiz Güvenliği)
- Doğru cevaplar public API'de gizlenir
- Sadece aktif quiz'ler katılıma açıktır
- Maksimum 50 soru limiti vardır

### 6. Request Size Limiting
- JSON body maksimum 1MB ile sınırlandırılmıştır
- DoS saldırılarına karşı koruma sağlar

## Önerilen Ek Güvenlik Önlemleri (Production İçin)

### 1. HTTPS Kullanımı
```javascript
// Production'da HTTPS zorunlu olmalı
app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
        res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
        next();
    }
});
```

### 2. Helmet.js Kullanımı
```bash
npm install helmet
```
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. CORS Konfigürasyonu
```javascript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
```

### 4. Environment Variables
```bash
# .env dosyası oluşturun
PORT=3005
MONGODB_URI=mongodb://localhost:27017/quiz-app
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

### 5. MongoDB Injection Koruması
```bash
npm install express-mongo-sanitize
```
```javascript
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());
```

### 6. Session Management
- JWT token kullanımı için token expiration ekleyin
- Refresh token mekanizması ekleyin

## Bilinen Sınırlamalar

1. Admin şifresi kodda sabit (Production'da değiştirilmeli)
2. JWT kullanılmıyor (basit authentication için yeterli)
3. CSRF koruması yok (stateless API için gerekli değil)
4. File upload yok (güvenlik riski azaltır)

## Güvenlik Güncellemeleri

Düzenli olarak:
- `npm audit` çalıştırın
- Bağımlılıkları güncelleyin: `npm update`
- Güvenlik açıklarını kontrol edin: `npm audit fix`

## İletişim

Güvenlik açığı bulursanız lütfen sorumlu bir şekilde bildirin.
