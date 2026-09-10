<?php

namespace App\Providers;

use App\Services\ConvertImageToWebp;
use Carbon\CarbonImmutable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureImageMacros();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Make WebP storage available anywhere via UploadedFile::storeAsWebp().
     */
    protected function configureImageMacros(): void
    {
        UploadedFile::macro('storeAsWebp', function (
            string $path,
            string $disk = 'public',
            int $quality = 82,
        ): string {
            /** @var UploadedFile $this */
            return app(ConvertImageToWebp::class)->store($this, $path, $disk, $quality);
        });
    }
}
