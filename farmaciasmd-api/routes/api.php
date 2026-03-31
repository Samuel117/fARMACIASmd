<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BranchStockController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\DashboardController;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('products', ProductController::class);
    Route::apiResource('branches', BranchController::class);

    Route::get('/branch-stocks', [BranchStockController::class, 'index']);

    Route::get('/stock-movements', [StockMovementController::class, 'index']);
    Route::post('/stock-movements', [StockMovementController::class, 'store']);

    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{sale}', [SaleController::class, 'show']);
    Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel']);

    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/top-products', [ReportController::class, 'topProducts']);
    Route::get('/reports/low-stock', [ReportController::class, 'lowStock']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
});