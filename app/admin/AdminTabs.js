'use client';

import Link from 'next/link';
import { TYPES } from './types';

export default function AdminTabs({ current }) {
  return (
    <nav className="a-tabs" aria-label="編集するもの">
      {Object.entries(TYPES).map(([key, t]) => (
        <Link key={key} href={`/admin/?type=${key}`} aria-current={current === key ? 'page' : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
