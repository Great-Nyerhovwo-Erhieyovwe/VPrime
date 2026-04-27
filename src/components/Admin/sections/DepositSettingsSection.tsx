import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSettings, FiSave, FiRefreshCw } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';

interface DepositSettings {
  bank: {
    accountNumber: string;
    accountHolder: string;
    routingNumber: string;
    bankName: string;
  };
  crypto: {
    address: string;
  };
}

interface DepositSettingsSectionProps {
  settings: DepositSettings | null;
  onRefresh: () => void;
  onUpdate: (settings: DepositSettings) => Promise<boolean>;
  loading: boolean;
}

export const DepositSettingsSection = ({ settings, onRefresh, onUpdate, loading }: DepositSettingsSectionProps) => {
  const defaultSettings: DepositSettings = {
    bank: {
      accountNumber: '',
      accountHolder: '',
      routingNumber: '',
      bankName: '',
    },
    crypto: {
      address: '',
    },
  };

  const [localSettings, setLocalSettings] = useState<DepositSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings && typeof settings === 'object') {
      const mergedSettings: DepositSettings = {
        bank: { ...defaultSettings.bank, ...(settings.bank || {}) },
        crypto: { ...defaultSettings.crypto, ...(settings.crypto || {}) },
      };
      setLocalSettings(mergedSettings);
    } else {
      setLocalSettings(defaultSettings);
    }
  }, [settings]);

  useEffect(() => {
    onRefresh();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onUpdate(localSettings);
    setIsSaving(false);
    if (success) {
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings');
    }
  };

  const handleInputChange = (section: 'bank' | 'crypto', field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="p-6 bg-white/5 rounded-lg border border-white/10 text-center">
          <p className="text-white/60">Loading settings...</p>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
            <FiSettings size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Deposit Settings</h3>
            <p className="text-white/50 text-sm">Manage deposit method details</p>
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
        <h4 className="text-white font-semibold mb-4">Bank Transfer Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Account Number</label>
            <input
              type="text"
              value={localSettings?.bank?.accountNumber || ''}
              onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter account number"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Account Holder</label>
            <input
              type="text"
              value={localSettings?.bank?.accountHolder || ''}
              onChange={(e) => handleInputChange('bank', 'accountHolder', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter account holder name"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Routing Number</label>
            <input
              type="text"
              value={localSettings?.bank?.routingNumber || ''}
              onChange={(e) => handleInputChange('bank', 'routingNumber', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter routing number"
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Bank Name</label>
            <input
              type="text"
              value={localSettings?.bank?.bankName || ''}
              onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
              placeholder="Enter bank name"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h4 className="text-white font-semibold mb-4">Cryptocurrency Details</h4>
        <div>
          <label className="block text-white/60 text-sm mb-2">Wallet Address</label>
          <input
            type="text"
            value={localSettings?.crypto?.address || ''}
            onChange={(e) => handleInputChange('crypto', 'address', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
            placeholder="Enter wallet address"
          />
        </div>
      </GlassCard>

      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          <FiSave size={16} />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </motion.button>
      </div>
    </div>
  );
};