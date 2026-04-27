import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_API_URL;

const MarketsPageContent: React.FC = () => {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [markets, setMarkets] = useState<Array<any>>([]);

  useEffect(() => {
    fetch(`${backendUrl}/api/market`)
      .then((r) => r.json())
      .then((d) => setMarkets(d.markets || []))
      .catch(() => setMarkets([]));
  }, []);

  const filteredMarkets = markets.filter(
    (market) =>
      (selectedCategory === "all" || market.category === selectedCategory) &&
      (market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Markets & Pairs</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore and trade cryptocurrency pairs
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {["all", "crypto"].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Markets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.map((market, idx) => (
                <tr
                  key={market.id}
                  className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                    idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{market.icon}</span>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          {market.symbol}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{market.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      ${market.price.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        market.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {market.change >= 0 ? "↑" : "↓"}
                      {Math.abs(market.change).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{market.volume}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm" onClick={() => navigate('/dashboard/trade')}>
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Market Cap</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">$2.1T</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 2.5% (24h)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">24h Volume</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">$85.3B</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-2">↓ 1.2% (24h)</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">BTC Dominance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">48.5%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">↑ 0.3% (24h)</p>
        </div>
      </div>
    </div>
  );
};

export const MarketsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login'
      return;
    }

    fetch(`${backendUrl}/api/dashboard/user`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setUser({
        name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
        email: d.email || '',
        isVerified: d.emailVerified || false
      }))
      .catch(() => setUser({ name: 'User', email: '', isVerified: false }));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout user={user}>
      <MarketsPageContent />
    </DashboardLayout>
  );
};

export default MarketsPage;
