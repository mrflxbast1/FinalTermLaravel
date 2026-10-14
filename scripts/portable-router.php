<?php

// Router for the bundled PHP development server; it binds only to loopback.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
if ($uri === '/__stockroom/health') {
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo json_encode(['instance' => getenv('STOCKROOM_INSTANCE')]);

    return true;
}

$public = realpath(__DIR__.'/../public');
$file = realpath($public.'/'.urldecode($uri));
if ($file !== false && str_starts_with($file, $public.DIRECTORY_SEPARATOR)
    && is_file($file) && strtolower(pathinfo($file, PATHINFO_EXTENSION)) !== 'php') {
    return false;
}

require $public.'/index.php';
