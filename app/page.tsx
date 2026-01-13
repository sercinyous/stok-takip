'use client';

import { useState, useEffect, useRef } from 'react';

interface Product {
  id: string;
  url: string;
  name: string;
  inStock: boolean;
  lastChecked: string;
  previousStockStatus?: boolean;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bildirim izni kontrolü
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // LocalStorage'dan ürünleri yükle
  useEffect(() => {
    const saved = localStorage.getItem('products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProducts(parsed);
      } catch (e) {
        console.error('Ürünler yüklenemedi:', e);
      }
    }
  }, []);

  // LocalStorage'a kaydet
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products]);

  // 15 dakika otomatik kontrol
  useEffect(() => {
    if (!autoCheckEnabled || products.length === 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // İlk kontrolü hemen yap (sadece bir kez)
    const checkProducts = async () => {
      const currentProducts = JSON.parse(localStorage.getItem('products') || '[]');
      if (currentProducts.length === 0) return;
      
      for (const product of currentProducts) {
        try {
          const res = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: product.url })
          });
          if (res.ok) {
            const data = await res.json();
            const previousStatus = product.inStock;
            const newStatus = data.inStock;

            setProducts(prev => {
              const updated = prev.map(p => 
                p.id === product.id 
                  ? { 
                      ...p, 
                      inStock: newStatus, 
                      previousStockStatus: previousStatus,
                      lastChecked: new Date().toLocaleString('tr-TR') 
                    } 
                  : p
              );
              return updated;
            });

            if (previousStatus === false && newStatus === true && notificationPermission === 'granted') {
              showNotification(product.name, 'Stokta!');
            }
          }
        } catch (error) {
          console.error(`Ürün kontrol hatası (${product.name}):`, error);
        }
      }
    };

    // İlk kontrolü hemen yap
    checkProducts();

    // 15 dakika = 900000 ms
    intervalRef.current = setInterval(() => {
      checkProducts();
    }, 15 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoCheckEnabled, products.length, notificationPermission]);

  const showNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'stock-alert',
        requireInteraction: true,
      });
    }
  };

  const checkStock = async (productUrl: string) => {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: productUrl })
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Kontrol başarısız');
    }
    return res.json();
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showNotification('Bildirimler Aktif', 'Stok geldiğinde bildirim alacaksınız!');
      }
    }
  };

  const addProduct = async () => {
    if (!url.trim()) {
      setError('Lütfen bir link girin');
      return;
    }
    if (!url.includes('trendyol.com')) {
      setError('Geçerli bir Trendyol linki girin');
      return;
    }
    
    // Aynı ürünü tekrar eklemeyi engelle
    const normalizedUrl = url.split('?')[0];
    if (products.some(p => p.url === normalizedUrl)) {
      setError('Bu ürün zaten listede');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await checkStock(url);
      const newProduct: Product = {
        id: Date.now().toString(),
        url: normalizedUrl,
        name: data.name,
        inStock: data.inStock,
        lastChecked: new Date().toLocaleString('tr-TR'),
        previousStockStatus: data.inStock
      };
      setProducts([newProduct, ...products]);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Ürün eklenemedi');
    }
    setLoading(false);
  };

  const refresh = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      const data = await checkStock(product.url);
      const previousStatus = product.inStock;
      const newStatus = data.inStock;

      setProducts(products.map(p => 
        p.id === id 
          ? { 
              ...p, 
              inStock: newStatus, 
              previousStockStatus: previousStatus,
              lastChecked: new Date().toLocaleString('tr-TR') 
            } 
          : p
      ));

      // Stok geldiyse bildirim
      if (previousStatus === false && newStatus === true && notificationPermission === 'granted') {
        showNotification(product.name, 'Stokta!');
      }
    } catch (err: any) {
      setError(err.message || 'Yenileme başarısız');
    }
  };

  const remove = (id: string) => {
    if (confirm('Bu ürünü listeden kaldırmak istediğinize emin misiniz?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📦 Trendyol Stok Takip
          </h1>
          <p className="text-gray-600">Ürünlerinizi takip edin, stok geldiğinde bildirim alın</p>
        </div>

        {/* Bildirim ve Otomatik Kontrol Ayarları */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCheckEnabled}
                onChange={(e) => setAutoCheckEnabled(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Otomatik kontrol (15 dakika)
              </span>
            </label>
          </div>
          <div>
            {notificationPermission === 'granted' ? (
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                ✓ Bildirimler aktif
              </span>
            ) : (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Bildirim İzni Ver
              </button>
            )}
          </div>
        </div>

        {/* Ürün Ekleme Formu */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && !loading && addProduct()}
              placeholder="Trendyol ürün linkini yapıştırın..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addProduct}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Kontrol ediliyor...
                </span>
              ) : (
                '➕ Ekle'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
          )}
        </div>

        {/* Ürün Listesi */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Henüz ürün eklenmedi</p>
            <p className="text-gray-400 text-sm mt-2">Yukarıdaki forma Trendyol linki ekleyerek başlayın</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(p => {
              const justCameInStock = p.previousStockStatus === false && p.inStock === true;
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                    p.inStock
                      ? 'border-l-4 border-green-500'
                      : 'border-l-4 border-red-500'
                  } ${justCameInStock ? 'animate-pulse ring-2 ring-green-400' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            p.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.inStock ? '✓ STOKTA' : '✗ TÜKENDİ'}
                        </span>
                        {justCameInStock && (
                          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 animate-bounce">
                            🎉 YENİ STOK!
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Son kontrol: {p.lastChecked}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => refresh(p.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      🔄 Yenile
                    </button>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                    >
                      🔗 Trendyol'da Aç
                    </a>
                    <button
                      onClick={() => remove(p.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Otomatik kontrol her 15 dakikada bir çalışır</p>
          {autoCheckEnabled && products.length > 0 && (
            <p className="mt-1">Sonraki kontrol: ~{Math.ceil((15 * 60 * 1000 - (Date.now() % (15 * 60 * 1000))) / 1000 / 60)} dakika</p>
          )}
        </div>
      </div>
    </main>
  );
}
