/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { FiDollarSign, FiTrendingUp, FiTarget, FiAward } from "react-icons/fi";
/* eslint-enable @typescript-eslint/no-unused-vars */
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { DashboardCard } from "../../components/Dashboard/DashboardCard";
import { TransactionHistory } from "../../components/Dashboard/TransactionHistory";
import { useDashboard } from "../../hooks/useDashboard";
import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";

// const backendUrl = import.meta.env.VITE_API_URL;

export const Dashboard: React.FC = () => {


  const formatMoney = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency
  }).format(amount);
};

  // Fetch real dashboard data from API
  const { user, portfolio, transactions, notifications, stats, loading, error } = useDashboard();

  const userCurrency = user?.currency || "USD";
  // const userId = user?.id;


  const navigate = useNavigate();

  // Prepare data for display
  const displayUser = user
    ? {
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      email: user.email || "",
      isVerified: user.emailVerified || false,
    }
    : { name: "Loading...", email: "", isVerified: false };


  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const displayMetrics = {
        totalBalance: stats?.totalBalance ?? 0,
        activeTradesCount: stats?.active_trades_count ?? 0,
        roi: stats?.roi ?? 0,
        activeInvestments: stats?.active_investments ?? 0,
      };
    // : {
    //     totalBalance: 0,
    //     activeTradesCount: 0,
    //     roi: 0,
    //     activeInvestments: 0,
    //   };

  // console.log(displayMetrics);

  const portfolioAssets = portfolio?.openPositions || [];


  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };


  // Transform notifications to match expected format
  const transformedNotifications = (notifications || []).map(notif => ({
    ...notif,
    timestamp: typeof notif.timestamp === 'string' ? new Date(notif.timestamp) : notif.timestamp,
  }));

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout notifications={transformedNotifications} user={displayUser} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  

  // Show error state
  if (error) {
    return (
      <DashboardLayout notifications={transformedNotifications} user={displayUser} onLogout={handleLogout}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">Error loading dashboard</p>
          <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout notifications={transformedNotifications} user={displayUser} onLogout={handleLogout}>
      {/* Welcome Section */}
<div className="mb-6 sm:mb-8">
  <div className="flex items-center gap-2 sm:gap-3 whitespace-nowrap">
    
    {/* 🔴 Original */}
    {/* <h1 className="text-2xl sm:text-3xl font-bold text-gray-900"> */}

    {/* 🟢 Changed → smaller on mobile */}
    <h1 className="text-lg sm:text-3xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
      {getGreeting()}, {displayUser.name}!
    </h1>

    {displayUser.isVerified && (
      <span
        className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full flex-shrink-0"
        title="Account Verified"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    )}
  </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">Here's your account overview and recent activity</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <DashboardCard
          title="Total Balance"
          value={formatMoney(displayMetrics.totalBalance, userCurrency)}
          icon={<FiDollarSign className="w-6 h-6" />}
          trend={{ value: 5.2, isPositive: true }}
          color="blue"
        />
        <DashboardCard
          title="Active Trades"
          // value={displayMetrics.activeTradesCount}
          value={stats?.activeTradesCount || 0}
          icon={<FiTrendingUp className="w-6 h-6" />}
          trend={{ value: 2, isPositive: true }}
          color="green"
        />
        <DashboardCard
          title="ROI"
          value={`${displayMetrics.roi}%`}
          icon={<FiTarget className="w-6 h-6" />}
          trend={{ value: 3.1, isPositive: true }}
          color="purple"
        />
        <DashboardCard
          title="Active Investments"
          value={displayMetrics.activeInvestments}
          icon={<FiAward className="w-6 h-6" />}
          trend={{ value: 1, isPositive: false }}
          color="orange"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Transaction History - Takes 2 cols on desktop, full width on mobile */}
        <div className="lg:col-span-2">
          <TransactionHistory transactions={transactions || []} />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4 sm:space-y-6">
          {/* Portfolio Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Portfolio Distribution
            </h3>
            <div className="space-y-3">
              {portfolioAssets.length > 0 ? (
                portfolioAssets.slice(0, 4).map((position: any) => {
                  // Calculate percentage based on total portfolio value
                  const totalValue = portfolioAssets.reduce(
                    (sum: number, pos: any) => sum + (pos.value || 0),
                    0
                  );
                  const percentage = totalValue > 0 ? ((position.value || 0) / totalValue) * 100 : 0;

                  return (
                    <div key={position.symbol}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {position.symbol}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill bg-blue-500"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No positions yet</p>
              )}
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
                <span className="text-sm font-bold text-green-600">
                  +{(stats?.roi || 0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Profit</span>
                <span className="text-sm font-bold text-green-600">
                  {formatMoney(stats?.monthlyProfit || 0, userCurrency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Trades</span>
                <span className="text-sm font-bold text-blue-600">
                  {stats?.activeTradesCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors" onClick={() => navigate("/dashboard/deposit")}>
                Buy Assets
              </button>
              <button className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors" onClick={() => navigate('/dashboard/trade')}>
                Sell Assets
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
