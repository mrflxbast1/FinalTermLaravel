import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Pencil } from 'lucide-react';
import Badge from './Badge';
import ProductIllustration from './ProductIllustration';
import { money, number } from '../lib/format';

export default function ProductTable({ products, compact = false }) {
    const canEdit = usePage().props.auth.permissions.includes('products.update');
    return (
        <div className="table-scroll">
            <table className={`product-table ${compact ? 'compact-table' : ''}`}>
                <thead>
                    <tr>
                        <th>Product</th>
                        {!compact && <th>Category</th>}
                        <th>Stock</th>
                        <th>Unit price</th>
                        <th>
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>
                                <Link className="product-link" href={`/products/${product.id}`}>
                                    <ProductIllustration name={product.illustration} />
                                    <span>
                                        <strong>{product.name}</strong>
                                        <small>{product.sku}</small>
                                    </span>
                                </Link>
                            </td>
                            {!compact && (
                                <td>
                                    <Link
                                        className="category-pill"
                                        href={`/categories/${product.category.id}`}
                                    >
                                        <i
                                            className={`color-dot color-${product.category.color}`}
                                        />
                                        {product.category.name}
                                    </Link>
                                </td>
                            )}
                            <td>
                                <div className="stock-cell">
                                    <span>
                                        {number(product.quantity)} <small>units</small>
                                    </span>
                                    <Badge status={product.stock_status} />
                                </div>
                            </td>
                            <td className="money-cell">{money(product.price)}</td>
                            <td className="row-actions">
                                {canEdit && !compact && (
                                    <Link
                                        className="icon-button"
                                        href={`/products/${product.id}/edit`}
                                        aria-label={`Edit ${product.name}`}
                                    >
                                        <Pencil size={16} />
                                    </Link>
                                )}
                                <Link
                                    className="icon-button"
                                    href={`/products/${product.id}`}
                                    aria-label={`View ${product.name}`}
                                >
                                    <ArrowUpRight size={18} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
