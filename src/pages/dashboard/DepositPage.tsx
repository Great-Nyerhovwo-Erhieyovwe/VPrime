import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";

const backendUrl = import.meta.env.VITE_API_URL;

const parseCurrencyValue = (value: any, fallback: number = 0) => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(normalized) ? normalized : fallback;
};

const parseFee = (fee: string | undefined): number => {
  if (!fee) return 0;
  if (fee.toLowerCase().includes("free")) return 0;
  const parsed = parseFloat(fee.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatCurrency = (value: any, currencyCode: string = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseCurrencyValue(value, 0));
};

const DepositPageContent: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Form state
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");

  const [currency, setCurrency] = useState<string>("USD");

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [agreed, setAgreed] = useState(false);

  // Modal state for feedback
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info" | "confirm";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  // Deposit history
  const [recentDeposits, setRecentDeposits] = useState<Array<any>>([]);

  // Deposit settings
  const [depositSettings, setDepositSettings] = useState<{
    bank: {
      accountNumber: string;
      accountHolder: string;
      routingNumber: string;
      bankName: string;
    };
    crypto: {
      address: string;
    };
  }>({
    bank: {
      accountNumber: "Loading...",
      accountHolder: "Loading...",
      routingNumber: "Loading...",
      bankName: "Loading...",
    },
    crypto: {
      address: "Loading...",
    },
  });

  // ============================================================================
  // DEPOSIT METHODS
  // ============================================================================
  const depositMethods = [
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      processingTime: "1-3 business days",
      fee: "Free",
      enabled: true,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      processingTime: "Instant",
      fee: "2%",
      enabled: false,
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: "₿",
      processingTime: "10-30 minutes",
      fee: "0.5%",
      enabled: true,
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: "📱",
      processingTime: "Instant",
      fee: "1%",
      enabled: false,
    },
  ];

  const selectedMethodData = depositMethods.find((m) => m.id === selectedMethod);

  // ============================================================================
  // DATA FETCHING - GET INITIAL DATA
  // ============================================================================
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        window.location.href = "/login";
        return;
      }

      try {
        // Fetch portfolio, deposit history, user, and deposit settings in parallel
        const [portfolioRes, depositsRes, userRes, settingsRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/deposits`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/dashboard/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/dashboard/deposit-settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const portfolio = await portfolioRes.json();
        const deposits = await depositsRes.json();
        const user = await userRes.json();
        const settings = await settingsRes.json();

        setCurrency(user.currency || "USD");

        setAvailableBalance(portfolio.totalBalance || portfolio.balanceUsd || 0);

        if (deposits.success && deposits.deposits) {
          // Show only last 5 deposits, sorted by most recent
          const sorted = deposits.deposits.sort(
            (a: any, b: any) =>
              new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          );
          setRecentDeposits(sorted.slice(0, 5));
        }

        if (settings.success && settings.data) {
          setDepositSettings(settings.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================================
  // FORM SUBMISSION HANDLER
  // ============================================================================
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const parsedAmount = parseFloat(amount || "0");
    if (!amount || isNaN(parsedAmount) || parsedAmount < 50) {
      setModal({
        isOpen: true,
        title: "Invalid Amount",
        message: "Minimum deposit amount is $50",
        type: "error",
      });
      return;
    }

    if (!agreed) {
      setModal({
        isOpen: true,
        title: "Terms Required",
        message: "You must agree to the terms and conditions before proceeding.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      // Call backend endpoint to create deposit request
      const response = await fetch(`${backendUrl}/api/requests/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parsedAmount,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Success! Show confirmation modal
        setModal({
          isOpen: true,
          title: "Deposit Request Submitted",
          message: `Your deposit of ${formatCurrency(amount, currency)} has been submitted successfully. Our admins will review and approve your request within 24 hours.`,
          type: "success",
        });

        // Clear form
        setAmount("");

        // Refresh deposit history after 1 second
        setTimeout(() => {
          const token = localStorage.getItem("token");
          fetch(`${backendUrl}/api/requests/deposits`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.deposits) {
                const sorted = d.deposits.sort(
                  (a: any, b: any) =>
                    new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
                );
                setRecentDeposits(sorted.slice(0, 5));
              }
            });
        }, 1000);
      } else {
        // Backend validation failed
        setModal({
          isOpen: true,
          title: "Deposit Failed",
          message: data.message || "Failed to submit deposit request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Deposit submission error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to submit deposit. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (isLoading) {
    return <Loading isLoading={true} message="Loading deposit page..." />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="space-y-6">
      {/* Loading overlay when submitting */}
      <Loading isLoading={isSubmitting} message="Processing your deposit..." />

      {/* Feedback modal */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Deposit Funds</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Add funds to your trading account and start investing
        </p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-300">
          {formatCurrency(availableBalance, currency)}
        </p>
      </div>

      {/* Deposit Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Select Deposit Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depositMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => method.enabled && setSelectedMethod(method.id)}
              disabled={!method.enabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${!method.enabled
                ? "border-gray-200 bg-gray-50 dark:bg-gray-700 opacity-60 cursor-not-allowed"
                : selectedMethod === method.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 cursor-pointer"
                  : "border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-700 dark:hover:border-gray-600 cursor-pointer"
                }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{method.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-600">
                      {method.processingTime}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Fee: {method.fee}</p>
                {!method.enabled && (
                  <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deposit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {selectedMethodData?.name}
        </h2>

        <form onSubmit={handleSubmitDeposit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deposit Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">{currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="50"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Minimum deposit: {currency}50
            </p>
          </div>

          {/* Fee Information */}
          {amount && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Deposit Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Fee ({selectedMethodData?.fee}):</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(
                      parseCurrencyValue(amount || "0") * (parseFee(selectedMethodData?.fee) / 100),
                      currency
                    )}
                  </span>
                </div>
                <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    You'll Deposit:
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(
                      parseCurrencyValue(amount || "0") -
                      parseCurrencyValue(amount || "0") * (parseFee(selectedMethodData?.fee) / 100),
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {selectedMethod === 'bank' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Bank Account Details</p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Account Number</p>
                  <p className="font-mono text-gray-900 dark:text-gray-100">{depositSettings.bank.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Account Holder</p>
                  <p className="font-mono text-gray-900 dark:text-gray-100">{depositSettings.bank.accountHolder}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Routing Number</p>
                  <p className="font-mono text-gray-900 dark:text-gray-100">{depositSettings.bank.routingNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bank Name</p>
                  <p className="font-mono text-gray-900 dark:text-gray-100">{depositSettings.bank.bankName}</p>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'crypto' && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded font-mono text-xs text-gray-900 dark:text-gray-100">
                  {depositSettings.crypto.address}
                </code>
                <button type="button" onClick={() => {
                  navigator.clipboard.writeText(depositSettings.crypto.address);
                  alert('Copied to clipboard');
                }}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                ><svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                    <path d="M16 1H4a2 2 0 00-2 2v12h2V3h12V1z" />
                    <path d="M20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              className="mt-1"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-300">
              I agree to the terms and conditions and understand that my deposit
              will be processed after admin approval
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!amount || isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Deposit Request"}
          </button>
        </form>
      </div>

      {/* Recent Deposits */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Recent Deposits
        </h2>
        <div className="space-y-3">
          {recentDeposits.length > 0 ? (
            recentDeposits.map((deposit) => (
              <div
                key={deposit.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(deposit.amount, deposit.currency || currency)} - {deposit.payment_method || deposit.paymentMethod}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(deposit.requested_at || deposit.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${deposit.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : deposit.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-4">No deposits yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE WRAPPER WITH USER PROFILE FETCHING
// ============================================================================
export const DepositPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch real user profile from API
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
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: "User", email: "" }}>
      <DepositPageContent />
    </DashboardLayout>
  );
};

export default DepositPage;
