<?php
/**
 * 公共工具函数
 */

// 禁止 PHP 错误以 HTML 形式污染 JSON 响应
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/php_error.log');

// CORS 头（允许前端跨域调用）
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Session-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── 响应工具 ──────────────────────────────
function ok($data = null) {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function err($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── 请求工具 ──────────────────────────────
function body() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

function get($key, $default = null) {
    return isset($_GET[$key]) ? trim($_GET[$key]) : $default;
}

// ── 服务器配置 ────────────────────────────
function get_server_config() {
    $f = __DIR__ . '/server.json';
    if (!file_exists($f)) return null;
    $cfg = json_decode(file_get_contents($f), true);
    return ($cfg && !empty($cfg['host'])) ? $cfg : null;
}

function save_server_config($cfg) {
    file_put_contents(__DIR__ . '/server.json', json_encode($cfg, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// ── 会话验证 ──────────────────────────────
function get_session() {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? ($_GET['token'] ?? '');
    if (!$token) return null;
    $f = __DIR__ . '/sessions/' . preg_replace('/[^a-zA-Z0-9]/', '', $token) . '.json';
    if (!file_exists($f)) return null;
    $sess = json_decode(file_get_contents($f), true);
    // 24小时过期
    if (time() - $sess['created'] > 86400) {
        unlink($f);
        return null;
    }
    return $sess;
}

function require_session() {
    $sess = get_session();
    if (!$sess) err('未登录，请重新登录', 401);
    return $sess;
}

function create_session($email, $password) {
    @mkdir(__DIR__ . '/sessions', 0755, true);
    $token = bin2hex(random_bytes(16));
    $sess = ['token' => $token, 'email' => $email, 'password' => $password, 'created' => time()];
    file_put_contents(__DIR__ . '/sessions/' . $token . '.json', json_encode($sess));
    return $token;
}

// ── 数据文件存储（联系人等） ───────────────
function read_data($name) {
    $f = __DIR__ . '/data/' . $name . '.json';
    if (!file_exists($f)) return [];
    return json_decode(file_get_contents($f), true) ?: [];
}

function write_data($name, $data) {
    @mkdir(__DIR__ . '/data', 0755, true);
    file_put_contents(__DIR__ . '/data/' . $name . '.json',
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}
