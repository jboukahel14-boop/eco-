<?php

return [
    'apps' => [
        [
            'app_id' => env('PUSHER_APP_ID'),
            'key' => env('PUSHER_APP_KEY'),
            'secret' => env('PUSHER_APP_SECRET'),
            'enable_client_messages' => false,
            'enable_statistics' => true,
        ],
    ],

    'channels' => [
        'orders' => [
            'auth' => function ($user, $channelName) {
                return $user->isAdmin();
            },
        ],
        'admin' => [
            'auth' => function ($user, $channelName) {
                return $user->isAdmin();
            },
        ],
        'inventory' => [
            'auth' => function ($user, $channelName) {
                return true;
            },
        ],
    ],
];
