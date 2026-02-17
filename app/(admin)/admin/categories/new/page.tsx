'use client'

import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="px-4 md:px-0">
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <CategoryForm />
    </div>
  )
}
