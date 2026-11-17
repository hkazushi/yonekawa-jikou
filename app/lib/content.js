// サイトの文言。文言の修正はまずここ。出典は notes/content-sources.md
export const company = {
  name: '株式会社米川自工',
  tagline: '全国トラック買取販売店',
  freeDial: '0120-776-634',
  hours: '9:00〜19:00（日曜・祝日を除く）',
  instagram: 'https://www.instagram.com/yonekawajikou/',
};

export const nav = [
  { href: '/company/', label: '会社概要', en: 'COMPANY' },
  { href: '/service/', label: '業務内容', en: 'SERVICE' },
  { href: '/fleet/', label: '保有車両', en: 'FLEET' },
  { href: '/staff/', label: 'スタッフ紹介', en: 'STAFF' },
  { href: '/vehicles/', label: '販売車両', en: 'STOCK' },
  { href: '/news/', label: '新着情報', en: 'NEWS' },
];

export const about = {
  title: 'どんな車両でも\n買取いたします。',
  body: [
    'メーカー架装は全く問いません。年式・走行距離・キズ等の修復歴に関わらず買取いたします。',
    '長い間使われていない車両やバッテリーがあがって動かない車両についての査定も大歓迎です。要望があればなんでもご相談ください。',
  ],
  ok: ['車検切れ・車検寸前', '廃車済', '旧年式・過走行', '事故車・不動車'],
};

export const promises = [
  { title: '書類手続きも無料にて代行', body: '名義変更等の書類手続きも、専門スタッフがスピーディーに対応いたします。' },
  { title: '自社レッカー・ローダー完備', body: '専門スタッフが自社レッカー・ローダーにて引き取りいたします。' },
  { title: '見積無料', body: '見積だけでもOKです。金額にご満足いただけない場合は、売却する必要はございません。相見積でもOKです。' },
];

export const flow = [
  { title: '申し込み', body: 'まずは、お車の状況・状態をお電話でお知らせください。' },
  { title: '無料査定', body: '弊社スタッフが現車を確認させていただいた後、査定いたします。' },
  { title: '結果・連絡', body: '査定結果をご連絡いたします。金額にご満足頂けた場合に契約に移ります。' },
  { title: '契約・お支払い', body: '必要書類のご説明と、即日現金払い・銀行振込のいずれかから料金をお支払いいたします。確認して頂けましたら車両の引き渡し（引取り）に伺います。' },
];

export const serviceLead =
  '米川自工では、お客様によりよい車をご提供するために、中古トラック及び建機・カスタムパーツの販売と買取を行っております。';

export const services = [
  { title: '中古トラック買取・販売', en: 'USED TRUCKS', image: '/img/photo-yard.jpg' },
  { title: 'フォークリフト買取・販売', en: 'FORKLIFTS', image: '/img/photo-machine.jpg' },
  { title: '建設機械買取・販売', en: 'CONSTRUCTION MACHINERY', image: '/img/photo-kenki.jpg' },
  { title: 'レッカーサービス', en: 'WRECKER SERVICE', image: '/img/photo-wrecker.jpg' },
  { title: '自動車解体', en: 'DISMANTLING', image: '/img/photo-line-1.jpg' },
  { title: '中古パーツ販売', en: 'USED PARTS', image: '/img/photo-parts.jpg' },
  { title: 'アルミコンテナ販売', en: 'CONTAINERS', image: '/img/photo-container.jpg' },
  { title: '各メーカー新車販売', en: 'NEW TRUCKS', image: '/img/photo-truck-front.jpg' },
];

export const profile = [
  ['会社名', '株式会社 米川自工'],
  ['代表者', '代表取締役　米川 輝之'],
  ['所在地', '〒350-0834\n埼玉県川越市大字鹿飼1514-1'],
  ['代表番号', 'TEL：049-223-3232\nFAX：049-223-3427'],
  ['業種', services.map((s) => `・${s.title}`).join('\n')],
  ['沿革', '昭和50年　米川カッター工業創業\n平成24年5月　株式会社米川自工に組織変更'],
  ['許可・認可', '古物商許可　埼玉県公安委員会　第431080009348号'],
];

export const downloads = [
  { label: '譲渡証明書', file: '/files/jyoudo.pdf' },
  { label: '譲渡証明書（記載例）', file: '/files/jyoudo_ex.pdf' },
  { label: '委任状', file: '/files/inin.pdf' },
  { label: '委任状（記載例）', file: '/files/inin_ex.pdf' },
  { label: '事業計画変更認可申請書兼届出書様式', file: '/files/01.pdf' },
];

export const fleetLead = '充実した車両設備で迅速な対応！！';

export const fleet = [
  { name: '大型レッカー', image: '/img/fleet-wrecker-l.jpg' },
  { name: '中型レッカー', image: '/img/fleet-wrecker-m.jpg' },
  { name: '大型ローダー①', image: '/img/fleet-loader-l1.jpg' },
  { name: '大型ローダー②', image: '/img/fleet-loader-l2.jpg' },
  { name: '大型ローダー③', image: '/img/fleet-loader-l3.jpg' },
  { name: '中型ローダー', image: '/img/fleet-loader-m.jpg' },
  { name: '小型ローダー①', image: '/img/fleet-loader-s1.jpg' },
  { name: '小型ローダー②', image: '/img/fleet-loader-s2.jpg' },
];

export const places = [
  {
    name: '本社',
    en: 'HEAD OFFICE',
    address: '〒350-0834\n埼玉県川越市大字鹿飼1514-1',
    tel: 'TEL 049-223-3232 ／ FAX 049-223-3427',
    routes: [
      ['電車', '西武線 本川越駅から15分／東武東上線 川越駅から17分／JR川越線 南古谷駅から17分'],
      ['お車', '圏央道 川島ICより15分／関越自動車道 川越ICより20分'],
    ],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3229.971121764616!2d139.50682081575718!3d35.947676380133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018daa06b6b85f9%3A0xc1b6b6d745b05278!2z57Gz5bed6Kej5L2T!5e0!3m2!1sja!2sjp!4v1455375483464',
  },
  {
    name: '小山ヤード',
    en: 'OYAMA YARD',
    address: '〒329-0203\n栃木県小山市西黒田666-1',
    // 「maps?q=住所&output=embed」を開いたときの転送先（住所の検索結果を埋め込む形式）
    map: 'https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1z5qCD5pyo55yM5bCP5bGx5biC6KW_6buS55SwNjY2LTE!6i15',
  },
];
