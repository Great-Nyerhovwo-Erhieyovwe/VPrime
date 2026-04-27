import React from "react";
import { DashboardSidebar } from "../../components/Dashboard/DashboardSidebar";
import { DashboardHeader } from "../../components/Dashboard/DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  notifications?: Array<{
    id: string;
    type: "alert" | "info" | "success" | "warning";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  user?: {
    name: string;
    email: string;
    isVerified?: boolean;
  };
  onLogout?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  notifications = [],
  user = {
    name: "John Doe",
    email: "john.doe@example.com",
    isVerified: true,
  },
  onLogout,
}) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          notifications={notifications}
          user={user}
          onLogout={onLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
