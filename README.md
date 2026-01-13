# Trendyol Stok Takip

Trendyol ürünlerinizin stok durumunu otomatik olarak takip eden modern bir web uygulaması.

## Özellikler

- ✅ Trendyol ürün linklerini ekleyerek stok takibi
- ✅ 15 dakika aralıklarla otomatik stok kontrolü
- ✅ Stok geldiğinde bildirim alma
- ✅ Modern ve kullanıcı dostu arayüz
- ✅ Responsive tasarım
- ✅ LocalStorage ile veri saklama

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Vercel'e Deploy

1. Projeyi GitHub'a push edin
2. [Vercel](https://vercel.com) hesabınıza giriş yapın
3. "New Project" butonuna tıklayın
4. GitHub repository'nizi seçin
5. Vercel otomatik olarak Next.js projesini algılayacak
6. "Deploy" butonuna tıklayın

Vercel, projeyi otomatik olarak build edip deploy edecektir.

## Kullanım

1. Trendyol'dan bir ürün linki kopyalayın
2. Linki forma yapıştırın ve "Ekle" butonuna tıklayın
3. Bildirim izni verin (stok geldiğinde bildirim almak için)
4. Otomatik kontrol aktif olduğunda, sistem her 15 dakikada bir ürünleri kontrol eder
5. Stok geldiğinde bildirim alacaksınız

## Teknolojiler

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## Notlar

- Bildirimler sadece tarayıcı açıkken çalışır
- Veriler tarayıcınızın LocalStorage'ında saklanır
- Otomatik kontrol sadece tarayıcı açıkken aktif olur
