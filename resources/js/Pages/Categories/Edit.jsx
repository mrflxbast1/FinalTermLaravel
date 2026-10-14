import AppLayout from '../../Layouts/AppLayout';
import CategoryForm from './CategoryForm';
export default function Edit(props) {
    return (
        <AppLayout
            title="Edit category"
            description="A small change can bring a little more clarity."
        >
            <CategoryForm {...props} />
        </AppLayout>
    );
}
