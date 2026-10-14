import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Boxes, Plus } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import EmptyState from '../../Components/EmptyState';
import { number } from '../../lib/format';

export default function Categories({ categories }) {
    const canCreate = usePage().props.auth.permissions.includes('categories.create');
    return (
        <AppLayout
            title="Categories"
            description="A little structure makes everything easier to find."
            actions={
                canCreate && (
                    <Button href="/categories/create">
                        <Plus size={17} /> Add category
                    </Button>
                )
            }
        >
            {categories.length ? (
                <div className="category-grid">
                    {categories.map((category, index) => (
                        <Link
                            className={`category-card theme-${category.color}`}
                            href={`/categories/${category.id}`}
                            key={category.id}
                            style={{ animationDelay: `${index * 35}ms` }}
                        >
                            <div className="category-card-top">
                                <span className="category-card-icon">
                                    <Boxes size={25} strokeWidth={1.4} />
                                </span>
                                <ArrowUpRight size={19} />
                            </div>
                            <p className="category-number">
                                COLLECTION {String(index + 1).padStart(2, '0')}
                            </p>
                            <h2>{category.name}</h2>
                            <p className="category-description">
                                {category.description ||
                                    'A place to keep related products together.'}
                            </p>
                            <div className="category-card-bottom">
                                <span>
                                    <strong>{category.products_count}</strong> products
                                </span>
                                <span>
                                    {number(category.products_sum_quantity || 0)} units{' '}
                                    <ArrowUpRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <section className="panel">
                    <EmptyState
                        title="Everything starts with a category"
                        description="Group similar products together and make your collection easier to navigate."
                        action={
                            canCreate && (
                                <Button href="/categories/create">
                                    <Plus size={16} /> Add category
                                </Button>
                            )
                        }
                    />
                </section>
            )}
        </AppLayout>
    );
}
