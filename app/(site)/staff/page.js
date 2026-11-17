import { PageHead, TelBand } from '@/app/components/Parts';
import { StaffFeed } from '@/app/components/Posts';

export const metadata = { title: 'スタッフ紹介' };

export default function StaffPage() {
  return (
    <main>
      <PageHead en="STAFF" title="スタッフ紹介" />
      <section className="section">
        <div className="wrap">
          <StaffFeed />
        </div>
      </section>
      <TelBand />
    </main>
  );
}
