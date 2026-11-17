// 写真を送る前にブラウザで縮小する（管理画面の投稿と、買取見積りフォームの添付で使う）
const MAX_SIDE = 2000;

const MAX_BYTES = 4 * 1024 * 1024;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// スマホの写真は大きいので、送る前にブラウザで縮小する。
// 縮小できない環境では、そのまま送れる形式・大きさならそのまま送る
export async function shrink(file) {
  try {
    return await resize(file);
  } catch {
    if (OK_TYPES.includes(file.type) && file.size <= MAX_BYTES) return file;
    throw new Error('この画像は読み込めませんでした。JPEG か PNG の写真でお試しください。');
  }
}

async function resize(file) {
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
