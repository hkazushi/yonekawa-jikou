import Link from 'next/link';
import Header from '@/app/components/Header';
import Motion from '@/app/components/Motion';
import { InstaBand, Logo } from '@/app/components/Parts';
import { company, nav, places } from '@/app/lib/content';

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <Motion />
      {children}
      <InstaBand />
      <footer className="site-footer">
        <div className="wrap">
          <div className="foot-main">
            <div>
              <Logo />
              <p className="foot-info">
                {places[0].address.replace('\n', ' ')}
                <br />
                {places[0].tel}
              </p>
              <a className="foot-tel" href={`tel:${company.freeDial}`}>
                <span className="en">{company.freeDial}</span>
                <small>営業時間 {company.hours}</small>
              </a>
            </div>
            <nav className="foot-nav" aria-label="フッターメニュー">
              <Link href="/">ホーム</Link>
              {nav.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                </Link>
              ))}
              <Link href="/#access">アクセス</Link>
              <Link href="/estimate/">買取見積りフォーム</Link>
              <Link href="/contact/">お問合せ</Link>
              <a href={company.instagram} target="_blank" rel="noreferrer">
                Instagram
              </a>
            </nav>
          </div>
          <p className="copyright">© {company.name}</p>
        </div>
      </footer>
    </>
  );
}
