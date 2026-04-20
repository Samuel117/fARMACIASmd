<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = $request->query('q');

        $products = Product::query()
            ->when($q, function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('sku', 'like', "%{$q}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Listado de productos',
            'data' => $products,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detalle de producto',
            'data' => $product,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'active' => ['required', 'boolean'],
        ]);

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado',
            'data' => $product,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'sku' => ['required', 'string', 'max:50', Rule::unique('products', 'sku')->ignore($product->id)],
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'min_stock' => ['required', 'integer', 'min:0'],
            'active' => ['required', 'boolean'],
        ]);

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado',
            'data' => $product->fresh(),
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado',
            'data' => null,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
