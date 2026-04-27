import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";
import { useDarkMode } from "../../contexts/DarkModeContext";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
}

interface SettingsState {
  darkMode: boolean;
  notifications: boolean;
  emailMarketing: boolean;
  language: string;
  currency: string;
  timezone: string;
}

const backendUrl = import.meta.env.VITE_API_URL;

const SettingsPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">("preferences");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDarkMode, setDarkMode } = useDarkMode();

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Settings state (fetched from backend)
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: isDarkMode,
    notifications: true,
    emailMarketing: false,
    language: "en",
    currency: "USD",
    timezone: "UTC",
  });

  // Modal state
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  // FETCH DATA ON MOUNT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      window.location.href = '/login';
      return;
    }

    Promise.all([
      fetch(`${backendUrl}/api/dashboard/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${backendUrl}/api/requests/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([userData, settingsData]) => {
        // Set user profile
        if (userData) {
          setProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            avatar: (userData.firstName && userData.lastName)
              ? `${userData.firstName[0]}${userData.lastName[0]}`
              : "U",
          });
        }

        // Set settings - use existing settings if available
        if (settingsData.settings) {
          setSettings({
            darkMode: settingsData.settings.darkMode || false,
            notifications: settingsData.settings.notifications !== false,
            emailMarketing: settingsData.settings.emailMarketing || false,
            language: settingsData.settings.language || "en",
            currency: settingsData.settings.currency || "USD",
            timezone: settingsData.settings.timezone || "UTC",
          });
        }
      })
      .catch((err) => console.error("Failed to fetch data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // HANDLE SETTINGS CHANGE (IMMEDIATE UPDATE)
  const handleSettingChange = async (
    field: keyof SettingsState,
    value: any
  ) => {
    // Update local state immediately for instant UX
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);

    // Apply dark mode immediately using context
    if (field === "darkMode") {
      setDarkMode(value);
    }

    // Submit to backend asynchronously (no modal, silent update)
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${backendUrl}/api/requests/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        console.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // SUBMIT PROFILE CHANGES
  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/dashboard/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
        }),
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          title: "Profile Updated",
          message: "Your profile has been successfully updated",
          type: "success",
        });
      } else {
        setModal({
          isOpen: true,
          title: "Update Failed",
          message: "Failed to update profile. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({
        isOpen: true,
        title: "Error",
        message: "An error occurred while updating your profile",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading isLoading={true} message="Loading settings..." />;

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Saving changes..." />
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {["preferences", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "preferences" | "profile")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab === "preferences" ? "Preferences" : "Profile"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* PREFERENCES TAB - Settings with dark mode */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Dark Mode */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Theme</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Switch to dark theme for easier viewing in low light
                    </p>
                  </div>
                  <button
                    onClick={() => handleSettingChange("darkMode", !isDarkMode)}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      isDarkMode ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                        isDarkMode ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts about trades and account activity</p>
                    </div>
                    <button
                      onClick={() =>
                        handleSettingChange("notifications", !settings.notifications)
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        settings.notifications ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          settings.notifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Marketing</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional offers and updates</p>
                    </div>
                    <button
                      onClick={() =>
                        handleSettingChange("emailMarketing", !settings.emailMarketing)
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        settings.emailMarketing ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <div
                        className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          settings.emailMarketing ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Preferences */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Display</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        handleSettingChange("language", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        handleSettingChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSettingChange("timezone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">EST</option>
                      <option value="CST">CST</option>
                      <option value="PST">PST</option>
                      <option value="GMT">GMT</option>
                    </select>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Settings are saved automatically as you change them
              </p>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {profile.avatar}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Upload Photo
                    </button>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) =>
                        handleProfileChange("firstName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) =>
                        handleProfileChange("lastName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) =>
                        handleProfileChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
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
            isVerified: d.emailVerified,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: "User", email: "" }}>
      <SettingsPageContent />
    </DashboardLayout>
  );
};

export default SettingsPage;
