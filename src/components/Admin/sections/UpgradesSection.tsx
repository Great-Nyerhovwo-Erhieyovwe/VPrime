import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUpCircle, FiPlus, FiSave, FiTrash2, FiCheck, FiX, FiStar } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import type { Plan, UpgradeRequest, User } from '../../../types/admin';

interface UpgradesSectionProps {
    plans: Plan[];
    requests: UpgradeRequest[];
    users: User[];
    onSave: (plan: Partial<Plan>, id?: string) => Promise<boolean>;
    onDelete: (id: string) => Promise<boolean>;
    onUpdateRequest: (id: string, status: 'approved' | 'rejected', adminNotes?: string) => Promise<boolean>;
    isLoading?: boolean;
}

// console.log('Upgrade requests component loaded :', UpgradeRequest)

export const UpgradesSection = ({
    plans,
    requests = [],
    users = [],
    onSave,
    onDelete,
    onUpdateRequest,
    isLoading,
}: UpgradesSectionProps) => {
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'plans' | 'requests'>('plans');
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '',
        slug: '',
        description: '',
        priceMonthly: 0,
        priceAnnual: 0,
        currency: 'USD',
        features: [],
        limits: {
            maxTradesPerDay: -1,
            maxWithdrawalPerDay: -1,
            maxDeposit: -1,
            minDeposit: 0,
            leverageMax: 1,
        },
        active: true,
        popular: false,
        displayOrder: 0,
        color: '#3B82F6',
    });
    

    // Mock upgrade requests (in real app, fetch from API)
    const [upgradeRequests, setUpgradeRequests] = useState([
        { _id: '1', userId: 'user1', userEmail: 'john@example.com', currentPlan: 'Free', targetPlan: 'Pro', requestedAt: new Date().toISOString(), status: 'pending' },
        { _id: '2', userId: 'user2', userEmail: 'jane@example.com', currentPlan: 'Mini', targetPlan: 'Standard', requestedAt: new Date(Date.now() - 86400000).toISOString(), status: 'pending' },
    ]);

    console.log('isLoading :', isLoading);
    // console.log('Upgrade requests :', upgradeRequests);
    console.log('Set upgrade requests :', setUpgradeRequests);

    const handleSelect = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsCreating(false);
        setFormData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description || '',
            priceMonthly: plan.priceMonthly,
            priceAnnual: plan.priceAnnual,
            currency: plan.currency,
            features: plan.features || [],
            limits: plan.limits || {},
            active: plan.active,
            popular: plan.popular,
            displayOrder: plan.displayOrder,
            color: plan.color,
        });
    };

    const handleNew = () => {
        setSelectedPlan(null);
        setIsCreating(true);
        setFormData({
            name: '',
            slug: '',
            description: '',
            priceMonthly: 0,
            priceAnnual: 0,
            currency: 'USD',
            features: [],
            limits: {
                maxTradesPerDay: -1,
                maxWithdrawalPerDay: -1,
                maxDeposit: -1,
                minDeposit: 0,
                leverageMax: 1,
            },
            active: true,
            popular: false,
            displayOrder: plans.length,
            color: '#3B82F6',
        });
    };

    const handleSave = () => {
        if (!formData.name || !formData.slug) {
            alert('Plan name and slug are required');
            return;
        }
        onSave(formData, selectedPlan?._id || selectedPlan?.id);
        setSelectedPlan(null);
        setIsCreating(false);
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const displayRequests = pendingRequests.length > 0 ? pendingRequests : requests;
    const showPendingOnly = pendingRequests.length > 0;

    const handleApproveRequest = async (requestId: string, notes?: string) => {
        const success = await onUpdateRequest(requestId, 'approved', notes);
        if (!success) return;
    };

    const handleRejectRequest = async (requestId: string, notes?: string) => {
        const success = await onUpdateRequest(requestId, 'rejected', notes);
        if (!success) return;
    };

    const getUserDisplay = (userId: string) => {
        const user = users.find(u => u.id === userId || u._id === userId);
        if (!user) return userId;
        return user.email || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || userId;
    };

    const featuresString = Array.isArray(formData.features)
        ? formData.features.join(', ')
        : formData.features || '';

    const colorOptions = [
        '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6'
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'plans', label: 'Plans', icon: <FiArrowUpCircle /> },
                    { id: 'requests', label: 'Upgrade Requests', icon: <FiStar />, count: upgradeRequests.filter(r => r.status === 'pending').length }
                ].map((tab) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'plans' | 'requests')}
                        className={`
              flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all
              ${activeTab === tab.id
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-transparent'}
            `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {tab.icon}
                        {tab.label}
                        {(tab as any).count > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                                {(tab as any).count}
                            </span>
                        )}
                    </motion.button>
                ))}
            </div>

            {activeTab === 'plans' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Plans List */}
                    <GlassCard className="lg:col-span-2 p-0 overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                                    <FiArrowUpCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Subscription Plans</h3>
                                    <p className="text-white/50 text-sm">{plans.length} plans configured</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleNew}
                                className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-white text-sm font-medium transition-colors"
                            >
                                <FiPlus size={16} />
                                New Plan
                            </motion.button>
                        </div>

                        <div className="max-h-[600px] overflow-y-auto">
                            {plans.length === 0 ? (
                                <div className="p-8 text-center text-white/50">No plans found</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                                    {plans.map((plan) => (
                                        <motion.div
                                            key={plan._id || plan.id}
                                            onClick={() => handleSelect(plan)}
                                            className={`
                        p-4 rounded-xl cursor-pointer transition-all border-2
                        ${selectedPlan?._id === plan._id
                                                    ? 'bg-pink-500/10 border-pink-500'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}
                      `}
                                            whileHover={{ y: -2 }}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                                        style={{ backgroundColor: plan.color || '#3B82F6' }}
                                                    >
                                                        {plan.name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white">{plan.name}</h4>
                                                        <p className="text-white/50 text-xs">${plan.priceMonthly}/mo • ${plan.priceAnnual}/yr</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    {plan.popular && (
                                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                                                            Popular
                                                        </span>
                                                    )}
                                                    {!plan.active && (
                                                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-full">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-white/60 text-sm mb-3 line-clamp-2">{plan.description || 'No description'}</p>
                                            <div className="flex items-center justify-between text-xs text-white/40">
                                                <span>{(plan.features || []).length} features</span>
                                                <span>Order: {plan.displayOrder}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Plan Editor */}
                    <div className="lg:sticky lg:top-24 h-fit">
                        <AnimatePresence mode="wait">
                            {(isCreating || selectedPlan) ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <GlassCard className="p-6">
                                        <h3 className="text-lg font-semibold text-white mb-6">
                                            {isCreating ? 'Create Plan' : 'Edit Plan'}
                                        </h3>

                                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                            <div>
                                                <label className="block text-white/60 text-sm mb-2">Plan Name</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g., Premium Pro"
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-pink-500/50 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-white/60 text-sm mb-2">Slug (URL identifier)</label>
                                                <input
                                                    type="text"
                                                    value={formData.slug}
                                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                                    placeholder="premium-pro"
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-pink-500/50 focus:outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-white/60 text-sm mb-2">Description</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Plan description..."
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-pink-500/50 focus:outline-none"
                                                    rows={2}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-white/60 text-sm mb-2">Monthly Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                                        <input
                                                            type="number"
                                                            value={formData.priceMonthly}
                                                            onChange={(e) => setFormData({ ...formData, priceMonthly: Number(e.target.value) })}
                                                            className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500/50 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-white/60 text-sm mb-2">Annual Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                                                        <input
                                                            type="number"
                                                            value={formData.priceAnnual}
                                                            onChange={(e) => setFormData({ ...formData, priceAnnual: Number(e.target.value) })}
                                                            className="w-full pl-7 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500/50 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-white/60 text-sm mb-2">Features (comma-separated)</label>
                                                <textarea
                                                    value={featuresString}
                                                    onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map(f => f.trim()).filter(f => f) })}
                                                    placeholder="Feature 1, Feature 2, Feature 3..."
                                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-pink-500/50 focus:outline-none"
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Limits */}
                                            <div className="space-y-3 pt-2 border-t border-white/10">
                                                <p className="text-white/80 text-sm font-medium">Plan Limits</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-white/50 text-xs mb-1">Max Trades/Day (-1 = unlimited)</label>
                                                        <input
                                                            type="number"
                                                            value={formData.limits?.maxTradesPerDay}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                limits: { 
                                                                    ...(formData.limits || { maxTradesPerDay: -1, maxWithdrawalPerDay: -1, maxDeposit: -1, minDeposit: 0, leverageMax: 1 }), 
                                                                    maxTradesPerDay: Number(e.target.value) 
                                                                }
                                                            })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500/50 focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-white/50 text-xs mb-1">Max Leverage</label>
                                                        <input
                                                            type="number"
                                                            value={formData.limits?.leverageMax}
                                                            onChange={(e) => setFormData({
                                                                ...formData,
                                                                limits: { 
                                                                    ...(formData.limits || { maxTradesPerDay: -1, maxWithdrawalPerDay: -1, maxDeposit: -1, minDeposit: 0, leverageMax: 1 }), 
                                                                    leverageMax: Number(e.target.value) 
                                                                }
                                                            })}
                                                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-pink-500/50 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Color Picker */}
                                            <div>
                                                <label className="block text-white/60 text-sm mb-2">Plan Color</label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {colorOptions.map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setFormData({ ...formData, color })}
                                                            className={`
                                w-8 h-8 rounded-lg transition-all
                                ${formData.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}
                              `}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Toggles */}
                                            <div className="flex gap-4 pt-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.active}
                                                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-pink-500 focus:ring-pink-500/20"
                                                    />
                                                    <span className="text-white/70 text-sm">Active</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.popular}
                                                        onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/20"
                                                    />
                                                    <span className="text-white/70 text-sm">Mark as Popular</span>
                                                </label>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleSave}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors"
                                                >
                                                    <FiSave size={16} />
                                                    Save Plan
                                                </motion.button>
                                                {selectedPlan && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => onDelete(selectedPlan._id || selectedPlan.id || '')}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
                                                    >
                                                        <FiTrash2 size={16} />
                                                        Delete
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <GlassCard className="p-8 text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                        <FiArrowUpCircle className="text-white/30" size={32} />
                                    </div>
                                    <p className="text-white/50">Select a plan to edit or create new</p>
                                </GlassCard>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                /* Upgrade Requests Tab */
                <GlassCard className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                                <FiStar size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Upgrade Requests</h3>
                                <p className="text-white/50 text-sm">{requests.filter(r => r.status === 'pending').length} pending approval</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                        {requests.length === 0 ? (
                            <div className="p-8 text-center text-white/50">No upgrade requests</div>
                        ) : (
                            <>
                                {!showPendingOnly && requests.length > 0 && (
                                    <div className="p-4 text-sm text-white/50 border-b border-white/5">
                                        Showing all requests because there are no pending approvals.
                                    </div>
                                )}
                                <div className="divide-y divide-white/5">
                                    {displayRequests.map((request) => (
                                        <motion.div
                                            key={request.id || request._id}
                                            className="p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {getUserDisplay(request.userId as any)[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{getUserDisplay(request.userId as any)}</p>
                                                        <p className="text-sm text-white/60">
                                                            {request.currentLevel || request.currentLevel} → <span className="text-pink-400 font-medium">{request.targetLevel}</span>
                                                        </p>
                                                        <p className="text-xs text-white/40">
                                                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <StatusBadge status={request.status} />
                                                    {request.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleApproveRequest(request.id || request._id || '', request.adminNotes)}
                                                                className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                                                title="Approve"
                                                            >
                                                                <FiCheck size={18} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleRejectRequest(request.id || request._id || '')}
                                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                                                title="Reject"
                                                            >
                                                                <FiX size={18} />
                                                            </motion.button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </GlassCard>
            )}
        </div>
    );
};