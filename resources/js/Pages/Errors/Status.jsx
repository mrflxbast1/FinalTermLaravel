import { Head, usePage } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, Search } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';

export default function Status({ status }) {
    const { auth } = usePage().props;
    const forbidden = status === 403;
    const content = (
        <section className="panel error-page">
            <span className="error-code">{status}</span>
            {forbidden ? (
                <LockKeyhole size={34} strokeWidth={1.4} />
            ) : (
                <Search size={34} strokeWidth={1.4} />
            )}
            <h2>{forbidden ? 'This space has a different key.' : 'A little out of place.'}</h2>
            <p>
                {forbidden
                    ? 'Your current role does not have access to this page. An administrator can help if you need more access.'
                    : 'This page may have moved, or the record is no longer here.'}
            </p>
            <Button href={auth?.user ? '/dashboard' : '/login'}>
                <ArrowLeft size={16} />
                {auth?.user ? 'Back to overview' : 'Go to sign in'}
            </Button>
        </section>
    );
    return auth?.user ? (
        <AppLayout title={forbidden ? 'Access restricted' : 'Page not found'}>{content}</AppLayout>
    ) : (
        <main className="standalone-error">
            <Head title={forbidden ? 'Access restricted' : 'Page not found'} />
            {content}
        </main>
    );
}
