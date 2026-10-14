import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    CircleAlert,
    Layers3,
    Package,
    Plus,
    Wallet,
} from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import StatCard from '../../Components/StatCard';
import Spotlight from '../../Components/Spotlight';
import ProductIllustration from '../../Components/ProductIllustration';
import ProductTable from '../../Components/ProductTable';
import EmptyState from '../../Components/EmptyState';
import { number } from '../../lib/format';

const colors = {
    sage: '#9cac7e',
    lilac: '#b3a4cf',
    peach: '#e7b396',
    sand: '#d8c59c',
    blue: '#91afbc',
    rose: '#cb9b9d',
};

export default function Dashboard({ stats, lowStockProducts, categoryBreakdown, recentProducts }) {
    const { auth } = usePage().props;
    const canCreate = auth.permissions.includes('products.create');
    const firstName = auth.user.name.split(' ')[0];
    let offset = 0;
    const circumference = 2 * Math.PI * 54;

    return (
        <AppLayout
            title="Overview"
            description={`Welcome back, ${firstName}. Here's how your inventory is looking.`}
            actions={
                canCreate && (
                    <Button href="/products/create">
                        <Plus size={17} /> Add product
                    </Button>
                )
            }
        >
            <Spotlight className="overview-hero">
                <div className="hero-grid" aria-hidden="true" />
                <div className="hero-copy">
                    <span className="hero-tag">
                        <span /> YOUR INVENTORY, CONNECTED
                    </span>
                    <h2>
                        Less searching.
                        <br />
                        <em>More moving forward.</em>
                    </h2>
                    <p>
                        Keep every product in view, every detail in order.
                        <br className="desktop-only" /> Your whole workspace, beautifully organized.
                    </p>
                    <div className="hero-actions">
                        <Link href="/products" className="hero-link">
                            Explore inventory <ArrowUpRight size={16} />
                        </Link>
                        <Link href="/products?stock=low" className="hero-secondary">
                            Review stock <ArrowRight size={15} />
                        </Link>
                    </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="hero-orbit" />
                    <div className="hero-orbit hero-orbit-two" />
                    <div className="hero-product hero-product-back">
                        <ProductIllustration name="bag" />
                        <span>Everyday essentials</span>
                    </div>
                    <div className="hero-product hero-product-front">
                        <span className="tile-category">THE COLLECTION</span>
                        <ProductIllustration name="headphones" />
                        <span>Sound. Sorted.</span>
                    </div>
                    <div className="hero-art-label">
                        <span className="little-check">✓</span>
                        <span>
                            <strong>{number(stats.products)} products</strong>
                            <small>One organized workspace</small>
                        </span>
                    </div>
                    <span className="hero-star">✳</span>
                </div>
                <div className="hero-index">
                    <span>STOCKROOM / WORKSPACE</span>
                    <span>MADE FOR YOUR EVERYDAY</span>
                </div>
            </Spotlight>
            <section className="stats-grid" aria-label="Inventory summary">
                <StatCard
                    label="Total products"
                    href="/products"
                    value={stats.products}
                    note={`Across ${stats.categories} categories`}
                    icon={Package}
                />
                <StatCard
                    label="Units on hand"
                    href="/products?sort=quantity&direction=desc"
                    value={stats.units}
                    note="Every item, accounted for"
                    icon={Layers3}
                />
                <StatCard
                    label="Inventory value"
                    href="/products?sort=price&direction=desc"
                    value={stats.value}
                    note="Based on current quantities"
                    icon={Wallet}
                    currency
                />
                <StatCard
                    label="Need attention"
                    href="/products?stock=low"
                    value={stats.low_stock}
                    note={
                        stats.low_stock
                            ? `${stats.out_of_stock} out of stock · time to review`
                            : 'Stock levels are looking good'
                    }
                    icon={CircleAlert}
                    tone={stats.low_stock ? 'stat-attention' : ''}
                />
            </section>
            <div className="dashboard-grid">
                <section className="panel">
                    <div className="panel-heading">
                        <div>
                            <h2>
                                Stock watchlist{' '}
                                <span className="count-pill">{stats.low_stock}</span>
                            </h2>
                            <p>Products at or below their stock threshold.</p>
                        </div>
                        <Link href="/products?stock=low" className="text-link">
                            View all <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    {lowStockProducts.length ? (
                        <div className="attention-list">
                            {lowStockProducts.map((product) => (
                                <Link
                                    href={`/products/${product.id}`}
                                    key={product.id}
                                    className="attention-row"
                                >
                                    <ProductIllustration name={product.illustration} />
                                    <span className="attention-name">
                                        <strong>{product.name}</strong>
                                        <small>{product.category.name}</small>
                                    </span>
                                    <span
                                        className={`stock-number ${product.quantity === 0 ? 'stock-zero' : ''}`}
                                    >
                                        <strong>{number(product.quantity)}</strong>
                                        <small>
                                            {product.quantity === 0 ? 'out of stock' : 'units left'}
                                        </small>
                                    </span>
                                    <ArrowUpRight size={16} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="All stocked up"
                            description="No active products are below their stock threshold."
                        />
                    )}
                </section>
                <section className="panel category-overview">
                    <div className="panel-heading">
                        <div>
                            <h2>Your inventory mix</h2>
                            <p>A clear view across your categories.</p>
                        </div>
                        <Link
                            href="/categories"
                            className="icon-button"
                            aria-label="View categories"
                        >
                            <ArrowUpRight size={18} />
                        </Link>
                    </div>
                    <div className="donut-wrap">
                        <svg
                            viewBox="0 0 140 140"
                            role="img"
                            aria-label="Product distribution by category"
                        >
                            <circle
                                cx="70"
                                cy="70"
                                r="54"
                                fill="none"
                                stroke="#eef0e8"
                                strokeWidth="17"
                            />
                            <g transform="rotate(-90 70 70)">
                                {categoryBreakdown.map((category) => {
                                    const length = stats.products
                                        ? (category.products_count / stats.products) * circumference
                                        : 0;
                                    const dash = Math.max(length - (length ? 3 : 0), 0);
                                    const current = offset;
                                    offset += length;
                                    return (
                                        <circle
                                            key={category.id}
                                            cx="70"
                                            cy="70"
                                            r="54"
                                            fill="none"
                                            stroke={colors[category.color]}
                                            strokeWidth="17"
                                            strokeDasharray={`${dash} ${circumference - dash}`}
                                            strokeDashoffset={-current}
                                        />
                                    );
                                })}
                            </g>
                        </svg>
                        <div className="donut-center">
                            <strong>{number(stats.products)}</strong>
                            <span>products</span>
                        </div>
                    </div>
                    <div className="category-legend">
                        {categoryBreakdown.length ? (
                            categoryBreakdown.map((category) => (
                                <Link key={category.id} href={`/categories/${category.id}`}>
                                    <span>
                                        <i style={{ background: colors[category.color] }} />
                                        {category.name}
                                    </span>
                                    <strong>{category.products_count}</strong>
                                </Link>
                            ))
                        ) : (
                            <p className="muted">Add a category to start your collection.</p>
                        )}
                    </div>
                </section>
            </div>
            <section className="panel recent-panel">
                <div className="panel-heading">
                    <div>
                        <h2>Recently updated</h2>
                        <p>The latest changes in your collection.</p>
                    </div>
                    <Link href="/products?sort=updated_at&direction=desc" className="text-link">
                        All products <ArrowRight size={16} />
                    </Link>
                </div>
                {recentProducts.length ? (
                    <ProductTable products={recentProducts} />
                ) : (
                    <EmptyState
                        title="Your collection starts here"
                        description="Add your first product and give it a place to live."
                        action={
                            canCreate && (
                                <Button href="/products/create">
                                    <Plus size={17} /> Add product
                                </Button>
                            )
                        }
                    />
                )}
            </section>
        </AppLayout>
    );
}
