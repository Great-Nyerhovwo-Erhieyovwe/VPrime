import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend, FiUsers, FiFileText, FiImage, FiTrash2, FiCheck } from 'react-icons/fi';
import { GlassCard } from '../ui/GlassCard';
import type { User } from '../../../types/admin';

console.log(FiFileText, FiCheck)

interface EmailSectionProps {
    users: User[];
    onSend: (data: {
        recipients: string[];
        subject: string;
        body: string;
        template?: string;
        attachments?: File[];
    }) => void;
    isLoading?: boolean;
}

const templates = [
    { id: 'welcome', name: 'Welcome Email', subject: 'Welcome to VPrime Capital', body: 'Thank you for joining...' },
    { id: 'verification', name: 'Verification Reminder', subject: 'Complete Your Verification', body: 'Please verify your account...' },
    { id: 'deposit', name: 'Deposit Confirmation', subject: 'Deposit Received', body: 'We have received your deposit...' },
    { id: 'withdrawal', name: 'Withdrawal Update', subject: 'Withdrawal Status Update', body: 'Your withdrawal request...' },
    { id: 'promo', name: 'Promotional Offer', subject: 'Special Offer Inside', body: 'Exclusive offer for you...' },
    { id: 'maintenance', name: 'System Maintenance', subject: 'Scheduled Maintenance', body: 'We will be performing maintenance...' },
];

export const EmailSection = ({ users, onSend, isLoading }: EmailSectionProps) => {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [template, setTemplate] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [bulkEmails, setBulkEmails] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [sendMode, setSendMode] = useState<'selected' | 'bulk' | 'all'>('selected');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleTemplateChange = (t: string) => {
        setTemplate(t);
        const selected = templates.find(tmp => tmp.id === t);
        if (selected) {
            setSubject(selected.subject);
            setBody(selected.body);
        }
    };

    const handleSend = () => {
        let recipients: string[] = [];

        if (sendMode === 'selected') {
            recipients = selectedUsers.map(id => users.find(u => (u._id || u.id) === id)?.email).filter(Boolean) as string[];
        } else if (sendMode === 'bulk') {
            recipients = bulkEmails.split('\n').map(e => e.trim()).filter(e => e);
        } else if (sendMode === 'all') {
            recipients = users.map(u => u.email);
        }

        if (recipients.length === 0) {
            alert('Please add at least one recipient');
            return;
        }

        onSend({ recipients, subject, body, template: template || undefined, attachments });

        // Reset
        setSelectedUsers([]);
        setBulkEmails('');
        setSubject('');
        setBody('');
        setTemplate('');
        setAttachments([]);
    };

    const toggleUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedUsers(filteredUsers.map(u => u._id || u.id || ''));
    };

    const clearSelection = () => {
        setSelectedUsers([]);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recipients Panel */}
            <GlassCard className="lg:col-span-1 p-0 overflow-hidden h-[700px] flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <FiUsers className="text-emerald-400" />
                        <span className="text-white font-medium">Recipients</span>
                        <span className="ml-auto px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-full">
                            {sendMode === 'selected' ? selectedUsers.length : sendMode === 'all' ? users.length : 'Bulk'}
                        </span>
                    </div>

                    {/* Send Mode Tabs */}
                    <div className="flex gap-1 mb-3">
                        {(['selected', 'bulk', 'all'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setSendMode(mode)}
                                className={`
                  flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all capitalize
                  ${sendMode === mode
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white/5 text-white/60 hover:bg-white/10'}
                `}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {sendMode === 'selected' && (
                        <>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-emerald-500/50 focus:outline-none mb-2"
                            />
                            <div className="flex gap-2">
                                <button onClick={selectAll} className="text-xs text-emerald-400 hover:text-emerald-300">Select All</button>
                                <button onClick={clearSelection} className="text-xs text-white/50 hover:text-white/70">Clear</button>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {sendMode === 'selected' ? (
                        filteredUsers.map((user) => (
                            <div
                                key={user._id || user.id}
                                className={`
                  p-3 border-b border-white/5 transition-colors flex items-center gap-3
                  ${selectedUsers.includes(user._id || user.id || '') ? 'bg-emerald-500/10' : 'hover:bg-white/5'}
                `}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id || user.id || '')}
                                    onChange={() => toggleUser(user._id || user.id || '')}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/20"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white text-sm truncate">{user.email}</p>
                                    <p className="text-white/50 text-xs truncate">
                                        {user.firstName} {user.lastName}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : sendMode === 'bulk' ? (
                        <div className="p-4">
                            <textarea
                                value={bulkEmails}
                                onChange={(e) => setBulkEmails(e.target.value)}
                                placeholder="Enter email addresses, one per line..."
                                className="w-full h-64 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-emerald-500/50 focus:outline-none"
                            />
                            <p className="text-xs text-white/50 mt-2">
                                {bulkEmails.split('\n').filter(e => e.trim()).length} emails entered
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-white/60">Will send to all {users.length} registered users</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Compose Panel */}
            <div className="lg:col-span-2">
                <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <FiMail />
                        Compose Email
                    </h3>

                    <div className="space-y-4">
                        {/* Template */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Template</label>
                            <select
                                value={template}
                                onChange={(e) => handleTemplateChange(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-emerald-500/50 focus:outline-none"
                            >
                                <option value="" className="bg-slate-900">Custom Email</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject..."
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-emerald-500/50 focus:outline-none"
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Email Body</label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Type your email content here..."
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-emerald-500/50 focus:outline-none"
                                rows={10}
                            />
                        </div>

                        {/* Attachments */}
                        <div>
                            <label className="block text-white/60 text-sm mb-2">Attachments</label>
                            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-emerald-500/50 transition-colors">
                                <FiImage className="w-8 h-8 text-white/40 mx-auto mb-2" />
                                <p className="text-white/60 text-sm">Drag files here or click to upload</p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => setAttachments(Array.from(e.target.files || []))}
                                    className="hidden"
                                />
                            </div>
                            {attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                            <span className="text-white/80 text-sm">{file.name}</span>
                                            <button
                                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSend}
                            disabled={!subject || !body || isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
                        >
                            <FiSend size={18} />
                            {isLoading ? 'Sending...' : `Send to ${sendMode === 'selected' ? selectedUsers.length : sendMode === 'all' ? users.length : bulkEmails.split('\n').filter(e => e.trim()).length} recipients`}
                        </motion.button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};