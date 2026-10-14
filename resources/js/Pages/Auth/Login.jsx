import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import Field from '../../Components/Field';

export default function Login({ status }) {
    const form = useForm({ email: '', password: '', remember: false });
    const submit = (event) => {
        event.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };
    return (
        <AuthLayout
            title="Welcome back."
            subtitle="A more organized day starts here. Sign in to your workspace."
        >
            {status && (
                <div className="notice notice-success" role="status">
                    {status}
                </div>
            )}
            <form onSubmit={submit} className="auth-form">
                <Field
                    label="Email address"
                    type="email"
                    name="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                    autoFocus
                />
                <Field
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    required
                />
                <div className="form-between">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={form.data.remember}
                            onChange={(e) => form.setData('remember', e.target.checked)}
                        />{' '}
                        Remember me
                    </label>
                    <Link href="/forgot-password">Forgot password?</Link>
                </div>
                <Button type="submit" className="full-width" processing={form.processing}>
                    Sign in to Stockroom <ArrowRight size={18} />
                </Button>
            </form>
            <p className="auth-switch">
                New around here?{' '}
                <Link href="/register">
                    Create an account <ArrowUpRightInline />
                </Link>
            </p>
            <div className="auth-small-note">
                <span /> Thoughtfully organized. Ready when you are.
            </div>
        </AuthLayout>
    );
}
function ArrowUpRightInline() {
    return <span aria-hidden="true">↗</span>;
}
