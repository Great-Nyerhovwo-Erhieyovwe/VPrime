import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

interface DashboardNotification {
  id: string;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string;
}

const backendUrl = import.meta.env.VITE_API_URL;

const NotificationsPageContent: React.FC = () => {
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  console.log(userProfile);
  console.log(loading);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${backendUrl}/api/dashboard/user`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${backendUrl}/api/dashboard/notifications`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([userData, notificationsData]) => {
      if (userData) {
        setUserProfile({
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
          email: userData.email || '',
          isVerified: userData.emailVerified
        });
      }
      const notifs = (notificationsData.notifications || []).map((n: any) => ({
        id: n._id || n.id,
        type: n.type || 'info',
        title: n.title || 'Notification',
        message: n.message || '',
        timestamp: new Date(n.timestamp),
        read: n.read || false,
        icon: n.type === 'success' ? '✓' : n.type === 'alert' ? '⚠️' : n.type === 'warning' ? '⚡' : 'ℹ️'
      }));
      setNotifications(notifs);
      setLoading(false);
    })
    .catch(() => {
      setNotifications([]);
      setLoading(false);
    });
  }, []);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    // setModal({ isOpen: true, title: 'Marked as Read', message: 'Notification marked as read.', type: 'success' });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // setModal({ isOpen: true, title: 'Deleted', message: 'Notification deleted successfully.', type: 'success' });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // setModal({ isOpen: true, title: 'All Read', message: 'All notifications marked as read.', type: 'success' });
  };

  const typeColors = {
    alert: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-700",
    info: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/20 dark:border-blue-700",
    success: "text-green-600 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-700",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700",
  };

  const timeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  const filterTabs = [
    { key: 'all', label: "All" },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Stay updated with your account activity</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>
      
      {/* <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, isOpen: false})}
      /> */}

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as "all" | "unread")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab.label}
              {tab.count && (
                <span className="ml-2 px-2 py-1 bg-red-600 text-white rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border-l-4 p-4 transition-all ${
                typeColors[notification.type]
              } ${notification.read ? "opacity-75" : "opacity-100"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-2xl mt-1">{notification.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-current rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {timeAgo(new Date(notification.timestamp))}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:bg-opacity-50 rounded transition-colors"
                      title="Mark as read"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-white dark:hover:bg-gray-700 hover:bg-opacity-50 rounded transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-3">
          {[
            "Trade executions",
            "Price alerts",
            "Account updates",
            "Security alerts",
            "System messages",
            "Marketing emails",
          ].map((pref, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">{pref}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 dark:accent-purple-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NotificationsPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

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
      <NotificationsPageContent />
    </DashboardLayout>
  );
};

export default NotificationsPage;
