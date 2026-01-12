export default function AdminProductsLoading() {
  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-40" />
      </div>
      
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-40" />
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

