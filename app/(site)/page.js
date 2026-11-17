import Link from 'next/link';
import { Arrow, Marquee, SecHead, TelBand } from '@/app/components/Parts';
import { NewsFeed, VehiclesFeed } from '@/app/components/Posts';
import { about, company, flow, places, promises, services } from '@/app/lib/content';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <video autoPlay muted loop playsInline preload="metadata" poster="/img/hero-poster.jpg" aria-hidden="true">
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-copy">
          <p className="hero-en en" aria-hidden="true">
            BUY &amp; SELL
            <br />
            <span>TRUCKS.</span>
          </p>
          <h1>
            <span>大切なトラックの</span>
            <span>高額買取なら、</span>
            <span>米川自工。</span>
          </h1>
          <p className="hero-tag">{company.tagline}</p>
        </div>
      </section>

      <Link className="stock-banner" href="/vehicles/">
        <span className="en">STOCK LIST</span>
        <strong>
          販売車両一覧はこちら
          <small>在庫車両を写真付きでご紹介しています</small>
        </strong>
        <i className="go" aria-hidden="true" />
        <img src="/img/photo-line-3.jpg" alt="" />
      </Link>

      <section className="section">
        <div className="wrap split">
          <div className="reveal">
            <SecHead en="ABOUT" title="米川自工とは" />
            <p className="big">{about.title}</p>
            {about.body.map((t) => (
              <p className="text" key={t}>
                {t}
              </p>
            ))}
            <ul className="ok-list">
              {about.ok.map((t) => (
                <li key={t}>
                  {t}
                  <b>買取OK</b>
                </li>
              ))}
            </ul>
            <Link className="btn" href="/company/">
              会社概要
              <Arrow />
            </Link>
          </div>
          <figure className="split-photo reveal">
            <img src="/img/photo-line-2.jpg" alt="ヤードに並ぶトラック" loading="lazy" />
          </figure>
        </div>
      </section>

      <Marquee text="YONEKAWA JIKOU — TRUCK PURCHASE & SALES — " />

      <section className="section soft">
        <div className="wrap">
          <SecHead en="PROMISE" title="トラック買取の安心保障" />
          <ol className="promise-grid">
            {promises.map((p, i) => (
              <li className="reveal" key={p.title}>
                <span className="en">0{i + 1}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap">
          <div className="head-row">
            <SecHead en="SERVICE" title="業務内容" light />
            <Link className="btn light" href="/service/">
              業務内容を見る
              <Arrow />
            </Link>
          </div>
          <ul className="service-photos" aria-hidden="true">
            {['yard', 'machine', 'kenki', 'wrecker', 'container'].map((n) => (
              <li key={n}>
                <img src={`/img/photo-${n}.jpg`} alt="" loading="lazy" />
              </li>
            ))}
          </ul>
          <ul className="service-list">
            {services.map((s, i) => (
              <li key={s.title}>
                <span className="en">0{i + 1}</span>
                {s.title}
              </li>
            ))}
          </ul>
        </div>
        <img className="dark-photo" src="/img/photo-loader-palm.jpg" alt="" loading="lazy" />
      </section>

      <section className="section">
        <div className="wrap">
          <SecHead en="FLOW" title="中古トラック買取までの流れ" />
          <ol className="flow">
            {flow.map((f, i) => (
              <li className="reveal" key={f.title}>
                <span className="en">STEP {i + 1}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TelBand />

      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <SecHead en="STOCK" title="販売車両" />
            <Link className="btn" href="/vehicles/">
              一覧を見る
              <Arrow />
            </Link>
          </div>
          <VehiclesFeed limit={3} />
        </div>
      </section>

      <section className="section soft">
        <div className="wrap news-row">
          <div>
            <SecHead en="NEWS" title="新着情報" />
            <Link className="btn" href="/news/">
              一覧を見る
              <Arrow />
            </Link>
          </div>
          <NewsFeed limit={3} />
        </div>
      </section>

      <section className="section" id="access">
        <div className="wrap">
          <SecHead en="ACCESS" title="アクセス" />
          <div className="access-grid">
            {places.map((p) => (
              <article key={p.name}>
                <iframe src={p.map} title={`${company.name} ${p.name}の地図`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <span className="en">{p.en}</span>
                <h3>
                  {company.name} {p.name}
                </h3>
                <p className="pre">{p.address}</p>
                {p.tel && <p>{p.tel}</p>}
                {p.routes && (
                  <dl>
                    {p.routes.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
