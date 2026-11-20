<?php
// 共通処理。データは公開フォルダの外（既定: public_html の隣の yj-data/）に置く
if (!defined('YJ')) {
    http_response_code(404);
    exit;
}

date_default_timezone_set('Asia/Tokyo');

const IMAGE_URL_PATTERN = '#^/api/image\.php\?f=([a-f0-9]{32}\.(?:jpg|png|webp))$#';

function data_dir(): string
{
    $dir = getenv('YJ_DATA_DIR') ?: dirname(__DIR__, 2) . '/yj-data';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        fail('データ用フォルダを作成できません。', 500);
    }
    // 公開領域に置かれてしまった場合の保険
    $guard = $dir . '/.htaccess';
    if (!is_file($guard)) {
        @file_put_contents($guard, "Require all denied\n");
    }
    return $dir;
}

function upload_dir(): string
{
    $dir = data_dir() . '/uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        fail('画像用フォルダを作成できません。', 500);
    }
    return $dir;
}

// 買取見積りフォームに添付された車の写真。個人情報に準じるので、管理画面にログインした人にだけ見せる
function inquiry_dir(): string
{
    $dir = data_dir() . '/inquiry-uploads';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        fail('画像用フォルダを作成できません。', 500);
    }
    return $dir;
}

// 受け取ったファイルが画像か確かめて保存し、ファイル名を返す
function save_uploaded_image(string $dir): string
{
    $file = $_FILES['file'] ?? null;
    if (!$file || !is_uploaded_file($file['tmp_name'] ?? '') || ($file['error'] ?? 1) !== UPLOAD_ERR_OK) {
        fail('画像を受け取れませんでした。');
    }
    if ($file['size'] > 8 * 1024 * 1024) fail('画像が大きすぎます。', 413);
    $info = @getimagesize($file['tmp_name']);
    $ext = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp'][$info[2] ?? 0] ?? null;
    if (!$ext) fail('JPEG / PNG / WebP の画像を選んでください。', 415);
    $name = bin2hex(random_bytes(16)) . ".$ext";
    if (!move_uploaded_file($file['tmp_name'], "$dir/$name")) {
        fail('画像を保存できませんでした。', 500);
    }
    return $name;
}

function config(): array
{
    static $config = null;
    if ($config === null) {
        $file = data_dir() . '/config.php';
        $config = is_file($file) ? require $file : [];
    }
    return is_array($config) ? $config : [];
}

function json_out(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    json_out(['error' => $message], $status);
}

function str_length(string $s): int
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

function text($value): string
{
    return is_string($value) ? trim($value) : '';
}

function read_json(string $name, $default)
{
    $file = data_dir() . "/$name.json";
    if (!is_file($file)) {
        return $default;
    }
    $data = json_decode((string) file_get_contents($file), true);
    // 壊れたファイルを空として扱うと、次の保存で全データを消してしまう
    if (!is_array($data)) {
        fail('データファイルを読み込めません。', 500);
    }
    return $data;
}

// 排他ロックの中で読み込み→変更→保存する。一時ファイルからの rename で途中状態を残さない
function update_json(string $name, $default, callable $change)
{
    $dir = data_dir();
    $lock = fopen("$dir/$name.lock", 'c');
    if (!$lock || !flock($lock, LOCK_EX)) {
        fail('データを保存できません。', 500);
    }
    try {
        $data = read_json($name, $default);
        $result = $change($data);
        $tmp = "$dir/$name." . bin2hex(random_bytes(6)) . '.tmp';
        $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if ($json === false || file_put_contents($tmp, $json) === false || !rename($tmp, "$dir/$name.json")) {
            @unlink($tmp);
            fail('データを保存できません。', 500);
        }
        return $result;
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

// お客さんに見せるためのテスト投稿。posts.json が無い初回だけ入り、削除すれば戻らない
function seed_posts(): array
{
    $at = '2026-11-17T09:00:00+09:00';
    $post = fn(string $id, string $type, string $title, string $date, array $images, string $body = '', array $data = [], int $sort = 0) => [
        'id' => $id, 'type' => $type, 'title' => $title, 'body' => $body, 'images' => $images, 'data' => $data, 'sort' => $sort,
        'published' => true, 'date' => $date, 'created_at' => $at, 'updated_at' => $at,
    ];
    $vehicle = fn(string $maker, string $name, string $body, array $more) => $more + [
        'maker' => $maker, 'name' => $name, 'body_type' => $body,
    ];
    return [
        $post('sample-vehicle-1', 'vehicle', 'いすゞ・フォワード・アルミウイング', '2026-11-17', ['/img/photo-line-1.jpg', '/img/photo-line-2.jpg', '/img/photo-yard.jpg'], '', $vehicle('いすゞ', 'フォワード', 'アルミウイング', [
            'size' => '中型', 'year' => '2018', 'mileage' => '356000', 'model' => 'TKG-FRR90S2', 'engine' => '4HK1', 'mission' => 'MT',
            'max_load' => '2700', 'gross_weight' => '7990', 'length' => '858', 'width' => '249', 'height' => '343',
            'shaken' => 'あり', 'shaken_until' => '令和9年3月まで', 'fuel' => '軽油', 'recycle' => '11170', 'price' => 'ご相談ください',
            'sales_point' => "※これはテスト投稿です。数値はすべて仮のものです。\n\n・写真は複数枚登録でき、スライドで表示されます\n・改行や　スペース、記号（★◎→）もそのまま表示されます",
        ])),
        $post('sample-vehicle-2', 'vehicle', '三菱ふそう・スーパーグレート・冷凍バン', '2026-11-10', ['/img/photo-line-3.jpg'], '', $vehicle('三菱ふそう', 'スーパーグレート', '冷凍バン', [
            'size' => '大型', 'year' => '2016', 'mileage' => '812000', 'model' => '', 'engine' => '', 'mission' => 'AT',
            'max_load' => '13200', 'gross_weight' => '24980', 'length' => '1199', 'width' => '249', 'height' => '379',
            'shaken' => 'なし', 'shaken_until' => '', 'fuel' => '軽油', 'recycle' => '', 'price' => 'ご相談ください',
            'sales_point' => '※これはテスト投稿です（写真1枚の例）。',
        ])),
        $post('sample-staff-1', 'staff', 'スタッフ名（テスト投稿）', '2026-11-17', [], 'ここにメッセージが入ります。お名前・イラスト写真・メッセージの3つを登録できます。', [], 1),
        $post('sample-staff-2', 'staff', 'スタッフ名 2（テスト投稿）', '2026-11-17', [], '並び順は管理画面の「↑」「↓」で入れ替えられます。', [], 2),
        $post('sample-news-1', 'news', 'ホームページをリニューアルしました（テスト投稿）', '2026-11-17', [], "株式会社米川自工のホームページをリニューアルしました。\n販売車両や新着情報を掲載してまいります。"),
        $post('sample-news-2', 'news', '写真付きのお知らせ（テスト投稿）', '2026-11-10', ['/img/photo-container.jpg'], '新着情報は、文章だけでも、写真付きでも投稿できます。'),
    ];
}

// スタッフは並び順、それ以外は日付の新しい順。
// 種類が違うもの同士は種類で分ける（比べ方が混ざると並びが崩れる。api/_logic.js と揃える）
function all_posts(): array
{
    $posts = read_json('posts', seed_posts());
    usort($posts, function ($a, $b) {
        if ($a['type'] !== $b['type']) {
            return strcmp($a['type'], $b['type']);
        }
        return $a['type'] === 'staff'
            ? [$a['sort'] ?? 0, $a['created_at']] <=> [$b['sort'] ?? 0, $b['created_at']]
            : [$b['date'], $b['created_at']] <=> [$a['date'], $a['created_at']];
    });
    return $posts;
}

function valid_id($id): bool
{
    return is_string($id) && preg_match('/^[a-z0-9-]{1,64}$/', $id) === 1;
}

function own_image($url): bool
{
    return is_string($url)
        && (preg_match('#^/img/[\w.-]+$#', $url) === 1 || preg_match(IMAGE_URL_PATTERN, $url) === 1);
}

function delete_images(array $urls): void
{
    foreach ($urls as $url) {
        if (is_string($url) && preg_match(IMAGE_URL_PATTERN, $url, $m)) {
            @unlink(upload_dir() . '/' . $m[1]);
        }
    }
}

// 総当たりやスパムを遅らせるための回数制限（IPごと）
function over_limit(string $key, int $max, int $seconds): bool
{
    $hits = read_json('rate', [])[hash('sha256', $key)] ?? [];
    return count(array_filter($hits, fn($t) => $t > time() - $seconds)) >= $max;
}

function record_hit(string $key, int $seconds): void
{
    update_json('rate', [], function (array &$rate) use ($key, $seconds) {
        $now = time();
        foreach ($rate as $k => $hits) {
            $rate[$k] = array_values(array_filter($hits, fn($t) => $t > $now - 86400));
            if (!$rate[$k]) {
                unset($rate[$k]);
            }
        }
        $rate[hash('sha256', $key)][] = $now;
    });
}

function clear_hits(string $key): void
{
    update_json('rate', [], function (array &$rate) use ($key) {
        unset($rate[hash('sha256', $key)]);
    });
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function start_admin_session(): void
{
    $dir = data_dir() . '/sessions';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    session_save_path($dir);
    $lifetime = 60 * 60 * 24 * 7;
    ini_set('session.gc_maxlifetime', (string) $lifetime);
    ini_set('session.gc_probability', '1');
    ini_set('session.gc_divisor', '100');
    ini_set('session.use_strict_mode', '1');
    session_name('yj_admin');
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'httponly' => true,
        'samesite' => 'Strict',
        'secure' => is_https(),
    ]);
    session_start();
}

function is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https';
}

function is_admin(): bool
{
    return !empty($_SESSION['admin']);
}

function require_admin(): void
{
    if (!is_admin()) {
        fail('ログインしてください。', 401);
    }
}

// 別サイトからの送信を拒否する。専用ヘッダーは別オリジンから付けられない
function require_same_origin_post(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        fail('不正なリクエストです。', 405);
    }
    if (($_SERVER['HTTP_X_YJ_REQUEST'] ?? '') !== '1') {
        fail('不正なリクエストです。', 403);
    }
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $parts = parse_url($origin);
        $host = ($parts['host'] ?? '') . (isset($parts['port']) ? ':' . $parts['port'] : '');
        if (!hash_equals((string) ($_SERVER['HTTP_HOST'] ?? ''), $host)) {
            fail('不正なリクエストです。', 403);
        }
    }
}

function json_body(): array
{
    $body = json_decode((string) file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

// フォームの通知メール。config.php の notify_to と mail_from が両方あるときだけ送る。失敗しても受付は成立させる
function notify_inquiry(array $row): void
{
    $to = config()['notify_to'] ?? '';
    $from = config()['mail_from'] ?? '';
    if ($to === '' || $from === '' || !function_exists('mb_send_mail')) {
        return;
    }
    mb_language('uni');
    mb_internal_encoding('UTF-8');
    $oneLine = fn(string $s) => str_replace(["\r", "\n"], ' ', $s);
    $kind = $row['kind'] === 'estimate' ? '買取見積り' : 'お問合せ';
    $lines = ["ホームページの{$kind}フォームから送信がありました。", ''];
    foreach (inquiry_labels($row['kind']) as $key => $label) {
        $value = $key === 'year' ? inquiry_year($row) : (string) ($row[$key] ?? '');
        if ($key === 'mileage' && $value !== '') $value = number_format((int) $value) . ' km';
        if ($value !== '' && !in_array($key, ['era', 'month'], true)) {
            $lines[] = "{$label}: {$value}";
        }
    }
    if ($row['images']) {
        $lines[] = '車の画像: ' . count($row['images']) . '枚（管理画面の「お問合せ」で確認できます）';
    }
    $headers = 'From: ' . $oneLine($from) . "\r\nReply-To: " . $oneLine($row['email']);
    if (!@mb_send_mail($to, "【HP】{$kind}（" . $oneLine($row['name']) . '様）', implode("\n", $lines) . "\n", $headers)) {
        error_log('yj: inquiry notify failed');
    }
}

// フォームの項目と表示名。app/lib/inquiry.js と api/_logic.js と揃える
function inquiry_labels(string $kind): array
{
    $common = ['name' => 'お名前', 'phone' => '電話番号', 'email' => 'メールアドレス'];
    return $kind === 'estimate'
        ? $common + [
            'company' => '会社名', 'address' => '住所', 'reply' => '折り返し連絡方法', 'car' => '車種', 'maker' => 'メーカー',
            'era' => '年式（年号）', 'year' => '年式', 'month' => '年式（月）', 'color' => 'カラー', 'mileage' => '走行距離',
            'model' => '型式', 'mission' => 'オートマ／マニュアル', 'state' => '今の状態',
        ]
        : $common + ['message' => 'お問合せ内容'];
}

function inquiry_year(array $row): string
{
    if (($row['year'] ?? '') === '') return '';
    return ($row['era'] ?? '') . $row['year'] . '年' . (($row['month'] ?? '') !== '' ? $row['month'] . '月' : '');
}
