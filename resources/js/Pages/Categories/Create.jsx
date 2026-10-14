import AppLayout from '../../Layouts/AppLayout';
import CategoryForm from './CategoryForm';
export default function Create(props) {
    return (
        <AppLayout title="Add a category" description="Give related products a place of their own.">
            <CategoryForm {...props} />
        </AppLayout>
    );
}
