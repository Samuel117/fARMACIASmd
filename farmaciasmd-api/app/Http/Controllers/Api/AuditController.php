<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $userId   = $request->query('user_id');
        $branchId = $request->query('branch_id');
        $from     = $request->query('from');
        $to       = $request->query('to');

        $sales = Sale::with(['user:id,name', 'branch:id,name'])
            ->when($userId,   fn($q) => $q->where('user_id',   $userId))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($from,     fn($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,       fn($q) => $q->whereDate('created_at', '<=', $to))
            ->orderBy('created_at', 'desc')
            ->limit(300)
            ->get()
            ->map(fn($s) => [
                'type'        => 'venta',
                'id'          => $s->id,
                'user_name'   => $s->user?->name ?? 'Sin usuario',
                'branch_name' => $s->branch?->name ?? '—',
                'description' => 'Venta #' . $s->id . ' — $' . number_format($s->total, 2) . ' (' . $s->status . ')',
                'status'      => $s->status,
                'date'        => $s->created_at,
            ]);

        $movements = StockMovement::with(['user:id,name', 'branch:id,name', 'product:id,name'])
            ->when($userId,   fn($q) => $q->where('user_id',   $userId))
            ->when($branchId, fn($q) => $q->where('branch_id', $branchId))
            ->when($from,     fn($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,       fn($q) => $q->whereDate('created_at', '<=', $to))
            ->orderBy('created_at', 'desc')
            ->limit(300)
            ->get()
            ->map(fn($m) => [
                'type'        => 'movimiento',
                'id'          => $m->id,
                'user_name'   => $m->user?->name ?? 'Sin usuario',
                'branch_name' => $m->branch?->name ?? '—',
                'description' => ucfirst($m->type) . ' de ' . $m->quantity . ' u. — ' . ($m->product?->name ?? '—'),
                'status'      => $m->type,
                'date'        => $m->created_at,
            ]);

        $activity = $sales->concat($movements)
            ->sortByDesc('date')
            ->values()
            ->take(200);

        $users = User::select('id', 'name')->orderBy('name')->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Historial de actividad',
            'data'      => ['activity' => $activity, 'users' => $users],
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
