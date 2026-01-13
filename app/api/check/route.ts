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

    // "inStock": true/false pattern'leri
    const inStockTrueMatch = html.match(/"inStock"\s*:\s*true/);
    const inStockFalseMatch = html.match(/"inStock"\s*:\s*false/);
    
    if (inStockTrueMatch && !inStockFalseMatch) {
      return NextResponse.json({ name, inStock: true });
    }
    if (inStockFalseMatch && !inStockTrueMatch) {
      return NextResponse.json({ name, inStock: false });
    }

    // "available": true/false pattern'leri
    const availableTrueMatch = html.match(/"available"\s*:\s*true/);
    const availableFalseMatch = html.match(/"available"\s*:\s*false/);
    
    if (availableTrueMatch && !availableFalseMatch) {
      return NextResponse.json({ name, inStock: true });
    }
    if (availableFalseMatch && !availableTrueMatch) {
      return NextResponse.json({ name, inStock: false });
    }

    // Pozitif işaretler: Sepete Ekle butonu, Stokta yazısı
    const positiveIndicators = [
      /<button[^>]*>[\s\S]*?sepete\s+ekle[\s\S]*?<\/button>/i,
      /"addToCart"/i,
      /class="[^"]*add-to-cart[^"]*"/i,
      /stokta\s+var/i,
      /stokta/i,
      /"availability"\s*:\s*"instock"/i,
      /"availability"\s*:\s*"InStock"/i,
      /"availability"\s*:\s*"https:\/\/schema\.org\/InStock"/i,
    ];

    // Negatif işaretler: Tükendi, Stokta Yok (daha spesifik)
    const negativeIndicators = [
      /<span[^>]*>[\s\S]*?tükendi[\s\S]*?<\/span>/i,
      /<div[^>]*>[\s\S]*?tükendi[\s\S]*?<\/div>/i,
      /<button[^>]*disabled[^>]*>[\s\S]*?tükendi[\s\S]*?<\/button>/i,
      /"availability"\s*:\s*"outofstock"/i,
      /"availability"\s*:\s*"OutOfStock"/i,
      /"availability"\s*:\s*"https:\/\/schema\.org\/OutOfStock"/i,
      /class="[^"]*sold-out[^"]*"/i,
      /class="[^"]*out-of-stock[^"]*"/i,
      /class="[^"]*tükendi[^"]*"/i,
    ];

    const hasPositive = positiveIndicators.some(pattern => pattern.test(html));
    const hasNegative = negativeIndicators.some(pattern => pattern.test(html));

    // Stok durumu belirleme: Pozitif işaret varsa stokta, negatif varsa tükendi
    // İkisi de yoksa varsayılan olarak stokta kabul et (daha güvenli)
    let inStock = true;
    
    if (hasNegative && !hasPositive) {
      inStock = false;
    } else if (hasPositive && !hasNegative) {
      inStock = true;
    } else if (hasPositive && hasNegative) {
      // İkisi de varsa, pozitif işaretlere öncelik ver
      inStock = true;
    }
    // İkisi de yoksa varsayılan olarak stokta (inStock = true)

    return NextResponse.json({
      name,
      inStock
    });

  } catch (error: any) {
    console.error('Stok kontrol hatası:', error);
    return NextResponse.json({ error: error.message || 'Stok kontrolü başarısız' }, { status: 500 });
  }
}
