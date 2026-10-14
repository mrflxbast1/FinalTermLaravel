import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';
import Button from '../../Components/Button';
import Field from '../../Components/Field';

export default function CategoryForm({ category, colors }) {
    const form = useForm({
        name: category?.name || '',
        description: category?.description || '',
        color: category?.color || 'sage',
    });
    const submit = (event) => {
        event.preventDefault();
        if (category) form.put(`/categories/${category.id}`);
        else form.post('/categories');
    };
    return (
        <form onSubmit={submit} className="category-editor">
            <Link
                href={category ? `/categories/${category.id}` : '/categories'}
                className="back-link"
            >
                <ArrowLeft size={15} /> Back to categories
            </Link>
            <section className="panel form-panel">
                <div className="panel-heading">
                    <div>
                        <h2>A place for similar things</h2>
                        <p>A simple name and a useful description go a long way.</p>
                    </div>
                </div>
                <div className="form-panel-body">
                    <Field
                        label="Category name"
                        placeholder="e.g. Desk & workspace"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        error={form.errors.name}
                        required
                        maxLength={120}
                        autoFocus
                    />
                    <Field
                        label="Description"
                        as="textarea"
                        placeholder="What belongs in this collection?"
                        value={form.data.description}
                        onChange={(event) => form.setData('description', event.target.value)}
                        error={form.errors.description}
                        maxLength={1000}
                    />
                    <div className="field">
                        <span className="field-label">Collection color</span>
                        <div className="color-picker" role="group" aria-label="Collection color">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Use ${color} color`}
                                    aria-pressed={form.data.color === color}
                                    className={`color-swatch color-${color} ${form.data.color === color ? 'selected' : ''}`}
                                    onClick={() => form.setData('color', color)}
                                >
                                    {form.data.color === color && <Check size={18} />}
                                </button>
                            ))}
                        </div>
                        {form.errors.color && <p className="field-error">{form.errors.color}</p>}
                    </div>
                </div>
            </section>
            <div className="editor-actions">
                <Button
                    variant="secondary"
                    href={category ? `/categories/${category.id}` : '/categories'}
                >
                    Cancel
                </Button>
                <Button type="submit" processing={form.processing}>
                    <Check size={17} />
                    {category ? 'Save changes' : 'Create category'}
                </Button>
            </div>
        </form>
    );
}
