import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowDownWideNarrow, Plus, Search, X } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import ProductTable from '../../Components/ProductTable';
import Pagination from '../../Components/Pagination';
import EmptyState from '../../Components/EmptyState';

export default function Products({ products, categories, filters, summary }) {
    const canCreate = usePage().props.auth.permissions.includes('products.create');
    const [search, setSearch] = useState(filters.search || '');
    useEffect(() => setSearch(filters.search || ''), [filters.search]);
    const apply = (changes = {}) =>
        router.get(
            '/products',
            { ...filters, search, ...changes },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    const filtered = Boolean(
        filters.search || filters.category || (filters.stock && filters.stock !== 'all'),
    );

    return (
        <AppLayout
            title="Products"
            description="A home for everything in your collection."
            actions={
                canCreate && (
                    <Button href="/products/create">
                        <Plus size={17} /> Add product
                    </Button>
                )
            }
        >
            <section className="panel inventory-panel">
                <div className="inventory-top">
                    <div className="stock-tabs">
                        {[
                            ['all', 'All products', summary.total],
                            ['low', 'Needs attention', summary.low],
                            ['inactive', 'Inactive', summary.inactive],
                        ].map(([value, label, count]) => (
                            <button
                                key={value}
                                className={`stock-tab ${(filters.stock || 'all') === value ? 'active' : ''}`}
                                aria-pressed={(filters.stock || 'all') === value}
                                onClick={() => apply({ stock: value })}
                            >
                                {label}
                                <span>{count}</span>
                            </button>
                        ))}
                    </div>
                    <span className="collection-label">YOUR COLLECTION</span>
                </div>
                <div className="filter-bar">
                    <form
                        className="list-search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            apply();
                        }}
                    >
                        <Search size={17} />
                        <input
                            aria-label="Search products by name or SKU"
                            placeholder="Search by name or SKU..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            maxLength={100}
                        />
                        <button
                            type="submit"
                            className="search-submit"
                            aria-label="Search products"
                        >
                            Search
                        </button>
                    </form>
                    <select
                        className="filter-select"
                        aria-label="Filter by category"
                        value={filters.category || ''}
                        onChange={(event) => apply({ category: event.target.value })}
                    >
                        <option value="">All categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <div className="sort-select">
                        <ArrowDownWideNarrow size={15} />
                        <select
                            aria-label="Sort products"
                            value={`${filters.sort || 'name'}:${filters.direction || 'asc'}`}
                            onChange={(event) => {
                                const [sort, direction] = event.target.value.split(':');
                                apply({ sort, direction });
                            }}
                        >
                            <option value="name:asc">Name, A–Z</option>
                            <option value="name:desc">Name, Z–A</option>
                            <option value="price:asc">Price, low to high</option>
                            <option value="price:desc">Price, high to low</option>
                            <option value="quantity:asc">Stock, low to high</option>
                            <option value="updated_at:desc">Recently updated</option>
                        </select>
                    </div>
                </div>
                {filtered && (
                    <div className="filter-summary">
                        <span>
                            {products.total} matching{' '}
                            {products.total === 1 ? 'product' : 'products'}
                            {filters.stock === 'out' ? ' · Out of stock' : ''}
                        </span>
                        <Link href="/products" className="text-link">
                            <X size={13} /> Clear filters
                        </Link>
                    </div>
                )}
                {products.data.length ? (
                    <>
                        <ProductTable products={products.data} />
                        <Pagination data={products} />
                    </>
                ) : (
                    <EmptyState
                        title={filtered ? 'No products found' : 'Make room for your first product'}
                        description={
                            filtered
                                ? 'Try another name, SKU, or category. Your next find is around the corner.'
                                : 'Add a product to start keeping track of your inventory.'
                        }
                        action={
                            filtered ? (
                                <Button href="/products" variant="secondary">
                                    Reset filters
                                </Button>
                            ) : (
                                canCreate && (
                                    <Button href="/products/create">
                                        <Plus size={16} /> Add product
                                    </Button>
                                )
                            )
                        }
                    />
                )}
            </section>
        </AppLayout>
    );
}
