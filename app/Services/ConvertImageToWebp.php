<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class ConvertImageToWebp
{
    private const SUPPORTED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/x-ms-bmp',
    ];

    /**
     * Convert an uploaded image to a WebP UploadedFile instance.
     */
    public function convertUploadedFile(UploadedFile $file, int $quality = 82): UploadedFile
    {
        if (! $file->isValid()) {
            return $file;
        }

        if (! $this->isConvertibleImage($file)) {
            return $file;
        }

        if ($file->getMimeType() === 'image/webp' && strtolower($file->getClientOriginalExtension()) === 'webp') {
            return $file;
        }

        $temporaryWebp = $this->createTemporaryWebpPath();

        $this->convertPathToWebp($file->getPathname(), $temporaryWebp, $quality);

        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.webp';

        return new UploadedFile(
            $temporaryWebp,
            $originalName,
            'image/webp',
            null,
            true,
        );
    }

    /**
     * Store an uploaded image as WebP on the given disk.
     */
    public function store(UploadedFile $file, string $directory, string $disk = 'public', int $quality = 82): string
    {
        $webpFile = $this->convertUploadedFile($file, $quality);
        $filename = Str::uuid()->toString().'.webp';
        $directory = trim($directory, '/');
        $path = $directory === '' ? $filename : $directory.'/'.$filename;

        Storage::disk($disk)->put($path, File::get($webpFile->getRealPath()));

        return $path;
    }

    /**
     * Convert an existing image file on disk to WebP.
     *
     * @return string Absolute path to the generated WebP file
     */
    public function convertPathToWebp(string $sourcePath, ?string $destinationPath = null, int $quality = 82): string
    {
        if (! is_file($sourcePath)) {
            throw new InvalidArgumentException("Image file not found: {$sourcePath}");
        }

        if (! function_exists('imagewebp')) {
            throw new RuntimeException('PHP GD WebP support is required to convert images.');
        }

        $destinationPath ??= $this->webpPathFor($sourcePath);

        $image = $this->createImageResource($sourcePath);

        if ($image === false) {
            throw new RuntimeException("Unable to read image: {$sourcePath}");
        }

        if (! imageistruecolor($image)) {
            $trueColor = imagecreatetruecolor(imagesx($image), imagesy($image));

            if ($trueColor === false) {
                imagedestroy($image);

                throw new RuntimeException('Unable to create truecolor image canvas.');
            }

            imagealphablending($trueColor, false);
            imagesavealpha($trueColor, true);
            $transparent = imagecolorallocatealpha($trueColor, 0, 0, 0, 127);
            imagefilledrectangle($trueColor, 0, 0, imagesx($image), imagesy($image), $transparent);
            imagecopy($trueColor, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
            imagedestroy($image);
            $image = $trueColor;
        } else {
            imagealphablending($image, true);
            imagesavealpha($image, true);
        }

        $directory = dirname($destinationPath);

        if (! is_dir($directory)) {
            File::ensureDirectoryExists($directory);
        }

        $converted = imagewebp($image, $destinationPath, max(0, min(100, $quality)));
        imagedestroy($image);

        if ($converted === false) {
            throw new RuntimeException("Unable to write WebP image: {$destinationPath}");
        }

        return $destinationPath;
    }

    public function isConvertibleImage(UploadedFile $file): bool
    {
        $mime = $file->getMimeType();

        return $mime !== null && in_array($mime, self::SUPPORTED_MIMES, true);
    }

    public function webpPathFor(string $sourcePath): string
    {
        return preg_replace('/\.[^.]+$/', '', $sourcePath).'.webp';
    }

    /**
     * @return \GdImage|false
     */
    private function createImageResource(string $sourcePath): object|false
    {
        $mime = mime_content_type($sourcePath) ?: '';

        return match ($mime) {
            'image/jpeg', 'image/jpg' => imagecreatefromjpeg($sourcePath),
            'image/png' => imagecreatefrompng($sourcePath),
            'image/gif' => imagecreatefromgif($sourcePath),
            'image/webp' => imagecreatefromwebp($sourcePath),
            'image/bmp', 'image/x-ms-bmp', 'image/x-windows-bmp' => function_exists('imagecreatefrombmp')
                ? imagecreatefrombmp($sourcePath)
                : false,
            default => false,
        };
    }

    private function createTemporaryWebpPath(): string
    {
        $path = tempnam(sys_get_temp_dir(), 'webp_');

        if ($path === false) {
            throw new RuntimeException('Unable to create temporary WebP file.');
        }

        $webpPath = $path.'.webp';
        File::move($path, $webpPath);

        return $webpPath;
    }
}
