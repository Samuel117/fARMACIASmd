<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'branch_id',
        'user_id',
        'total',
        'notes',
        'status',
        'cancelled_at',
    ];

    protected $casts = [
        'total'        => 'decimal:2',
        'cancelled_at' => 'datetime',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
