import { Link } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

export default function Button({
    children,
    href,
    variant = 'primary',
    className = '',
    processing = false,
    disabled,
    ...props
}) {
    const classes = `button button-${variant} ${className}`;
    if (href)
        return (
            <Link href={href} className={classes} {...props}>
                {children}
            </Link>
        );
    return (
        <button type="button" className={classes} disabled={disabled || processing} {...props}>
            {processing && <LoaderCircle size={17} className="spin" aria-hidden="true" />}
            {children}
        </button>
    );
}
