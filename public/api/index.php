<?php
// 投稿（販売車両・スタッフ紹介・新着情報）とログインの API。?action= で処理を選ぶ
define('YJ', true);
require __DIR__ . '/lib.php';

const POST_TYPES = ['vehicle', 'staff', 'news'];
// 販売車両の詳細項目。app/lib/vehicle.js と揃える
const VEHICLE_CHOICES = [
    'size' => ['大型', '中型', '小型'],
    'mission' => ['AT', 'MT'],
    'shaken' => ['あり', 'なし'],
    'fuel' => ['軽油', 'ガソリン'],
];
const VEHICLE_NUMBERS = ['year', 'mileage', 'max_load', 'gross_weight', 'length', 'width', 'height', 'recycle'];
const VEHICLE_TEXTS = ['model', 'engine', 'shaken_until'];

$action = $_GET['action'] ?? '';

// ---- 公開 ----
if ($action === 'posts') {
    $type = $_GET['type'] ?? '';
    $posts = array_values(array_filter(all_posts(), fn($p) => $p['published'] && $p['type'] === $type));
    $limit = (int) ($_GET['limit'] ?? 0);
    json_out(['posts' => $limit > 0 ? array_slice($posts, 0, $limit) : $posts]);
}

if ($action === 'post') {
    foreach (all_posts() as $post) {
        if ($post['id'] === ($_GET['id'] ?? '') && in_array($post['type'], ['news', 'vehicle'], true) && $post['published']) {
            json_out(['post' => $post]);
        }
    }
    fail('ページが見つかりません。', 404);
}

// 確認段階だけ使う「パスワード無しで入れる」設定（yj-data/config.php の open_login）。本番公開の前に必ず外す
$openLogin = (config()['open_login'] ?? false) === true;

if ($action === 'login_mode') {
    json_out(['open' => $openLogin]);
}

// 買取見積りフォームの写真（送信前に1枚ずつ受け取る）
if ($action === 'inquiry_upload') {
    require_same_origin_post();
    $key = 'inquiry_upload:' . client_ip();
    if (over_limit($key, 15, 600)) fail('送信が続いています。時間をおいて再度お試しください。', 429);
    record_hit($key, 600);
    json_out(['ref' => save_uploaded_image(inquiry_dir())]);
}

// 買取見積りフォーム・お問合せフォームの受付
if ($action === 'contact') {
    require_same_origin_post();
    $in = json_body();
    // ボット用の隠し項目。入っていたら保存せず成功に見せる
    if (text($in['website'] ?? '') !== '') {
        json_out(['ok' => true]);
    }
    $kind = ($in['kind'] ?? '') === 'estimate' ? 'estimate' : 'contact';
    $row = ['kind' => $kind];
    $limits = ['name' => 100, 'phone' => 30, 'email' => 200, 'company' => 200, 'address' => 300, 'car' => 100, 'maker' => 100,
        'color' => 100, 'model' => 100, 'state' => 5000, 'message' => 5000, 'reply' => 20, 'era' => 10, 'mission' => 10];
    foreach (array_keys(inquiry_labels($kind)) as $key) {
        $value = text($in[$key] ?? '');
        if (in_array($key, ['year', 'month', 'mileage'], true)) {
            $value = str_replace([',', '，', ' ', '　'], '', function_exists('mb_convert_kana') ? mb_convert_kana($value, 'n', 'UTF-8') : $value);
            if ($value !== '' && !preg_match('/^\d{1,9}$/', $value)) fail('年式・走行距離は半角数字で入力してください。');
            $value = $value === '' ? '' : (string) (int) $value;
        } elseif (str_length($value) > $limits[$key]) {
            fail('入力内容が長すぎます。');
        }
        $row[$key] = $value;
    }
    if ($row['name'] === '') fail('お名前を入力してください。');
    if ($row['phone'] === '') fail('電話番号を入力してください。');
    if (!filter_var($row['email'], FILTER_VALIDATE_EMAIL)) fail('メールアドレスを正しく入力してください。');
    $images = [];
    if ($kind === 'estimate') {
        if (!in_array($row['reply'], ['お電話', 'メールアドレス'], true)) fail('折り返し連絡方法を選択してください。');
        if (!in_array($row['era'], ['', '令和', '平成', '昭和'], true) || !in_array($row['mission'], ['', 'AT', 'MT'], true)) fail('選択項目を選び直してください。');
        if ($row['month'] !== '' && ((int) $row['month'] < 1 || (int) $row['month'] > 12)) fail('年式の月は1〜12で入力してください。');
        foreach (array_slice((array) ($in['images'] ?? []), 0, 3) as $ref) {
            if (is_string($ref) && preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $ref) && is_file(inquiry_dir() . "/$ref")) {
                $images[] = $ref;
            }
        }
    } elseif ($row['message'] === '') {
        fail('お問合せ内容を入力してください。');
    }
    $row['images'] = $images;
    $key = 'contact:' . client_ip();
    if (over_limit($key, 5, 600)) fail('送信が続いています。時間をおいて再度お試しください。', 429);
    record_hit($key, 600);

    update_json('inquiries', [], function (array &$list) use ($row) {
        $list[] = $row + ['id' => bin2hex(random_bytes(16)), 'read' => false, 'created_at' => date('c')];
    });
    notify_inquiry($row);
    json_out(['ok' => true]);
}

// ---- 管理 ----
start_admin_session();

if ($action === 'login') {
    require_same_origin_post();
    $key = 'login:' . client_ip();
    if (over_limit($key, 5, 900)) fail('ログインの失敗が続いたため、15分ほど待ってからお試しください。', 429);
    $in = json_body();
    $config = config();
    $user = (string) ($config['user'] ?? '');
    $hash = (string) ($config['password_hash'] ?? '');
    // 設定が無ければ誰もログインできない
    $ok = $openLogin || ($user !== '' && $hash !== ''
        && hash_equals($user, text($in['user'] ?? ''))
        && password_verify((string) ($in['password'] ?? ''), $hash));
    if (!$ok) {
        record_hit($key, 900);
        fail('IDまたはパスワードが違います。', 401);
    }
    clear_hits($key);
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    json_out(['ok' => true]);
}

if ($action === 'logout') {
    require_same_origin_post();
    $_SESSION = [];
    setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => is_https()]);
    session_destroy();
    json_out(['ok' => true]);
}

require_admin();

if ($action === 'me') {
    $unread = count(array_filter(read_json('inquiries', []), fn($q) => !$q['read']));
    json_out(['ok' => true, 'unread' => $unread]);
}

if ($action === 'inquiries') {
    $list = read_json('inquiries', []);
    usort($list, fn($a, $b) => strcmp($b['created_at'], $a['created_at']));
    foreach ($list as $i => $q) {
        $list[$i]['images'] = array_map(fn($name) => "/api/image.php?i=$name", $q['images'] ?? []);
    }
    json_out(['inquiries' => $list]);
}

if ($action === 'inquiry_read') {
    require_same_origin_post();
    $in = json_body();
    update_json('inquiries', [], function (array &$list) use ($in) {
        foreach ($list as $i => $q) {
            if ($q['id'] === ($in['id'] ?? '')) {
                $list[$i]['read'] = ($in['read'] ?? false) === true;
            }
        }
    });
    json_out(['ok' => true]);
}

if ($action === 'inquiry_delete') {
    require_same_origin_post();
    $id = json_body()['id'] ?? '';
    $names = update_json('inquiries', [], function (array &$list) use ($id) {
        foreach ($list as $i => $q) {
            if ($q['id'] === $id) {
                array_splice($list, $i, 1);
                return $q['images'] ?? [];
            }
        }
        return [];
    });
    foreach ($names as $name) {
        if (is_string($name) && preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $name)) {
            @unlink(inquiry_dir() . "/$name");
        }
    }
    json_out(['ok' => true]);
}

if ($action === 'admin_posts') {
    $type = $_GET['type'] ?? '';
    json_out(['posts' => array_values(array_filter(all_posts(), fn($p) => $p['type'] === $type))]);
}

if ($action === 'admin_post') {
    foreach (all_posts() as $post) {
        if ($post['id'] === ($_GET['id'] ?? '')) {
            json_out(['post' => $post]);
        }
    }
    fail('投稿が見つかりません。', 404);
}

if ($action === 'upload') {
    require_same_origin_post();
    json_out(['url' => '/api/image.php?f=' . save_uploaded_image(upload_dir())]);
}

if ($action === 'save_post') {
    require_same_origin_post();
    $in = json_body();
    $type = $in['type'] ?? '';
    if (!in_array($type, POST_TYPES, true)) fail('不正なリクエストです。');
    $id = $in['id'] ?? null;
    if ($id !== null && !valid_id($id)) fail('不正なリクエストです。');

    $title = text($in['title'] ?? '');
    $body = text($in['body'] ?? '');
    $date = text($in['date'] ?? '');
    $images = array_values(array_slice(array_filter((array) ($in['images'] ?? []), 'own_image'), 0, $type === 'staff' ? 1 : 30));
    $data = [];

    if ($type === 'vehicle') {
        $d = is_array($in['data'] ?? null) ? $in['data'] : [];
        foreach (['maker' => 'メーカー', 'name' => '名前', 'body_type' => 'ボディ形状'] as $key => $label) {
            $data[$key] = text($d[$key] ?? '');
            if ($data[$key] === '') fail("{$label}を入力してください。");
            if (str_length($data[$key]) > 40) fail("{$label}は40文字以内にしてください。");
        }
        foreach (VEHICLE_CHOICES as $key => $choices) {
            $data[$key] = text($d[$key] ?? '');
            if (!in_array($data[$key], $choices, true)) fail('選択項目を選び直してください。');
        }
        foreach (VEHICLE_NUMBERS as $key) {
            // 全角数字やカンマ付きで入力されても数字だけにする
            $n = str_replace([',', '，', ' ', '　'], '', function_exists('mb_convert_kana') ? mb_convert_kana(text($d[$key] ?? ''), 'n', 'UTF-8') : text($d[$key] ?? ''));
            if ($n !== '' && !preg_match('/^\d{1,9}$/', $n)) fail('数字の項目は半角数字で入力してください。');
            $data[$key] = $n === '' ? '' : (string) (int) $n;
        }
        foreach (VEHICLE_TEXTS as $key) {
            $data[$key] = text($d[$key] ?? '');
            if (str_length($data[$key]) > 60) fail('入力内容が長すぎます。');
        }
        if ($data['shaken'] !== 'あり') $data['shaken_until'] = '';
        // セールスポイントは改行・スペースをそのまま残す（末尾の空白だけ落とす）
        $sp = is_string($d['sales_point'] ?? null) ? rtrim(str_replace("\r\n", "\n", $d['sales_point'])) : '';
        if (str_length($sp) > 5000) fail('セールスポイントが長すぎます。');
        $data['sales_point'] = $sp;
        $title = "{$data['maker']}・{$data['name']}・{$data['body_type']}";
        $body = '';
        if (!$images) fail('写真を1枚以上入れてください。');
    } elseif ($type === 'staff') {
        if ($title === '') fail('名前を入力してください。');
        if (str_length($title) > 40) fail('名前は40文字以内にしてください。');
        if (str_length($body) > 2000) fail('メッセージが長すぎます。');
    } else {
        if ($title === '') fail('タイトルを入力してください。');
        if (str_length($title) > 120) fail('タイトルは120文字以内にしてください。');
        if (str_length($body) > 20000) fail('本文が長すぎます。');
        if ($body === '' && !$images) fail('本文か写真を入れてください。');
    }
    if (!preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1])) {
        fail('日付を入力してください。');
    }

    $removed = update_json('posts', seed_posts(), function (array &$posts) use ($id, $type, $title, $body, $date, $images, $data, $in) {
        $row = [
            'type' => $type, 'title' => $title, 'body' => $body, 'images' => $images, 'data' => $data,
            'published' => ($in['published'] ?? false) === true, 'date' => $date, 'updated_at' => date('c'),
        ];
        if ($id === null) {
            // スタッフは一番後ろに追加する
            $last = max(array_merge([0], array_map(fn($p) => (int) ($p['sort'] ?? 0), $posts)));
            $posts[] = $row + ['id' => bin2hex(random_bytes(16)), 'sort' => $last + 1, 'created_at' => date('c')];
            return [];
        }
        foreach ($posts as $i => $post) {
            if ($post['id'] === $id && $post['type'] === $type) {
                $posts[$i] = $row + $post;
                return array_values(array_diff($post['images'], $images));
            }
        }
        fail('この投稿は削除されています。', 404);
    });
    delete_images($removed);
    json_out(['ok' => true, 'type' => $type]);
}

// スタッフの並び順を1つ前後に動かす
if ($action === 'move_post') {
    require_same_origin_post();
    $in = json_body();
    $id = $in['id'] ?? '';
    $delta = ($in['delta'] ?? 0) === -1 ? -1 : 1;
    update_json('posts', seed_posts(), function (array &$posts) use ($id, $delta) {
        $staff = array_keys(array_filter($posts, fn($p) => $p['type'] === 'staff'));
        usort($staff, fn($a, $b) => [$posts[$a]['sort'] ?? 0, $posts[$a]['created_at']] <=> [$posts[$b]['sort'] ?? 0, $posts[$b]['created_at']]);
        foreach ($staff as $pos => $i) {
            if ($posts[$i]['id'] === $id && isset($staff[$pos + $delta])) {
                [$staff[$pos], $staff[$pos + $delta]] = [$staff[$pos + $delta], $staff[$pos]];
                break;
            }
        }
        foreach ($staff as $pos => $i) {
            $posts[$i]['sort'] = $pos + 1;
        }
    });
    json_out(['ok' => true]);
}

if ($action === 'delete_post') {
    require_same_origin_post();
    $id = json_body()['id'] ?? '';
    $images = update_json('posts', seed_posts(), function (array &$posts) use ($id) {
        foreach ($posts as $i => $post) {
            if ($post['id'] === $id) {
                array_splice($posts, $i, 1);
                return $post['images'];
            }
        }
        return [];
    });
    delete_images($images);
    json_out(['ok' => true]);
}

fail('不正なリクエストです。', 404);
