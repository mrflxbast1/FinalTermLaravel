<?php

$required = ['ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash', 'mbstring', 'openssl', 'pcre', 'PDO', 'pdo_sqlite', 'session', 'tokenizer', 'xml', 'zip'];

echo implode(', ', array_filter($required, fn ($extension) => ! extension_loaded($extension)));
