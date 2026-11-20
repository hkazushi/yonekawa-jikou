'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/app/lib/api';
import { CHOICES, PRICE_ASK, comma, digits, emptyVehicle } from '@/app/lib/vehicle';
import Photos from './Photos';
import { TYPES } from './types';

const todayJst = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());

function Text({ label, value, onChange, max = 60, required, placeholder, note }) {
  return (
    <label className="a-field">
      <span>
        {label}
        {required && <b className="a-req">必須</b>}
      </span>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} required={required} placeholder={placeholder} />
      {note && <small>{note}</small>}
    </label>
  );
}

// 数字だけ受け付け、カンマ区切りで表示する（保存するのは数字のみ）
function Num({ label, value, onChange, unit, prefix, plain = false }) {
  return (
    <label className="a-field">
      <span>{label}</span>
      <span className="a-num">
        {prefix && <i>{prefix}</i>}
        <input
          type="text"
          inputMode="numeric"
          value={plain ? value : comma(value)}
          onChange={(e) => onChange(digits(e.target.value))}
        />
        {unit && <i>{unit}</i>}
      </span>
    </label>
  );
}

function Choice({ label, name, value, onChange }) {
  return (
    <fieldset className="a-field a-choice">
      <legend>{label}</legend>
      <div>
        {CHOICES[name].map((c) => (
          <label key={c}>
            <input type="radio" name={name} value={c} checked={value === c} onChange={() => onChange(c)} />
            <span>{c}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function PostForm({ post, type }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [date, setDate] = useState(post?.date ?? todayJst());
  const [published, setPublished] = useState(post?.published ?? true);
  const [images, setImages] = useState(post?.images ?? []);
  const [v, setV] = useState({ ...emptyVehicle, ...(post?.data ?? {}) });
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('save_post', {
        body: { ...(post ? { id: post.id } : {}), type, title, body, date, published, images, ...(type === 'vehicle' ? { data: v } : {}) },
      });
      router.push(`/admin/?type=${type}&saved=1`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
      window.scrollTo({ top: 0 });
    }
  }

  const photos = (
    <Photos images={images} setImages={setImages} single={type === 'staff'} note={TYPES[type].photoNote} onBusy={setBusy} onError={setError} />
  );

  return (
    <form className="a-card" onSubmit={submit}>
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}

      {type === 'vehicle' && (
        <>
          <h2 className="a-sec">一覧に表示する内容</h2>
          <p className="a-hint">一覧には「写真の1枚目」と「メーカー・名前・ボディ形状」が表示されます。</p>
          {photos}
          <div className="a-grid three">
            <Text label="メーカー" value={v.maker} onChange={set('maker')} max={40} required placeholder="例）いすゞ" />
            <Text label="名前" value={v.name} onChange={set('name')} max={40} required placeholder="例）フォワード" />
            <Text label="ボディ形状" value={v.body_type} onChange={set('body_type')} max={40} required placeholder="例）アルミウイング" />
          </div>

          <h2 className="a-sec">詳細ページに表示する内容</h2>
          <p className="a-hint">空欄の項目は「—」と表示されます。メーカーは上で入力したものが入ります。</p>
          <Choice label="サイズ" name="size" value={v.size} onChange={set('size')} />
          <div className="a-grid two">
            <Num label="年式" value={v.year} onChange={set('year')} unit="年" plain />
            <Num label="距離" value={v.mileage} onChange={set('mileage')} unit="km" />
            <Text label="型式" value={v.model} onChange={set('model')} />
            <Text label="エンジン型式" value={v.engine} onChange={set('engine')} />
          </div>
          <Choice label="ミッション" name="mission" value={v.mission} onChange={set('mission')} />
          <div className="a-grid two">
            <Num label="最大積載量" value={v.max_load} onChange={set('max_load')} unit="kg" />
            <Num label="車両総重量" value={v.gross_weight} onChange={set('gross_weight')} unit="kg" />
          </div>
          <div className="a-grid three">
            <Num label="寸法（長さ）" value={v.length} onChange={set('length')} unit="cm" />
            <Num label="寸法（幅）" value={v.width} onChange={set('width')} unit="cm" />
            <Num label="寸法（高さ）" value={v.height} onChange={set('height')} unit="cm" />
          </div>
          <Choice label="車検状態" name="shaken" value={v.shaken} onChange={set('shaken')} />
          {v.shaken === 'あり' && (
            <Text label="車検の期限" value={v.shaken_until} onChange={set('shaken_until')} placeholder="例）令和9年3月まで" />
          )}
          <Choice label="燃料" name="fuel" value={v.fuel} onChange={set('fuel')} />
          <Num label="リサイクル券" value={v.recycle} onChange={set('recycle')} prefix="¥" />
          <Text
            label="車両販売価格"
            value={v.price}
            onChange={set('price')}
            placeholder={PRICE_ASK}
            note={`金額を載せる車両だけ、「${PRICE_ASK}」を消して「3,000,000円」のように入力してください。空のままにすると「${PRICE_ASK}」と表示されます。`}
          />
          <label className="a-field">
            <span>セールスポイント</span>
            <textarea value={v.sales_point} onChange={(e) => set('sales_point')(e.target.value)} maxLength={5000} />
            <small>改行・スペース・記号は、入力したとおりに表示されます。</small>
          </label>
          <label className="a-field">
            <span>掲載日</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <small>新しい日付の車両が一覧の先頭に並びます。</small>
          </label>
        </>
      )}

      {type === 'staff' && (
        <>
          <Text label="名前" value={title} onChange={setTitle} max={40} required />
          {photos}
          <label className="a-field">
            <span>メッセージ</span>
            <textarea className="short" value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} />
          </label>
        </>
      )}

      {type === 'news' && (
        <>
          <Text label="タイトル" value={title} onChange={setTitle} max={120} required />
          <label className="a-field">
            <span>日付</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="a-field">
            <span>本文</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          {photos}
        </>
      )}

      <label className="a-check">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        サイトに公開する（外すと下書き）
      </label>
      <div className="a-actions">
        <Link className="a-btn sub" href={`/admin/?type=${type}`}>
          戻る
        </Link>
        <button className="a-btn" type="submit" disabled={saving || busy}>
          {saving ? '保存中…' : '保存する'}
        </button>
      </div>
    </form>
  );
}
