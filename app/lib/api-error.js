export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Vercel の確認用ビルドだけ true。next.config.mjs で決まる。true のとき保存先は /api/store（Vercel Blob）
export const REVIEW = process.env.NEXT_PUBLIC_REVIEW === '1';
