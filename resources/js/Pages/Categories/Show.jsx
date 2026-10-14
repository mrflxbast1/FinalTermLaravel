import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import AppLayout from '../../Layouts/AppLayout';
import Button from '../../Components/Button';
import ProductTable from '../../Components/ProductTable';
import Pagination from '../../Components/Pagination';
import EmptyState from '../../Components/EmptyState';
import ConfirmDialog from '../../Components/ConfirmDialog';

export default function Show({ category, products }) {
    const permissions = usePage().props.auth.permissions;
    const [deleting, setDeleting] = useState(false);
    const form = useForm({});
    return (
        <AppLayout
            title={category.name}
            description={category.description || 'Everything in this collection, in one place.'}
            eyebrow="YOUR COLLECTION"
            actions={
                <>
                    {permissions.includes('categories.delete') && (
                        <Button variant="secondary" onClick={() => setDeleting(true)}>
                            <Trash2 size={16} /> Delete
                        </Button>
                    )}
                    {permissions.includes('categories.update') && (
                        <Button href={`/categories/${category.id}/edit`}>
                            <Pencil size={16} /> Edit category
                        </Button>
                    )}
                </>
            }
        >
            <Link href="/categories" className="back-link">
                <ArrowLeft size={15} /> All categories
            </Link>
            <section className="panel">
                <div className="panel-heading">
                    <div>
                        <h2>
                            In this collection{' '}
                            <span className="count-pill">{category.products_count}</span>
                        </h2>
                        <p>Products grouped under {category.name.toLowerCase()}.</p>
                    </div>
                    {permissions.includes('products.create') && (
                        <Button href="/products/create" variant="secondary">
                            <Plus size={16} /> Add product
                        </Button>
                    )}
                </div>
                {products.data.length ? (
                    <>
                        <ProductTable products={products.data} />
                        <Pagination data={products} />
                    </>
                ) : (
                    <EmptyState
                        title="Room for something good"
                        description="Choose this category when you add or edit a product."
                    />
                )}
            </section>
            <ConfirmDialog
                open={deleting}
                title="Delete this category?"
                description={`This permanently deletes “${category.name}” and all ${category.products_count} products in it. These records cannot be recovered.`}
                confirmLabel={`Delete category${category.products_count ? ' & products' : ''}`}
                processing={form.processing}
                onClose={() => setDeleting(false)}
                onConfirm={() =>
                    form.delete(`/categories/${category.id}`, {
                        onSuccess: () => setDeleting(false),
                    })
                }
            />
        </AppLayout>
    );
}
