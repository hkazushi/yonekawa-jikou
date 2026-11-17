'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/app/lib/api';
import { REVIEW } from '@/app/lib/api-error';
import { company } from '@/app/lib/content';
import { shrink } from '@/app/lib/shrink';
import { digits } from '@/app/lib/vehicle';

const EMPTY = {
  name: '', phone: '', email: '', company: '', address: '', reply: '', car: '', maker: '',
  era: '', year: '', month: '', color: '', mileage: '', model: '', mission: '', state: '', message: '', website: '',
};

function Field({ label, required, children, note }) {
  return (
    <div className="field">
      <span className="label">
        {label}
        {required && <b>必須</b>}
      </span>
      <div>
        {children}
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

// kind: 'estimate'（買取見積り） / 'contact'（お問合せ）
export default function InquiryForm({ kind }) {
  const isEstimate = kind === 'estimate';
  // 販売車両の詳細から来たときは、どの車両の問い合わせかを本文に入れておく
  const about = useSearchParams().get('about') ?? '';
  const [v, setV] = useState({ ...EMPTY, message: about ? `「${about}」について\n` : '' });
  const [files, setFiles] = useState([null, null, null]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setV((prev) => ({ ...prev, [key]: e.target.value }));
  const setNum = (key) => (e) => setV((prev) => ({ ...prev, [key]: digits(e.target.value) }));
  const text = (key, props = {}) => <input type="text" value={v[key]} onChange={set(key)} {...props} />;

  // React 19 は <form action> の完了後に入力を消すので、onSubmit で自分で送る（エラー時に入力を残す）
  async function submit(e) {
    e.preventDefault();
    setPending(true);
    setError('');
    try {
      const images = [];
      for (const file of files) {
        if (file) images.push((await api('inquiry_upload', { file: await shrink(file) })).ref);
      }
      await api('contact', { body: { ...v, kind, images } });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message || '送信できませんでした。時間をおいて再度お試しください。');
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="form-done" role="status">
        <h2>送信しました</h2>
        <p>
          {isEstimate ? '査定のお申し込み' : 'お問い合わせ'}ありがとうございます。
          <br />
          内容を確認のうえ、担当者よりご連絡いたします。
        </p>
        <p>
          お急ぎの場合はお電話ください。
          <br />
          <a className="en" href={`tel:${company.freeDial}`}>
            {company.freeDial}
          </a>
          <small>営業時間 {company.hours}</small>
        </p>
        <Link className="btn" href="/">
          トップページへ
        </Link>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      {REVIEW && <p className="form-note">確認用のサイトです。テスト用の内容でお試しください（実際のお客様の情報は入力しないでください）。</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <Field label="お名前" required>
        {text('name', { required: true, maxLength: 100, autoComplete: 'name', placeholder: '例：山田太郎' })}
      </Field>
      <Field label="電話番号" required>
        <input type="tel" value={v.phone} onChange={set('phone')} required maxLength={30} autoComplete="tel" placeholder="例：0492233232" />
      </Field>
      <Field label="メールアドレス" required>
        <input type="email" value={v.email} onChange={set('email')} required maxLength={200} autoComplete="email" placeholder="例：xxx@example.com" />
      </Field>

      {isEstimate ? (
        <>
          <Field label="会社名">{text('company', { maxLength: 200, autoComplete: 'organization' })}</Field>
          <Field label="住所">{text('address', { maxLength: 300, autoComplete: 'street-address' })}</Field>
          <Field label="折り返し連絡方法" required>
            <select value={v.reply} onChange={set('reply')} required>
              <option value="">選択してください</option>
              <option>お電話</option>
              <option>メールアドレス</option>
            </select>
          </Field>
          <Field label="車種">{text('car', { maxLength: 100, placeholder: '例：アルミウイング' })}</Field>
          <Field label="メーカー">{text('maker', { maxLength: 100, placeholder: '例：いすゞ' })}</Field>
          <Field label="年式（和暦）">
            <span className="inline">
              <select value={v.era} onChange={set('era')} aria-label="年号">
                <option value="">和暦選択</option>
                <option>令和</option>
                <option>平成</option>
                <option>昭和</option>
              </select>
              <input type="text" inputMode="numeric" className="mini" value={v.year} onChange={setNum('year')} maxLength={2} aria-label="年" />
              <i>年</i>
              <input type="text" inputMode="numeric" className="mini" value={v.month} onChange={setNum('month')} maxLength={2} aria-label="月" />
              <i>月</i>
            </span>
          </Field>
          <Field label="カラー">{text('color', { maxLength: 100, placeholder: '例：黒色' })}</Field>
          <Field label="走行距離">
            <span className="inline">
              <input
                type="text"
                inputMode="numeric"
                className="mid"
                value={v.mileage ? Number(v.mileage).toLocaleString('ja-JP') : ''}
                onChange={setNum('mileage')}
                aria-label="走行距離"
              />
              <i>km</i>
            </span>
          </Field>
          <Field label="型式">{text('model', { maxLength: 100, placeholder: '例：FRR90T2' })}</Field>
          <Field label="オートマもしくはマニュアル">
            <select value={v.mission} onChange={set('mission')}>
              <option value="">選択してください</option>
              <option>AT</option>
              <option>MT</option>
            </select>
          </Field>
          <Field label="今の状態">
            <textarea value={v.state} onChange={set('state')} maxLength={5000} placeholder="状態を詳しくご入力ください。" />
          </Field>
          {[0, 1, 2].map((i) => (
            <Field label={`車の画像${i + 1}`} key={i}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0] ?? null;
                  setFiles((list) => list.map((f, n) => (n === i ? file : f)));
                }}
              />
            </Field>
          ))}
        </>
      ) : (
        <Field label="お問合せ内容" required>
          <textarea value={v.message} onChange={set('message')} required maxLength={5000} placeholder="お問合せ内容をできるだけ具体的にご入力ください。" />
        </Field>
      )}

      {/* ボット用の隠し項目。人には見えない */}
      <input className="hp" type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} aria-hidden="true" />

      <div className="form-actions">
        <button className="btn red" type="submit" disabled={pending}>
          {pending ? '送信中…' : isEstimate ? '査定のお申し込みをする' : '送信する'}
        </button>
      </div>
    </form>
  );
}
