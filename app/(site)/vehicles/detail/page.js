import { Suspense } from 'react';
import Vehicle from './Vehicle';

export const metadata = { title: '販売車両' };

export default function VehicleDetail() {
  return (
    <main>
      <section className="section detail">
        <div className="narrow wide">
          <Suspense fallback={<p className="empty">読み込み中…</p>}>
            <Vehicle />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
