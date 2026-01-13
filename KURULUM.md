# Kurulum ve Deploy Adımları

## Adım 1: Node.js Kurulumu (Eğer yüklü değilse)

1. https://nodejs.org adresine gidin
2. **LTS** (Long Term Support) versiyonunu indirin
3. İndirilen dosyayı çalıştırıp kurulumu tamamlayın
4. Terminal'i yeniden açın

Kurulumu kontrol etmek için:
```bash
node --version
npm --version
```

## Adım 2: Bağımlılıkları Yükleme

Proje klasöründe terminal açın ve şu komutu çalıştırın:

```bash
cd /Users/sercankilic/Downloads/stok-takip
npm install
```

Bu komut:
- Next.js 14.2.35'i yükler
- Tüm diğer bağımlılıkları yükler
- `node_modules` klasörünü oluşturur
- `package-lock.json` dosyasını günceller

## Adım 3: Git Commit ve Push

### 3.1 Değişiklikleri Stage'e Alın

```bash
git add package.json
```

Eğer `package-lock.json` dosyası varsa:
```bash
git add package.json package-lock.json
```

### 3.2 Commit Yapın

```bash
git commit -m "Security: Next.js 14.2.35'e güncellendi"
```

### 3.3 GitHub'a Push Edin

```bash
git push
```

Eğer ilk kez push yapıyorsanız:
```bash
git push -u origin main
```

## Adım 4: Vercel Otomatik Deploy

GitHub'a push yaptığınızda:
1. Vercel otomatik olarak değişiklikleri algılar
2. Yeni bir build başlatır
3. Deploy eder
4. Birkaç dakika içinde yeni versiyon canlıya çıkar

Vercel dashboard'unuzdan deploy durumunu takip edebilirsiniz.

## Hızlı Komutlar (Hepsini Birden)

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Git işlemleri
git add package.json package-lock.json
git commit -m "Security: Next.js 14.2.35'e güncellendi"
git push
```

## Sorun Giderme

### "npm: command not found" hatası
- Node.js yüklü değil → Yukarıdaki Adım 1'i yapın
- Terminal'i yeniden açın

### "git: command not found" hatası
- Git yüklü değil → macOS'ta genellikle yüklü gelir
- Kontrol: `git --version`

### GitHub'a push hatası
- GitHub repository URL'inizi kontrol edin: `git remote -v`
- GitHub'a giriş yaptığınızdan emin olun
