'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { TYPES } from './types';

// refresh が変わるたびに、お問合せの未読数を読み直す
export default function AdminTabs({ current, refresh = 0 }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let alive = true;
    api('me')
      .then((res) => alive && setUnread(res.unread || 0))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [refresh]);

  return (
    <nav className="a-tabs" aria-label="編集するもの">
      {Object.entries(TYPES).map(([key, t]) => (
        <Link key={key} href={`/admin/?type=${key}`} aria-current={current === key ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
      <Link href="/admin/inquiries/" aria-current={current === 'inquiries' ? 'page' : undefined}>
        お問合せ
        {unread > 0 && <span className="a-badge">{unread}</span>}
      </Link>
    </nav>
  );
}
