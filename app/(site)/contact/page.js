import { Suspense } from 'react';
import InquiryForm from '@/app/components/InquiryForm';
import { PageHead } from '@/app/components/Parts';

export const metadata = { title: 'お問合せフォーム' };

export default function ContactPage() {
  return (
    <main>
      <PageHead en="CONTACT" title="お問合せフォーム" />
      <section className="section">
        <div className="narrow">
          <p className="page-lead pre">{'各項目を入力していただき、入力が終わりましたら「送信する」を押してください。'}</p>
          <Suspense fallback={null}>
            <InquiryForm kind="contact" />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
