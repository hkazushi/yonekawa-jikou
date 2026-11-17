'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Slider from '@/app/components/Slider';
import { api } from '@/app/lib/api';
import { company } from '@/app/lib/content';
import { specRows } from '@/app/lib/vehicle';

export default function Vehicle() {
  const id = useSearchParams().get('id') ?? '';
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api('post', { params: { id } })
      .then((res) => {
        if (!alive) return;
        if (res.post.type !== 'vehicle') throw Object.assign(new Error(), { status: 404 });
        setPost(res.post);
        document.title = `${res.post.title}｜販売車両｜${company.name}`;
      })
      .catch((e) => alive && setError(e.status === 404 ? 'この車両は見つかりませんでした。掲載を終了した可能性があります。' : e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  const back = (
    <p className="back-link">
      <Link className="btn" href="/vehicles/">
        販売車両一覧へ
      </Link>
    </p>
  );

  if (error) {
    return (
      <>
        <p className="empty">{error}</p>
        {back}
      </>
    );
  }
  if (!post) return <p className="empty">読み込み中…</p>;

  const d = post.data;
  return (
    <>
      <header className="vehicle-head">
        <span className="en">STOCK LIST</span>
        <h1>{post.title}</h1>
      </header>
      <Slider images={post.images} alt={post.title} />
      <section className="vehicle-sec">
        <h2>詳細情報</h2>
        <dl className="spec">
          {specRows(d).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      {d.sales_point && (
        <section className="vehicle-sec sales-point">
          <h2>セールスポイント</h2>
          <p>{d.sales_point}</p>
        </section>
      )}
      <a className="vehicle-tel" href={`tel:${company.freeDial}`}>
        <span>この車両のお問い合わせはお電話で</span>
        <strong className="en">{company.freeDial}</strong>
        <small>営業時間 {company.hours}</small>
      </a>
      {back}
    </>
  );
}
