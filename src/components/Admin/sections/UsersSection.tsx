import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiEye, FiEyeOff, FiSave, FiTrash2, FiSearch } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { User } from '../../../types/admin';

interface UsersSectionProps {
    users: User[];
    onRefresh: () => void;
    onUpdate: (id: string, updates: Partial<User>) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    loading: boolean;
}

export const UsersSection = ({ users, onRefresh, onUpdate, onDelete, loading }: UsersSectionProps) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [editForm, setEditForm] = useState<Partial<User> | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    console.log(showPassword, FiEye, FiEyeOff)

    useEffect(() => {
        onRefresh();
    }, []);

    const getUserId = (user: User | null | Partial<User>) => {
        if (!user) return '';
        return (user.id || (user as any)._id || '').toString();
    };

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setEditForm({
            ...user,
            password: String((user as any).password || ''),
            withdrawal_min_usd: (user as any).withdrawal_min_usd ?? 500,
            withdrawal_max_usd: (user as any).withdrawal_max_usd ?? 5000,
            banned: user.banned ?? false,
            frozen: user.frozen ?? false,
        });
        setShowPassword(false);
    };

    const handleSave = async () => {
        if (!selectedUser || !editForm) return;
        setIsSaving(true);
        const success = await onUpdate(getUserId(selectedUser), {
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            email: editForm.email,
            password: editForm.password,
            balanceUsd: Number(editForm.balanceUsd),
            roi: Number(editForm.roi),
            country: editForm.country,
            emailVerified: !!editForm.emailVerified,
            banned: !!editForm.banned,
            frozen: !!editForm.frozen,
            withdrawal_min_usd: Number(editForm.withdrawal_min_usd ?? 500),
            withdrawal_max_usd: Number(editForm.withdrawal_max_usd ?? 5000),
            bankAccountHolder: editForm.bankAccountHolder,
            bankName: editForm.bankName,
            bitcoinAddress: editForm.bitcoinAddress,
            ethereumAddress: editForm.ethereumAddress,
        });
        setIsSaving(false);
        if (success) {
            setSelectedUser(null);
            onRefresh();
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        if (!confirm('Are you sure you want to delete this user?')) return;
        const success = await onDelete(getUserId(selectedUser));
        if (success) {
            setSelectedUser(null);
            onRefresh();
        }
    };

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Users List */}
            <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <FiUsers size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">All Users</h3>
                                <p className="text-white/50 text-sm">{users.length} total users</p>
                            </div>
                        </div>
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-blue-500/50 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-white/50">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-white/50">No users found</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <motion.div
                                    key={user.id || user._id}
                                    onClick={() => handleSelectUser(user)}
                                    className={`
                    p-4 cursor-pointer transition-all
                    ${(selectedUser && (selectedUser.id || (selectedUser as any)._id)) === (user.id || user._id)
                                            ? 'bg-blue-500/10 border-l-4 border-blue-500'
                                            : 'hover:bg-white/5 border-l-4 border-transparent'
                                        }
                  `}
                                    whileHover={{ x: 4 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white">{user.email}</span>
                                                {user.emailVerified && <StatusBadge status="verified" variant="small" />}
                                            </div>
                                            <p className="text-white/50 text-sm">
                                                {user.firstName} {user.lastName} • {user.country || 'Unknown'}
                                            </p>
                                            <p className="text-white/40 text-xs mt-1">
                                                Balance: {(user.balanceUsd || 0).toLocaleString()} • ROI: {user.roi || 0}%
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            {user.banned && <StatusBadge status="banned" variant="small" />}
                                            {user.frozen && <StatusBadge status="frozen" variant="small" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* User Details */}
            <div className="lg:sticky lg:top-24 h-fit">
                <AnimatePresence mode="wait">
                    {selectedUser && editForm ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-6">Edit User</h3>

                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">First Name</label>
                                            <input
                                                type="text"
                                                value={editForm.firstName || ''}
                                                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                value={editForm.lastName || ''}
                                                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Password (new)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={editForm.password || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                    placeholder="Set new password"
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    className="px-3 py-2 rounded-lg bg-white/10 text-white text-xs"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >{showPassword ? 'Hide' : 'Show'}</button>
                                            </div>
                                            <p className="text-white/50 text-xs mt-1">Leave blank to keep existing password.</p>
                                        </div>
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Limits</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="number"
                                                    value={(editForm as any).withdrawal_min_usd || 500}
                                                    onChange={(e) => setEditForm({ ...editForm, withdrawal_min_usd: Number(e.target.value) })}
                                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                                    placeholder="Min"
                                                />
                                                <input
                                                    type="number"
                                                    value={(editForm as any).withdrawal_max_usd || 5000}
                                                    onChange={(e) => setEditForm({ ...editForm, withdrawal_max_usd: Number(e.target.value) })}
                                                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                                    placeholder="Max"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-white/60 text-sm mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email || ''}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Balance (USD)</label>
                                            <input
                                                type="number"
                                                value={editForm.balanceUsd || 0}
                                                onChange={(e) => setEditForm({ ...editForm, balanceUsd: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">ROI (%)</label>
                                            <input
                                                type="number"
                                                value={editForm.roi || 0}
                                                onChange={(e) => setEditForm({ ...editForm, roi: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Withdrawal Min</label>
                                            <input
                                                type="number"
                                                value={(editForm as any).withdrawal_min_usd || 500}
                                                onChange={(e) => setEditForm({ ...editForm, withdrawal_min_usd: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white/60 text-sm mb-2">Withdrawal Max</label>
                                            <input
                                                type="number"
                                                value={(editForm as any).withdrawal_max_usd || 5000}
                                                onChange={(e) => setEditForm({ ...editForm, withdrawal_max_usd: Number(e.target.value) })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editForm.emailVerified || false}
                                                onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-green-500"
                                            />
                                            <span className="text-white/70 text-sm">Email Verified</span>
                                        </label>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setEditForm({ ...editForm, banned: !editForm.banned })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${editForm.banned ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                        >
                                            {editForm.banned ? 'Unban User' : 'Ban User'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setEditForm({ ...editForm, frozen: !editForm.frozen })}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors ${editForm.frozen ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                                        >
                                            {editForm.frozen ? 'Unfreeze Account' : 'Freeze Account'}
                                        </motion.button>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <h4 className="text-white font-semibold mb-3 text-sm">Bank Details</h4>
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                placeholder="Account Holder"
                                                value={editForm.bankAccountHolder || ''}
                                                onChange={(e) => setEditForm({ ...editForm, bankAccountHolder: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Bank Name"
                                                value={editForm.bankName || ''}
                                                onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-white/10">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                                        >
                                            <FiSave size={16} />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleDelete}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
                                        >
                                            <FiTrash2 size={16} />
                                            Delete
                                        </motion.button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <GlassCard className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <FiUsers className="text-white/30" size={32} />
                            </div>
                            <p className="text-white/50">Select a user to view details</p>
                        </GlassCard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};