import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkModeProvider } from "./contexts/DarkModeContext";
import Home from "./pages/Home/Home";
import Contact from "./pages/Home/Contact/Contact";
import About from "./pages/Home/About/AboutUs";
import Markets from "./pages/Home/Market/Market";
import Platform from "./pages/Home/Platform/Platform";
import Login from "./pages/auth/Login/Login";
import Signup from "./pages/auth/Signup/Signup";
import Dashboard from "./pages/dashboard/Dashboard"; 
import DepositPage from "./pages/dashboard/DepositPage";
import WithdrawalPage from "./pages/dashboard/WithdrawalPage";
import TradePage from "./pages/dashboard/TradePage";
import MarketsPage from "./pages/dashboard/MarketsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import UpgradePage from "./pages/dashboard/UpgradePage";
import VerificationPage from "./pages/dashboard/VerificationPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SupportPage from "./pages/dashboard/SupportPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { AdminRedirect } from "./components/AdminRedirect";

function App() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <Router>
      {/* Homepage routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/markets" element={<Markets />} />
      </Routes>

      {/* Auth routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      {/* User Dashboard routes - Protected */}
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/dashboard/deposit" element={<ProtectedRoute element={<DepositPage />} />} />
        <Route path="/dashboard/withdraw" element={<ProtectedRoute element={<WithdrawalPage />} />} />
        <Route path="/dashboard/trade" element={<ProtectedRoute element={<TradePage />} />} />
        <Route path="/dashboard/markets" element={<ProtectedRoute element={<MarketsPage />} />} />
        <Route path="/dashboard/settings" element={<ProtectedRoute element={<SettingsPage />} />} />
        <Route path="/dashboard/upgrade" element={<ProtectedRoute element={<UpgradePage />} />} />
        <Route path="/dashboard/verification" element={<ProtectedRoute element={<VerificationPage />} />} />
        <Route path="/dashboard/notifications" element={<ProtectedRoute element={<NotificationsPage />} />} />
        <Route path="/dashboard/support" element={<ProtectedRoute element={<SupportPage />} />} />
      </Routes>

      {/* Admin routes - Protected */}
      <Routes>
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/admin/login" element={<AdminLogin />} /> 
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute element={<AdminDashboard />} />} />
      </Routes>
      </Router>
      </DarkModeProvider>
    </QueryClientProvider>
  );
}

export default App;