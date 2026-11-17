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
    if (!window.confirm('この内容を削除します。元に戻せません。よろしいですか？')) return;
    try {
      await api('delete_post', { body: { id } });
      router.push(`/admin/?type=${post.type}&deleted=1`);
    } catch (e) {
      setError(e.message);
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
            <button type="button" className="a-btn danger" onClick={remove}>
              削除する
            </button>
          </div>
        </>
      )}
    </>
  );
}
