import { PageHead, TelBand } from '@/app/components/Parts';
import { VehiclesFeed } from '@/app/components/Posts';

export const metadata = { title: '販売車両' };

export default function VehiclesPage() {
  return (
    <main>
      <PageHead en="STOCK LIST" title="販売車両" />
      <section className="section">
        <div className="wrap">
          <VehiclesFeed />
        </div>
      </section>
      <TelBand />
    </main>
  );
}
