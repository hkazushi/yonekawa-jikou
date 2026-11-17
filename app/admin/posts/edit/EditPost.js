'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/api';
import PostForm from '../../PostForm';
import { TYPES } from '../../types';

export default function EditPost() {
  const router = useRouter();
  const id = useSearchParams().get('id') ?? '';
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  // 削除の確認は画面の中に出す。window.confirm は埋め込みブラウザなどで出ないことがあり、押しても何も起きなくなる
  const [asking, setAsking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    api('admin_post', { params: { id } })
      .then((res) => alive && setPost(res.post))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [id]);

  async function remove() {
    setDeleting(true);
    setError('');
    try {
      await api('delete_post', { body: { id } });
      router.push(`/admin/?type=${post.type}&deleted=1`);
    } catch (e) {
      setError(e.message);
      setDeleting(false);
      setAsking(false);
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <>
      {error && (
        <p className="a-error" role="alert">
          {error}
        </p>
      )}
      {post && (
        <>
          <h1 style={{ marginBottom: 16 }}>{TYPES[post.type].label}を編集</h1>
          <PostForm post={post} type={post.type} />
          <div className="a-danger-zone">
            {asking ? (
              <div className="a-confirm" role="alertdialog" aria-label="削除の確認">
                <p>「{post.title}」を削除します。元に戻せません。</p>
                <div>
                  <button type="button" className="a-btn sub" onClick={() => setAsking(false)} disabled={deleting}>
                    やめる
                  </button>
                  <button type="button" className="a-btn danger solid" onClick={remove} disabled={deleting}>
                    {deleting ? '削除中…' : '削除する'}
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="a-btn danger" onClick={() => setAsking(true)}>
                削除する
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
