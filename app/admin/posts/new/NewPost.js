'use client';

import { useSearchParams } from 'next/navigation';
import PostForm from '../../PostForm';
import { TYPES, typeOf } from '../../types';

export default function NewPost() {
  const type = typeOf(useSearchParams().get('type'));
  return (
    <>
      <h1 style={{ marginBottom: 16 }}>{TYPES[type].label}を{type === 'staff' ? '追加' : '投稿'}</h1>
      <PostForm type={type} />
    </>
  );
}
