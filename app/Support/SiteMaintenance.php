<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

final class SiteMaintenance
{
    /**
     * @return array{enabled: bool, hours: int, minutes: int, until: string|null}
     */
    public function status(): array
    {
        $this->deactivateIfExpired();

        return $this->read();
    }

    public function isActive(): bool
    {
        return $this->status()['enabled'];
    }

    public function activate(int $hours, int $minutes): void
    {
        $until = now()->addMinutes(($hours * 60) + $minutes);

        $this->write([
            'enabled' => true,
            'hours' => $hours,
            'minutes' => $minutes,
            'until' => $until->toIso8601String(),
        ]);
    }

    public function deactivate(): void
    {
        $current = $this->read();

        $this->write([
            'enabled' => false,
            'hours' => $current['hours'],
            'minutes' => $current['minutes'],
            'until' => null,
        ]);
    }

    public function path(): string
    {
        return storage_path('framework/site-maintenance.json');
    }

    private function deactivateIfExpired(): void
    {
        $payload = $this->read();

        if (! $payload['enabled'] || $payload['until'] === null) {
            return;
        }

        if (Carbon::parse($payload['until'])->lessThanOrEqualTo(now())) {
            $this->deactivate();
        }
    }

    /**
     * @return array{enabled: bool, hours: int, minutes: int, until: string|null}
     */
    private function read(): array
    {
        if (! File::exists($this->path())) {
            return $this->defaults();
        }

        /** @var array<string, mixed> $decoded */
        $decoded = json_decode(File::get($this->path()), true) ?? [];

        return [
            'enabled' => (bool) ($decoded['enabled'] ?? false),
            'hours' => max(0, (int) ($decoded['hours'] ?? 0)),
            'minutes' => max(0, (int) ($decoded['minutes'] ?? 30)),
            'until' => isset($decoded['until']) && is_string($decoded['until']) && $decoded['until'] !== ''
                ? $decoded['until']
                : null,
        ];
    }

    /**
     * @param  array{enabled: bool, hours: int, minutes: int, until: string|null}  $payload
     */
    private function write(array $payload): void
    {
        File::ensureDirectoryExists(dirname($this->path()));
        File::put(
            $this->path(),
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES).PHP_EOL,
        );
    }

    /**
     * @return array{enabled: bool, hours: int, minutes: int, until: string|null}
     */
    private function defaults(): array
    {
        return [
            'enabled' => false,
            'hours' => 0,
            'minutes' => 30,
            'until' => null,
        ];
    }
}
