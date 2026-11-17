import { PageHead, SecHead, TelBand } from '@/app/components/Parts';
import { downloads, profile } from '@/app/lib/content';

export const metadata = { title: '会社概要' };

export default function CompanyPage() {
  return (
    <main>
      <PageHead en="COMPANY" title="会社概要" />
      <section className="section">
        <div className="narrow">
          <dl className="def">
            {profile.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="section soft" id="download">
        <div className="narrow">
          <SecHead en="DOWNLOAD" title="様式ダウンロード" />
          <p className="text">各種様式のダウンロードは下記にて行ってください。</p>
          <ul className="dl-list">
            {downloads.map((d) => (
              <li key={d.file}>
                <a href={d.file} target="_blank" rel="noreferrer">
                  <span>{d.label}</span>
                  <b className="en">PDF</b>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <TelBand />
    </main>
  );
}
