export const TYPES = {
  vehicle: { label: '販売車両', photoNote: '1枚以上。1枚目が一覧に出る写真です。左から順にスライド表示' },
  staff: { label: 'スタッフ紹介', photoNote: 'イラスト写真を1枚' },
  news: { label: '新着情報', photoNote: 'なくてもOK。一覧には出ず、記事の中に表示' },
};
export const typeOf = (value) => (TYPES[value] ? value : 'vehicle');
