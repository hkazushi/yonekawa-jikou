'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { company, nav } from '@/app/lib/content';
import { Logo } from './Parts';

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // トップでは動画の上に重ね、スクロールしたら黒地にする
  const [top, setTop] = useState(true);
  useEffect(() => {
    const onScroll = () => setTop(window.scrollY < 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`site-header${pathname === '/' && top && !open ? ' clear' : ''}`}>
        <Link href="/" className="brand" aria-label="株式会社米川自工 トップページ">
          <Logo />
        </Link>
        <nav className="gnav" aria-label="メインメニュー">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={pathname.startsWith(n.href) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <a className="head-tel" href={`tel:${company.freeDial}`}>
            <strong className="en">{company.freeDial}</strong>
            <small>{company.hours}</small>
          </a>
        </nav>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'メニューを閉じる' : 'メニューを開く'}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="メニュー">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href}>
                  {n.label}
                  <small className="en">{n.en}</small>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#access" onClick={() => setOpen(false)}>
                アクセス
                <small className="en">ACCESS</small>
              </Link>
            </li>
          </ul>
          <a className="btn red" href={`tel:${company.freeDial}`}>
            <span>
              <span className="en">{company.freeDial}</span>
              <small>{company.hours}</small>
            </span>
          </a>
        </nav>
      )}
    </>
  );
}
