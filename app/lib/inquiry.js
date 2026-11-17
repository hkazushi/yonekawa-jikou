// フォーム（買取見積り・お問合せ）の項目。public/api/lib.php の inquiry_labels、api/_logic.js と揃える
export const KIND_LABEL = { estimate: '買取見積り', contact: 'お問合せ' };

const comma = (v) => Number(v).toLocaleString('ja-JP');

// 管理画面で表示する行。空の項目は出さない
export function inquiryRows(q) {
  const year = q.year ? `${q.era || ''}${q.year}年${q.month ? `${q.month}月` : ''}` : '';
  const rows =
    q.kind === 'estimate'
      ? [
          ['会社名', q.company],
          ['住所', q.address],
          ['折り返し連絡方法', q.reply],
          ['車種', q.car],
          ['メーカー', q.maker],
          ['年式', year],
          ['カラー', q.color],
          ['走行距離', q.mileage ? `${comma(q.mileage)} km` : ''],
          ['型式', q.model],
          ['オートマ／マニュアル', q.mission],
          ['今の状態', q.state],
        ]
      : [['お問合せ内容', q.message]];
  return rows.filter(([, v]) => v);
}
