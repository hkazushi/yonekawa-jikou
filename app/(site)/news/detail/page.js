import { Suspense } from 'react';
import Article from './Article';

export const metadata = { title: '新着情報' };

export default function NewsDetail() {
  return (
    <main>
      <section className="section detail">
        <article className="narrow">
          <Suspense fallback={<p className="empty">読み込み中…</p>}>
            <Article />
          </Suspense>
        </article>
      </section>
    </main>
  );
}
