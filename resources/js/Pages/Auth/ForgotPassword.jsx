import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import Field from '../../Components/Field';

export default function ForgotPassword({ status, localMail }) {
    const form = useForm({ email: '' });
    return (
        <AuthLayout
            title="Let's get you back in."
            subtitle={
                localMail
                    ? 'Enter your account email to create a password reset link.'
                    : "Enter your account email and we'll send a password reset link."
            }
        >
            {status && (
                <div className="notice notice-success" role="status">
                    {localMail ? 'Your reset message is ready in the local mail log.' : status}
                </div>
            )}
            {localMail && (
                <p className="local-mail-note">
                    This workspace keeps email on your PC. Open{' '}
                    <code>storage/logs/laravel.log</code> in the project folder and copy the latest
                    reset link into your browser.
                </p>
            )}
            <form
                className="auth-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/forgot-password');
                }}
            >
                <Field
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                    autoFocus
                />
                <Button type="submit" className="full-width" processing={form.processing}>
                    Send reset link <ArrowRight size={18} />
                </Button>
            </form>
            <p className="auth-switch">
                <Link href="/login">
                    <ArrowLeft size={16} /> Back to sign in
                </Link>
            </p>
        </AuthLayout>
    );
}
