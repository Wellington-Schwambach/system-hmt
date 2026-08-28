<?php

return [
    'admin' => [
        'name' => env('ADMIN_NAME', 'Administrador'),
        'username' => env('ADMIN_USERNAME', 'admin'),
        'password' => env('ADMIN_PASSWORD'),
    ],

    'security' => [
        'max_failed_login_attempts' => (int) env('LOGIN_MAX_FAILED_ATTEMPTS', 10),
        'login_attempt_window_minutes' => (int) env('LOGIN_ATTEMPT_WINDOW_MINUTES', 15),
        'login_block_minutes' => (int) env('LOGIN_BLOCK_MINUTES', 30),
    ],

    'access' => [
        'permissions' => [
            'dashboard' => [
                'label' => 'Dashboard',
                'group' => 'Operação',
                'path' => '/dashboard',
            ],
            'bi' => [
                'label' => 'BI Operacional',
                'group' => 'Operação',
                'path' => '/bi',
            ],
            'registrations.vehicles' => [
                'label' => 'Cadastros > Veículos',
                'group' => 'Cadastros',
                'path' => '/cadastros/veiculos',
            ],
            'registrations.employees' => [
                'label' => 'Cadastros > Colaboradores',
                'group' => 'Cadastros',
                'path' => '/cadastros/colaboradores',
            ],
            'registrations.shippers' => [
                'label' => 'Cadastros > Embarcadores',
                'group' => 'Cadastros',
                'path' => '/cadastros/embarcadores',
            ],
            'registrations.company' => [
                'label' => 'Cadastros > Empresa',
                'group' => 'Cadastros',
                'path' => '/cadastros/empresa',
            ],
            'vehicle_sets' => [
                'label' => 'Conjuntos de veículos',
                'group' => 'Operação',
                'path' => '/conjuntos',
            ],
            'fuel' => [
                'label' => 'Combustível',
                'group' => 'Operação',
                'path' => '/fuel',
            ],
            'travel' => [
                'label' => 'Viagens',
                'group' => 'Operação',
                'path' => '/travel',
            ],
            'settlements' => [
                'label' => 'Acertos',
                'group' => 'Financeiro',
                'path' => '/acertos',
            ],
            'finance' => [
                'label' => 'Financeiro',
                'group' => 'Financeiro',
                'path' => '/finance',
            ],
            'maintenance' => [
                'label' => 'Manutenção',
                'group' => 'Operação',
                'path' => '/maintenance',
            ],
            'logistics' => [
                'label' => 'Logística',
                'group' => 'Operação',
                'path' => '/logistic',
            ],
            'admin.security' => [
                'label' => 'Segurança e usuários',
                'group' => 'Administração',
                'path' => '/admin/seguranca',
            ],
        ],

        'profiles' => [
            'Administrador' => [
                'label' => 'Administrador',
                'description' => 'Acesso total ao sistema, usuários e segurança.',
                'permissions' => [
                    'dashboard',
                    'bi',
                    'registrations.vehicles',
                    'registrations.employees',
                    'registrations.shippers',
                    'registrations.company',
                    'fuel',
                    'travel',
                    'vehicle_sets',
                    'settlements',
                    'finance',
                    'maintenance',
                    'logistics',
                    'admin.security',
                ],
            ],
            'Gestor' => [
                'label' => 'Gestor',
                'description' => 'Acesso amplo à operação e aos indicadores, sem administrar usuários.',
                'permissions' => [
                    'dashboard',
                    'bi',
                    'registrations.vehicles',
                    'registrations.employees',
                    'registrations.shippers',
                    'registrations.company',
                    'fuel',
                    'travel',
                    'vehicle_sets',
                    'settlements',
                    'finance',
                    'maintenance',
                    'logistics',
                ],
            ],
            'Operador' => [
                'label' => 'Operador',
                'description' => 'Rotinas operacionais e cadastros essenciais.',
                'permissions' => [
                    'dashboard',
                    'registrations.vehicles',
                    'registrations.employees',
                    'registrations.shippers',
                    'registrations.company',
                    'fuel',
                    'travel',
                    'vehicle_sets',
                    'settlements',
                    'maintenance',
                    'logistics',
                ],
            ],
            'Visualizador' => [
                'label' => 'Visualizador',
                'description' => 'Consulta ao painel e indicadores, sem rotinas de alteração.',
                'permissions' => [
                    'dashboard',
                    'bi',
                ],
            ],
        ],
    ],
];
