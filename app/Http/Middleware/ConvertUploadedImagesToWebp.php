<?php

namespace App\Http\Middleware;

use App\Services\ConvertImageToWebp;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Symfony\Component\HttpFoundation\Response;

class ConvertUploadedImagesToWebp
{
    public function __construct(private ConvertImageToWebp $converter) {}

    /**
     * Convert every uploaded image in the request to WebP before controllers run.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->files->count() === 0) {
            return $next($request);
        }

        $converted = $this->convertFiles($request->allFiles());

        $request->files->replace($converted);

        return $next($request);
    }

    /**
     * @param  array<string, mixed>  $files
     * @return array<string, mixed>
     */
    private function convertFiles(array $files): array
    {
        foreach ($files as $key => $file) {
            if (is_array($file)) {
                $files[$key] = $this->convertFiles($file);

                continue;
            }

            if ($file instanceof UploadedFile) {
                $files[$key] = $this->converter->convertUploadedFile($file);
            }
        }

        return $files;
    }
}
