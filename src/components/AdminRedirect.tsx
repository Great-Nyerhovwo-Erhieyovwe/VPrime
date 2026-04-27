import { Navigate } from "react-router-dom";

/**
 * AdminRedirect - Redirect /admin to /admin/dashboard
 * 
 * - If admin is logged in: redirects to /admin/dashboard
 * - If admin is NOT logged in: redirects to /admin/login
 */
export function AdminRedirect() {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  // Check if logged in
  if (!token || !userStr) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user is admin
  try {
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in as admin - redirect to dashboard
  return <Navigate to="/admin/dashboard" replace />;
}
