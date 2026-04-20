<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminRole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acceso denegado. Se requiere rol de administrador.',
                'data' => null,
                'errors' => null,
                'timestamp' => now()->toISOString(),
            ], 403);
        }

        return $next($request);
    }
}
