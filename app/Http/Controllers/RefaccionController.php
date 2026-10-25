<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCotizacionRefaccionRequest;
use App\Models\CotizacionRefaccion;
use App\Models\Fabricante;
use App\Models\Modulo;
use App\Models\Refaccion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RefaccionController extends Controller
{
    /**
     * Public spare-parts catalog. Modalities only; choosing one opens the quote form.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        if ($request->filled('modalidad')) {
            return redirect()->route(
                'refacciones.cotizar',
                $request->string('modalidad')->toString(),
            );
        }

        $modalidades = Modulo::query()
            ->activos()
            ->orderBy('modulo')
            ->get(['id', 'modulo', 'slug', 'imagen'])
            ->map(fn (Modulo $modulo): array => [
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
                'imagen' => $modulo->imageUrl() ?? '',
            ])
            ->values()
            ->all();

        return Inertia::render('Refacciones/ViewPiesasReffaciones', [
            'modalidades' => $modalidades,
        ]);
    }

    /**
     * Public detail of one published spare part.
     */
    public function show(string $modalidad, Refaccion $refaccion): Response
    {
        $modulo = $this->moduloPublicado($modalidad);
        abort_unless($this->perteneceAlModulo($refaccion, $modulo), 404);

        return Inertia::render('Refacciones/vistarefraccionview', [
            'refaccion' => $refaccion->toDetailPayload(),
        ]);
    }

    /**
     * Quote screen for one modality, before a spare part is chosen.
     */
    public function cotizarModalidad(string $modalidad): Response
    {
        return $this->cotizacionPage($this->moduloPublicado($modalidad));
    }

    /**
     * Quote screen for one published spare part.
     */
    public function cotizacion(string $modalidad, Refaccion $refaccion): Response
    {
        $modulo = $this->moduloPublicado($modalidad);
        abort_unless($this->perteneceAlModulo($refaccion, $modulo), 404);

        return $this->cotizacionPage($modulo, $refaccion);
    }

    /**
     * Store a public spare-part quote for the modality selected on the catalog.
     */
    public function store(StoreCotizacionRefaccionRequest $request, string $modalidad): RedirectResponse
    {
        $modulo = $this->moduloPublicado($modalidad);
        $refaccion = $this->refaccionDeLaRuta($request, $modulo);
        $validated = $request->validated();
        $fabricante = Fabricante::query()->findOrFail($validated['fabricante_id']);

        DB::transaction(function () use ($request, $validated, $modulo, $refaccion, $fabricante): void {
            $cotizacion = CotizacionRefaccion::query()->create([
                'refaccion_id' => $refaccion?->id,
                'modulo_id' => $modulo->id,
                'cliente' => $validated['cliente'],
                'direccion' => $validated['direccion'] ?? null,
                'contacto' => $validated['contacto'],
                'area' => $validated['area'] ?? null,
                'telefono' => $validated['telefono'],
                'correo' => $validated['correo'],
                'equipo' => $validated['equipo'],
                'fabricante_id' => $fabricante->id,
                'marca' => $fabricante->nombre,
                'refaccion' => $validated['refaccion'],
                'numero_parte' => $validated['numero_parte'] ?? null,
                'descripcion' => $validated['descripcion'] ?? null,
                'estatus' => 'pendiente',
            ]);

            foreach (array_values($request->file('imagenes', [])) as $index => $imagen) {
                if (! $imagen instanceof UploadedFile) {
                    continue;
                }

                $filename = $imagen->storeAsWebp('', 'cotizaciones');

                $cotizacion->imagenes()->create([
                    'ruta' => 'Imagen/Cotizaciones/'.$filename,
                    'nombre_original' => $imagen->getClientOriginalName(),
                    'orden' => $index,
                ]);
            }
        });

        $redirect = $refaccion === null
            ? redirect()->route('refacciones.cotizar', $modulo->slug)
            : redirect()->route('refacciones.cotizacion', [
                'modalidad' => $modulo->slug,
                'refaccion' => $refaccion,
            ]);

        return $redirect->with('success', 'Solicitud de cotización enviada correctamente.');
    }

    /**
     * The public parts catalog stays hidden. Old links open the quote form.
     */
    public function piezas(string $modalidad): RedirectResponse
    {
        $modulo = $this->moduloPublicado($modalidad);

        return redirect()->route('refacciones.cotizar', $modulo->slug);
    }

    private function cotizacionPage(Modulo $modulo, ?Refaccion $refaccion = null): Response
    {
        $refaccion?->loadMissing('fabricante:id,nombre');

        return Inertia::render('Refacciones/cotizacionesViewPiesasReffaciones', [
            'modalidad' => [
                'id' => $modulo->id,
                'slug' => $modulo->slug,
                'nombre' => $modulo->modulo,
            ],
            'marcas' => $this->marcas(),
            'refaccion' => $refaccion === null ? null : [
                'id' => $refaccion->id,
                'nombre' => $refaccion->nombre,
                'parte' => $refaccion->numero_parte ?? '',
                'marca' => $refaccion->fabricante?->nombre ?? '',
                'fabricante_id' => $refaccion->fabricante_id,
                'modalidad' => [
                    'id' => $modulo->id,
                    'slug' => $modulo->slug,
                    'nombre' => $modulo->modulo,
                ],
            ],
        ]);
    }

    /**
     * @return list<array{id: int, nombre: string}>
     */
    private function marcas(): array
    {
        return Fabricante::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn (Fabricante $fabricante): array => [
                'id' => $fabricante->id,
                'nombre' => $fabricante->nombre,
            ])
            ->all();
    }

    private function refaccionDeLaRuta(StoreCotizacionRefaccionRequest $request, Modulo $modulo): ?Refaccion
    {
        $parametro = $request->route('refaccion');

        if ($parametro === null) {
            return null;
        }

        $refaccion = $parametro instanceof Refaccion
            ? $parametro
            : Refaccion::query()->findOrFail($parametro);

        abort_unless($this->perteneceAlModulo($refaccion, $modulo), 404);

        return $refaccion;
    }

    private function moduloPublicado(string $modalidad): Modulo
    {
        $modulo = Modulo::query()
            ->activos()
            ->where('slug', $modalidad)
            ->first(['id', 'modulo', 'slug', 'imagen']);

        abort_if($modulo === null, 404);

        return $modulo;
    }

    private function perteneceAlModulo(Refaccion $refaccion, Modulo $modulo): bool
    {
        return $refaccion->publicado && $refaccion->modulo_id === $modulo->id;
    }
}
