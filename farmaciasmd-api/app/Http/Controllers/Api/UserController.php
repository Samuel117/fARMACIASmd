<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function userFields(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'branch_id'  => $user->branch_id,
            'branch'     => $user->branch ? ['id' => $user->branch->id, 'name' => $user->branch->name] : null,
            'created_at' => $user->created_at,
        ];
    }

    public function index()
    {
        $users = User::with('branch:id,name')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn($u) => $this->userFields($u));

        return response()->json([
            'success'   => true,
            'message'   => 'Listado de usuarios',
            'data'      => $users,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function show(User $user)
    {
        $user->load('branch:id,name');

        return response()->json([
            'success'   => true,
            'message'   => 'Detalle de usuario',
            'data'      => $this->userFields($user),
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8'],
            'role'      => ['required', Rule::in(['admin', 'employee'])],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $user = User::create([
            'name'      => $data['name'],
            'email'     => $data['email'],
            'password'  => Hash::make($data['password']),
            'role'      => $data['role'],
            'branch_id' => $data['branch_id'] ?? null,
        ]);

        $user->load('branch:id,name');

        return response()->json([
            'success'   => true,
            'message'   => 'Usuario creado',
            'data'      => $this->userFields($user),
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password'  => ['nullable', 'string', 'min:8'],
            'role'      => ['required', Rule::in(['admin', 'employee'])],
            'branch_id' => ['nullable', 'exists:branches,id'],
        ]);

        $user->name      = $data['name'];
        $user->email     = $data['email'];
        $user->role      = $data['role'];
        $user->branch_id = $data['branch_id'] ?? null;

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();
        $user->load('branch:id,name');

        return response()->json([
            'success'   => true,
            'message'   => 'Usuario actualizado',
            'data'      => $this->userFields($user),
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success'   => false,
                'message'   => 'No puedes eliminar tu propio usuario.',
                'data'      => null,
                'errors'    => null,
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success'   => true,
            'message'   => 'Usuario eliminado',
            'data'      => null,
            'errors'    => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
