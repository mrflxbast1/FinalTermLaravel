<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_local_password_recovery_explains_where_to_find_the_link(): void
    {
        $this->withoutVite();
        config(['mail.default' => 'log']);
        $this->get('/forgot-password')->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Auth/ForgotPassword')->where('localMail', true));

        config(['mail.default' => 'smtp']);
        $this->get('/forgot-password')->assertInertia(fn (AssertableInertia $page) => $page
            ->where('localMail', false));
    }

    public function test_guests_must_sign_in_before_viewing_inventory(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_users_can_sign_in_and_sign_out(): void
    {
        $user = User::factory()->create();

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);

        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_an_incorrect_password_does_not_start_a_session(): void
    {
        $user = User::factory()->create();

        $this->post('/login', ['email' => $user->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_registration_grants_only_the_user_role(): void
    {
        $this->post('/register', [
            'name' => 'Jamie Cruz',
            'email' => 'jamie@example.test',
            'password' => 'LocalDemo!234',
            'password_confirmation' => 'LocalDemo!234',
            'role' => 'Admin',
            'permissions' => ['users.manage'],
        ])->assertRedirect('/dashboard');

        $user = User::where('email', 'jamie@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('LocalDemo!234', $user->password));
        $this->assertSame(['User'], $user->getRoleNames()->all());
        $this->assertAuthenticatedAs($user);
    }

    public function test_registration_rejects_duplicate_email_and_short_password(): void
    {
        $user = User::factory()->create();

        $this->post('/register', [
            'name' => 'Jamie', 'email' => $user->email,
            'password' => 'short', 'password_confirmation' => 'short',
        ])->assertSessionHasErrors(['email', 'password']);
    }

    public function test_password_reset_notification_contains_a_usable_single_use_token(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])
            ->assertSessionHas('status');

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $payload = [
            'email' => $user->email, 'token' => $token,
            'password' => 'ChangedPass!234', 'password_confirmation' => 'ChangedPass!234',
        ];
        $this->post('/reset-password', $payload)->assertRedirect('/login');
        $this->assertTrue(Hash::check('ChangedPass!234', $user->fresh()->password));
        $this->post('/reset-password', $payload)->assertSessionHasErrors('email');
    }

    public function test_invalid_reset_token_cannot_change_a_password(): void
    {
        $user = User::factory()->create();
        Password::createToken($user);

        $this->post('/reset-password', [
            'email' => $user->email, 'token' => 'not-the-issued-token',
            'password' => 'ChangedPass!234', 'password_confirmation' => 'ChangedPass!234',
        ])->assertSessionHasErrors('email');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }
}
