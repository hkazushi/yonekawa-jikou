'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '@/app/components/Parts';
import { api } from '@/app/lib/api';
import AdminTabs from './AdminTabs';
import { TYPES, typeOf } from './types';

export default function AdminHome() {
  const params = useSearchParams();
  const type = typeOf(params.get('type'));
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(
    () =>
      api('admin_posts', { params: { type } })
        .then((res) => setPosts(res.posts))
        .catch((e) => setError(e.message)),
    [type],
  );

  useEffect(() => {
    setPosts(null);
    load();
  }, [load]);

  async function move(id, delta) {
    setError('');
    try {
      await api('move_post', { body: { id, delta } });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <AdminTabs current={type} />
      {params.get('saved') && (
        <p className="a-notice" role="status">
          保存しました。
        </p>
      )}
      {params.get('deleted') && (
        <p className="a-notice" role="status">
          削除しました。
        </p>
      )}
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      <div className="a-head">
        <h1>
          {TYPES[type].label}
          {posts && `（${posts.length}件）`}
        </h1>
        <Link className="a-btn" href={`/admin/posts/new/?type=${type}`}>
          ＋ 新しく{type === 'staff' ? '追加' : '投稿'}
        </Link>
      </div>
      {posts && posts.length === 0 && <p className="a-empty">まだ登録がありません。右上のボタンから追加できます。</p>}
      {posts && posts.length > 0 && (
        <ul className="a-list">
          {posts.map((p, i) => (
            <li className={`a-item${type === 'staff' ? ' has-move' : ''}`} key={p.id}>
              {p.images[0] ? (
                <img className="thumb" src={p.images[0]} alt="" loading="lazy" />
              ) : (
                <span className="thumb no-photo">写真なし</span>
              )}
              <div>
                <strong>
                  {p.title}
                  {!p.published && <span className="a-draft">下書き</span>}
                </strong>
                <small>
                  {type === 'staff' ? p.body.slice(0, 40) : formatDate(p.date)}
                  {type !== 'staff' && p.images.length > 0 && ` ・ 写真${p.images.length}枚`}
                </small>
              </div>
              {type === 'staff' && (
                <span className="a-move">
                  <button type="button" aria-label={`${p.title} を上へ`} disabled={i === 0} onClick={() => move(p.id, -1)}>
                    ↑
                  </button>
                  <button type="button" aria-label={`${p.title} を下へ`} disabled={i === posts.length - 1} onClick={() => move(p.id, 1)}>
                    ↓
                  </button>
                </span>
              )}
              <Link className="a-btn sub" href={`/admin/posts/edit/?id=${p.id}`}>
                編集
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
