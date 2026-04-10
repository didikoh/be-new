<?php

use Dotenv\Dotenv;
use Illuminate\Database\Capsule\Manager as Capsule;

require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../app/Support/helpers.php';

$dotenv = Dotenv::createImmutable(dirname(__DIR__));
$dotenv->safeLoad();

date_default_timezone_set(env('APP_TIMEZONE', 'UTC'));

$config = require __DIR__ . '/../config/database.php';
$capsule = new Capsule();
$capsule->addConnection($config);
$capsule->setAsGlobal();
$capsule->bootEloquent();

$dbTimezone = env('DB_TIMEZONE', null);
if ($dbTimezone) {
    $capsule->getConnection()->statement("SET time_zone = '{$dbTimezone}'");
}

return $capsule;
