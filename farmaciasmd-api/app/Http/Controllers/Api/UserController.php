<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Listado de usuarios',
            'data' => $users,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'message' => 'Detalle de usuario',
            'data' => $user->only('id', 'name', 'email', 'role', 'created_at'),
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'employee'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Usuario creado',
            'data' => $user->only('id', 'name', 'email', 'role', 'created_at'),
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'employee'])],
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->role = $data['role'];

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Usuario actualizado',
            'data' => $user->only('id', 'name', 'email', 'role', 'created_at'),
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes eliminar tu propio usuario.',
                'data' => null,
                'errors' => null,
                'timestamp' => now()->toISOString(),
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuario eliminado',
            'data' => null,
            'errors' => null,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
