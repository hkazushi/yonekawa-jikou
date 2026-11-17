<?php
// サーバーの yj-data/config.php としてコピーして使う（公開フォルダの外。Git に入れない）
return [
    // ログインID
    'user' => 'ここにログインID',
    // パスワードのハッシュ。作り方は CLAUDE.md の「デプロイ」を参照
    'password_hash' => 'ここにハッシュ',
    // true にすると、ID・パスワード無しで管理画面に入れる（お客さんの確認段階だけ）。本番公開の前に必ず false にする
    'open_login' => false,
];
