'use client';

import { useState } from 'react';
import { api } from '@/app/lib/api';

const MAX_SIDE = 2000;

// スマホの写真は大きいので、送る前にブラウザで縮小する
async function shrink(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('画像を変換できませんでした。'))), 'image/jpeg', 0.85);
  });
}

// 写真の追加（選択 or ドラッグ＆ドロップ）・並べ替え・削除。single は1枚だけ
export default function Photos({ images, setImages, single = false, note, onBusy, onError }) {
  const [uploading, setUploading] = useState(0);
  const [over, setOver] = useState(false);

  async function add(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith('image/')).slice(0, single ? 1 : 30);
    if (!files.length) return;
    onError('');
    setUploading(files.length);
    onBusy(true);
    for (const file of files) {
      try {
        const { url } = await api('upload', { file: await shrink(file) });
        setImages((list) => (single ? [url] : [...list, url]));
      } catch (err) {
        onError(`${file.name}: ${err.message || 'アップロードできませんでした。'}`);
      }
      setUploading((n) => n - 1);
    }
    onBusy(false);
  }

  function move(i, delta) {
    setImages((list) => {
      const next = [...list];
      const [item] = next.splice(i, 1);
      next.splice(i + delta, 0, item);
      return next;
    });
  }

  return (
    <div className="a-field">
      <span>写真{note && `（${note}）`}</span>
      {images.length > 0 && (
        <ul className="a-images">
          {images.map((src, i) => (
            <li className="a-image" key={src}>
              <img src={src} alt={`${i + 1}枚目`} />
              {!single && i === 0 && <em>一覧の写真</em>}
              <div className={single ? 'one' : undefined}>
                {!single && (
                  <>
                    <button type="button" aria-label="前へ" disabled={i === 0} onClick={() => move(i, -1)}>
                      ←
                    </button>
                    <button type="button" aria-label="後ろへ" disabled={i === images.length - 1} onClick={() => move(i, 1)}>
                      →
                    </button>
                  </>
                )}
                <button type="button" className="rm" onClick={() => setImages(images.filter((u) => u !== src))}>
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <label
        className={`a-add${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept="image/*"
          multiple={!single}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
        {uploading > 0
          ? `アップロード中…（残り${uploading}枚）`
          : single && images.length
            ? '写真を入れ替える'
            : '＋ 写真を追加（ここにドラッグしても追加できます）'}
      </label>
    </div>
  );
}
