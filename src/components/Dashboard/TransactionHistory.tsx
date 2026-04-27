import React from "react";

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal";
  symbol: string;
  amount: number;
  price: number;
  date: Date | string;
  status: "completed" | "pending" | "failed";
}

interface TransactionHistoryProps {
  transactions?: Transaction[] | any[];
}

const typeIcons = {
  buy: "📥",
  sell: "📤",
  deposit: "💰",
  withdrawal: "💸",
};

const statusColors = {
  completed: "text-green-600 bg-green-50",
  pending: "text-yellow-600 bg-yellow-50",
  failed: "text-red-600 bg-red-50",
};

/**
 * TransactionHistory Component
 * Displays a table of user transactions with real data from the dashboard API
 * 
 * Props:
 * - transactions: Array of transaction objects from the API
 *   Each transaction should have: id, type, symbol, amount, price, date, status
 * 
 * Features:
 * - Responsive design (mobile-friendly with horizontal scroll on small screens)
 * - Color-coded transaction types and statuses
 * - Proper date formatting
 * - Shows empty state if no transactions exist
 */
export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions = [],
}) => {
  // Ensure transactions array exists and is properly formatted
  const displayTransactions = Array.isArray(transactions)
    ? transactions.map((txn: any) => ({
      id: txn.id || txn._id || `${Date.now()}-${Math.random()}`,
        type: txn.type || "buy",
        symbol: txn.symbol || "UNKNOWN",
        amount: typeof txn.amount === "number" ? txn.amount : 0,
        price: typeof txn.price === "number" ? txn.price : 0,
        date: txn.date ? new Date(txn.date) : new Date(),
        status: txn.status || "completed",
      }))
    : [];

  // Sort transactions by date (newest first)
  const sortedTransactions = [...displayTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);


  // Show only the 5 most recent transactions in dashboard
  const recentTransactions = sortedTransactions.slice(0, 5);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Transaction History</h2>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="p-6 sm:p-8 text-center">
          <svg
            className="w-10 sm:w-12 h-10 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-lg">
                        {typeIcons[transaction.type as keyof typeof typeIcons] || "💱"}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {transaction.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      {transaction.symbol.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {transaction.type === 'deposit' || transaction.type === 'withdrawal' 
                        ? (transaction as any).formattedAmount || `${transaction.amount.toFixed(2)}`
                        : transaction.amount.toFixed(4)}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm text-gray-700">
                      {transaction.type === 'deposit' || transaction.type === 'withdrawal' 
                        ? 'N/A'
                        : `$${transaction.price.toFixed(2)}`}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[transaction.status as keyof typeof statusColors] || statusColors.completed
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {capitalize(transaction.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedTransactions.length > 5 && (
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <button className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View All {sortedTransactions.length} Transactions
          </button>
        </div>
      )}
    </div>
  );
};
