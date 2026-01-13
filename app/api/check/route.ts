import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      throw new Error('Sayfa yüklenemedi');
    }

    const html = await response.text();

    // Ürün adı - daha iyi parse
    let name = 'Ürün';
    const titleMatch = html.match(/<title>([^<|]+)/);
    if (titleMatch) {
      name = titleMatch[1].trim().replace(/\s*-\s*Trendyol.*$/, '');
    }

    // JSON-LD veya script tag'lerinden ürün bilgisi
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/);
    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd.name) name = jsonLd.name;
        if (jsonLd.offers?.availability === 'https://schema.org/InStock') {
          return NextResponse.json({ name, inStock: true });
        }
        if (jsonLd.offers?.availability === 'https://schema.org/OutOfStock') {
          return NextResponse.json({ name, inStock: false });
        }
      } catch (e) {
        // JSON parse hatası, devam et
      }
    }

    // Trendyol'un kendi JSON yapısı
    const productDataMatch = html.match(/window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});/);
    if (productDataMatch) {
      try {
        const productData = JSON.parse(productDataMatch[1]);
        if (productData.product?.variants?.[0]?.stock) {
          const stock = productData.product.variants[0].stock;
          const inStock = stock > 0;
          if (productData.product?.name) {
            name = productData.product.name;
          }
          return NextResponse.json({ name, inStock });
        }
      } catch (e) {
        // JSON parse hatası, devam et
      }
    }

    // Alternatif: script içinde stok bilgisi
    const stockMatch = html.match(/"stock":\s*(\d+)/);
    if (stockMatch) {
      const stock = parseInt(stockMatch[1]);
      return NextResponse.json({ name, inStock: stock > 0 });
    }

    // Son çare: HTML içinde tükendi kelimesi arama (daha spesifik)
    const htmlLower = html.toLowerCase();
    const tükendiPatterns = [
      /tükendi/i,
      /stokta yok/i,
      /stokta bulunmamaktadır/i,
      /"inStock"\s*:\s*false/,
      /"availability"\s*:\s*"outofstock"/i,
      /class="[^"]*sold-out[^"]*"/i,
      /class="[^"]*out-of-stock[^"]*"/i,
    ];

    const isOutOfStock = tükendiPatterns.some(pattern => pattern.test(html));

    // Eğer "Sepete Ekle" butonu varsa ve tükendi yoksa, stokta demektir
    const addToCartPatterns = [
      /sepete ekle/i,
      /"addToCart"/i,
      /class="[^"]*add-to-cart[^"]*"/i,
    ];

    const hasAddToCart = addToCartPatterns.some(pattern => pattern.test(html));

    // Stok durumu belirleme
    let inStock = true;
    if (isOutOfStock) {
      inStock = false;
    } else if (hasAddToCart && !isOutOfStock) {
      inStock = true;
    }

    return NextResponse.json({
      name,
      inStock
    });

  } catch (error: any) {
    console.error('Stok kontrol hatası:', error);
    return NextResponse.json({ error: error.message || 'Stok kontrolü başarısız' }, { status: 500 });
  }
}
