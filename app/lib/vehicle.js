// 販売車両の詳細項目。public/api/index.php の VEHICLE_* と揃える
export const CHOICES = {
  size: ['大型', '中型', '小型'],
  mission: ['AT', 'MT'],
  shaken: ['あり', 'なし'],
  fuel: ['軽油', 'ガソリン'],
};

export const emptyVehicle = {
  maker: '', name: '', body_type: '',
  size: '大型', year: '', mileage: '', model: '', engine: '', mission: 'AT',
  max_load: '', gross_weight: '', length: '', width: '', height: '',
  shaken: 'あり', shaken_until: '', fuel: '軽油', recycle: '', sales_point: '',
};

export const comma = (v) => (v === '' || v == null ? '' : Number(v).toLocaleString('ja-JP'));
// 入力欄用: 全角数字を半角にして、数字以外を落とす
export const digits = (v) =>
  String(v).replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\D/g, '').slice(0, 9);

const unit = (v, u) => (v === '' || v == null ? '' : `${comma(v)}${u}`);

// 詳細ページの表。空の項目は「—」
export function specRows(d) {
  const size = [['長さ', d.length], ['幅', d.width], ['高さ', d.height]]
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k} ${comma(v)}cm`)
    .join(' × ');
  return [
    ['サイズ', d.size],
    ['メーカー', d.maker],
    ['年式', d.year ? `${d.year}年` : ''],
    ['距離', unit(d.mileage, 'km')],
    ['型式', d.model],
    ['エンジン型式', d.engine],
    ['ミッション', d.mission],
    ['最大積載量', unit(d.max_load, 'kg')],
    ['車両総重量', unit(d.gross_weight, 'kg')],
    ['寸法', size],
    ['車検状態', d.shaken === 'あり' && d.shaken_until ? `あり（${d.shaken_until}）` : d.shaken],
    ['燃料', d.fuel],
    ['リサイクル券', d.recycle === '' || d.recycle == null ? '' : `¥${comma(d.recycle)}`],
  ].map(([k, v]) => [k, v || '—']);
}
