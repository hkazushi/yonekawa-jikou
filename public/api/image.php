<?php
// アップロード画像の配信。実体は公開フォルダの外にあるので、デプロイで上書きしても消えない
//   ?f= 投稿の写真（誰でも見られる）
//   ?i= フォームに添付された写真（管理画面にログインした人だけ）
define('YJ', true);
require __DIR__ . '/lib.php';

$private = isset($_GET['i']);
$name = $private ? $_GET['i'] : ($_GET['f'] ?? '');
if (!is_string($name) || !preg_match('/^[a-f0-9]{32}\.(jpg|png|webp)$/', $name, $m)) {
    http_response_code(404);
    exit;
}
if ($private) {
    start_admin_session();
    if (!is_admin()) {
        http_response_code(404);
        exit;
    }
    session_write_close();
}
$file = ($private ? inquiry_dir() : upload_dir()) . "/$name";
if (!is_file($file)) {
    http_response_code(404);
    exit;
}
header('Content-Type: ' . ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp'][$m[1]]);
header('Content-Length: ' . filesize($file));
header('Cache-Control: ' . ($private ? 'private, no-store' : 'public, max-age=31536000, immutable'));
header('X-Content-Type-Options: nosniff');
readfile($file);
