import { useState, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiCheck, FiX, FiEye, FiDownload, FiUser, FiFileText } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { VerificationRequest, User } from '../../../types/admin';

interface VerificationsSectionProps {
    verifications: VerificationRequest[];
    users: User[];
    onUpdate: (id: string, status: 'approved' | 'rejected', reason?: string) => void;
    isLoading?: boolean;
}

export const VerificationsSection = ({
    verifications,
    users,
    onUpdate,
    isLoading
}: VerificationsSectionProps) => {
    const [selectedVer, setSelectedVer] = useState<VerificationRequest | null>(null);
    const [reason, setReason] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [searchQuery, setSearchQuery] = useState('');


    console.log(isLoading);

    const pendingVers = verifications.filter((v) => {
        return (filter === 'all' || v.status === filter) &&
               (searchQuery === '' || v.userId.toLowerCase().includes(searchQuery.toLowerCase()));
    });

    const getUserById = (userId: string | User) => {
        if (typeof userId !== 'string') return userId;
        return users.find(u => (u._id || u.id) === userId);
    };

    const handleApprove = () => {
        if (selectedVer) {
            onUpdate(selectedVer._id || selectedVer.id || '', 'approved');
            setSelectedVer(null);
            setReason('');
        }
    };

    const handleReject = () => {
        if (selectedVer) {
            onUpdate(selectedVer._id || selectedVer.id || '', 'rejected', reason);
            setSelectedVer(null);
            setReason('');
        }
    };

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case 'passport': return '🛂';
            case 'drivers_license': return '🚗';
            case 'national_id': return '🆔';
            case 'visa': return '🌐';
            default: return '📄';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Verifications List */}
            <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                <FiCheckCircle size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">KYC Verifications</h3>
                                <p className="text-white/50 text-sm">
                                    {verifications.filter(v => v.status === 'pending').length} pending review
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search by user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                            />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500/50 focus:outline-none"
                            >
                                <option value="pending" className="bg-slate-900">Pending</option>
                                <option value="approved" className="bg-slate-900">Approved</option>
                                <option value="rejected" className="bg-slate-900">Rejected</option>
                                <option value="all" className="bg-slate-900">All</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                    {pendingVers.length === 0 ? (
                        <div className="p-8 text-center text-white/50">No verifications found</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {pendingVers.map((ver) => {
                                const user = getUserById(ver.userId);
                                return (
                                    <motion.div
                                        key={ver._id || ver.id}
                                        onClick={() => {
                                            setSelectedVer(ver);
                                            setReason('');
                                        }}
                                        className={`
                      p-4 cursor-pointer transition-all
                      ${selectedVer?._id === ver._id
                                                ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                                                : 'hover:bg-white/5 border-l-4 border-transparent'}
                    `}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                                                    {getDocumentIcon(ver.submittedData?.idType || ver.type)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-white">
                                                            {ver.submittedData?.idType?.replace('_', ' ') || ver.type}
                                                        </span>
                                                        <StatusBadge status={ver.status} variant="small" />
                                                    </div>
                                                    <p className="text-white/60 text-sm">
                                                        {user?.email || ver.userId}
                                                    </p>
                                                    <p className="text-white/40 text-xs mt-1">
                                                        Submitted: {new Date(ver.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-white/60 text-xs">Level {ver.verificationLevel}</p>
                                                {ver.documents?.length > 0 && (
                                                    <p className="text-cyan-400 text-xs mt-1">
                                                        {ver.documents.length} document{ver.documents.length > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Review Panel */}
            <div className="lg:sticky lg:top-24 h-fit">
                <AnimatePresence mode="wait">
                    {selectedVer ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-6">Review Verification</h3>

                                <div className="space-y-4">
                                    {/* User Info */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FiUser className="text-cyan-400" />
                                            <span className="text-white font-medium">Applicant</span>
                                        </div>
                                        {(() => {
                                            const user = getUserById(selectedVer.userId);
                                            return (
                                                <div className="space-y-2">
                                                    <p className="text-white text-sm">{user?.email || selectedVer.userId}</p>
                                                    <p className="text-white/60 text-sm">
                                                        {user?.firstName} {user?.lastName}
                                                    </p>
                                                    <p className="text-white/40 text-xs">
                                                        Country: {user?.country || 'Unknown'}
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Document Details */}
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <FiFileText className="text-cyan-400" />
                                            <span className="text-white font-medium">Document Details</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Type</span>
                                                <span className="text-white capitalize">
                                                    {selectedVer.submittedData?.idType?.replace('_', ' ') || selectedVer.type}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Number</span>
                                                <span className="text-white font-mono">
                                                    {selectedVer.submittedData?.idNumber || 'N/A'}
                                                </span>
                                            </div>
                                            {selectedVer.expiresAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Expires</span>
                                                    <span className="text-white">
                                                        {new Date(selectedVer.expiresAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    {selectedVer.documents && selectedVer.documents.length > 0 && (
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                            <div className="flex items-center gap-3 mb-3">
                                                <FiEye className="text-cyan-400" />
                                                <span className="text-white font-medium">Submitted Documents</span>
                                            </div>
                                            <div className="space-y-2">
                                                {selectedVer.documents.map((doc: { type: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; url: string | undefined; }, idx: Key | null | undefined) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                        <span className="text-white/80 text-sm capitalize">{doc.type}</span>
                                                        <div className="flex gap-2">
                                                            <motion.a
                                                                href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                                            >
                                                                <FiEye size={16} />
                                                            </motion.a>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                                            >
                                                                <FiDownload size={16} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    <div>
                                        <label className="block text-white/60 text-sm mb-2">
                                            Rejection Reason (if rejecting)
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Reason for rejection..."
                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-cyan-500/50 focus:outline-none"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleApprove}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors"
                                        >
                                            <FiCheck size={16} />
                                            Approve
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleReject}
                                            disabled={!reason}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
                                        >
                                            <FiX size={16} />
                                            Reject
                                        </motion.button>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <GlassCard className="p-8 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <FiCheckCircle className="text-white/30" size={32} />
                            </div>
                            <p className="text-white/50">Select a verification to review</p>
                        </GlassCard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};