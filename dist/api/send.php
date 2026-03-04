<?php
/**
 * POST /api/send.php
 * body: { to, toEmail, subject, body, package, fromCity, toCity }
 */
require '_helper.php';
require '_smtp.php';
require '_imap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') err('仅支持 POST', 405);

$sess = require_session();
$cfg  = get_server_config();
$data = body();

$to      = trim($data['to']      ?? '');
$toEmail = trim($data['toEmail'] ?? $data['to'] ?? '');
$subject = trim($data['subject'] ?? '（无主题）');
$body    = trim($data['body']    ?? '');

if (!$to || !$body) err('收件人和内容不能为空');

// 如果 toEmail 不是合法邮箱，尝试从地址簿找
if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
    $contacts = read_data('contacts_' . md5($sess['email']));
    foreach ($contacts as $c) {
        if ($c['name'] === $to && !empty($c['email'])) {
            $toEmail = $c['email'];
            break;
        }
    }
    if (!filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
        err('收件人邮箱地址无效，请填写完整邮箱地址');
    }
}

$trackingId = 'PPO-' . date('Ymd') . '-' . rand(1000, 9999);

// ── 未配置服务器：演示模式 ─────────────────
if (!$cfg) {
    ok(['demo' => true, 'trackingId' => $trackingId]);
}

// ── 真实发送 ───────────────────────────────
try {
    $smtp = new SmtpClient($cfg, $sess['email'], $sess['password']);
    $rawMsg = $smtp->send($to, $toEmail, $subject, $body);

    // 发送成功后把副本存入 IMAP Sent 文件夹
    try {
        $imap = new ImapClient($cfg, $sess['email'], $sess['password']);
        $imap->connect();
        $sentFolder = $imap->getSentFolder();
        $imap->close();
        $imap->appendToSent($sentFolder, $rawMsg);
    } catch (Exception $e2) {
        // IMAP 存副本失败不影响发送成功
        error_log('IMAP append 失败: ' . $e2->getMessage());
    }

    ok(['demo' => false, 'trackingId' => $trackingId, 'success' => true]);
} catch (Exception $e) {
    err('发送失败：' . $e->getMessage());
}
