export default function AdminOrdersLoading() {
  return (
    <div className="px-4 md:px-0 bg-white">
      <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 w-32" />
      
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center justify-between p-4 border rounded">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                </div>
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

