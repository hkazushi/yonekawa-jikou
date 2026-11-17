'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import { inquiryRows, KIND_LABEL } from '@/app/lib/inquiry';
import AdminTabs from '../AdminTabs';

const when = (iso) =>
  new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export default function Inquiries() {
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [asking, setAsking] = useState('');
  // 未読の数が変わったらタブのバッジを読み直す
  const [tick, setTick] = useState(0);

  const load = useCallback(
    () =>
      api('inquiries')
        .then((res) => {
          setList(res.inquiries);
          setTick((n) => n + 1);
        })
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  async function act(action, body) {
    setError('');
    try {
      await api(action, { body });
      setAsking('');
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <AdminTabs current="inquiries" refresh={tick} />
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <div className="a-head">
        <h1>
          お問合せ
          {list && `（${list.length}件）`}
        </h1>
      </div>
      {list && list.length === 0 && <p className="a-empty">まだ届いていません。買取見積りフォーム・お問合せフォームから送信されると、ここに表示されます。</p>}
      {list && list.length > 0 && (
        <ul className="a-list">
          {list.map((q) => (
            <li className={`a-inq${q.read ? '' : ' unread'}`} key={q.id}>
              <div className="a-inq-head">
                <span>
                  <b className={`a-kind ${q.kind}`}>{KIND_LABEL[q.kind]}</b>
                  {!q.read && <b className="a-new">未読</b>}
                </span>
                <time dateTime={q.created_at}>{when(q.created_at)}</time>
              </div>
              <h2>{q.name} 様</h2>
              <dl>
                <dt>電話番号</dt>
                <dd>
                  <a href={`tel:${q.phone}`}>{q.phone}</a>
                </dd>
                <dt>メール</dt>
                <dd>
                  <a href={`mailto:${q.email}`}>{q.email}</a>
                </dd>
                {inquiryRows(q).map(([k, val]) => (
                  <div className="row-pair" key={k}>
                    <dt>{k}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
              {q.images?.length > 0 && (
                <div className="a-inq-images">
                  {q.images.map((src, i) => (
                    <a href={src} target="_blank" rel="noreferrer" key={src}>
                      <img src={src} alt={`車の画像${i + 1}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
              <div className="row">
                {asking === q.id ? (
                  <>
                    <span>削除します。元に戻せません。</span>
                    <button type="button" className="a-btn sub" onClick={() => setAsking('')}>
                      やめる
                    </button>
                    <button type="button" className="a-btn danger solid" onClick={() => act('inquiry_delete', { id: q.id })}>
                      削除する
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="a-btn sub" onClick={() => act('inquiry_read', { id: q.id, read: !q.read })}>
                      {q.read ? '未読に戻す' : '既読にする'}
                    </button>
                    <button type="button" className="a-btn danger" onClick={() => setAsking(q.id)}>
                      削除
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
