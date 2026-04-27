import React from "react";

/**
 * Reusable Loading Component
 * 
 * Props:
 * - isLoading: boolean - Whether to show loading spinner
 * - message: string - Optional loading message
 * - fullScreen: boolean - Whether to cover entire screen or inline
 */
export const Loading: React.FC<{
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
}> = ({ isLoading, message = "Loading...", fullScreen = true }) => {
  if (!isLoading) return null;

  const baseClasses = "flex items-center justify-center gap-3";
  const containerClasses = fullScreen
    ? `${baseClasses} fixed inset-0 bg-black bg-opacity-50 z-50`
    : `${baseClasses} p-6`;

  return (
    <div className={containerClasses}>
      <div className="bg-white rounded-lg p-8 shadow-2xl flex items-center gap-4">
        {/* Spinner */}
        <div className="flex-shrink-0">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
        </div>

        {/* Loading message */}
        <div className="flex-grow">
          <p className="text-gray-700 font-medium">{message}</p>
          <div className="mt-2 flex gap-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
