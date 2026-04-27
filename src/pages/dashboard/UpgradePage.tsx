import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";
import { useAuthStatus } from "../../hooks/useAuth";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: string;

  withdrawal: {
    minUsd: number;
    maxUsd: number;
    frequencyDays: number;
  }
}

const backendUrl = import.meta.env.VITE_API_URL;

const UpgradePageContent: React.FC = () => {
  // const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("free");

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [upgradeHistory, setUpgradeHistory] = useState<Array<any>>([]);

  // Auth status hook
  const { isFrozen } = useAuthStatus();

  const plans: Plan[] = [
    {
      id: "mini",
      name: "Mini",
      price: 49.99,
      description: "Perfect for beginners",
      icon: "🚀",
      withdrawal: { minUsd: 500, maxUsd: 5000, frequencyDays: 7},
      features: [
        "Up to $5,000 trading limit",
        "Basic market data",
        "Email support",
        "2 active trades",
        "Basic analytics",
      ],
    },
    {
      id: "standard",
      name: "Standard",
      price: 299.99,
      description: "For regular traders",
      icon: "⭐",
      withdrawal: { minUsd: 1000, maxUsd: 10000, frequencyDays: 3 },
      features: [
        "Up to $50,000 trading limit",
        "Advanced market data",
        "Priority email support",
        "10 active trades",
        "Advanced analytics",
        "API access",
      ],
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      price: 799.99,
      description: "For professional traders",
      icon: "💎",
      withdrawal: { minUsd: 5000, maxUsd: 50000, frequencyDays: 1 },
      features: [
        "Up to $500,000 trading limit",
        "Real-time market data",
        "24/7 phone & chat support",
        "Unlimited active trades",
        "Professional analytics",
        "API access",
        "Custom indicators",
        "Dedicated account manager",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: 1999.99,
      description: "For institutional traders",
      icon: "👑",
      withdrawal: { minUsd: 5000, maxUsd: 100000, frequencyDays: 1 },
      features: [
        "Unlimited trading limit",
        "Premium market data feeds",
        "24/7 dedicated support",
        "Unlimited active trades",
        "Enterprise analytics",
        "API access",
        "Custom indicators & bots",
        "Dedicated account manager",
        "Priority execution",
        "Custom integrations",
      ],
    },
  ];

  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(1)

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    Promise.all([
      fetch(`${backendUrl}/api/dashboard/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${backendUrl}/api/requests/upgrades`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${backendUrl}/api/dashboard/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([portfolio, upgrades, user]) => {
        // Set current plan from portfolio
        if (portfolio.upgradeLevel) {
          setCurrentPlan(portfolio.upgradeLevel);
        }

        // Set currency from user
        if (user && user.currency) {
          setCurrency(user.currency);
        }

        // Set upgrade history
        if (upgrades.success && upgrades.upgrades) {
          const sorted = upgrades.upgrades.sort(
            (a: any, b: any) =>
              new Date(b.requestedAt).getTime() -
              new Date(a.requestedAt).getTime()
          );
          setUpgradeHistory(sorted.slice(0, 5));
        }
      })
      .catch((err) => console.error("Failed to fetch data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (currency === 'USD') return;

    fetch(`https:api.exchangerate.host/latest?base=USD&symbols=${currency}`)
      .then((res) => res.json())
      .then((data) => {
        setRate(data.rates[currency] || 1);
      });
  }, [currency]);

  // Converter function
  const convert = (usd: number) => usd * rate;

  // SUBMIT UPGRADE REQUEST
  const handleUpgrade = async (planId: string) => {
    // Check if already on this plan
    if (planId === currentPlan) {
      setModal({
        isOpen: true,
        title: "Already Subscribed",
        message: `You are already on the ${plans.find((p) => p.id === planId)?.name} plan`,
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    // const user = { upgradeLevel: currentPlan }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/requests/upgrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          upgradeLevel: planId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const targetPlan = plans.find((p) => p.id === planId);
        setModal({
          isOpen: true,
          title: "Upgrade Request Submitted",
          message: `Your upgrade to ${targetPlan?.name} plan has been submitted and is awaiting admin approval. You'll be notified once it's approved.`,
          type: "success",
        });

        // Refresh upgrade history
        setTimeout(() => {
          const token = localStorage.getItem("token");
          fetch(`${backendUrl}/api/requests/upgrades`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.upgrades) {
                const sorted = d.upgrades.sort(
                  (a: any, b: any) =>
                    new Date(b.requestedAt).getTime() -
                    new Date(a.requestedAt).getTime()
                );
                setUpgradeHistory(sorted.slice(0, 5));
              }
            });
        }, 1000);
      } else {
        setModal({
          isOpen: true,
          title: "Upgrade Failed",
          message: data.message || "Failed to submit upgrade request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to submit upgrade request",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading isLoading={true} message="Loading upgrade options..." />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400";
      default:
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400";
    }
  };

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Processing upgrade..." />
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upgrade Your Account</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Choose the perfect plan for your trading needs</p>
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
                <p>Your account is currently frozen. You cannot upgrade your account until your account is unfrozen by an administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          <span className="font-bold">Current Plan:</span>{" "}
          {plans.find((p) => p.id === currentPlan)?.name || "Free"} -
          {currentPlan ? (
            <>
              {currency}{" "}
              {convert(plans.find((p) => p.id === currentPlan)?.price || 0)}/month
            </>
          ) : (
            " No active plan"
          )}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg border-2 overflow-hidden transition-all relative ${
              plan.id === currentPlan
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800"
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
            )}

            {/* Current Badge */}
            {plan.id === currentPlan && (
              <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                CURRENT
              </div>
            )}

            <div className="p-6">
              {/* Icon and Name */}
              <div className="mb-4">
                <span className="text-4xl mb-2 block">{plan.icon}</span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {currency} {convert(plan.price).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits:2,
                  })}
                  <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
                <p>
                  Min Withdrawal: {currency}{" "}
                  {convert(plan.withdrawal.minUsd)}
                </p>
                <p>
                  Max Withdrawal: {currency}{" "}
                  {convert(plan.withdrawal.maxUsd)}
                </p>
              </div>

              {/* Button */}
              {plan.id === currentPlan ? (
                <button className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium cursor-not-allowed">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isSubmitting || isFrozen}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : isFrozen ? "Account Frozen" : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade History */}
      {upgradeHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Upgrade History
          </h2>
          <div className="space-y-3">
            {upgradeHistory.map((upgrade) => (
              <div
                key={upgrade._id}
                  className="p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Upgrade to {plans.find((p) => p.id === upgrade.targetLevel)?.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${plans.find((p) => p.id === upgrade.targetLevel)?.price}/month
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      upgrade.status
                    )}`}
                  >
                    {upgrade.status.charAt(0).toUpperCase() +
                      upgrade.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(upgrade.requestedAt).toLocaleDateString()}
                </p>
                {upgrade.adminNotes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    {upgrade.adminNotes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I upgrade or downgrade anytime?",
              a: "Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, bank transfers, and cryptocurrency payments.",
            },
            {
              q: "Is there a free trial?",
              a: "Yes, all new users get a 7-day free trial of any plan they choose.",
            },
            {
              q: "What happens if I downgrade?",
              a: "You'll get a prorated refund for the unused portion of your current billing cycle.",
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0"
            >
              <p className="font-medium text-gray-900 dark:text-white mb-2">{faq.q}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Sales */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Need Custom Plan?</h2>
        <p className="mb-4">
          Contact our sales team for enterprise solutions and custom pricing
        </p>
        <button className="px-6 py-2 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() =>('/support')}>
          Get in Touch
        </button>
      </div>
    </div>
  );
};

export const UpgradePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    };

    fetch(`${backendUrl}/api/dashboard/user`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
            email: d.email || '',
            isVerified: d.emailVerified
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout user={userProfile || { name: 'User', email: '' }}>
      <UpgradePageContent />
    </DashboardLayout>
  );
};

export default UpgradePage;
