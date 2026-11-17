import Link from 'next/link';
import { company } from '@/app/lib/content';

export const formatDate = (d) => String(d).replaceAll('-', '.');

// 米川自工にロゴマークは無い（2026-11-17 確認）。会社名を大きく読ませる文字組みにしている
export function Logo() {
  return (
    <span className="logo">
      <small>{company.tagline}</small>
      <strong>
        <i>株式会社</i>米川自工
      </strong>
    </span>
  );
}

// 大きな英字が横に流れる帯（飾り）
export function Marquee({ text }) {
  return (
    <div className="marquee en" aria-hidden="true">
      <div>
        {[0, 1, 2, 3].map((i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  );
}

export function PageHead({ en, title }) {
  return (
    <section className="page-head">
      <div className="wrap">
        <span className="en">{en}</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}

export function SecHead({ en, title, light = false }) {
  return (
    <div className={`sec-head${light ? ' light' : ''}`}>
      <span className="en">{en}</span>
      <h2>{title}</h2>
    </div>
  );
}

export function Arrow() {
  return <i className="arrow" aria-hidden="true" />;
}

export function VehicleGrid({ posts }) {
  if (!posts.length) return <p className="empty">販売車両は準備中です。</p>;
  return (
    <div className="vehicle-grid">
      {posts.map((p) => (
        <Link className="vehicle-card" href={`/vehicles/detail/?id=${p.id}`} key={p.id}>
          <span className="photo">
            <img src={p.images[0]} alt="" loading="lazy" />
          </span>
          <strong>{p.title}</strong>
        </Link>
      ))}
    </div>
  );
}

export function StaffGrid({ posts }) {
  if (!posts.length) return <p className="empty">スタッフ紹介は準備中です。</p>;
  return (
    <ul className="staff-grid">
      {posts.map((p) => (
        <li className="staff-card" key={p.id}>
          {p.images[0] ? <img src={p.images[0]} alt="" loading="lazy" /> : <span className="no-photo" aria-hidden="true" />}
          <div>
            <h2>{p.title}</h2>
            {p.body && <p>{p.body}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

// 一覧は文字だけ（画像は記事の中）
export function NewsList({ posts }) {
  if (!posts.length) return <p className="empty">新着情報は準備中です。</p>;
  return (
    <ul className="news-list">
      {posts.map((p) => (
        <li key={p.id}>
          <Link href={`/news/detail/?id=${p.id}`}>
            <time className="en" dateTime={p.date}>
              {formatDate(p.date)}
            </time>
            <span className="title">{p.title}</span>
            <Arrow />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TelBand() {
  return (
    <section className="tel-band">
      <div className="wrap">
        <div>
          <p className="catch">見積無料・相談無料・査定無料</p>
          <p>査定に関するご要望・ご相談もどうぞお気軽に。</p>
        </div>
        <div className="tel-actions">
          <a className="tel" href={`tel:${company.freeDial}`}>
            <span className="en">{company.freeDial}</span>
            <small>営業時間 {company.hours}</small>
          </a>
          <Link className="form-link" href="/estimate/">
            買取見積りフォームはこちら
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

// 公式 Instagram への案内（現HPの「インスタグラムはじめました」バナーの後継）。全ページのフッター前に出す
export function InstaBand() {
  return (
    <a className="insta-band" href={company.instagram} target="_blank" rel="noreferrer">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="17.6" cy="6.4" r="1.1" className="dot" />
      </svg>
      <span className="en">INSTAGRAM</span>
      <strong>
        米川自工 公式インスタグラム
        <small>@yonekawajikou</small>
      </strong>
      <span className="follow">
        フォローする
        <Arrow />
      </span>
    </a>
  );
}
