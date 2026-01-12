import { CategoryForm } from '@/components/admin/CategoryForm'

export const metadata = {
  title: 'New Category - Admin Panel',
}

export default function NewCategoryPage() {
  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <CategoryForm />
    </div>
  )
}






