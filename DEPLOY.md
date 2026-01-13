# Vercel'e Deploy Rehberi

## Adım 1: GitHub'da Repository Oluşturma

1. https://github.com adresine gidin ve giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın → **"New repository"** seçin
3. Repository adı: `stok-takip` (veya istediğiniz bir isim)
4. **Public** veya **Private** seçin (Public önerilir)
5. **"Add a README file"** seçeneğini işaretlemeyin (zaten var)
6. **"Create repository"** butonuna tıklayın

## Adım 2: Projeyi GitHub'a Yükleme

Terminal'de şu komutları çalıştırın (GitHub'da gösterilen URL'i kullanın):

```bash
cd /Users/sercankilic/Downloads/stok-takip

# GitHub repository URL'inizi buraya yapıştırın
git remote add origin https://github.com/KULLANICI_ADINIZ/stok-takip.git

# Projeyi GitHub'a yükleyin
git branch -M main
git push -u origin main
```

**Not:** `KULLANICI_ADINIZ` yerine GitHub kullanıcı adınızı yazın.

## Adım 3: Vercel'e Deploy Etme

### 3.1 Vercel Hesabı Oluşturma

1. https://vercel.com adresine gidin
2. **"Sign Up"** butonuna tıklayın
3. **"Continue with GitHub"** seçeneğini seçin
4. GitHub hesabınızla giriş yapın ve izinleri onaylayın

### 3.2 Projeyi Deploy Etme

1. Vercel dashboard'unda **"Add New..."** → **"Project"** butonuna tıklayın
2. GitHub repository listenizden **"stok-takip"** projesini seçin
3. **"Import"** butonuna tıklayın
4. Vercel otomatik olarak Next.js projesini algılayacak:
   - **Framework Preset:** Next.js (otomatik algılanır)
   - **Root Directory:** `./` (değiştirmeyin)
   - **Build Command:** `npm run build` (otomatik)
   - **Output Directory:** `.next` (otomatik)
5. **"Deploy"** butonuna tıklayın
6. Birkaç dakika bekleyin, Vercel projeyi build edip deploy edecek

### 3.3 Deploy Sonrası

- Deploy tamamlandığında size bir URL verilecek (örnek: `stok-takip.vercel.app`)
- Bu URL'yi tarayıcınızda açarak uygulamanızı görebilirsiniz
- Her GitHub'a push yaptığınızda Vercel otomatik olarak yeni bir deploy yapacak

## Sorun Giderme

### Build Hatası Alıyorsanız:

1. Vercel dashboard'unda **"Deployments"** sekmesine gidin
2. Hatalı deployment'a tıklayın
3. **"Build Logs"** sekmesinde hatayı kontrol edin
4. Genellikle şu sorunlar olabilir:
   - `npm install` hatası → `package.json` dosyasını kontrol edin
   - TypeScript hatası → `tsconfig.json` dosyasını kontrol edin
   - Tailwind CSS hatası → `tailwind.config.js` dosyasını kontrol edin

### API Route Çalışmıyorsa:

- Vercel'de API route'lar otomatik olarak çalışır
- Eğer çalışmıyorsa, `next.config.js` dosyasını kontrol edin

## Önemli Notlar

- ✅ Vercel ücretsiz planında yeterli
- ✅ Otomatik HTTPS sertifikası
- ✅ Her push'ta otomatik deploy
- ✅ Custom domain ekleyebilirsiniz (ücretsiz)

## Yardım

Sorun yaşarsanız:
- Vercel dokümantasyonu: https://vercel.com/docs
- Next.js dokümantasyonu: https://nextjs.org/docs
