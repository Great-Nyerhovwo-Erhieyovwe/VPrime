import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";
import { useAuthStatus } from "../../hooks/useAuth";

const backendUrl = import.meta.env.VITE_API_URL;

const VerificationPageContent: React.FC = () => {
  // STATE
  const [documentType, setDocumentType] = useState<string>("passport");
  const [documentNumber, setDocumentNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [recentVerifications, setRecentVerifications] = useState<Array<any>>([]);

  // Auth status hook
  const { isFrozen } = useAuthStatus();

  // DOCUMENT TYPES
  const docTypes = [
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "national_id", label: "National ID" },
    { value: "visa", label: "Visa" },
  ];

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const [userRes, verificationsRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/verifications`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const user = await userRes.json();
        const verifications = await verificationsRes.json();

        // Set full name from user
        if (user) {
          setFullName(
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || ""
          );
        }

        // Set recent verifications
        if (verifications.success && verifications.verifications) {
          const sorted = verifications.verifications.sort(
            (a: any, b: any) =>
              new Date(b.requestedAt).getTime() -
              new Date(a.requestedAt).getTime()
          );
          setRecentVerifications(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // VALIDATE FORM
  const validateForm = (): string | null => {
    if (!fullName.trim()) return "Please enter your full name";
    if (!documentType) return "Please select a document type";
    if (!documentNumber.trim()) return "Please enter document number";
    if (!expiryDate) return "Please enter expiry date";

    // Validate expiry date is in future
    const expiry = new Date(expiryDate);
    if (expiry < new Date()) return "Document must not be expired";

    return null;
  };

  // SUBMIT VERIFICATION REQUEST
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setModal({
        isOpen: true,
        title: "Validation Error",
        message: error,
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/requests/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType,
          documentNumber,
          expiryDate,
          fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          title: "Verification Submitted",
          message: `Your ${docTypes.find((d) => d.value === documentType)?.label} verification has been submitted. Our team will review and approve within 24-48 hours.`,
          type: "success",
        });

        // Reset form
        setDocumentNumber("");
        setExpiryDate("");

        // Refresh verification history
        setTimeout(() => {
          const token = localStorage.getItem("token");
          if (token) {
            fetch(`${backendUrl}/api/requests/verifications`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((r) => r.json())
              .then((d) => {
                if (d.success && d.verifications) {
                  const sorted = d.verifications.sort(
                    (a: any, b: any) =>
                      new Date(b.requestedAt).getTime() -
                      new Date(a.requestedAt).getTime()
                  );
                  setRecentVerifications(sorted.slice(0, 5));
                }
              });
          }
        }, 1000);
      } else {
        setModal({
          isOpen: true,
          title: "Submission Failed",
          message: data.message || "Failed to submit verification request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "Failed to submit verification request",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading isLoading={true} message="Loading verification page..." />;
  }

  // Status badge colors
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
      <Loading isLoading={isSubmitting} message="Submitting verification..." />
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Identity Verification</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verify your identity to unlock full platform access
        </p>
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
                <p>Your account is currently frozen. You cannot submit verification requests until your account is unfrozen by an administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
        <p className="text-sm text-orange-800 dark:text-orange-200">
          ⚠️ KYC verification is required to withdraw funds. Submit your valid government-issued ID to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Submit Verification
          </h2>

          <form onSubmit={handleSubmitVerification} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name (as on document)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {docTypes.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Number
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g., A12345678"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Document Upload Info */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📄 Ensure all details match your document exactly. Clear, legible scans are required.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!documentNumber || !expiryDate || isSubmitting || isFrozen}
              className="w-full px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : isFrozen ? "Account Frozen" : "Submit for Verification"}
            </button>
          </form>

          {/* Document Requirements */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Document Requirements:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Must be a valid government-issued ID</li>
              <li>• Must not be expired</li>
              <li>• All fields must be clearly visible</li>
              <li>• No filters or edits allowed</li>
            </ul>
          </div>
        </div>

        {/* Verification History */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Verification History
          </h2>
          <div className="space-y-3">
            {recentVerifications.length > 0 ? (
              recentVerifications.map((verification) => (
                <div
                  key={verification._id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {docTypes.find((d) => d.value === verification.documentType)
                          ?.label || verification.documentType}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {verification.documentNumber}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        verification.status
                      )}`}
                    >
                      {verification.status
                        .charAt(0)
                        .toUpperCase() + verification.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(verification.requestedAt).toLocaleDateString()}
                  </p>
                  {verification.adminNotes && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      {verification.adminNotes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-6">
                No verification requests yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VerificationPage: React.FC = () => {
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
      <VerificationPageContent />
    </DashboardLayout>
  );
};

export default VerificationPage;
