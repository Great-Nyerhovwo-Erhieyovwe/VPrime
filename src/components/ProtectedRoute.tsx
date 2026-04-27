import { Navigate } from "react-router-dom";
import Loading from "./Loading/Loading";
import { useAuthStatus } from "../hooks/useAuth";

/**
 * ProtectedRoute - Protect user dashboard routes
 *
 * - Checks if user is logged in (token in localStorage)
 * - Redirects to /login if not authenticated
 * - Shows loading while checking authentication
 * - Handles banned users (auto-logout)
 * - Allows frozen users to access dashboard but with restrictions
 */
interface ProtectedRouteProps {
  element: React.ReactElement;
  isLoading?: boolean;
}

export function ProtectedRoute({ element, isLoading = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading: authLoading, isBanned } = useAuthStatus();

  // If loading auth status, show loading
  if (authLoading || isLoading) {
    return <Loading isLoading={true} message="Loading Dashboard..." fullScreen={true} />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Banned user - should be auto-logged out by useAuthStatus, but just in case
  if (isBanned) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated (including frozen users) - render the element
  // Frozen users can still access dashboard but actions will be blocked by backend
  return element;
}
