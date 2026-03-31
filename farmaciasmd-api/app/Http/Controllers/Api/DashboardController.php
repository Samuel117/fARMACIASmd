<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchProductStock;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        $ventasHoy = Sale::where('status', 'active')
            ->whereDate('created_at', $today)
            ->sum('total');

        $ventasMes = Sale::where('status', 'active')
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->sum('total');

        $stockBajo = BranchProductStock::with(['branch', 'product'])
            ->whereColumn('stock', '<', DB::raw(
                '(SELECT min_stock FROM products WHERE products.id = branch_product_stocks.product_id)'
            ))
            ->get()
            ->map(fn($s) => [
                'sucursal'     => $s->branch?->name,
                'producto'     => $s->product?->name,
                'stock_actual' => $s->stock,
                'stock_minimo' => $s->product?->min_stock,
            ]);

        $ultimasVentas = Sale::with('branch')
            ->where('status', 'active')
            ->orderByDesc('id')
            ->limit(5)
            ->get(['id', 'branch_id', 'total', 'created_at']);

        return response()->json([
            'success'   => true,
            'message'   => 'Resumen dashboard',
            'data'      => [
                'ventas_hoy'    => round((float) $ventasHoy, 2),
                'ventas_mes'    => round((float) $ventasMes, 2),
                'stock_bajo'    => $stockBajo,
                'ultimas_ventas'=> $ultimasVentas,
            ],
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
