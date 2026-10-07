<?php

use App\Providers\AppServiceProvider;
use Illuminate\Support\Facades\URL;

test('treats forwarded https as secure behind a cpanel proxy', function () {
    $this->withServerVariables([
        'HTTPS' => 'off',
        'HTTP_X_FORWARDED_PROTO' => 'https',
        'HTTP_X_FORWARDED_PORT' => '443',
        'REMOTE_ADDR' => '127.0.0.1',
    ])->get(route('home'))->assertOk();

    expect(request()->secure())->toBeTrue();
});

test('forces https urls when running in production', function () {
    $this->app->instance('env', 'production');

    $method = new ReflectionMethod(AppServiceProvider::class, 'configureProductionWeb');
    $method->invoke(new AppServiceProvider($this->app));

    expect(URL::to('/contacto'))->toStartWith('https://');
});

test('cpanel deployment files use production-safe defaults', function () {
    expect(base_path('.htaccess'))->toBeFile();
    expect(public_path('.htaccess'))->toBeFile();
    expect(public_path('.user.ini'))->toBeFile();
    expect(base_path('.env.cpanel.example'))->toBeFile();
    expect(base_path('.cpanel.yml'))->toBeFile();

    $env = file_get_contents(base_path('.env.cpanel.example'));

    expect($env)
        ->toContain('APP_ENV=production')
        ->toContain('APP_DEBUG=false')
        ->toContain('APP_NAME="Medical Imaging Group"')
        ->toContain('DB_CONNECTION=mysql')
        ->toContain('SESSION_SECURE_COOKIE=true');

    expect(file_get_contents(base_path('.htaccess')))
        ->toContain('public/$1')
        ->toContain('Require all denied');

    expect(file_get_contents(public_path('.htaccess')))
        ->toContain('X-Forwarded-Proto');

    expect(file_get_contents(base_path('.cpanel.yml')))
        ->toContain('composer install --no-dev')
        ->toContain('artisan optimize');

    $composer = json_decode((string) file_get_contents(base_path('composer.json')), true, flags: JSON_THROW_ON_ERROR);

    expect($composer['scripts']['cpanel:deploy'])
        ->toContain('@php artisan migrate --force --no-interaction')
        ->toContain('@php artisan optimize --no-interaction');
});
