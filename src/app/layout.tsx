import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '麻雀勉強ソフト',
  description: '麻雀の基礎から実践まで学べる学習アプリケーション',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
