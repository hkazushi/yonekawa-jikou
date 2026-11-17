import { PageHead, TelBand } from '@/app/components/Parts';
import { serviceLead, services } from '@/app/lib/content';

export const metadata = { title: '業務内容' };

export default function ServicePage() {
  return (
    <main>
      <PageHead en="SERVICE" title="業務内容" />
      <section className="section">
        <div className="wrap">
          <p className="page-lead">{serviceLead}</p>
          <ul className="service-grid">
            {services.map((s, i) => (
              <li className={`reveal${s.image ? '' : ' plain'}`} key={s.title}>
                {s.image && <img src={s.image} alt="" loading="lazy" />}
                <span className="num en">0{i + 1}</span>
                <div>
                  <span className="en">{s.en}</span>
                  <h2>{s.title}</h2>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <TelBand />
    </main>
  );
}
