export default function OrderDetailLoading() {
  return (
    <div className="px-4 md:px-0">
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-64" />
      
      <div className="space-y-6">
        {/* Order info skeleton */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Items skeleton */}
        <div className="border rounded-lg p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 border rounded">
              <div className="w-20 h-20 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

