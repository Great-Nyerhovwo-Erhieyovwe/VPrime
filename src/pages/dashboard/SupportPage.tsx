import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
// import Loading from "../../components/Loading/Loading";

const backendUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://vprimeapi.onrender.com' : 'http://localhost:4000');

const SupportPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tawk.to embed script
    const Tawk_API = (window as any).Tawk_API || {};
    const Tawk_LoadStart = new Date();
    if (!document.getElementById("tawk-script")) {
      const s1 = document.createElement("script");
      s1.id = "tawk-script";
      s1.src = "https://embed.tawk.to/twkid/default"; // updated later
      s1.async = true;
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");
      document.body.appendChild(s1);
    }
    console.log(Tawk_API, Tawk_LoadStart)
  }, []);

  const faqs = [
    {
      category: "Account",
      questions: [
        {
          q: "How do I reset my password?",
          a: "Go to Settings > Security and click 'Change Password'. You'll receive a verification email.",
        },
        {
          q: "Can I change my email address?",
          a: "Yes, go to Settings > Profile and update your email. You'll need to verify the new email.",
        },
        {
          q: "How do I enable two-factor authentication?",
          a: "Visit Settings > Security and enable 2FA. You can use an authenticator app or SMS.",
        },
      ],
    },
    {
      category: "Trading",
      questions: [
        {
          q: "What are the trading limits?",
          a: "Limits depend on your verification level. Basic: $10k, Advanced: $100k, Expert: Unlimited.",
        },
        {
          q: "What fees do you charge?",
          a: "We charge 0.1% maker fee and 0.15% taker fee. Premium users get reduced fees.",
        },
        {
          q: "How long does a trade take to execute?",
          a: "Most trades execute instantly. Complex orders may take a few seconds.",
        },
      ],
    },
    {
      category: "Deposits & Withdrawals",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "We accept credit/debit cards, bank transfers, cryptocurrency, and digital wallets.",
        },
        {
          q: "How long do deposits take?",
          a: "Cards: instant, Bank transfers: 1-3 days, Crypto: 10-30 minutes.",
        },
        {
          q: "Are there withdrawal limits?",
          a: "Yes, limits depend on your verification level. Contact support for higher limits.",
        },
      ],
    },
  ];

  //  if (isLoading) return <Loading isLoading={true} message="Loading support page..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Support Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Get help and find answers to common questions</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex gap-4">
          {["faq", "contact"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "faq" | "contact")}
              className={`px-6 py-2 font-medium transition-colors rounded-lg ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "faq" ? "FAQ" : "Contact Us"}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Search FAQs..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* FAQ Sections */}
          {faqs.map((section, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((item, qidx) => (
                  <details
                    key={qidx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <summary className="p-4 cursor-pointer font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between">
                      {item.q}
                      <span className="text-blue-600">+</span>
                    </summary>
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Send us a Message
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What can we help you with?"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                </div>
              </div>

              <button className="w-full px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const Tawk_API = (window as any).Tawk_API;
                  if (Tawk_API && Tawk_API.maximize) {
                    Tawk_API.maximize(); // opens the chat widget
                  }
              }}
              >
                Send Message
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {/* Email */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                support@vprime.com
              </p>
              <p className="text-sm text-gray-600">
                Response time: Within 24 hours
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Phone (WhatsApp)</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                +63 (935) 686-9755
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Available: Mon-Fri 9AM-6PM EST
              </p>
            </div>

            {/* Live Chat */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Live Chat</h3>
              <p className="text-sm text-blue-900 dark:text-blue-200 mb-3">
                Chat with our support team instantly
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
            </div>

            {/* Status Page */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                System Status
              </h3>
              <p className="text-green-600 dark:text-green-300 font-medium">All systems operational</p>
              <button className="text-blue-600 hover:text-blue-700 text-sm mt-2">
                View status page →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SupportPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      window.location.href = '/login';
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
      <SupportPageContent />
    </DashboardLayout>
  );
};

export default SupportPage;
