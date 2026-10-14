<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Team/Index', [
            'users' => User::with('roles')->orderBy('name')->paginate(12)
                ->through(fn (User $user) => [
                    ...$user->only('id', 'name', 'email', 'created_at'),
                    'role' => $user->getRoleNames()->first() ?? 'User',
                ]),
            'roles' => ['Admin', 'Manager', 'User'],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(['Admin', 'Manager', 'User'])]]);

        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['role' => 'Your own role cannot be changed here.']);
        }

        DB::transaction(function () use ($user, $data) {
            $admins = User::role('Admin')->lockForUpdate()->get();
            $target = User::lockForUpdate()->findOrFail($user->id);

            if ($target->hasRole('Admin') && $data['role'] !== 'Admin' && $admins->count() <= 1) {
                throw ValidationException::withMessages(['role' => 'At least one administrator must remain.']);
            }

            $target->syncRoles([$data['role']]);
        }, 3);

        return back()->with('success', 'Team member role updated.');
    }
}
