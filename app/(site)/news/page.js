import { PageHead } from '@/app/components/Parts';
import { NewsFeed } from '@/app/components/Posts';

export const metadata = { title: '新着情報' };

export default function NewsPage() {
  return (
    <main>
      <PageHead en="NEWS" title="新着情報" />
      <section className="section">
        <div className="narrow">
          <NewsFeed />
        </div>
      </section>
    </main>
  );
}
