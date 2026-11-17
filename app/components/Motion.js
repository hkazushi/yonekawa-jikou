'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// .reveal が画面に入ったら .in を付ける。JS が動かないときは隠さない（html.motion がある間だけ隠す）
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    document.documentElement.classList.add('motion');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // /#access のように場所を指定して開いたとき、販売車両や新着情報が後から読み込まれて
  // 高さが変わり、手前で止まってしまう。読み込みが落ち着くまで位置を合わせ直す（操作されたらやめる）
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return undefined;
    let active = true;
    const stop = () => {
      active = false;
    };
    const align = () => {
      const el = active && document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    const ro = new ResizeObserver(align);
    ro.observe(document.body);
    const timer = setTimeout(stop, 4000);
    const events = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    events.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));
    return () => {
      stop();
      ro.disconnect();
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, stop));
    };
  }, [pathname]);

  return null;
}
