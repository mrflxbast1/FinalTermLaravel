import { PackageOpen } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', description, action }) {
    return (
        <div className="empty-state">
            <span>
                <PackageOpen size={30} strokeWidth={1.4} />
            </span>
            <h3>{title}</h3>
            <p>{description}</p>
            {action}
        </div>
    );
}
