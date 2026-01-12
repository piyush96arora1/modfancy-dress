export default function ProductsLoading() {
  return (
    <div className="px-4 md:px-0 bg-white">
      {/* Compact Header Section Skeleton */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
          <div className="h-7 md:h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-5 bg-gray-200 rounded animate-pulse w-24" />
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="w-full">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Category Filter Skeleton */}
        <div className="mt-3">
          <div className="border rounded-lg bg-white p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-20" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded-full animate-pulse w-24" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="border rounded-lg overflow-hidden bg-white">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

