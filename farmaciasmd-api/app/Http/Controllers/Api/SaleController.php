<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchProductStock;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $branchId = $request->query('branch_id');

        $sales = Sale::with(['branch', 'items.product'])
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json([
            'success'   => true,
            'message'   => 'Listado de ventas',
            'data'      => $sales,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function show(Sale $sale)
    {
        $sale->load(['branch', 'items.product', 'user']);

        return response()->json([
            'success'   => true,
            'message'   => 'Detalle de venta',
            'data'      => $sale,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function cancel(Request $request, Sale $sale)
    {
        if ($sale->status === 'cancelled') {
            return response()->json([
                'success'   => false,
                'message'   => 'La venta ya fue anulada.',
                'data'      => null,
                'errors'    => null,
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        return DB::transaction(function () use ($sale, $request) {
            foreach ($sale->items as $item) {
                $stock = BranchProductStock::where('branch_id', $sale->branch_id)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($stock) {
                    $stock->increment('stock', $item->quantity);
                } else {
                    BranchProductStock::create([
                        'branch_id'  => $sale->branch_id,
                        'product_id' => $item->product_id,
                        'stock'      => $item->quantity,
                    ]);
                }

                StockMovement::create([
                    'branch_id'  => $sale->branch_id,
                    'product_id' => $item->product_id,
                    'type'       => 'entry',
                    'quantity'   => $item->quantity,
                    'notes'      => "Anulación venta #{$sale->id}",
                    'user_id'    => $request->user()?->id,
                ]);
            }

            $sale->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            return response()->json([
                'success'   => true,
                'message'   => 'Venta anulada correctamente.',
                'data'      => $sale->fresh(['branch', 'items.product']),
                'errors'    => null,
                'timestamp' => now()->toISOString(),
            ]);
        });
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'branch_id'             => ['required', 'exists:branches,id'],
            'notes'                 => ['nullable', 'string'],
            'items'                 => ['required', 'array', 'min:1'],
            'items.*.product_id'    => ['required', 'exists:products,id'],
            'items.*.quantity'      => ['required', 'integer', 'min:1'],
        ]);

        return DB::transaction(function () use ($data, $request) {
            $branchId   = $data['branch_id'];
            $total      = 0;
            $itemsData  = [];

            // Validar stock y armar datos de ítems antes de persistir
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);

                $stock = BranchProductStock::where('branch_id', $branchId)
                    ->where('product_id', $item['product_id'])
                    ->first();

                if (!$stock || $stock->stock < $item['quantity']) {
                    $disponible = $stock->stock ?? 0;
                    return response()->json([
                        'success'   => false,
                        'message'   => "Stock insuficiente para '{$product->name}'. Disponible: {$disponible}, solicitado: {$item['quantity']}.",
                        'data'      => null,
                        'errors'    => ['stock' => ["Stock insuficiente para '{$product->name}'"]],
                        'timestamp' => now()->toISOString(),
                    ], 422);
                }

                $unitPrice = (float) $product->price;
                $subtotal  = $unitPrice * $item['quantity'];
                $total    += $subtotal;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal'   => $subtotal,
                    'stock'      => $stock,
                ];
            }

            // Crear cabecera de venta
            $sale = Sale::create([
                'branch_id' => $branchId,
                'user_id'   => $request->user()?->id,
                'total'     => $total,
                'notes'     => $data['notes'] ?? null,
            ]);

            // Crear ítems, descontar stock y registrar movimiento
            foreach ($itemsData as $itemData) {
                SaleItem::create([
                    'sale_id'    => $sale->id,
                    'product_id' => $itemData['product_id'],
                    'quantity'   => $itemData['quantity'],
                    'unit_price' => $itemData['unit_price'],
                    'subtotal'   => $itemData['subtotal'],
                ]);

                $itemData['stock']->decrement('stock', $itemData['quantity']);

                StockMovement::create([
                    'branch_id'  => $branchId,
                    'product_id' => $itemData['product_id'],
                    'type'       => 'exit',
                    'quantity'   => $itemData['quantity'],
                    'notes'      => "Venta #{$sale->id}",
                    'user_id'    => $request->user()?->id,
                ]);
            }

            return response()->json([
                'success'   => true,
                'message'   => 'Venta registrada correctamente',
                'data'      => $sale->load(['branch', 'items.product']),
                'errors'    => null,
                'timestamp' => now()->toISOString(),
            ], 201);
        });
    }
}
