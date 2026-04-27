import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiTrendingUp,
  FiRepeat,
  FiCreditCard,
  FiArrowDown,
  FiBell,
  FiCheck,
  FiStar,
  FiSettings,
  FiMessageSquare,
  FiMenu,
  FiX,
} from "react-icons/fi";

interface SidebarLink {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

// const navigate = useNavigate();

export const DashboardSidebar: React.FC = () => {

  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // Sidebar navigation links with React Icons instead of emojis
  const sidebarLinks: SidebarLink[] = [
    { name: "Overview", path: "/dashboard", icon: <FiBarChart2 size={20} /> },
    { name: "Trade", path: "/dashboard/trade", icon: <FiTrendingUp size={20} /> },
    { name: "Markets & Pairs", path: "/dashboard/markets", icon: <FiRepeat size={20} /> },
    { name: "Deposit", path: "/dashboard/deposit", icon: <FiCreditCard size={20} /> },
    { name: "Withdraw", path: "/dashboard/withdraw", icon: <FiArrowDown size={20} /> },
    { name: "Notifications", path: "/dashboard/notifications", icon: <FiBell size={20} />, badge: 3 },
    { name: "Verification", path: "/dashboard/verification", icon: <FiCheck size={20} /> },
    { name: "Upgrade", path: "/dashboard/upgrade", icon: <FiStar size={20} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <FiSettings size={20} /> },
    { name: "Support", path: "/dashboard/support", icon: <FiMessageSquare size={20} /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        title="Toggle Sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out z-40 lg:static lg:translate-x-0 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">VP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">VPrime Capital</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trading Platform</p> 
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4">
          <div className="space-y-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-normal"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">{link.icon}</span>
                  <span className="text-sm">{link.name}</span>
                </div>
                {link.badge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:bg-gray-900">
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" onClick={() => navigate('https://t.me/')}>
            Need Help?
          </button>
        </div>
      </aside>
    </>
  );
};

