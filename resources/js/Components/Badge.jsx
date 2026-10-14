const labels = { healthy: 'In stock', low: 'Low stock', out: 'Out of stock', inactive: 'Inactive' };
export default function Badge({ status }) {
    return (
        <span className={`badge badge-${status}`}>
            <span className="badge-dot" />
            {labels[status] || status}
        </span>
    );
}
