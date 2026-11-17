import { Barlow_Condensed, Zen_Kaku_Gothic_New } from 'next/font/google';
import './globals.css';

const gothic = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-gothic',
  display: 'swap',
  preload: false,
});
const en = Barlow_Condensed({
  weight: ['600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-en',
  display: 'swap',
});

const description =
  '埼玉県川越市の株式会社米川自工。中古トラックの買取・販売を中心に、フォークリフト、建設機械、レッカーサービス、自動車解体、中古パーツ、アルミコンテナ、各メーカー新車販売まで対応しています。';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: '株式会社米川自工｜全国トラック買取販売店', template: '%s｜株式会社米川自工' },
  description,
  // 確認用ビルドは検索結果に出さない
  ...(process.env.NEXT_PUBLIC_REVIEW === '1' ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    title: '株式会社米川自工｜全国トラック買取販売店',
    description,
    images: ['/img/hero-poster.jpg'],
    locale: 'ja_JP',
    type: 'website',
  },
};

export const viewport = { themeColor: '#0d0f12' };

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${gothic.variable} ${en.variable}`}>
      <body>{children}</body>
    </html>
  );
}
