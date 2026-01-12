export default function EditProductLoading() {
  return (
    <div className="px-4 md:px-0">
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-48" />
      
      <div className="max-w-4xl space-y-6">
        {/* Form skeleton */}
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 bg-gray-200 rounded animate-pulse" />
        </div>
        
        {/* Images section */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Variants section */}
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
          <div className="border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
          <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  )
}

