<?php

namespace App\Support;

/**
 * Feature flags for equipment model fields that remain in the codebase
 * but are currently disabled in forms and forced to null on persist.
 */
final class EquipoFieldFlags
{
    /**
     * When false: estado is hidden in forms and stored as null.
     */
    public const ESTADO_ENABLED = false;

    /**
     * When false: disponibilidad is hidden in forms and stored as null.
     */
    public const DISPONIBILIDAD_ENABLED = false;

    /**
     * When false: ubicación is hidden in the public equipment detail view.
     */
    public const UBICACION_ENABLED = false;
}
