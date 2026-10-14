import AppLayout from '../../Layouts/AppLayout';
import ProductForm from './ProductForm';
export default function Create(props) {
    return (
        <AppLayout
            title="Add a product"
            description="Give something new a place in your collection."
        >
            <ProductForm {...props} />
        </AppLayout>
    );
}
