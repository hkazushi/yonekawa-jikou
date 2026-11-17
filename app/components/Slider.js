'use client';

import { useRef, useState } from 'react';

// 写真のスライド。1枚なら矢印もサムネイルも出さない
export default function Slider({ images, alt }) {
  const track = useRef(null);
  const [index, setIndex] = useState(0);

  const go = (i) => {
    const el = track.current;
    el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' });
  };

  return (
    <div className="slider">
      <div className="slider-main">
        <div
          className="slider-track"
          ref={track}
          tabIndex={images.length > 1 ? 0 : undefined}
          aria-label={`${alt} の写真`}
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {images.map((src, i) => (
            <figure key={src + i}>
              <img src={src} alt={`${alt}（${i + 1}枚目）`} loading={i === 0 ? 'eager' : 'lazy'} />
            </figure>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button type="button" className="slider-btn prev" aria-label="前の写真" disabled={index === 0} onClick={() => go(index - 1)}>
              ←
            </button>
            <button type="button" className="slider-btn next" aria-label="次の写真" disabled={index === images.length - 1} onClick={() => go(index + 1)}>
              →
            </button>
            <span className="slider-count en">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <ul className="slider-thumbs">
          {images.map((src, i) => (
            <li key={src + i}>
              <button type="button" aria-label={`${i + 1}枚目を表示`} aria-current={i === index ? 'true' : undefined} onClick={() => go(i)}>
                <img src={src} alt="" loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
