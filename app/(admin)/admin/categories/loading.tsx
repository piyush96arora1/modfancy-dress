export default function AdminCategoriesLoading() {
  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-40" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-48" />
      </div>
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

