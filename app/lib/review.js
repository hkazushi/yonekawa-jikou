// 確認用ビルド（Vercel）の API 代わり。PHP が無いので、見ている人のブラウザの中だけで動かす。
// 本番ビルドには入らず、本番のログインは PHP 側で必ず確認する。動作は public/api/index.php と揃える
import { ApiError } from './api-error';
import { CHOICES } from './vehicle';

const KEY = 'yj-review-v1';
const AT = '2026-11-17T09:00:00+09:00';

const seed = () => {
  const post = (id, type, title, date, images, body = '', data = {}, sort = 0) => ({
    id, type, title, body, images, data, sort, published: true, date, created_at: AT, updated_at: AT,
  });
  return {
    loggedIn: false,
    posts: [
      post('sample-vehicle-1', 'vehicle', 'いすゞ・フォワード・アルミウイング', '2026-11-17', ['/img/photo-line-1.jpg', '/img/photo-line-2.jpg', '/img/photo-yard.jpg'], '', {
        maker: 'いすゞ', name: 'フォワード', body_type: 'アルミウイング',
        size: '中型', year: '2018', mileage: '356000', model: 'TKG-FRR90S2', engine: '4HK1', mission: 'MT',
        max_load: '2700', gross_weight: '7990', length: '858', width: '249', height: '343',
        shaken: 'あり', shaken_until: '令和9年3月まで', fuel: '軽油', recycle: '11170',
        sales_point: '※これはテスト投稿です。数値はすべて仮のものです。\n\n・写真は複数枚登録でき、スライドで表示されます\n・改行や　スペース、記号（★◎→）もそのまま表示されます',
      }),
      post('sample-vehicle-2', 'vehicle', '三菱ふそう・スーパーグレート・冷凍バン', '2026-11-10', ['/img/photo-line-3.jpg'], '', {
        maker: '三菱ふそう', name: 'スーパーグレート', body_type: '冷凍バン',
        size: '大型', year: '2016', mileage: '812000', model: '', engine: '', mission: 'AT',
        max_load: '13200', gross_weight: '24980', length: '1199', width: '249', height: '379',
        shaken: 'なし', shaken_until: '', fuel: '軽油', recycle: '',
        sales_point: '※これはテスト投稿です（写真1枚の例）。',
      }),
      post('sample-staff-1', 'staff', 'スタッフ名（テスト投稿）', '2026-11-17', [], 'ここにメッセージが入ります。お名前・イラスト写真・メッセージの3つを登録できます。', {}, 1),
      post('sample-staff-2', 'staff', 'スタッフ名 2（テスト投稿）', '2026-11-17', [], '並び順は管理画面の「↑」「↓」で入れ替えられます。', {}, 2),
      post('sample-news-1', 'news', 'ホームページをリニューアルしました（テスト投稿）', '2026-11-17', [], '株式会社米川自工のホームページをリニューアルしました。\n販売車両や新着情報を掲載してまいります。'),
      post('sample-news-2', 'news', '写真付きのお知らせ（テスト投稿）', '2026-11-10', ['/img/photo-container.jpg'], '新着情報は、文章だけでも、写真付きでも投稿できます。'),
    ],
  };
};

let memory = null;

function load() {
  if (memory) return memory;
  try {
    memory = JSON.parse(localStorage.getItem(KEY));
  } catch {
    memory = null;
  }
  memory = memory || seed();
  return memory;
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(memory));
  } catch {
    throw new ApiError('確認用の保存容量を超えました。写真を減らしてお試しください。', 507);
  }
}

const sorted = (posts) =>
  [...posts].sort((a, b) =>
    a.type === 'staff' && b.type === 'staff'
      ? a.sort - b.sort || a.created_at.localeCompare(b.created_at)
      : b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at),
  );

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new ApiError('画像を読み込めませんでした。', 400));
    reader.readAsDataURL(file);
  });

function normalize(body) {
  const row = { ...body, title: (body.title || '').trim(), body: (body.body || '').trim(), data: {} };
  if (body.type === 'vehicle') {
    const d = body.data || {};
    for (const [key, label] of [['maker', 'メーカー'], ['name', '名前'], ['body_type', 'ボディ形状']]) {
      if (!d[key]?.trim()) throw new ApiError(`${label}を入力してください。`, 400);
    }
    for (const key of Object.keys(CHOICES)) {
      if (!CHOICES[key].includes(d[key])) throw new ApiError('選択項目を選び直してください。', 400);
    }
    if (!body.images.length) throw new ApiError('写真を1枚以上入れてください。', 400);
    row.data = { ...d, maker: d.maker.trim(), name: d.name.trim(), body_type: d.body_type.trim(), sales_point: (d.sales_point || '').trimEnd() };
    if (row.data.shaken !== 'あり') row.data.shaken_until = '';
    row.title = `${row.data.maker}・${row.data.name}・${row.data.body_type}`;
    row.body = '';
  } else if (body.type === 'staff') {
    if (!row.title) throw new ApiError('名前を入力してください。', 400);
    row.images = body.images.slice(0, 1);
  } else {
    if (!row.title) throw new ApiError('タイトルを入力してください。', 400);
    if (!row.body && !body.images.length) throw new ApiError('本文か写真を入れてください。', 400);
  }
  return row;
}

export async function reviewApi(action, { params = {}, body = {}, file } = {}) {
  const db = load();

  if (action === 'posts') {
    const posts = sorted(db.posts).filter((p) => p.published && p.type === params.type);
    return { posts: params.limit ? posts.slice(0, Number(params.limit)) : posts };
  }
  if (action === 'post') {
    const post = db.posts.find((p) => p.id === params.id && ['news', 'vehicle'].includes(p.type) && p.published);
    if (!post) throw new ApiError('ページが見つかりません。', 404);
    return { post };
  }
  if (action === 'login_mode') return { open: true };
  if (action === 'login') {
    db.loggedIn = true;
    save();
    return { ok: true };
  }
  if (action === 'logout') {
    db.loggedIn = false;
    save();
    return { ok: true };
  }

  if (!db.loggedIn) throw new ApiError('ログインしてください。', 401);

  switch (action) {
    case 'me':
      return { ok: true };
    case 'admin_posts':
      return { posts: sorted(db.posts).filter((p) => p.type === params.type) };
    case 'admin_post': {
      const post = db.posts.find((p) => p.id === params.id);
      if (!post) throw new ApiError('投稿が見つかりません。', 404);
      return { post };
    }
    case 'upload':
      return { url: await readFile(file) };
    case 'save_post': {
      const now = new Date().toISOString();
      const row = { ...normalize(body), updated_at: now };
      const i = db.posts.findIndex((p) => p.id === body.id);
      if (i >= 0) db.posts[i] = { ...db.posts[i], ...row };
      else db.posts.push({ ...row, id: crypto.randomUUID(), sort: Math.max(0, ...db.posts.map((p) => p.sort || 0)) + 1, created_at: now });
      save();
      return { ok: true };
    }
    case 'move_post': {
      const staff = sorted(db.posts.filter((p) => p.type === 'staff'));
      const pos = staff.findIndex((p) => p.id === body.id);
      const to = pos + (body.delta === -1 ? -1 : 1);
      if (pos >= 0 && staff[to]) [staff[pos], staff[to]] = [staff[to], staff[pos]];
      staff.forEach((p, n) => {
        p.sort = n + 1;
      });
      save();
      return { ok: true };
    }
    case 'delete_post':
      db.posts = db.posts.filter((p) => p.id !== body.id);
      save();
      return { ok: true };
    default:
      throw new ApiError('不正なリクエストです。', 404);
  }
}
