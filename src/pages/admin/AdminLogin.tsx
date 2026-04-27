// src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { InputField } from "../../components/Form/InputField";
import { motion } from "framer-motion";

/**
 * AdminLogin
 *
 * Frontend admin login page. This component:
 * - Calls the dedicated admin login endpoint `/api/admin/login`
 * - Stores the returned JWT in `localStorage` (used by `api` client)
 * - Verifies the returned user object has `role: 'admin'`
 * - Redirects to `/admin/dashboard` on success
 *
 * Security notes (frontend): * - Avoid storing long-lived credentials in the browser. We store a JWT
 *   which should be short-lived and refreshed via secure flows.
 * - Admin pages should be further locked down on the backend (IP allowlist,
 *   MFA) — frontend checks are only UX-oriented and NOT a security boundary.
 */
export default function AdminLogin() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Local form state
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");

  // Simple controlled input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({});
    setServerError("");
  };

  // Basic client-side validation for UX
  const validate = () => {
    const newErr: typeof errors = {};
    if (!form.email) newErr.email = "Email required.";
    if (!form.password) newErr.password = "Password required.";
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  /**
   * Use React Query mutation to call the admin login API.
   * We target `/api/admin/login` which returns { success, token, user }.
   * Note: api client points at the backend root, so use the full /api path.
   */
  const loginMutation = useMutation<any, unknown, { email: string; password: string }>({
    mutationFn: async (payload) => {
      console.log('🔄 Attempting admin login with:', payload.email);
      try {
        const res = await api.post("/api/admin/login", payload);
        console.log('✅ Admin login successful:', res.data);
        return res;
      } catch (error) {
        console.error('❌ Admin login failed:', error);
        throw error;
      }
    },
    onSuccess: async (res: any) => {
      try {
        // API returns a JWT token and user object
        const token: string | undefined = res?.data?.token;
        const user = res?.data?.user;

        if (!token) {
          setServerError("Authentication failed: no token received.");
          return;
        }

        // Persist the token - the `api` client attaches it to subsequent requests
        localStorage.setItem("token", token);

        // Basic role check: ensure backend flagged this user as admin
        if (!user || user.role !== "admin") {
          // Defensive: remove token if returned user is not admin
          localStorage.removeItem("token");
          setServerError("Account is not authorized as admin.");
          return;
        }

        // Store user object for protection checks
        localStorage.setItem("user", JSON.stringify(user));

        // Invalidate cached `me` query so other parts of app will refresh
        qc.invalidateQueries({ queryKey: ["me"] });

        // Redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } catch (err: any) {
        console.error("Admin login:onSuccess handler error:", err);
        setServerError("Unexpected error processing login result.");
      }
    },
    onError: (err: any) => {
      // Surface API error message when available
      const msg = err?.response?.data?.message || "Invalid credentials — please try again.";
      setServerError(msg);
    },
  });

  // React Query v5 vs older versions expose slightly different flags on
  // the mutation object (`isLoading` or `isPending`). Compute a stable
  // `isSubmitting` boolean that works across versions and TS checks.
  const isSubmitting = !!(
    (loginMutation as any).isLoading ?? (loginMutation as any).isPending ?? ((loginMutation as any).status === "loading")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    loginMutation.mutate(form);
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-primary">
      <div className="glass w-full max-w-md p-8">
        <h2 className="mb-6 text-center text-2xl font-bold text-white">Admin Login</h2>

        {serverError && (
          <p className="mb-4 rounded bg-red-900 p-2 text-center text-sm text-red-200">{serverError}</p>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          <motion.button
            type="submit"
            className="mt-4 w-full rounded-md bg-accent py-2 font-medium text-primary hover:bg-accent/90"
            whileHover={{ scale: 1.02 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign In as Admin"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-white/80">
          Not an admin? <Link to="/login" className="hover:text-accent">Login as user...</Link>
        </p>
      </div>
    </section>
  );
}