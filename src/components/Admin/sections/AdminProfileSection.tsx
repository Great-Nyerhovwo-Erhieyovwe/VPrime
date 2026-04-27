import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSave, FiRefreshCw, FiLock, FiMail } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import type { AdminProfile } from '../../../types/admin';

interface AdminProfileSectionProps {
  profile: AdminProfile | null;
  onRefresh: () => void;
  onUpdate: (updates: Partial<AdminProfile> & { password?: string }) => Promise<boolean>;
  loading: boolean;
}

export const AdminProfileSection = ({ profile, onRefresh, onUpdate, loading }: AdminProfileSectionProps) => {
  const [formState, setFormState] = useState<Partial<AdminProfile> & { password: string }>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormState({
        email: profile.email || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        password: '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    const updates: Partial<AdminProfile> & { password?: string } = {
      email: formState.email,
      firstName: formState.firstName,
      lastName: formState.lastName,
    };

    if (formState.password) {
      updates.password = formState.password;
    }

    const success = await onUpdate(updates);
    setIsSaving(false);

    if (success) {
      alert('Admin profile updated successfully.');
      setFormState({ ...formState, password: '' });
      onRefresh();
    } else {
      alert('Failed to update admin profile.');
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
          <p className="text-white/60">Loading admin profile...</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
            <FiUser size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Admin Profile</h3>
            <p className="text-white/50 text-sm">Update your admin email, name, and password</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
        >
          <FiRefreshCw size={16} />
          Refresh
        </motion.button>
      </div>

      <GlassCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full pl-10 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Role</label>
            <input
              type="text"
              value={profile?.role || 'admin'}
              readOnly
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">First Name</label>
            <input
              type="text"
              value={formState.firstName}
              onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              placeholder="First name"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Last Name</label>
            <input
              type="text"
              value={formState.lastName}
              onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
              placeholder="Last name"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/60 text-sm mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={formState.password}
                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                className="w-full pl-10 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-purple-500/50 focus:outline-none"
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          <FiSave size={16} />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </motion.button>
      </div>
    </div>
  );
};
