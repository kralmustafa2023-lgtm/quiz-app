# Deployment Kılavuzu

Bu dosya, Quiz Uygulamasını production ortamına deploy etmek için gerekli adımları içerir.

## 📋 Ön Hazırlık

### 1. Environment Variables

Production için `.env` dosyası oluşturun:

```env
NODE_ENV=production
PORT=3005
MONGODB_URI=mongodb://your-mongodb-uri/quiz-app
ALLOWED_ORIGINS=https://yourdomain.com
```

### 2. Güvenlik Güncellemeleri

#### Admin Şifresini Değiştirin
`server.js` dosyasında admin şifresini değiştirin:

```javascript
// Güvenli bir şifre kullanın
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'your-secure-password';
```

#### Helmet.js Ekleyin
```bash
npm install helmet
```

`server.js` dosyasına ekleyin:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### CORS Yapılandırması
```javascript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
```

### 3. MongoDB Setup

Production için MongoDB Atlas kullanmanız önerilir:

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı oluşturun
2. Cluster oluşturun
3. Database user oluşturun
4. IP whitelist'e deployment sunucunuzu ekleyin
5. Connection string'i `.env` dosyasına ekleyin

## 🚀 Deployment Seçenekleri

### Option 1: Heroku

1. **Heroku CLI Kurulumu**
```bash
npm install -g heroku
heroku login
```

2. **Proje Hazırlığı**
```bash
# Git repository oluşturun
git init
git add .
git commit -m "Initial commit"
```

3. **Heroku App Oluşturma**
```bash
heroku create your-quiz-app
```

4. **Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
```

5. **Deploy**
```bash
git push heroku main
```

6. **Açın**
```bash
heroku open
```

### Option 2: DigitalOcean

1. **Droplet Oluşturun**
   - Ubuntu 20.04 LTS seçin
   - En az 1GB RAM

2. **Sunucuya Bağlanın**
```bash
ssh root@your-server-ip
```

3. **Node.js Kurulumu**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **PM2 Kurulumu**
```bash
npm install -g pm2
```

5. **Projeyi Klonlayın**
```bash
git clone your-repo-url
cd quiz-app
npm install
```

6. **Environment Variables**
```bash
nano .env
# Değişkenleri girin ve kaydedin
```

7. **PM2 ile Başlatın**
```bash
pm2 start server.js --name quiz-app
pm2 save
pm2 startup
```

8. **Nginx Kurulumu (Opsiyonel)**
```bash
sudo apt install nginx
```

Nginx config (`/etc/nginx/sites-available/quiz-app`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/quiz-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **SSL Sertifikası (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 3: Vercel (Frontend + Serverless)

1. **Vercel CLI Kurulumu**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Environment Variables**
Vercel dashboard'dan environment variables ekleyin.

### Option 4: Railway

1. [Railway](https://railway.app) hesabı oluşturun
2. "New Project" > "Deploy from GitHub repo"
3. Repository'nizi seçin
4. Environment variables ekleyin
5. Deploy!

## 🔍 Production Checklist

- [ ] Environment variables ayarlandı
- [ ] Admin şifresi değiştirildi
- [ ] MongoDB production URI eklendi
- [ ] HTTPS aktif
- [ ] CORS yapılandırıldı
- [ ] Helmet.js eklendi
- [ ] Rate limiting aktif
- [ ] Error logging eklendi
- [ ] Backup stratejisi oluşturuldu
- [ ] Monitoring kuruldu (örn: PM2, New Relic)
- [ ] Domain DNS ayarları yapıldı

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit
pm2 logs quiz-app
```

### Log Dosyaları
```bash
# PM2 logs
~/.pm2/logs/

# Nginx logs
/var/log/nginx/
```

## 🔄 Güncelleme

### Heroku
```bash
git add .
git commit -m "Update"
git push heroku main
```

### DigitalOcean (PM2)
```bash
cd quiz-app
git pull
npm install
pm2 restart quiz-app
```

## 🐛 Troubleshooting

### Port Hatası
```bash
# Port kullanımını kontrol edin
lsof -i :3005
# Process'i sonlandırın
kill -9 PID
```

### MongoDB Bağlantı Hatası
- Connection string'i kontrol edin
- IP whitelist'i kontrol edin
- Database user credentials'ı kontrol edin

### Memory Hatası
```bash
# PM2 memory limit
pm2 start server.js --max-memory-restart 500M
```

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Environment variables'ı doğrulayın
3. GitHub Issues'da sorun açın

## 🎉 Başarılı Deployment!

Uygulamanız artık production'da çalışıyor! 🚀
