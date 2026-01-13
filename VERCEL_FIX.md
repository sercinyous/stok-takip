# Vercel "No Next.js version detected" Hatası Çözümü

## Sorun
Vercel, Next.js'i algılayamıyor. Bu genellikle Root Directory ayarından kaynaklanır.

## Çözüm Adımları

### 1. Vercel Dashboard'da Ayarları Kontrol Edin

1. Vercel dashboard'unuzda projenize gidin
2. **"Settings"** sekmesine tıklayın
3. **"General"** bölümüne gidin
4. **"Root Directory"** ayarını kontrol edin:
   - ✅ **Boş bırakın** (hiçbir şey yazmayın) VEYA
   - ✅ **`./`** yazın
   - ❌ Alt klasör adı yazmayın

### 2. Framework Preset'i Kontrol Edin

1. **"General"** ayarlarında **"Framework Preset"** bölümünü bulun
2. **"Next.js"** seçili olduğundan emin olun
3. Eğer seçili değilse, **"Next.js"** seçin

### 3. Build Settings'i Kontrol Edin

1. **"General"** ayarlarında aşağı kaydırın
2. **"Build and Output Settings"** bölümünü bulun:
   - **Build Command:** `npm run build` (veya boş bırakın, otomatik algılanır)
   - **Output Directory:** `.next` (veya boş bırakın)
   - **Install Command:** `npm install` (veya boş bırakın)

### 4. Projeyi Yeniden Deploy Edin

1. **"Deployments"** sekmesine gidin
2. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Redeploy"** seçin
4. Veya yeni bir commit yapın ve otomatik deploy'u bekleyin

### 5. Alternatif: Manuel Build Test

Eğer hala çalışmıyorsa, yerel olarak build test edin:

```bash
cd /Users/sercankilic/Downloads/stok-takip
npm install
npm run build
```

Eğer bu komutlar yerel olarak çalışıyorsa, sorun Vercel ayarlarındadır.

## En Yaygın Hatalar

### ❌ Yanlış Root Directory
- Root Directory: `app` veya `src` yazılmış
- **Çözüm:** Boş bırakın veya `./` yazın

### ❌ Framework Preset Yanlış
- Framework Preset: "Other" veya "Vite" seçilmiş
- **Çözüm:** "Next.js" seçin

### ❌ package.json Yanlış Yerde
- package.json bir alt klasörde
- **Çözüm:** package.json proje kök dizininde olmalı

## Hala Çalışmıyorsa

1. Vercel'de projeyi silin
2. GitHub repository'nizi kontrol edin (package.json kök dizinde mi?)
3. Vercel'de yeni proje oluşturun
4. Repository'yi tekrar import edin

## Kontrol Listesi

- [ ] Root Directory boş veya `./`
- [ ] Framework Preset: "Next.js"
- [ ] package.json proje kök dizininde
- [ ] package.json'da "next" dependency var
- [ ] Build Command: `npm run build` (veya boş)
- [ ] Output Directory: `.next` (veya boş)
