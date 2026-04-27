import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";
import { useAuthStatus } from "../../hooks/useAuth";

const backendUrl = import.meta.env.VITE_API_URL;

const parseCurrencyValue = (value: any, fallback: number = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(normalized) ? normalized : fallback;
};

const formatCurrency = (value: any, currencyCode: string = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseCurrencyValue(value, 0));
};

const TradePageContent: React.FC = () => {
  // STATE
  const [amount, setAmount] = useState<string>("");
  const [asset, setAsset] = useState<string>("EUR/USD");
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [leverage, setLeverage] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Currency Formatter
  const [currency, setCurrency] = useState("USD");

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [recentTrades, setRecentTrades] = useState<Array<any>>([]);

  // Auth status hook
  const { isFrozen } = useAuthStatus();

  // ASSETS
  const assets = ["EUR/USD", "GBP/USD", "BTC/USD", "ETH/USD", "GOLD", "OIL"];

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [portfolioRes, tradesRes, userRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/trades`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/dashboard/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const portfolio = await portfolioRes.json();
        const trades = await tradesRes.json();
        const user = await userRes.json();

        setAvailableBalance(portfolio.totalBalance || portfolio.balanceUsd || 0);
        setCurrency(user.currency || "USD");

        if (trades.success && trades.trades) {
          const sorted = trades.trades.sort(
            (a: any, b: any) => new Date(b.requested_at || b.requestedAt).getTime() - new Date(a.requested_at || a.requestedAt).getTime()
          );
          setRecentTrades(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // SUBMIT TRADE
  const handleSubmitTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount || "0");
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setModal({ isOpen: true, title: "Invalid Amount", message: "Please enter a valid trade amount", type: "error" });
      return;
    }

    if (parsedAmount > availableBalance) {
      setModal({ isOpen: true, title: "Insufficient Balance", message: "You don't have enough balance for this trade", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/requests/trade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          asset,
          type,
          leverage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          title: "Trade Executed",
          message: `${type.toUpperCase()} ${formatCurrency(amount, currency)} of ${asset} executed successfully. Your balance has been updated. Awaiting admin trade report.`,
          type: "success",
        });
        setAmount("");

        setTimeout(() => {
          const token = localStorage.getItem("token");
          Promise.all([
            fetch(`${backendUrl}/api/dashboard/portfolio`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
            fetch(`${backendUrl}/api/requests/trades`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json()),
          ]).then(([portfolio, trades]) => {
            setAvailableBalance(portfolio.totalBalance || portfolio.balanceUsd || 0);
            if (trades.success) {
              const sorted = trades.trades.sort(
                (a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
              );
              setRecentTrades(sorted.slice(0, 5));
            }
          });
        }, 1000);
      } else {
        setModal({ isOpen: true, title: "Trade Failed", message: data.message || "Failed to execute trade", type: "error" });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({ isOpen: true, title: "Error", message: "Failed to execute trade", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading isLoading={true} message="Loading trading page..." />;

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Executing trade..." />
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Execute Trade</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Trade currency pairs, commodities, and cryptocurrencies</p>
      </div>

      {isFrozen && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Account Frozen</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>Your account is currently frozen. You cannot execute trades until your account is unfrozen by an administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
          }).format(availableBalance)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Trade</h2>

          <form onSubmit={handleSubmitTrade} className="space-y-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {assets.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Trade Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setType("buy")}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    type === "buy" ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setType("sell")}
                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                    type === "sell" ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Amount</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">{currency}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Leverage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Leverage: {leverage}x</label>
              <input
                type="range"
                min="1"
                max="50"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Summary */}
            {amount && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Trade Amount:</span>
                    <span className="font-medium">{formatCurrency(amount, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leverage:</span>
                    <span className="font-medium">{leverage}x</span>
                  </div>
                  <div className="border-t border-purple-200 dark:border-purple-600 pt-2 flex justify-between font-bold">
                    <span>Deduct from Balance:</span>
                    <span className="text-red-600 dark:text-red-300">
                      {formatCurrency(amount, currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!amount || isSubmitting || isFrozen}
              className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Executing..." : isFrozen ? "Account Frozen" : "Execute Trade"}
            </button>
          </form>
        </div>

        {/* Active Trades */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Trades</h2>
          <div className="space-y-3">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade) => (
                <div key={trade.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {trade.type.toUpperCase()} {trade.asset}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{trade.amount}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trade.status === "closed"
                          ? trade.result === "gain"
                            ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      }`}
                    >
                      {trade.status === "closed"
                        ? trade.result === "gain"
                          ? `+${trade.resultAmount}`
                          : `-${trade.resultAmount}`
                        : "Pending"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">No trades yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TradePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${backendUrl}/api/dashboard/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ""} ${d.lastName || ""}`.trim() || "User",
            email: d.email || "",
            isVerified: d.emailVerified || false,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: "User", email: "" }}>
      <TradePageContent />
    </DashboardLayout>
  );
};

export default TradePage;
