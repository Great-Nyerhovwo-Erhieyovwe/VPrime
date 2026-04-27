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

const parseFee = (fee: string | undefined): number => {
  if (!fee) return 0;
  if (fee.toLowerCase().includes("free")) return 0;
  const parsed = parseFloat(fee.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

console.log('parseFee :', parseFee);

const formatCurrency = (value: any, currencyCode: string = "USD") => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(parseCurrencyValue(value, 0));
};

const WithdrawalPageContent: React.FC = () => {
  const { isFrozen } = useAuthStatus();

  // STATE
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [lastWithdrawalDate, setLastWithdrawalDate] = useState<Date | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [recentWithdrawals, setRecentWithdrawals] = useState<Array<any>>([]);

  // Bank Transfer Details
  const [bankDetails, setBankDetails] = useState<{
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  }>({ accountHolder: "", accountNumber: "", routingNumber: "", bankName: "" });

  // Crypto Wallet Address
  const [walletAddress, setWalletAddress] = useState<string>("");

  // WITHDRAWAL METHODS
  const withdrawalMethods = [
    { id: "bank", name: "Bank Transfer", icon: "🏦", processingTime: "1-3 business days", fee: "Free", enabled: true },
    { id: "card", name: "Debit Card", icon: "💳", processingTime: "1-2 business days", fee: "1%", enabled: false },
    { id: "crypto", name: "Cryptocurrency", icon: "₿", processingTime: "10-30 minutes", fee: "0.5%", enabled: true },
    { id: "wallet", name: "Digital Wallet", icon: "📱", processingTime: "Instant", fee: "1.5%", enabled: false },
  ];

  const selectedMethodData = withdrawalMethods.find((m) => m.id === selectedMethod);

  // const [currency, setCurrency] = useState<string>("USD");

  // const formatMoney = (amount: number, currency: string = 'USD') => {
  //   return new Intl.NumberFormat(undefined, {
  //     style: "currency",
  //     currency
  //   }).format(amount);
  // };


  const planWithdrawalLimits: Record<string, { min: number; max: number; frequencyDays: number; }> = {
    free: { min: 500, max: 5000, frequencyDays: 7 },
    mini: { min: 500, max: 5000, frequencyDays: 7 },
    standard: { min: 1000, max: 50000, frequencyDays: 3 },
    pro: { min: 5000, max: 500000, frequencyDays: 1 },
    premium: { min: 10000, max: Infinity, frequencyDays: 1 },
  };

  const [userPlan, setUserPlan] = useState<string>("free");
  const [currency, setCurrency] = useState<string>("USD");
  const [withdrawalLimits, setWithdrawalLimits] = useState<{ min: number; max: number; frequencyDays: number; }>({ min: 500, max: 5000, frequencyDays: 7 });
  // const [rate, setRate] = useState<number>(1);

  console.log('User plan :', userPlan);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
         return window.location.href = '/login';
        // return;
      }

      try {
        const [portfolioRes, withdrawalsRes, userRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/dashboard/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const portfolio = await portfolioRes.json();
        const withdrawals = await withdrawalsRes.json();
        const user = await userRes.json();

        setCurrency(user.currency || "USD");

        const planKey = portfolio.upgradeLevel || user.upgradeLevel || "free";
        setAvailableBalance(portfolio.totalBalance || portfolio.balanceUsd || 0);
        setUserPlan(planKey);

        const defaultPlanLimits = planWithdrawalLimits[planKey] || planWithdrawalLimits.free;
        if (user.withdrawal_min_usd !== undefined && user.withdrawal_max_usd !== undefined) {
          setWithdrawalLimits({
            min: user.withdrawal_min_usd,
            max: user.withdrawal_max_usd,
            frequencyDays: defaultPlanLimits.frequencyDays,
          });
        } else {
          // Fallback to plan-based limits
          setWithdrawalLimits(defaultPlanLimits);
        }

        // if (currency !== "USD" && rates[currency]) {
        //   setRate(rates[currency]);
        // }

        if (withdrawals.success && withdrawals.withdrawals) {
          // Find last approved withdrawal
          const approved = withdrawals.withdrawals
            .filter((w: any) => w.status === "approved")
            .sort((a: any, b: any) => new Date(b.approved_at || b.approvedAt).getTime() - new Date(a.approved_at || a.approvedAt).getTime());
          
          if (approved.length > 0) {
            setLastWithdrawalDate(new Date(approved[0].approvedAt));
          }

          const sorted = withdrawals.withdrawals.sort(
            (a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          );
          setRecentWithdrawals(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // VALIDATION
  const canWithdraw = () => {

    const limits = withdrawalLimits;

    const amt = parseFloat(amount || "0");

    // Check for valid number
    if (isNaN(amt)) return { can: false, reason: "Please enter a valid amount" };

    // Check minimum amount
    if (amt < limits.min)
      return { can: false, reason: `Minimum withdrawal is ${currency} ${(limits.min).toLocaleString()} ` };
    
    // Check maximum daily
    if (amt > limits.max) 
      return { can: false, reason: `Maximum daily withdrawal is ${currency} ${(limits.max).toLocaleString()} ` };
    
    // Check balance
    if (amt > availableBalance) return { can: false, reason: "Insufficient balance" };

    // Check required fields for selected method
    if (selectedMethod === "bank" && !bankDetails.accountHolder) {
      return { can: false, reason: "Please fill in all bank details" };
    }
    if (selectedMethod === "crypto" && !walletAddress) {
      return { can: false, reason: "Please enter a wallet address" };
    }
    
    const frequencyDays = limits.frequencyDays || 7;

    if (lastWithdrawalDate) {
      const cutoff = new Date(Date.now() - frequencyDays * 24 * 60 * 60 * 1000);
      if (lastWithdrawalDate > cutoff) {
        const daysLeft = Math.ceil((frequencyDays - (Date.now() - lastWithdrawalDate.getTime()) / (24 * 60 * 60 * 1000)));
        return { can: false, reason: `You can withdraw again in ${daysLeft} day${daysLeft === 1 ? '' : 's'}` };
      }
    }

    return { can: true };
  };

  // SUBMIT
  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is frozen
    if (isFrozen) {
      setModal({
        isOpen: true,
        title: "Account Frozen",
        message: "Your account is frozen and you cannot make withdrawals. Please contact support.",
        type: "error"
      });
      return;
    }

    const validation = canWithdraw();
    if (!validation.can) {
      setModal({ isOpen: true, title: "Cannot Withdraw", message: validation.reason || "Cannot withdraw at this time", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const withdrawalAmount = parseFloat(amount);
      const destinationAddr = selectedMethod === "crypto" ? walletAddress : 
                              selectedMethod === "bank" ? JSON.stringify(bankDetails) : null;

      const response = await fetch(`${backendUrl}/api/requests/withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: withdrawalAmount,
          withdrawalMethod: selectedMethod,
          destinationAddress: destinationAddr,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          title: "Withdrawal Submitted",
          message: `Your withdrawal of ${new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
          }).format(parseFloat(amount))} has been submitted. Admin approval usually takes 24-48 hours.`,
          type: "success",
        });
        setAmount("");

        setTimeout(() => {
          const token = localStorage.getItem("token");
          fetch(`${backendUrl}/api/requests/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                const sorted = d.withdrawals.sort(
                  (a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
                );
                setRecentWithdrawals(sorted.slice(0, 5));
              }
            });
        }, 1000);
      } else {
        setModal({
          isOpen: true,
          title: "Withdrawal Failed",
          message: data.message || "Failed to submit withdrawal request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({ isOpen: true, title: "Error", message: "Failed to submit withdrawal", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading isLoading={true} message="Loading withdrawal page..." />;

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Processing withdrawal request..." />
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-600 mt-2">Withdraw funds from your trading account</p>
      </div>

      {/* Frozen Account Warning */}
      {isFrozen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-lg">⚠️</span>
            <p className="text-yellow-800 font-medium">Account Frozen</p>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Your account is currently frozen. You cannot make withdrawals. Please contact support for assistance.
          </p>
        </div>
      )}

      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <p className="text-sm text-gray-600 mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-green-600">
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
          }).format(availableBalance)}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Withdrawal Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {withdrawalMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => method.enabled && setSelectedMethod(method.id)}
              disabled={!method.enabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                !method.enabled
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : selectedMethod === method.id
                    ? "border-green-600 bg-green-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{method.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-600">{method.processingTime}</p>
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

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{selectedMethodData?.name}</h2>

        <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">{currency}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min={withdrawalLimits.min}
                max={withdrawalLimits.max}
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Min: {currency} {(withdrawalLimits.min).toLocaleString()} |
              Max: {currency} {(withdrawalLimits.max).toLocaleString()} daily | {withdrawalLimits.frequencyDays === 1 ? 'Once per day' : `Once every ${withdrawalLimits.frequencyDays} days`}
            </p>
          </div>

          {/* Bank Transfer Details */}
          {selectedMethod === "bank" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="Bank name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
                  <input
                    type="text"
                    value={bankDetails.routingNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                    placeholder="9 digits"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="password"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Account number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          {/* Crypto Wallet Address */}
          {selectedMethod === "crypto" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {amount && !isNaN(parseFloat(amount)) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fee ({selectedMethodData?.fee || "0%"}):</span>
                  <span>
                    {formatCurrency(
                      selectedMethod === "bank"
                        ? 0
                        : parseCurrencyValue(amount || "0") * (selectedMethod === "crypto" ? 0.005 : 0.01),
                      currency
                    )}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                  <span>You'll Receive:</span>
                  <span>
                    {formatCurrency(
                      parseCurrencyValue(amount || "0") -
                        (selectedMethod === "bank" ? 0 : parseCurrencyValue(amount || "0") * (selectedMethod === "crypto" ? 0.005 : 0.01)),
                      currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!amount || isSubmitting || isFrozen}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFrozen ? "Account Frozen - Contact Support" : isSubmitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Withdrawals</h2>
        <div className="space-y-3">
          {recentWithdrawals.length > 0 ? (
            recentWithdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(withdrawal.amount, withdrawal.currency || currency)} - {withdrawal.withdrawal_method || withdrawal.withdrawalMethod}
                  </p>
                  <p className="text-sm text-gray-600">{new Date(withdrawal.requested_at || withdrawal.requestedAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    withdrawal.status === "approved" ? "bg-green-100 text-green-800" : withdrawal.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-4">No withdrawals yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const WithdrawalPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
      <WithdrawalPageContent />
    </DashboardLayout>
  );
};

export default WithdrawalPage;
