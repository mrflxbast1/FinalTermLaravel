import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check, Package } from 'lucide-react';
import Button from '../../Components/Button';
import Field from '../../Components/Field';
import ProductIllustration from '../../Components/ProductIllustration';
import { money } from '../../lib/format';

export default function ProductForm({ product, categories, illustrations }) {
    const form = useForm({
        name: product?.name || '',
        sku: product?.sku || '',
        product_category_id: product?.product_category_id || '',
        description: product?.description || '',
        price: product?.price || '',
        quantity: product?.quantity ?? 0,
        low_stock_threshold: product?.low_stock_threshold ?? 5,
        is_active: product?.is_active ?? true,
        illustration: product?.illustration || 'box',
    });
    const set = (field) => (event) => form.setData(field, event.target.value);
    const submit = (event) => {
        event.preventDefault();
        if (product) form.put(`/products/${product.id}`);
        else form.post('/products');
    };
    const category = categories.find(
        (item) => Number(item.id) === Number(form.data.product_category_id),
    );

    return (
        <form onSubmit={submit}>
            <Link href={product ? `/products/${product.id}` : '/products'} className="back-link">
                <ArrowLeft size={15} /> Back to {product ? 'product' : 'products'}
            </Link>
            {!categories.length && (
                <div className="notice notice-warning">
                    Create a category before adding a product.{' '}
                    <Link href="/categories/create" className="text-link">
                        Add a category ↗
                    </Link>
                </div>
            )}
            <div className="editor-grid">
                <div className="editor-main">
                    <section className="panel form-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>The essentials</h2>
                                <p>A clear name and a few useful details.</p>
                            </div>
                            <Package size={19} className="muted" />
                        </div>
                        <div className="form-panel-body">
                            <Field
                                label="Product name"
                                placeholder="e.g. Studio Headphones"
                                value={form.data.name}
                                onChange={set('name')}
                                error={form.errors.name}
                                required
                                maxLength={160}
                                autoFocus
                            />
                            <div className="form-grid">
                                <Field
                                    label="SKU"
                                    placeholder="e.g. AUD-001"
                                    value={form.data.sku}
                                    onChange={set('sku')}
                                    error={form.errors.sku}
                                    hint="A unique code using letters, numbers, hyphens, or underscores."
                                    required
                                    maxLength={40}
                                />
                                <Field
                                    label="Category"
                                    as="select"
                                    value={form.data.product_category_id}
                                    onChange={set('product_category_id')}
                                    error={form.errors.product_category_id}
                                    required
                                >
                                    <option value="">Choose a category</option>
                                    {categories.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </Field>
                            </div>
                            <Field
                                label="Description"
                                as="textarea"
                                placeholder="What makes this product worth knowing about?"
                                value={form.data.description}
                                onChange={set('description')}
                                error={form.errors.description}
                                maxLength={2000}
                            />
                        </div>
                    </section>
                    <section className="panel form-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>Price & inventory</h2>
                                <p>The numbers that keep your collection moving.</p>
                            </div>
                        </div>
                        <div className="form-panel-body">
                            <div className="form-grid three-columns">
                                <Field
                                    label="Unit price (PHP)"
                                    type="number"
                                    min="0"
                                    max="9999999.99"
                                    step="0.01"
                                    value={form.data.price}
                                    onChange={set('price')}
                                    error={form.errors.price}
                                    placeholder="0.00"
                                    required
                                />
                                <Field
                                    label="Quantity on hand"
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="1"
                                    value={form.data.quantity}
                                    onChange={set('quantity')}
                                    error={form.errors.quantity}
                                    required
                                />
                                <Field
                                    label="Low-stock threshold"
                                    type="number"
                                    min="0"
                                    max="1000000"
                                    step="1"
                                    value={form.data.low_stock_threshold}
                                    onChange={set('low_stock_threshold')}
                                    error={form.errors.low_stock_threshold}
                                    required
                                />
                            </div>
                            <div className="active-option">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(event) =>
                                            form.setData('is_active', event.target.checked)
                                        }
                                    />{' '}
                                    Active product
                                </label>
                                <p>
                                    Inactive products stay in your inventory but won't appear in
                                    low-stock alerts.
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="panel form-panel">
                        <div className="panel-heading">
                            <div>
                                <h2>Give it a look</h2>
                                <p>Choose an illustration that fits.</p>
                            </div>
                        </div>
                        <div className="form-panel-body">
                            <div
                                className="illustration-picker"
                                role="group"
                                aria-label="Product illustration"
                            >
                                {illustrations.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        className={
                                            form.data.illustration === name ? 'selected' : ''
                                        }
                                        aria-label={`Use ${name} illustration`}
                                        aria-pressed={form.data.illustration === name}
                                        onClick={() => form.setData('illustration', name)}
                                    >
                                        <ProductIllustration name={name} />
                                        <span>{name}</span>
                                    </button>
                                ))}
                            </div>
                            {form.errors.illustration && (
                                <p className="field-error" role="alert">
                                    {form.errors.illustration}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
                <aside className="editor-aside">
                    <div className="panel preview-card">
                        <p className="eyebrow">A QUICK PREVIEW</p>
                        <div className="preview-art">
                            <ProductIllustration name={form.data.illustration} />
                        </div>
                        <span className="preview-category">
                            {category?.name || 'Your category'}
                        </span>
                        <h3>{form.data.name || 'Your new product'}</h3>
                        <p className="preview-sku">{form.data.sku || 'PRODUCT-SKU'}</p>
                        <div className="preview-price">
                            <strong>{money(form.data.price)}</strong>
                            <span>{form.data.quantity || 0} units</span>
                        </div>
                    </div>
                    <p className="aside-note">
                        Good details make great inventory. You can always come back and edit these
                        later.
                    </p>
                </aside>
            </div>
            <div className="editor-actions">
                <Button
                    href={product ? `/products/${product.id}` : '/products'}
                    variant="secondary"
                >
                    Cancel
                </Button>
                <Button type="submit" processing={form.processing} disabled={!categories.length}>
                    <Check size={17} />
                    {product ? 'Save changes' : 'Add product'}
                </Button>
            </div>
        </form>
    );
}
