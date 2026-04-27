// @ts-nocheck
'use client';
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { api } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { MdDashboard, MdArrowDownward, MdArrowUpward, MdVerified, MdTrendingUp, MdPeople, MdCandlestickChart, MdHeadsetMic, MdMessage, MdEmail, MdNotifications, MdSearch, MdMenu, MdKeyboardArrowDown, MdLogout } from "react-icons/md";

// Import layout components
import { AdminLayout } from "../../components/Admin/layouts/AdminLayout";

// Import section components
import { OverviewSection } from "../../components/Admin/sections/OverviewSection";
import { DepositsSection } from "../../components/Admin/sections/DepositsSection";
import { WithdrawalsSection } from "../../components/Admin/sections/WithdrawalsSection";
import { VerificationsSection } from "../../components/Admin/sections/VerificationsSection";
import { UpgradesSection } from "../../components/Admin/sections/UpgradesSection";
import { UsersSection } from "../../components/Admin/sections/UsersSection";
import { TradesSection } from "../../components/Admin/sections/TradesSection";
import { DepositSettingsSection } from "../../components/Admin/sections/DepositSettingsSection";
import { AdminProfileSection } from "../../components/Admin/sections/AdminProfileSection";
// import { MessagesSection } from "../../components/Admin/sections/MessagesSection";

// Import types
import type { AdminTab, User, Deposit, Withdrawal, Trade, VerificationRequest, UpgradeRequest, Message } from "../../types/admin";

// Import custom hooks
import { useDashboard } from "../../hooks/useDashboard";
import { useNavigate } from "react-router-dom";

// Helper function for fetch requests
const fetchJson = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store",
        ...options,
    });

    if (res.status === 304) {
        return null;
    }

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Fetch error ${res.status}: ${errorText}`);
    }

    if (res.status === 204) return null;
    return res.json();
};

/**
 * AdminDashboard - Complete Admin Control Panel
 *
 * Main admin interface with 8 tabs for complete platform management:
 * 1. Overview - Summary cards with key metrics (users, deposits, withdrawals, active, verified)
 * 2. Users - Full CRUD for user accounts (view, edit, ban, freeze, delete)
 * 3. Deposits - Approve/reject deposits with admin notes
 * 4. Withdrawals - Approve/reject withdrawals with admin notes
 * 5. Trades - Manage active trades, close manually with profit/loss calculation
 * 6. Verifications - Approve/reject KYC verifications
 * 7. Upgrades - Manage upgrade plans and requests
 * 8. Messages - Send direct messages and warnings to users
 *
 * All sections are fully commented and responsive for mobile/desktop.
 * Backend API endpoints are protected by admin middleware.
 */
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Logout handler
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    // Admin summary query
    const { data: adminStats, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-summary'],
        queryFn: async () => {
            console.log('🔄 Fetching admin summary...');
            try {
                return await fetchJson('/api/admin/summary');
            } catch (error) {
                console.error('❌ Admin summary fetch failed:', error);
                throw error;
            }
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    // Users query
    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            console.log('🔄 Fetching admin users...');
            try {
                return await fetchJson('/api/admin/users');
            } catch (error) {
                console.error('❌ Admin users fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'users' || activeTab === 'messages',
    });

    // Deposits query
    const { data: deposits = [], isLoading: depositsLoading } = useQuery({
        queryKey: ['admin-deposits'],
        queryFn: async () => {
            console.log('🔄 Fetching admin deposits...');
            try {
                return await fetchJson('/api/admin/transactions/deposits');
            } catch (error) {
                console.error('❌ Admin deposits fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'deposits',
    });

    // Withdrawals query
    const { data: withdrawals = [], isLoading: withdrawalsLoading } = useQuery({
        queryKey: ['admin-withdrawals'],
        queryFn: async () => {
            console.log('🔄 Fetching admin withdrawals...');
            try {
                return await fetchJson('/api/admin/transactions/withdrawals');
            } catch (error) {
                console.error('❌ Admin withdrawals fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'withdrawals',
    });

    // Trades query
    const { data: trades = [], isLoading: tradesLoading } = useQuery({
        queryKey: ['admin-trades'],
        queryFn: async () => {
            console.log('🔄 Fetching admin trades...');
            try {
                return await fetchJson('/api/admin/trades');
            } catch (error) {
                console.error('❌ Admin trades fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'trades',
    });

    // Verifications query
    const { data: verifications = [], isLoading: verificationsLoading } = useQuery({
        queryKey: ['admin-verifications'],
        queryFn: async () => {
            console.log('🔄 Fetching admin verifications...');
            try {
                return await fetchJson('/api/admin/verifications');
            } catch (error) {
                console.error('❌ Admin verifications fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'verifications',
    });

    // Upgrade plans query (for UpgradesSection plan management)
    const { data: plans = [], isLoading: plansLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: async () => {
            console.log('🔄 Fetching admin plans...');
            try {
                return await fetchJson('/api/admin/plans');
            } catch (error) {
                console.error('❌ Admin plans fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'upgrades',
    });

    // Upgrade requests query
    const { data: upgradeRequests = [], isLoading: upgradeRequestsLoading } = useQuery({
        queryKey: ['admin-upgrade-requests'],
        queryFn: async () => {
            console.log('🔄 Fetching admin upgrade requests...');
            try {
                return await fetchJson('/api/admin/upgrades');
            } catch (error) {
                console.error('❌ Admin upgrade requests fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'upgrades',
    });

    // Messages query
    // const { data: messages = [], isLoading: messagesLoading } = useQuery({
    //     queryKey: ['admin-messages'],
    //     queryFn: async () => {
    //         console.log('🔄 Fetching admin messages...');
    //         try {
    //             return await fetchJson('/api/admin/messages');
    //         } catch (error) {
    //             console.error('❌ Admin messages fetch failed:', error);
    //             throw error;
    //         }
    //     },
    //     enabled: activeTab === 'messages',
    // });

    // Admin profile query
    const { data: adminProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['admin-profile'],
        queryFn: async () => {
            console.log('🔄 Fetching admin profile...');
            try {
                return await fetchJson('/api/admin/profile');
            } catch (error) {
                console.error('❌ Admin profile fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'profile',
    });

    // Deposit settings query
    const { data: depositSettings, isLoading: depositSettingsLoading } = useQuery({
        queryKey: ['admin-deposit-settings'],
        queryFn: async () => {
            console.log('🔄 Fetching admin deposit settings...');
            try {
                const response = await fetchJson('/api/admin/deposit-settings');
                console.log('📥 Deposit settings received:', response);
                return response?.data || response;
            } catch (error) {
                console.error('❌ Admin deposit settings fetch failed:', error);
                throw error;
            }
        },
        enabled: activeTab === 'settings',
    });

    // Mutations for CRUD operations
    const updateUserMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
            fetchJson(`/api/admin/users/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id: string) =>
            fetchJson(`/api/admin/users/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const updateDepositMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Deposit> }) =>
            fetchJson(`/api/admin/transactions/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-deposits'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const updateWithdrawalMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Withdrawal> }) =>
            fetchJson(`/api/admin/transactions/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'], refetchActive: true });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
        onError: (error: any) => {
            console.error('Update withdrawal mutation failed:', error);
            alert('Failed to update withdrawal: ' + (error?.message || 'Unknown error'));
        },
    });

    const updateTradeMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Trade> }) =>
            fetchJson(`/api/admin/trades/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-trades'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const updateVerificationMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<VerificationRequest> }) =>
            fetchJson(`/api/admin/verifications/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const createPlanMutation = useMutation({
        mutationFn: (plan: Partial<UpgradeRequest>) =>
            fetchJson('/api/admin/plans', {
                method: 'POST',
                body: JSON.stringify(plan),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        },
    });

    const updatePlanMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<UpgradeRequest> }) =>
            fetchJson(`/api/admin/plans/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            queryClient.invalidateQueries({ queryKey: ['admin-summary'] });
        },
    });

    const deletePlanMutation = useMutation({
        mutationFn: (id: string) =>
            fetchJson(`/api/admin/plans/${id}`, {
                method: 'DELETE',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        },
    });

    const updateUpgradeRequestMutation = useMutation({
        mutationFn: ({ id, status, adminNotes }: { id: string; status: 'approved' | 'rejected'; adminNotes?: string }) =>
            fetchJson(`/api/admin/upgrades/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, adminNotes }),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-upgrade-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        },
    });

    // const sendMessageMutation = useMutation({
    //     mutationFn: (message: Partial<Message>) =>
    //         fetchJson('/api/admin/messages', {
    //             method: 'POST',
    //             body: JSON.stringify(message),
    //         }),
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    //     },
    // });

    // const updateMessageMutation = useMutation({
    //     mutationFn: ({ id, status }: { id: string; status: 'completed' | 'pending' }) =>
    //         fetchJson(`/api/admin/messages/${id}`, {
    //             method: 'PATCH',
    //             body: JSON.stringify({ status }),
    //         }),
    //     onSuccess: () => {
    //         queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    //     },
    // });

    const updateDepositSettingsMutation = useMutation({
        mutationFn: (settings: any) =>
            fetchJson('/api/admin/deposit-settings', {
                method: 'PUT',
                body: JSON.stringify(settings),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-deposit-settings'] });
        },
    });

    const updateAdminProfileMutation = useMutation({
        mutationFn: (updates: any) =>
            fetchJson('/api/admin/profile', {
                method: 'PATCH',
                body: JSON.stringify(updates),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
        },
    });

    // Render active section based on tab
    const renderActiveSection = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewSection
                        stats={adminStats}
                        loading={statsLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-summary'] })}
                    />
                );

            case 'users':
                return (
                    <UsersSection
                        users={users}
                        loading={usersLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
                        onUpdate={async (id, updates) => {
                            try {
                                await updateUserMutation.mutateAsync({ id, updates });
                                return true;
                            } catch (error) {
                                console.error('Failed to update user:', error);
                                return false;
                            }
                        }}
                        onDelete={async (id) => {
                            try {
                                await deleteUserMutation.mutateAsync(id);
                                return true;
                            } catch (error) {
                                console.error('Failed to delete user:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'deposits':
                return (
                    <DepositsSection
                        deposits={deposits}
                        loading={depositsLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-deposits'] })}
                        onApprove={async (id, notes) => {
                            try {
                                await updateDepositMutation.mutateAsync({
                                    id,
                                    updates: { status: 'approved', adminNotes: notes, reviewedAt: new Date().toISOString() }
                                });
                                return true;
                            } catch (error) {
                                console.error('Failed to approve deposit:', error);
                                return false;
                            }
                        }}
                        onReject={async (id, notes) => {
                            try {
                                await updateDepositMutation.mutateAsync({
                                    id,
                                    updates: { status: 'rejected', adminNotes: notes, reviewedAt: new Date().toISOString() }
                                });
                                return true;
                            } catch (error) {
                                console.error('Failed to reject deposit:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'withdrawals':
                return (
                    <WithdrawalsSection
                        withdrawals={withdrawals}
                        loading={withdrawalsLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })}
                        onApprove={async (id, notes) => {
                            try {
                                await updateWithdrawalMutation.mutateAsync({
                                    id,
                                    updates: { status: 'approved', adminNotes: notes, reviewedAt: new Date().toISOString() }
                                });
                                return true;
                            } catch (error) {
                                console.error('Failed to approve withdrawal:', error);
                                return false;
                            }
                        }}
                        onReject={async (id, notes) => {
                            try {
                                await updateWithdrawalMutation.mutateAsync({
                                    id,
                                    updates: { status: 'rejected', adminNotes: notes, reviewedAt: new Date().toISOString() }
                                });
                                return true;
                            } catch (error) {
                                console.error('Failed to reject withdrawal:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'trades':
                return (
                    <TradesSection
                        trades={trades}
                        users={users}
                        isLoading={tradesLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-trades'] })}
                        onUpdate={async (id, updates) => {
                            try {
                                await updateTradeMutation.mutateAsync({ id, updates });
                                return true;
                            } catch (error) {
                                console.error('Failed to update trade:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'verifications':
                return (
                    <VerificationsSection
                        verifications={verifications}
                        users={users}
                        isLoading={verificationsLoading}
                        onUpdate={async (id, status, reason) => {
                            try {
                                await updateVerificationMutation.mutateAsync({
                                    id,
                                    updates: {
                                        status,
                                        adminNotes: reason,
                                        reviewedAt: new Date().toISOString()
                                    }
                                });
                                return true;
                            } catch (error) {
                                console.error('Failed to update verification:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'upgrades':
                return (
                    <UpgradesSection
                        plans={plans}
                        requests={upgradeRequests}
                        loading={plansLoading || upgradeRequestsLoading}
                        onRefresh={() => {
                            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
                            queryClient.invalidateQueries({ queryKey: ['admin-upgrade-requests'] });
                        }}
                        onSave={async (plan, id) => {
                            try {
                                if (id) {
                                    await updatePlanMutation.mutateAsync({ id, updates: plan });
                                } else {
                                    await createPlanMutation.mutateAsync(plan);
                                }
                                return true;
                            } catch (error) {
                                console.error('Failed to save plan:', error);
                                return false;
                            }
                        }}
                        onDelete={async (id) => {
                            try {
                                await deletePlanMutation.mutateAsync(id);
                                return true;
                            } catch (error) {
                                console.error('Failed to delete plan:', error);
                                return false;
                            }
                        }}
                        onUpdateRequest={async (id, status, notes) => {
                            try {
                                await updateUpgradeRequestMutation.mutateAsync({ id, status, adminNotes: notes });
                                return true;
                            } catch (error) {
                                console.error('Failed to update upgrade request:', error);
                                return false;
                            }
                        }}
                    />
                );

            // case 'messages':
            //     return (
            //         <MessagesSection
            //             users={users}
            //             messages={messages}
            //             isLoading={messagesLoading}
            //             onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-messages'] })}
            //             onSend={async (message) => {
            //                 try {
            //                     await sendMessageMutation.mutateAsync(message);
            //                     return true;
            //                 } catch (error) {
            //                     console.error('Failed to send message:', error);
            //                     return false;
            //                 }
            //             }}
            //             onMarkComplete={async (id) => {
            //                 try {
            //                     await updateMessageMutation.mutateAsync({ id, status: 'completed' });
            //                     return true;
            //                 } catch (error) {
            //                     console.error('Failed to complete message:', error);
            //                     return false;
            //                 }
            //             }}
            //         />
            //     );

            case 'profile':
                return (
                    <AdminProfileSection
                        profile={adminProfile}
                        loading={profileLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-profile'] })}
                        onUpdate={async (updates) => {
                            try {
                                await updateAdminProfileMutation.mutateAsync(updates);
                                return true;
                            } catch (error) {
                                console.error('Failed to update admin profile:', error);
                                return false;
                            }
                        }}
                    />
                );

            case 'settings':
                return (
                    <DepositSettingsSection
                        settings={depositSettings}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-deposit-settings'] })}
                        onUpdate={async (settings) => {
                            try {
                                await updateDepositSettingsMutation.mutateAsync(settings);
                                return true;
                            } catch (error) {
                                console.error('Failed to update deposit settings:', error);
                                return false;
                            }
                        }}
                        loading={depositSettingsLoading}
                    />
                );

            default:
                return (
                    <OverviewSection
                        stats={adminStats}
                        loading={statsLoading}
                        onRefresh={() => queryClient.invalidateQueries({ queryKey: ['admin-summary'] })}
                    />
                );
        }
    };

    // Get title for active tab
    const getTabTitle = (tab: AdminTab): string => {
        const titles = {
            overview: 'Dashboard Overview',
            users: 'User Management',
            profile: 'Admin Profile',
            deposits: 'Deposit Requests',
            withdrawals: 'Withdrawal Requests',
            trades: 'Trade Management',
            verifications: 'KYC Verifications',
            upgrades: 'Upgrade Requests',
            settings: 'Deposit Settings',
            messages: 'Messages & Communications'
        };
        return titles[tab] || 'Admin Dashboard';
    };

    return (
        <AdminLayout
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title={getTabTitle(activeTab)}
            onLogout={handleLogout}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderActiveSection()}
                </motion.div>
            </AnimatePresence>
        </AdminLayout>
    );
}
