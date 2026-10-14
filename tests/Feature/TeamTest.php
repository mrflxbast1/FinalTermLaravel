<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
        $this->withoutVite();
    }

    public function test_admin_can_assign_an_existing_user_a_valid_role(): void
    {
        $this->actingAs(User::factory()->create()->assignRole('Admin'));
        $user = User::factory()->create()->assignRole('User');

        $this->get('/team')->assertOk();
        $this->put('/team/'.$user->id, ['role' => 'Manager'])->assertSessionHasNoErrors();
        $this->assertSame(['Manager'], $user->fresh()->getRoleNames()->all());
        $this->put('/team/'.$user->id, ['role' => 'SuperAdmin'])->assertSessionHasErrors('role');
    }

    public function test_admin_cannot_demote_their_own_account(): void
    {
        $admin = User::factory()->create()->assignRole('Admin');
        $this->actingAs($admin)->put('/team/'.$admin->id, ['role' => 'User'])
            ->assertSessionHasErrors('role');
        $this->assertTrue($admin->fresh()->hasRole('Admin'));
    }

    public function test_non_admins_cannot_view_or_change_team_roles(): void
    {
        $target = User::factory()->create()->assignRole('User');
        foreach (['Manager', 'User'] as $role) {
            $this->actingAs(User::factory()->create()->assignRole($role));
            $this->get('/team')->assertForbidden();
            $this->put('/team/'.$target->id, ['role' => 'Admin'])->assertForbidden();
        }
        $this->assertFalse($target->fresh()->hasRole('Admin'));
    }
}
