import { Suspense } from 'react';
import InquiryForm from '@/app/components/InquiryForm';
import { PageHead } from '@/app/components/Parts';

export const metadata = { title: '買取見積りフォーム' };

export default function EstimatePage() {
  return (
    <main>
      <PageHead en="ESTIMATE" title="買取見積りフォーム" />
      <section className="section">
        <div className="narrow">
          <p className="page-lead pre">{'買取をご希望のお客様は、以下のフォームにてお見積りを承っております。\n最終的に車輌を直接拝見させていただきたくご相談する場合があります。\nご理解の程、よろしくお願い申し上げます。'}</p>
          <Suspense fallback={null}>
            <InquiryForm kind="estimate" />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
