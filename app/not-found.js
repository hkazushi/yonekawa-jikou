import Link from 'next/link';

export const metadata = { title: 'ページが見つかりません' };

export default function NotFound() {
  return (
    <main className="not-found">
      <span className="en">404</span>
      <h1>ページが見つかりません</h1>
      <p>お探しのページは、移動または削除された可能性があります。</p>
      <Link className="btn light" href="/">
        トップページへ
      </Link>
    </main>
  );
}
