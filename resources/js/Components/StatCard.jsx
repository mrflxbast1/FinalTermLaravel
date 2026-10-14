import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { money, number } from '../lib/format';

export default function StatCard({
    label,
    value,
    note,
    icon: Icon,
    tone = '',
    currency = false,
    href,
}) {
    const [display, setDisplay] = useState(value);
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setDisplay(value);
            return;
        }
        let frame;
        const start = performance.now();
        const tick = (now) => {
            const progress = Math.min((now - start) / 650, 1);
            setDisplay(value * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [value]);
    const format = (amount) => (currency ? money(amount) : number(Math.round(amount)));
    const Card = href ? Link : 'article';
    return (
        <Card {...(href ? { href } : {})} className={`stat-card ${tone}`}>
            <div className="stat-label">
                <span>{label}</span>
                <span className="stat-icon">
                    <Icon size={19} strokeWidth={1.7} />
                </span>
            </div>
            <strong className="stat-value" aria-label={format(value)}>
                <span aria-hidden="true">{format(display)}</span>
            </strong>
            <div className="stat-foot">
                <p>
                    <span className="stat-note-dot" />
                    {note}
                </p>
                {href && <ArrowUpRight size={15} aria-hidden="true" />}
            </div>
        </Card>
    );
}
