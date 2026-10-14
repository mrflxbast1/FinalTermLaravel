import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ data }) {
    if (!data.total) return null;
    return (
        <div className="pagination">
            <span>
                Showing{' '}
                <strong>
                    {data.from}–{data.to}
                </strong>{' '}
                of <strong>{data.total}</strong>
            </span>
            <div className="page-buttons">
                {data.links.map((link, index) => {
                    const first = index === 0;
                    const last = index === data.links.length - 1;
                    const content = first ? (
                        <ChevronLeft size={16} />
                    ) : last ? (
                        <ChevronRight size={16} />
                    ) : (
                        link.label
                    );
                    const label = first
                        ? 'Previous page'
                        : last
                          ? 'Next page'
                          : `Page ${link.label}`;
                    return link.url ? (
                        <Link
                            preserveScroll
                            key={index}
                            href={link.url}
                            className={`page-button ${link.active ? 'active' : ''}`}
                            aria-label={label}
                            aria-current={link.active ? 'page' : undefined}
                        >
                            {content}
                        </Link>
                    ) : (
                        <span key={index} className="page-button disabled" aria-label={label}>
                            {content}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
