import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";

/**
 * ProtectedAdminRoute - Protect admin dashboard routes
 * 
 * - Checks if admin is logged in (token in localStorage)
 * - Verifies user role is 'admin'
 * - Redirects to /admin/login if not authenticated as admin
 * - Shows loading while checking authentication
 */
interface ProtectedAdminRouteProps {
  element: React.ReactElement;
  isLoading?: boolean;
}

export function ProtectedAdminRoute({ element, isLoading = false }: ProtectedAdminRouteProps) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  
  // If loading, show loading component
  if (isLoading) {
    return <Loading isLoading={true} message="Verifying Admin Access..." fullScreen={true} />;
  }

  // Not authenticated - redirect to admin login
  if (!token || !userStr) {
    return <Navigate to="/admin/login" replace />;
  }

  // Parse user object and check if admin
  try {
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      // User is logged in but not an admin - redirect to admin login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return <Navigate to="/admin/login" replace />;
    }
  } catch {
    // Invalid user data - redirect to admin login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated admin - render the element
  return element;
}
