import { PageHead, TelBand } from '@/app/components/Parts';
import { fleet, fleetLead } from '@/app/lib/content';

export const metadata = { title: '保有車両' };

export default function FleetPage() {
  return (
    <main>
      <PageHead en="FLEET" title="保有車両" />
      <section className="section">
        <div className="wrap">
          <p className="page-lead">{fleetLead}</p>
          <ul className="fleet-grid">
            {fleet.map((f) => (
              <li className="reveal" key={f.name}>
                <img src={f.image} alt={f.name} loading="lazy" />
                <h2>{f.name}</h2>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <TelBand />
    </main>
  );
}
