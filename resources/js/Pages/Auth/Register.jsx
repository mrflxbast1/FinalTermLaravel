import { Link, useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import Field from '../../Components/Field';

export default function Register() {
    const form = useForm({ name: '', email: '', password: '', password_confirmation: '' });
    const submit = (event) => {
        event.preventDefault();
        form.post('/register', { onFinish: () => form.reset('password', 'password_confirmation') });
    };
    return (
        <AuthLayout
            title="Make yourself at home."
            subtitle="Create your account and get a clearer view of the inventory."
        >
            <form onSubmit={submit} className="auth-form">
                <Field
                    label="Full name"
                    name="name"
                    autoComplete="name"
                    placeholder="Jamie Santos"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                    required
                    autoFocus
                    maxLength={120}
                />
                <Field
                    label="Email address"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                />
                <div className="form-grid">
                    <Field
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        error={form.errors.password}
                        required
                        minLength={8}
                    />
                    <Field
                        label="Confirm password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="One more time"
                        value={form.data.password_confirmation}
                        onChange={(e) => form.setData('password_confirmation', e.target.value)}
                        error={form.errors.password_confirmation}
                        required
                    />
                </div>
                <p className="form-note">
                    New accounts can browse the inventory. An administrator can grant editing
                    access.
                </p>
                <Button type="submit" className="full-width" processing={form.processing}>
                    Create account <ArrowRight size={18} />
                </Button>
            </form>
            <p className="auth-switch">
                Already have an account? <Link href="/login">Sign in ↗</Link>
            </p>
        </AuthLayout>
    );
}
