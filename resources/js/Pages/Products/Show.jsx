import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import Badge from '../../Components/Badge';
import ProductIllustration from '../../Components/ProductIllustration';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { date, money, number } from '../../lib/format';

export default function Show({ product }) {
    const permissions = usePage().props.auth.permissions;
    const [deleting, setDeleting] = useState(false);
    const form = useForm({});
    return (
        <AppLayout
            title={product.name}
            description={`${product.sku} · ${product.category.name}`}
            eyebrow="PRODUCT DETAILS"
            actions={
                <>
                    {permissions.includes('products.delete') && (
                        <Button variant="secondary" onClick={() => setDeleting(true)}>
                            <Trash2 size={16} /> Delete
                        </Button>
                    )}
                    {permissions.includes('products.update') && (
                        <Button href={`/products/${product.id}/edit`}>
                            <Pencil size={16} /> Edit product
                        </Button>
                    )}
                </>
            }
        >
            <Link href="/products" className="back-link">
                <ArrowLeft size={15} /> Back to products
            </Link>
            <div className="product-detail-grid">
                <section className="panel product-detail-art">
                    <ProductIllustration name={product.illustration} />
                    <span className="detail-art-label">THE STOCKROOM COLLECTION</span>
                </section>
                <section className="panel product-detail-info">
                    <div className="detail-info-top">
                        <Link href={`/categories/${product.category.id}`} className="category-pill">
                            <i className={`color-dot color-${product.category.color}`} />
                            {product.category.name}
                        </Link>
                        <Badge status={product.stock_status} />
                    </div>
                    <h2>{product.name}</h2>
                    <p className="detail-description">
                        {product.description || 'No description added yet.'}
                    </p>
                    <strong className="detail-price">
                        {money(product.price)}
                        <small>per unit</small>
                    </strong>
                    <dl className="detail-facts">
                        <div>
                            <dt>Quantity on hand</dt>
                            <dd>{number(product.quantity)} units</dd>
                        </div>
                        <div>
                            <dt>Low-stock threshold</dt>
                            <dd>{number(product.low_stock_threshold)} units</dd>
                        </div>
                        <div>
                            <dt>Inventory value</dt>
                            <dd>{money(Number(product.price) * product.quantity)}</dd>
                        </div>
                        <div>
                            <dt>Product status</dt>
                            <dd>{product.is_active ? 'Active' : 'Inactive'}</dd>
                        </div>
                        <div>
                            <dt>Added</dt>
                            <dd>{date(product.created_at)}</dd>
                        </div>
                        <div>
                            <dt>Last updated</dt>
                            <dd>{date(product.updated_at)}</dd>
                        </div>
                    </dl>
                </section>
            </div>
            <ConfirmDialog
                open={deleting}
                title="Remove this product?"
                description={`${product.name} will be permanently removed from the inventory. This cannot be undone.`}
                confirmLabel="Delete product"
                processing={form.processing}
                onClose={() => setDeleting(false)}
                onConfirm={() =>
                    form.delete(`/products/${product.id}`, { onSuccess: () => setDeleting(false) })
                }
            />
        </AppLayout>
    );
}
