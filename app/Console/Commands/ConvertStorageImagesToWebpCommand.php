<?php

namespace App\Console\Commands;

use App\Models\Modulo;
use App\Services\ConvertImageToWebp;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Finder\Finder;

class ConvertStorageImagesToWebpCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'images:to-webp
                            {--disk=maquinas : Filesystem disk to scan (maquinas = public/Imagen/Maquinas)}
                            {--path= : Optional relative path inside the disk}
                            {--delete-original : Delete the original file after conversion}
                            {--quality=82 : WebP quality from 0 to 100}';

    /**
     * @var string
     */
    protected $description = 'Convert existing stored images to WebP (default: public/Imagen/Maquinas)';

    public function handle(ConvertImageToWebp $converter): int
    {
        $disk = (string) $this->option('disk');
        $relativePath = trim((string) $this->option('path'), '/');
        $deleteOriginal = (bool) $this->option('delete-original');
        $quality = (int) $this->option('quality');

        $root = Storage::disk($disk)->path($relativePath === '' ? '' : $relativePath);

        if (! is_dir($root)) {
            $this->error("Path not found on disk [{$disk}]: {$root}");

            return self::FAILURE;
        }

        $finder = Finder::create()
            ->files()
            ->in($root)
            ->name('/\.(jpe?g|png|gif|bmp)$/i');

        $converted = 0;

        foreach ($finder as $file) {
            $sourcePath = $file->getRealPath();

            if ($sourcePath === false) {
                continue;
            }

            $webpPath = $converter->convertPathToWebp($sourcePath, null, $quality);
            $converted++;

            $sourceRelative = $this->toDiskRelativePath($root, $sourcePath, $relativePath);
            $webpRelative = preg_replace('/\.[^.]+$/', '', $sourceRelative).'.webp';
            $dbSource = $this->toDatabaseImagePath($disk, $sourceRelative);
            $dbWebp = $this->toDatabaseImagePath($disk, $webpRelative);

            Modulo::query()
                ->where('imagen', $dbSource)
                ->update(['imagen' => $dbWebp]);

            if ($deleteOriginal && is_file($sourcePath) && $sourcePath !== $webpPath) {
                File::delete($sourcePath);
            }

            $this->line("Converted: {$dbSource} -> {$dbWebp}");
        }

        $this->info("Done. {$converted} image(s) converted to WebP.");

        return self::SUCCESS;
    }

    private function toDiskRelativePath(string $root, string $absolutePath, string $relativeBase): string
    {
        $normalizedRoot = rtrim(str_replace('\\', '/', $root), '/');
        $normalizedAbsolute = str_replace('\\', '/', $absolutePath);
        $relative = ltrim(substr($normalizedAbsolute, strlen($normalizedRoot)), '/');

        if ($relativeBase === '') {
            return $relative;
        }

        return trim($relativeBase, '/').'/'.$relative;
    }

    private function toDatabaseImagePath(string $disk, string $diskRelative): string
    {
        if ($disk === 'maquinas') {
            return 'Imagen/Maquinas/'.ltrim($diskRelative, '/');
        }

        return $diskRelative;
    }
}
