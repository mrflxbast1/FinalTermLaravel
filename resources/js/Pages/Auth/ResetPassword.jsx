import { useForm } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import AuthLayout from '../../Layouts/AuthLayout';
import Button from '../../Components/Button';
import Field from '../../Components/Field';

export default function ResetPassword({ email, token }) {
    const form = useForm({ email, token, password: '', password_confirmation: '' });
    return (
        <AuthLayout
            title="A fresh start."
            subtitle="Choose a new password to get back to your workspace."
        >
            <form
                className="auth-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post('/reset-password', {
                        onFinish: () => form.reset('password', 'password_confirmation'),
                    });
                }}
            >
                <Field
                    label="Email address"
                    type="email"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    error={form.errors.email}
                    required
                    autoComplete="username"
                />
                <Field
                    label="New password"
                    type="password"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    error={form.errors.password}
                    required
                    minLength={8}
                    autoFocus
                />
                <Field
                    label="Confirm new password"
                    type="password"
                    autoComplete="new-password"
                    value={form.data.password_confirmation}
                    onChange={(e) => form.setData('password_confirmation', e.target.value)}
                    error={form.errors.password_confirmation}
                    required
                />
                <Button type="submit" className="full-width" processing={form.processing}>
                    Reset password <ArrowRight size={18} />
                </Button>
            </form>
        </AuthLayout>
    );
}
