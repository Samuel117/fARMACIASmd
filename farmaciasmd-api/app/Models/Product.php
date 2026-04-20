<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'sku',
        'name',
        'brand',
        'category',
        'description',
        'image_url',
        'price',
        'min_stock',
        'active'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean',
    ];

    public function stocks()
    {
        return $this->hasMany(BranchProductStock::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }
}