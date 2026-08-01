<?php
require_once __DIR__ . '/handler.php';

$port = getenv('PORT') ?: '8080';

$cmd = sprintf("php -S 0.0.0.0:%s %s", $port, __FILE__);

if (php_sapi_name() !== 'cli-server') {
    passthru($cmd);
    exit;
}

$uri = $_SERVER['REQUEST_URI'];
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method Not Allowed"]);
    exit;
}

$rawInput = file_get_contents('php://input');
$event = json_decode($rawInput, true) ?? [];

try {
    $result = handle($event);
    header('Content-Type: application/json');
    echo json_encode(["success" => true, "result" => result]);
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}