// 確認用（Vercel）の保存 API。投稿と画像を Vercel Blob に置くので、保存した内容は全員に反映される。
// 本番（レンタルサーバー）では使わない。そちらは public/api/index.php がファイルに保存する
const { put, get, del } = require('@vercel/blob');
const { handle, ApiError, MAX_UPLOAD } = require('./_logic');

const POSTS = 'data/posts.json';

const store = {
  async readPosts() {
    // CDN のキャッシュを通すと保存直後に古い内容が返るので、必ず元データを読む
    const res = await get(POSTS, { access: 'public', useCache: false });
    if (!res || res.statusCode !== 200) return null;
    const data = JSON.parse(await new Response(res.stream).text());
    if (!Array.isArray(data)) throw new ApiError('データファイルを読み込めません。', 500);
    return data;
  },
  async writePosts(posts) {
    await put(POSTS, JSON.stringify(posts, null, 2), {
      access: 'public',
      allowOverwrite: true,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
    });
  },
  async putImage(buffer, name) {
    const ext = name.split('.').pop();
    const { url } = await put(`uploads/${name}`, buffer, {
      access: 'public',
      contentType: { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext],
    });
    return url;
  },
  async delImages(urls) {
    if (urls.length) await del(urls).catch(() => {});
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_UPLOAD + 1024) {
        reject(new ApiError('画像が大きすぎます。', 413));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex');
  try {
    const url = new URL(req.url, 'http://localhost');
    const query = Object.fromEntries(url.searchParams);
    let body;
    if (req.method === 'POST') {
      // 別サイトからの送信を拒否する。専用ヘッダーは別オリジンから付けられない
      if (req.headers['x-yj-request'] !== '1') throw new ApiError('不正なリクエストです。', 403);
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) throw new ApiError('不正なリクエストです。', 403);
      const raw = await readBody(req);
      body = query.action === 'upload' ? raw : JSON.parse(raw.toString('utf8') || '{}');
    }
    const result = await handle({ action: query.action, method: req.method, query, body }, store);
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (e) {
    const known = e instanceof ApiError;
    if (!known) console.error(e);
    res.statusCode = known ? e.status : 500;
    res.end(JSON.stringify({ error: known ? e.message : '保存先に接続できませんでした。時間をおいて再度お試しください。' }));
  }
};

// 画像を生のバイト列で受け取るので、Vercel の自動パースを止める
module.exports.config = { api: { bodyParser: false } };
