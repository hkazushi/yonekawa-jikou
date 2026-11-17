// 確認用（Vercel）の API の中身。保存先は引数の store に任せる（本番の Vercel Blob / テスト用のメモリ）。
// 動作は public/api/index.php と揃える。違いは「ログイン無し」と「画像を生のバイト列で受け取る」だけ
const crypto = require('node:crypto');

const POST_TYPES = ['vehicle', 'staff', 'news'];
const CHOICES = {
  size: ['大型', '中型', '小型'],
  mission: ['AT', 'MT'],
  shaken: ['あり', 'なし'],
  fuel: ['軽油', 'ガソリン'],
};
const NUMBERS = ['year', 'mileage', 'max_load', 'gross_weight', 'length', 'width', 'height', 'recycle'];
const TEXTS = ['model', 'engine', 'shaken_until'];
const MAX_POSTS = 300;
const MAX_UPLOAD = 4 * 1024 * 1024;
const IMAGE_URL = /^(\/img\/[\w.-]+|https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/uploads\/[a-f0-9]{32}\.(jpg|png|webp))$/;

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}
const fail = (message, status) => {
  throw new ApiError(message, status);
};

const AT = '2026-11-17T09:00:00+09:00';
// お客さんに見せるためのテスト投稿。まだ何も保存されていない初回だけ使う
function seed() {
  const post = (id, type, title, date, images, body = '', data = {}, sort = 0) => ({
    id, type, title, body, images, data, sort, published: true, date, created_at: AT, updated_at: AT,
  });
  return [
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
  ];
}

const text = (v) => (typeof v === 'string' ? v.trim() : '');
const len = (s) => [...s].length;
const staffOrder = (a, b) => (a.sort || 0) - (b.sort || 0) || a.created_at.localeCompare(b.created_at);
// スタッフは並び順、それ以外は日付の新しい順
const sorted = (posts) =>
  [...posts].sort((a, b) =>
    a.type === 'staff' && b.type === 'staff' ? staffOrder(a, b) : b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at),
  );

function imageExt(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return null;
}

function validDate(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

function normalize(input) {
  const type = input.type;
  if (!POST_TYPES.includes(type)) fail('不正なリクエストです。');
  const id = input.id ?? null;
  if (id !== null && !(typeof id === 'string' && /^[a-z0-9-]{1,64}$/.test(id))) fail('不正なリクエストです。');

  let title = text(input.title);
  let body = text(input.body);
  const date = text(input.date);
  const images = (Array.isArray(input.images) ? input.images : [])
    .filter((u) => typeof u === 'string' && IMAGE_URL.test(u))
    .slice(0, type === 'staff' ? 1 : 30);
  const data = {};

  if (type === 'vehicle') {
    const d = input.data && typeof input.data === 'object' ? input.data : {};
    for (const [key, label] of [['maker', 'メーカー'], ['name', '名前'], ['body_type', 'ボディ形状']]) {
      data[key] = text(d[key]);
      if (!data[key]) fail(`${label}を入力してください。`);
      if (len(data[key]) > 40) fail(`${label}は40文字以内にしてください。`);
    }
    for (const key of Object.keys(CHOICES)) {
      data[key] = text(d[key]);
      if (!CHOICES[key].includes(data[key])) fail('選択項目を選び直してください。');
    }
    for (const key of NUMBERS) {
      // 全角数字やカンマ付きで入力されても数字だけにする
      const n = text(String(d[key] ?? ''))
        .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
        .replace(/[,，\s　]/g, '');
      if (n !== '' && !/^\d{1,9}$/.test(n)) fail('数字の項目は半角数字で入力してください。');
      data[key] = n === '' ? '' : String(Number(n));
    }
    for (const key of TEXTS) {
      data[key] = text(d[key]);
      if (len(data[key]) > 60) fail('入力内容が長すぎます。');
    }
    if (data.shaken !== 'あり') data.shaken_until = '';
    // セールスポイントは改行・スペースをそのまま残す（末尾の空白だけ落とす）
    const sp = typeof d.sales_point === 'string' ? d.sales_point.replace(/\r\n/g, '\n').trimEnd() : '';
    if (len(sp) > 5000) fail('セールスポイントが長すぎます。');
    data.sales_point = sp;
    title = `${data.maker}・${data.name}・${data.body_type}`;
    body = '';
    if (!images.length) fail('写真を1枚以上入れてください。');
  } else if (type === 'staff') {
    if (!title) fail('名前を入力してください。');
    if (len(title) > 40) fail('名前は40文字以内にしてください。');
    if (len(body) > 2000) fail('メッセージが長すぎます。');
  } else {
    if (!title) fail('タイトルを入力してください。');
    if (len(title) > 120) fail('タイトルは120文字以内にしてください。');
    if (len(body) > 20000) fail('本文が長すぎます。');
    if (!body && !images.length) fail('本文か写真を入れてください。');
  }
  if (!validDate(date)) fail('日付を入力してください。');

  return { id, row: { type, title, body, images, data, published: input.published === true, date } };
}

// store: { readPosts(): Promise<array|null>, writePosts(array), putImage(buffer, name): Promise<url>, delImages(urls) }
async function handle({ action, method, query = {}, body }, store) {
  const posts = async () => (await store.readPosts()) ?? seed();
  const needPost = () => {
    if (method !== 'POST') fail('不正なリクエストです。', 405);
  };
  const uploaded = (urls) => urls.filter((u) => u.startsWith('https://'));

  switch (action) {
    case 'posts': {
      const list = sorted(await posts()).filter((p) => p.published && p.type === query.type);
      const limit = Number(query.limit) || 0;
      return { posts: limit > 0 ? list.slice(0, limit) : list };
    }
    case 'post': {
      const post = (await posts()).find((p) => p.id === query.id && ['news', 'vehicle'].includes(p.type) && p.published);
      if (!post) fail('ページが見つかりません。', 404);
      return { post };
    }
    // 確認段階はログイン無し
    case 'login_mode':
      return { open: true };
    case 'me':
    case 'login':
    case 'logout':
      return { ok: true };
    case 'admin_posts':
      return { posts: sorted(await posts()).filter((p) => p.type === query.type) };
    case 'admin_post': {
      const post = (await posts()).find((p) => p.id === query.id);
      if (!post) fail('投稿が見つかりません。', 404);
      return { post };
    }
    case 'upload': {
      needPost();
      if (!Buffer.isBuffer(body) || !body.length) fail('画像を受け取れませんでした。');
      if (body.length > MAX_UPLOAD) fail('画像が大きすぎます。', 413);
      const ext = imageExt(body);
      if (!ext) fail('JPEG / PNG / WebP の画像を選んでください。', 415);
      return { url: await store.putImage(body, `${crypto.randomBytes(16).toString('hex')}.${ext}`) };
    }
    case 'save_post': {
      needPost();
      const { id, row } = normalize(body && typeof body === 'object' ? body : {});
      const list = await posts();
      const now = new Date().toISOString();
      let removed = [];
      if (id === null) {
        if (list.length >= MAX_POSTS) fail('登録できる件数の上限に達しました。不要な投稿を削除してください。');
        const last = Math.max(0, ...list.map((p) => p.sort || 0));
        list.push({ ...row, id: crypto.randomBytes(16).toString('hex'), sort: last + 1, created_at: now, updated_at: now });
      } else {
        const i = list.findIndex((p) => p.id === id && p.type === row.type);
        if (i < 0) fail('この投稿は削除されています。', 404);
        removed = list[i].images.filter((u) => !row.images.includes(u));
        list[i] = { ...list[i], ...row, updated_at: now };
      }
      await store.writePosts(list);
      await store.delImages(uploaded(removed));
      return { ok: true, type: row.type };
    }
    // スタッフの並び順を1つ前後に動かす
    case 'move_post': {
      needPost();
      const list = await posts();
      const staff = list.filter((p) => p.type === 'staff').sort(staffOrder);
      const pos = staff.findIndex((p) => p.id === body?.id);
      const to = pos + (body?.delta === -1 ? -1 : 1);
      if (pos >= 0 && staff[to]) [staff[pos], staff[to]] = [staff[to], staff[pos]];
      staff.forEach((p, n) => {
        p.sort = n + 1;
      });
      await store.writePosts(list);
      return { ok: true };
    }
    case 'delete_post': {
      needPost();
      const list = await posts();
      const i = list.findIndex((p) => p.id === body?.id);
      if (i >= 0) {
        const [post] = list.splice(i, 1);
        await store.writePosts(list);
        await store.delImages(uploaded(post.images));
      }
      return { ok: true };
    }
    default:
      return fail('不正なリクエストです。', 404);
  }
}

module.exports = { handle, ApiError, MAX_UPLOAD };
