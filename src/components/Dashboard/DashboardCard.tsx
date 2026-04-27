import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorClasses = {
  blue: "from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700",
  green: "from-green-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700",
  purple: "from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-700",
  orange: "from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-700",
  red: "from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-700",
};

const iconColorClasses = {
  blue: "text-blue-600 dark:text-blue-400",
  green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400",
  orange: "text-orange-600 dark:text-orange-400",
  red: "text-red-600 dark:text-red-400",
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "blue",
}) => {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{value}</p>
          {trend && (
            <p
              className={`text-xs sm:text-sm mt-1 sm:mt-2 ${
                trend.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? "+" : "-"}{trend.value}% {trend.isPositive ? "up" : "down"}
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-xl sm:text-2xl flex-shrink-0 ${iconColorClasses[color]}`}>{icon}</div>
        )}
      </div>
    </div>
  );
};
