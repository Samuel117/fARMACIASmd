<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchProductStock;
use App\Models\SaleItem;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Reporte de ventas por rango de fechas y sucursal
    public function sales(Request $request)
    {
        $from     = $request->query('from');
        $to       = $request->query('to');
        $branchId = $request->query('branch_id');

        $query = Sale::with('branch')
            ->where('status', 'active')
            ->when($from, fn($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('created_at', '<=', $to))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->select('id', 'branch_id', 'total', 'notes', 'created_at')
            ->orderBy('created_at', 'desc');

        $sales = $query->get();

        $totalGeneral = $sales->sum(fn($s) => (float) $s->total);
        $porSucursal  = $sales->groupBy('branch_id')->map(fn($group) => [
            'sucursal'   => $group->first()->branch?->name ?? '—',
            'cantidad'   => $group->count(),
            'total'      => round($group->sum(fn($s) => (float) $s->total), 2),
        ])->values();

        return response()->json([
            'success'   => true,
            'message'   => 'Reporte de ventas',
            'data'      => [
                'ventas'        => $sales,
                'por_sucursal'  => $porSucursal,
                'total_general' => round($totalGeneral, 2),
                'cantidad'      => $sales->count(),
            ],
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    // Top productos más vendidos
    public function topProducts(Request $request)
    {
        $from     = $request->query('from');
        $to       = $request->query('to');
        $branchId = $request->query('branch_id');
        $limit    = (int) ($request->query('limit', 10));

        $results = SaleItem::join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', 'active')
            ->when($from, fn($q) => $q->whereDate('sales.created_at', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('sales.created_at', '<=', $to))
            ->when($branchId, fn($q) => $q->where('sales.branch_id', $branchId))
            ->groupBy('sale_items.product_id', 'products.name', 'products.sku')
            ->select(
                'sale_items.product_id',
                'products.name',
                'products.sku',
                DB::raw('SUM(sale_items.quantity) as total_vendido'),
                DB::raw('SUM(sale_items.subtotal) as total_ingresos')
            )
            ->orderByDesc('total_vendido')
            ->limit($limit)
            ->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Top productos más vendidos',
            'data'      => $results,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    // Productos con stock bajo
    public function lowStock(Request $request)
    {
        $branchId = $request->query('branch_id');

        $results = BranchProductStock::with(['branch', 'product'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->whereColumn('stock', '<', DB::raw(
                '(SELECT min_stock FROM products WHERE products.id = branch_product_stocks.product_id)'
            ))
            ->get()
            ->map(fn($s) => [
                'sucursal'    => $s->branch?->name,
                'producto'    => $s->product?->name,
                'sku'         => $s->product?->sku,
                'stock_actual'=> $s->stock,
                'stock_minimo'=> $s->product?->min_stock,
                'diferencia'  => $s->stock - ($s->product?->min_stock ?? 0),
            ]);

        return response()->json([
            'success'   => true,
            'message'   => 'Productos con stock bajo',
            'data'      => $results,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
