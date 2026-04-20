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
use App\Http\Controllers\Api\UserController;

Route::get('/health', fn() => response()->json(['status' => 'ok']));

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Accesible para todos los roles autenticados
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{product}', [ProductController::class, 'show']);

    Route::get('/branches', [BranchController::class, 'index']);
    Route::get('/branches/{branch}', [BranchController::class, 'show']);

    Route::get('/branch-stocks', [BranchStockController::class, 'index']);

    Route::get('/sales', [SaleController::class, 'index']);
    Route::post('/sales', [SaleController::class, 'store']);
    Route::get('/sales/{sale}', [SaleController::class, 'show']);
    Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Solo admin
    Route::middleware('admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        Route::post('/branches', [BranchController::class, 'store']);
        Route::put('/branches/{branch}', [BranchController::class, 'update']);
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy']);

        Route::get('/stock-movements', [StockMovementController::class, 'index']);
        Route::post('/stock-movements', [StockMovementController::class, 'store']);

        Route::get('/reports/sales', [ReportController::class, 'sales']);
        Route::get('/reports/top-products', [ReportController::class, 'topProducts']);
        Route::get('/reports/low-stock', [ReportController::class, 'lowStock']);

        Route::apiResource('users', UserController::class);
    });
});
