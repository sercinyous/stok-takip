import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trendyol Stok Takip',
  description: 'Trendyol ürünlerinizin stok durumunu takip edin, stok geldiğinde bildirim alın',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
