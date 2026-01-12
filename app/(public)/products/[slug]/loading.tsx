export default function ProductLoading() {
  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Image skeleton */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Content skeleton */}
        <div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-6 w-1/2" />
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-6 w-1/3" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

