'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { REVIEW } from '@/app/lib/api-error';

// ログイン確認が済むまで中身を出さない。実際の権限チェックは PHP 側で毎回行う
export default function AdminShell({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('me')
      .then(() => setReady(true))
      .catch((e) => {
        if (e.status === 401) router.replace('/admin/login/');
        else setError(e.message);
      });
  }, [router]);

  async function logout() {
    await api('logout', { body: {} }).catch(() => {});
    router.replace('/admin/login/');
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <Link className="left" href="/admin/">
          米川自工 管理画面
        </Link>
        <nav aria-label="管理メニュー">
          <a href="/" target="_blank" rel="noreferrer">
            サイトを見る
          </a>
          <button type="button" onClick={logout}>
            ログアウト
          </button>
        </nav>
      </header>
      <main className="admin-main">
        {REVIEW && (
          <p className="a-review" role="note">
            確認用のサイトです。保存した内容は、このサイトを見ている全員に反映されます。
          </p>
        )}
        {error && (
          <p className="a-error" role="alert">
            {error}
          </p>
        )}
        {ready && children}
      </main>
    </div>
  );
}
