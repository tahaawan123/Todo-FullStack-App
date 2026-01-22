import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks yet</h3>
      <p className="text-gray-500 mb-4">
        Get started by creating your first task
      </p>
      <p className="text-sm text-gray-400">
        Tasks you add will appear here
      </p>
    </div>
  );
};

export default EmptyState;