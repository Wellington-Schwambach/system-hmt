<?php

$frontendUrls = env(
    'FRONTEND_URLS',
    env('FRONTEND_URL', 'http://localhost:5173')
);

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map(
        static fn (string $url): string => trim($url),
        explode(',', $frontendUrls)
    ))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'X-Session-Expires-At',
        'X-Session-Lifetime-Minutes',
    ],

    'max_age' => 0,

    'supports_credentials' => true,
];
