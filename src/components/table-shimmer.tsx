export function TableShimmer() {
  return (
    <div className="w-full">
      {/* Search and columns header */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-56 h-10 bg-gray-200 rounded-[2px] relative overflow-hidden">
          <div className="shimmer-effect absolute inset-0" />
        </div>
        <div className="w-28 h-10 bg-gray-200 rounded-[2px] relative overflow-hidden">
          <div className="shimmer-effect absolute inset-0" />
        </div>
      </div>

      {/* Table */}
      <div className="w-full border rounded-[2px] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-7 bg-zinc-50 border-b">
          <div className="p-3 w-12">
            <div className="w-5 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-16 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-20 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-24 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-20 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-16 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
          <div className="p-3">
            <div className="w-20 h-5 bg-gray-200 rounded relative overflow-hidden">
              <div className="shimmer-effect absolute inset-0" />
            </div>
          </div>
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="grid grid-cols-7 border-b">
            <div className="p-3 w-12">
              <div className="w-5 h-5 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center">
              <div className="w-24 h-5 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center">
              <div className="w-full h-5 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center">
              <div className="w-40 h-5 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
            <div className="p-3 flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="w-48 h-5 bg-gray-200 rounded relative overflow-hidden">
          <div className="shimmer-effect absolute inset-0" />
        </div>
        <div className="flex space-x-2">
          <div className="w-24 h-10 bg-gray-200 rounded-[2px] relative overflow-hidden">
            <div className="shimmer-effect absolute inset-0" />
          </div>
          <div className="w-24 h-10 bg-gray-200 rounded-[2px] relative overflow-hidden">
            <div className="shimmer-effect absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
