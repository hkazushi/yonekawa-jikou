// API の呼び出し（ブラウザ側のみ）。
// 本番は PHP（/api/index.php、ファイルに保存）、確認用（Vercel）は /api/store（Vercel Blob に保存）。どちらも全員に反映される
import { ApiError, REVIEW } from './api-error';

export { ApiError };

const ENDPOINT = REVIEW ? '/api/store' : '/api/index.php';

export async function api(action, { params, body, file } = {}) {
  const query = new URLSearchParams({ action, ...params });
  const init = {};
  if (body !== undefined || file) {
    init.method = 'POST';
    init.headers = { 'X-YJ-Request': '1' };
    if (file && REVIEW) {
      // Vercel の関数は画像をそのままのバイト列で受け取る
      init.headers['Content-Type'] = 'application/octet-stream';
      init.body = file;
    } else if (file) {
      init.body = new FormData();
      init.body.append('file', file, 'photo.jpg');
    } else {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${ENDPOINT}?${query}`, init);
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError('サーバーと通信できませんでした。', res.status);
  }
  if (!res.ok) throw new ApiError(json.error || 'エラーが発生しました。', res.status);
  return json;
}
