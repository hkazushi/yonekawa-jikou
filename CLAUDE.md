# 株式会社米川自工 コーポレートサイト（yonekawa-jikou）

埼玉県川越市のトラック買取・販売会社のHPリニューアル。販売車両・スタッフ紹介・新着情報は、お客さんが `/admin` から自分で投稿する。2026-11-17 新規作成。山﨑工業（`../yamazaki-kougyo`）の仕組みを土台にしている。

現HP: https://yonekawa-jikou.co.jp/ （文言・様式PDFの引き継ぎ元）
参考サイト: https://www.frontierx.net/ （トップの構成）／ https://www.yonekawakogyo.jp/ ／ https://hokuyotransporter.co.jp/ ／ https://www.kuriyama-truck.com/trucks/list/ （販売車両）
素材: Google Drive「HP画像」（`meetings/2026-11-17.md` 参照）
GitHub: https://github.com/hkazushi/yonekawa-jikou （**Public**。2026-11-17 にユーザーが作成し、反映を指示）
Vercel（確認用URL）: 未作成

## 技術構成

- 公開先は**レンタルサーバー想定（未定）**。条件は PHP 7.4 以上（`mbstring` 有効）と Apache 2.4 互換の `.htaccess`
- 画面: Next.js（App Router）+ **JavaScript** の**静的エクスポート**（`output: 'export'` / `trailingSlash: true`）
- 投稿・ログイン: **PHP**（`public/api/`）。**データベースは使わない**。フォーム（お問合せ・買取見積り）は**無い**（電話導線のみ。要否は発注者に確認中）
- 保存先: 公開フォルダの外の `yj-data/`（`public_html` の隣）。デプロイで上書きしても消えない
- ログイン: `yj-data/config.php` の1アカウント + PHP セッション
- **確認段階はパスワード無し**（2026-11-17 の指示）: `yj-data/config.php` の `'open_login' => true` で、ログイン画面が「パスワードなしで入る」ボタンだけになる。**本番公開の前に必ず `false` に戻す**（誰でも投稿・削除できてしまう）。ローカルの `yj-data/config.php` は `true` にしてある
- 確認用ビルド（`NEXT_PUBLIC_REVIEW=1`。Vercel では自動）: PHP の代わりに `app/lib/review.js` がブラウザ内（localStorage）で動く。ログイン不要、noindex

### ディレクトリ

| パス | 役割 |
|---|---|
| `app/lib/content.js` | サイトの文言・会社情報・業務内容・保有車両・アクセス。**文言の修正はまずここ** |
| `app/lib/vehicle.js` | 販売車両の項目（選択肢、表示の整形）。`public/api/index.php` の `VEHICLE_*` と揃える |
| `app/lib/api.js` | PHP API の呼び出し |
| `app/components/Posts.js` | 販売車両・スタッフ・新着情報の読み込み（ブラウザから API を呼ぶ） |
| `app/(site)/` | 公開ページ（`/` `/company` `/service` `/fleet` `/staff` `/vehicles` `/vehicles/detail/?id=` `/news` `/news/detail/?id=`）。アクセスはトップ内（`/#access`）、様式ダウンロードは会社概要内 |
| `app/admin/` | 管理画面。`PostForm.js` が3種類のフォーム、`Photos.js` が写真の追加・並べ替え。権限チェックは PHP 側で毎回行う |
| `public/api/index.php` | API 本体（`?action=`） |
| `public/api/lib.php` | 保存（ファイルロック + rename）、セッション、回数制限、初回のテスト投稿 |
| `public/api/image.php` | `yj-data/uploads/` の画像を配信 |
| `public/files/` | 様式PDF（現HPから引き継ぎ） |
| `deploy/config.sample.php` | `yj-data/config.php` の雛形 |
| `app/globals.css` | 全スタイル（1ファイル。後半が管理画面） |
| `meetings/` `notes/` | 打ち合わせ記録と内部メモ。**Public リポジトリなので `.gitignore` 済み（ローカルのみ）** |

### 投稿データ（`yj-data/posts.json`）

1件 = `id, type, title, body, images[], data{}, sort, published, date, created_at, updated_at`。

- `vehicle`（販売車両）: `title` は「メーカー・名前・ボディ形状」を保存時に自動で組む。詳細項目は `data`。`images[0]` が一覧の写真。数字の項目は**数字だけ**保存し、カンマ・単位・¥は表示時に付ける
- `staff`（スタッフ紹介）: `title`=名前、`body`=メッセージ、`images[0]`=イラスト写真。`sort` の順に並ぶ（管理画面の ↑↓）
- `news`（新着情報）: `title` `body` `images`。一覧は文字だけ

---

## 変更後の検証（必須）

```bash
npm run build
npm audit --omit=dev
```

TypeScript も lint も無いので、検証はビルドと実表示。`next dev` では PHP が動かないので、**`out/` を Apache + PHP で確認する**: `comvace-work/.claude/launch.json` の `yonekawa-jikou`（Docker の `php:8.3-apache` / http://localhost:4330）。データは `yj-data/` を使う。**ビルドしたらコンテナを起動し直す**（`out/` を作り直すとマウントが外れる）。

- 375 / 768 / 1440px で確認する。`document.documentElement.scrollWidth` が画面幅を超えないこと
- 管理画面や API を触ったら、ログイン → 投稿 → 公開ページに反映 → 編集 → 削除 → ログアウトを通す
- ローカルのログイン情報は `.env.local` の `ADMIN_USER` / `ADMIN_PASSWORD`（テスト用）。`yj-data/config.php` にはそのハッシュが入っている
- API の動作を変えたら `public/api/index.php` と `app/lib/review.js` の両方を直す。確認用は `NEXT_PUBLIC_REVIEW=1 npm run build` して `yonekawa-review-static`（http://localhost:4331）で見る
- 全体のスクリーンショットはヘッドレス Chrome が早い（**幅は500px未満にできない**ので、スマホ幅の確認は Browser pane で行う）: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --virtual-time-budget=6000 --window-size=1440,6700 --screenshot=out.png http://localhost:4330/`

---

## デプロイ

1. `NEXT_PUBLIC_SITE_URL=https://（本番ドメイン） npm run build`（`NEXT_PUBLIC_REVIEW` を付けない）
2. `out/` の**中身**を `public_html/` にアップロードする。`.htaccess` は隠しファイルなので FTP ソフトの設定に注意
3. **初回だけ** `public_html` の隣に `yj-data/` を作り、`deploy/config.sample.php` を `config.php` として置く。パスワードのハッシュは次のコマンドで作る（コマンド履歴に残るので、終わったら消す）

```bash
docker run --rm php:8.3-cli php -r 'echo password_hash("ここにパスワード", PASSWORD_DEFAULT), PHP_EOL;'
```

4. https でログイン、投稿、画像アップロードを確認する
5. **公開前チェック**: `yj-data/config.php` の `open_login` が `false`（または無い）こと

- **ドメイン直下かサブドメインに置く**。画像や API は `/img/...` `/api/...` の絶対パスなので、サブディレクトリでは壊れる
- `public_html` の隣に置けないサーバーでは、環境変数 `YJ_DATA_DIR` で場所を指定する
- `posts.json` が無い初回だけ、テスト投稿（車両2・スタッフ2・新着2）が入る。削除すれば戻らない
- 現HPからの切り替え時は、旧URL（`/access/` `/file/` `/estimate/` `/contact/`）が 404 になる。必要ならリダイレクトを `.htaccess` に足す

---

## デザインの決まりごと

要望は「シンプル＋かっこよく」「イラストではなく写真を活用」。最初の案（白地・細い見出し）は**「シンプルすぎて今までのHPと変わらない。ロゴも使って、シンプルかつインパクトのある感じに」**と言われて作り直した（2026-11-17）。おとなしい方向に戻さない。

- 色は `:root` の変数のみ。**白 / 黒（`--ink`）/ 赤（`--red`）**。黒地の上の赤い文字は `#ff5560`（`--red` だと暗くて読めない）。角丸・影は公開側で使わない
- インパクトの出し方は3つに絞る: **大きな斜体の英字**（Barlow Condensed 800 italic。見出し・番号・電話番号）、**斜めの赤**（ヘッダーの電話、バナー、下層の見出し、見出し前の斜線）、**全画面の動画**。これ以外の飾りは足さない
- 動画下のバナー（`.stock-banner`）は**動かす**（2026-11-17「固定でベタ貼りなので、アニメーションで少し目立たせたい」）: 光が斜めに走る、写真がゆっくり寄る、矢印の丸が脈打つ。トップの「SCROLL」表示は不要と言われて削除済み。戻さない
- 日本語は Zen Kaku Gothic New。英字・数字は `.en`
- ヘッダーは黒地。トップだけ、動画の上では透明（`Header.js` の `clear`）
- **米川自工にロゴマークは無い**（2026-11-17 にユーザーが確認。現HPも文字だけ）。赤い平行四辺形の「Y」＋「YONEKAWA JIKOU」（社屋の表記）を文字で組んだものをロゴとして使う（`Parts.js` の `Logo`）。他社（参考サイトのフロンティア等）のロゴを流用しない
- 参考サイトから取り入れた構成: トップは frontierx（全画面動画 → バナー → 会社紹介 → 写真が並ぶ業務内容）、販売車両の詳細は栗山自動車（写真 → 詳細情報 → 文章）、保有車両は現HP（2列・名前の帯 + 大きい写真）
- トップの動画 `public/video/hero.mp4` は IMG_8819 / 0697 / 0712 / 0581 の「車が近い場面」だけを切り出してつないだもの（18秒・音なし）。作り直すときの切り出し位置は `notes/content-sources.md`
- 写真の出典と使い所は `notes/content-sources.md`
- 下層ページの見出しは写真を使わない（黒地 + 大きい英字 + 右に斜めの赤）

---

## 過去に実際に踏んだ罠（再発防止）

- **Drive コネクタで動画を落とせない（2026-11-17）**: `download_file_content` は base64 を会話に返すので、数十MBの動画や写真には使えない。ファイルIDは `search_files`（`title contains 'IMG_xxxx'`）で取り、Chrome で `https://drive.google.com/uc?id=<ID>&export=download` を開くと `~/Downloads` に落ちる（90MB の動画でも確認画面は出なかった）
- **ffmpeg に `drawtext` が無い（2026-11-17）**: Homebrew 版は freetype 無しでビルドされている。コンタクトシートに時刻を焼き込めないので、`fps=12/<長さ>,tile=4x3` で等間隔に並べて位置から時刻を割り出す
- **ヘッドレス Chrome で撮ると栗山自動車は 403、`.reveal` の要素が写らないことがある（2026-11-17）**: 前者は CloudFront がヘッドレスを弾くので、実ブラウザ（Claude in Chrome）で見る。後者は撮影上の問題で、実ブラウザでは表示される。コードの不具合と決めつけず Browser pane で `opacity` を確認する
- **React 19 のフォーム自動リセット、Browser pane で `requestAnimationFrame` が止まる件**は `../yamazaki-kougyo/CLAUDE.md` と同じ（`onSubmit` + `preventDefault`、スライドは `scrollLeft` 直指定かヘッドレスで確認）

---

## 秘密情報

`.env*` と `yj-data/` はコミットしない（`.env.example` のみ可）。Public リポジトリなので、API キーやログイン情報をコードやドキュメントに書かない。
