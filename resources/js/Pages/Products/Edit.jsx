import AppLayout from '../../Layouts/AppLayout';
import ProductForm from './ProductForm';
export default function Edit(props) {
    return (
        <AppLayout title="Edit product" description="Keep the little details up to date.">
            <ProductForm {...props} />
        </AppLayout>
    );
}
