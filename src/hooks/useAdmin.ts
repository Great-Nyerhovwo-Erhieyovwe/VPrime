import { useState, useCallback } from 'react';
import type {
    User, Deposit, Withdrawal, Trade, UpgradeRequest,
    VerificationRequest, AdminStats, Message, AdminTab
} from '../types/admin';

const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface UseAdminReturn {
  // Data
  stats: AdminStats | null;
  users: User[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  trades: Trade[];
  upgrades: UpgradeRequest[];
  verifications: VerificationRequest[];
  messages: Message[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Actions
  refreshData: (tab: AdminTab) => void;
  updateUser: (id: string, updates: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  approveDeposit: (id: string, notes?: string) => Promise<boolean>;
  rejectDeposit: (id: string, notes?: string) => Promise<boolean>;
  approveWithdrawal: (id: string, notes?: string) => Promise<boolean>;
  rejectWithdrawal: (id: string, notes?: string) => Promise<boolean>;
  closeTrade: (id: string, data: { exitPrice: number; result: 'win' | 'loss' | 'cancelled'; notes?: string }) => Promise<boolean>;
  approveUpgrade: (id: string, notes?: string) => Promise<boolean>;
  rejectUpgrade: (id: string, notes?: string) => Promise<boolean>;
  approveVerification: (id: string, notes?: string) => Promise<boolean>;
  rejectVerification: (id: string, notes?: string) => Promise<boolean>;
  sendMessage: (data: { userId?: string; message: string; type: string; subject?: string }) => Promise<boolean>;
}

export const useAdmin = (): UseAdminReturn => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [upgrades, setUpgrades] = useState<UpgradeRequest[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('token');

  const fetchWithAuth = async (endpoint: string, options?: RequestInit) => {
    const token = getToken();
    if (!token) throw new Error('No authentication token');

    const response = await fetch(`${backendUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  const refreshData = useCallback(async (tab: AdminTab) => {
    setLoading(true);
    setError(null);

    try {
      switch (tab) {
        case 'overview':
          const statsData = await fetchWithAuth('/admin/summary');
          setStats(statsData);
          break;
        case 'users':
          const usersData = await fetchWithAuth('/admin/users');
          setUsers(Array.isArray(usersData) ? usersData : (usersData.users || []));
          break;
        case 'deposits':
          const depositsData = await fetchWithAuth('/api/admin/transactions?type=deposit');
          setDeposits(depositsData);
          break;
        case 'withdrawals':
          const withdrawalsData = await fetchWithAuth('/api/admin/transactions?type=withdrawal');
          setWithdrawals(withdrawalsData);
          break;
        case 'trades':
          const tradesData = await fetchWithAuth('/api/admin/trades');
          setTrades(tradesData);
          break;
        case 'upgrades':
          const upgradesData = await fetchWithAuth('/api/admin/upgrades');
          setUpgrades(upgradesData);
          break;
        case 'verifications':
          const verificationsData = await fetchWithAuth('/api/admin/verifications');
          setVerifications(verificationsData);
          break;
        case 'messages':
          const messagesData = await fetchWithAuth('/api/admin/messages');
          setMessages(messagesData);
          break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // User actions
  const updateUser = async (id: string, updates: Partial<User>): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Deposit actions
  const approveDeposit = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', adminNotes: notes, creditUser: true }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const rejectDeposit = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Withdrawal actions
  const approveWithdrawal = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const rejectWithdrawal = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Trade actions
  const closeTrade = async (id: string, data: { exitPrice: number; result: 'win' | 'loss' | 'cancelled'; notes?: string }): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/trades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'closed',
          exitPrice: data.exitPrice,
          result: data.result,
          adminNotes: data.notes,
        }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Upgrade actions
  const approveUpgrade = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/upgrades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const rejectUpgrade = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/upgrades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Verification actions
  const approveVerification = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  const rejectVerification = async (id: string, notes?: string): Promise<boolean> => {
    try {
      await fetchWithAuth(`/api/admin/verifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', adminNotes: notes }),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  // Message actions
  const sendMessage = async (data: { userId?: string; message: string; type: string; subject?: string }): Promise<boolean> => {
    try {
      await fetchWithAuth('/api/admin/messages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return true;
    } catch (err) {
      return false;
    }
  };

  return {
    stats,
    users,
    deposits,
    withdrawals,
    trades,
    upgrades,
    verifications,
    messages,
    loading,
    error,
    refreshData,
    updateUser,
    deleteUser,
    approveDeposit,
    rejectDeposit,
    approveWithdrawal,
    rejectWithdrawal,
    closeTrade,
    approveUpgrade,
    rejectUpgrade,
    approveVerification,
    rejectVerification,
    sendMessage,
  };
};