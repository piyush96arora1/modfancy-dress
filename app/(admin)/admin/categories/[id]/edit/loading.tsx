export default function EditCategoryLoading() {
  return (
    <div className="px-4 md:px-0">
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-48" />
      
      <div className="max-w-2xl space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="h-24 bg-gray-200 rounded animate-pulse" />
        
        <div className="flex gap-4 pt-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  )
}

