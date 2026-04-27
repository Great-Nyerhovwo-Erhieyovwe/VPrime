import React from "react";

/**
 * Reusable Modal Component
 * 
 * Props:
 * - isOpen: boolean - Whether modal is visible
 * - title: string - Modal title
 * - message: string - Modal message/body
 * - type: 'success' | 'error' | 'warning' | 'info' | 'confirm' - Modal type
 * - onClose: function - Called when modal closes
 * - onConfirm: function (optional) - Called when confirm button clicked (for confirm type)
 * - confirmText: string - Text for confirm button (default: "Confirm")
 * - cancelText: string - Text for cancel button (default: "Cancel")
 * - isLoading: boolean - Show loading state on confirm button
 */
export const Modal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "confirm";
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}> = ({
  isOpen,
  title,
  message,
  type = "info",
  onClose,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Color scheme based on type
  const colorSchemes = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-600",
      button: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    confirm: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const scheme = colorSchemes[type];

  // Icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    // Backdrop with animation
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        className={`${scheme.bg} border ${scheme.border} rounded-lg shadow-2xl max-w-sm w-full mx-4 transform transition-all animate-fade-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header with icon */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <div className={`${scheme.icon} mb-4`}>{getIcon()}</div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>

        {/* Modal message */}
        <div className="px-6 py-4">
          <p className="text-gray-700 text-center">{message}</p>
        </div>

        {/* Modal footer with buttons */}
        <div className={`px-6 py-4 flex gap-3 ${type === "confirm" ? "justify-end" : "justify-center"}`}>
          {type === "confirm" ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2 text-white rounded-lg transition-colors ${scheme.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                disabled={isLoading}
              >
                {isLoading && <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${scheme.button}`}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
