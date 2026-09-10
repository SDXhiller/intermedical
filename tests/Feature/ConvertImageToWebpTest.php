<?php

use App\Models\Status;
use App\Models\UserAdmin;
use App\Services\ConvertImageToWebp;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    Storage::fake('maquinas');
});

test('convert image service stores uploads as webp', function () {
    $png = createTemporaryPngUpload('equipo.png');

    $path = app(ConvertImageToWebp::class)->store($png, 'modulos');

    expect($path)->toEndWith('.webp');
    Storage::disk('public')->assertExists($path);
});

test('uploaded file storeAsWebp macro stores webp files', function () {
    $png = createTemporaryPngUpload('rayos.png');

    $path = $png->storeAsWebp('modulos');

    expect($path)->toEndWith('.webp');
    Storage::disk('public')->assertExists($path);
});

test('admin modulo uploads are stored as webp through the full request stack', function () {
    $this->seed(\Database\Seeders\StatusSeeder::class);

    $admin = UserAdmin::factory()->create();
    $activo = Status::query()->where('nombre', 'Activo')->firstOrFail();
    $png = createTemporaryPngUpload('ultrasonido.png');

    $this->actingAs($admin, 'admin')
        ->post(route('admin.equipos.store'), [
            'modulo' => 'Ultrasonido',
            'slug' => 'ultrasonido-webp',
            'descripcion' => 'Prueba webp',
            'estatus_id' => $activo->id,
            'imagen' => $png,
        ])
        ->assertRedirect(route('admin.equipos.create'));

    $modulo = \App\Models\Modulo::query()->where('slug', 'ultrasonido-webp')->first();

    expect($modulo)->not->toBeNull()
        ->and($modulo->imagen)->toStartWith('Imagen/Maquinas/')
        ->and($modulo->imagen)->toEndWith('.webp');

    $filename = basename($modulo->imagen);
    Storage::disk('maquinas')->assertExists($filename);

    $contents = Storage::disk('maquinas')->get($filename);
    expect(str_starts_with($contents, 'RIFF'))->toBeTrue()
        ->and(str_contains(substr($contents, 0, 16), 'WEBP'))->toBeTrue();
});

test('convert image service converts an existing png file to webp', function () {
    $source = tempnam(sys_get_temp_dir(), 'src_');
    expect($source)->not->toBeFalse();

    $image = imagecreatetruecolor(12, 12);
    imagefilledrectangle($image, 0, 0, 11, 11, imagecolorallocate($image, 255, 0, 0));
    imagepng($image, $source);
    imagedestroy($image);

    $webp = app(ConvertImageToWebp::class)->convertPathToWebp($source);

    expect($webp)->toEndWith('.webp')
        ->and(is_file($webp))->toBeTrue();

    @unlink($source);
    @unlink($webp);
});

function createTemporaryPngUpload(string $filename): UploadedFile
{
    $path = tempnam(sys_get_temp_dir(), 'png_');

    expect($path)->not->toBeFalse();

    $image = imagecreatetruecolor(20, 20);
    $color = imagecolorallocate($image, 10, 124, 74);
    imagefilledrectangle($image, 0, 0, 19, 19, $color);
    imagepng($image, $path);
    imagedestroy($image);

    return new UploadedFile($path, $filename, 'image/png', null, true);
}
