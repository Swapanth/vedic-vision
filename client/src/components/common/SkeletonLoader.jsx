import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Filter tabs skeleton */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8">
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      </div>

      {/* Leaderboard table skeleton */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          
          <div className="space-y-3">
            {[...Array(10)].map((_, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-lg border-2 border-gray-200"
              >
                {/* Rank skeleton */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 mr-4">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                </div>

                {/* User info skeleton */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {/* Avatar skeleton */}
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    
                    {/* User details skeleton */}
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>

                {/* Role badge skeleton */}
                <div className="mr-4">
                  <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                </div>

                {/* Score skeleton */}
                <div className="text-right">
                  <div className="h-6 bg-gray-300 rounded w-12 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-300 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
