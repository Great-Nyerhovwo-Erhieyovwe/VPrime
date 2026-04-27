// import { useEffect, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiMessageSquare, FiSend, FiUsers, FiAlertTriangle, FiInfo, FiMail, FiCheck } from 'react-icons/fi';
// import { GlassCard } from '../ui/GlassCard';
// import type { User, Message } from '../../../types/admin';

// interface MessagesSectionProps {
//     users: User[];
//     messages: Message[];
//     onSend: (data: {
//         userId?: string;
//         message: string;
//         type: 'direct' | 'warning' | 'notice';
//         subject?: string;
//     }) => Promise<boolean>;
//     onMarkComplete: (id: string) => Promise<boolean>;
//     onRefresh: () => void;
//     loading?: boolean;
//     isLoading?: boolean;
// }

// export const MessagesSection = ({ users, messages, onSend, onMarkComplete, onRefresh, loading, isLoading }: MessagesSectionProps) => {
//     const [selectedUser, setSelectedUser] = useState<User | null>(null);
//     const [message, setMessage] = useState('');
//     const [subject, setSubject] = useState('');
//     const [type, setType] = useState<'direct' | 'warning' | 'notice'>('direct');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [sendMethod, setSendMethod] = useState<'app' | 'email' | 'both'>('app');
//     const [pendingPopups, setPendingPopups] = useState<Message[]>([]);
//     const [localPendingMessages, setLocalPendingMessages] = useState<Message[]>([]);
//     const loadingState = isLoading ?? loading;

//     useEffect(() => {
//         setPendingPopups(messages?.filter((msg) => msg.status === 'pending') || []);
//     }, [messages]);

//     const filteredUsers = users?.filter(u =>
//         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const recentBroadcasts = [...localPendingMessages, ...messages]
//         .filter((msg) => msg.type !== 'direct')
//         .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

//     const handleSend = async () => {
//         if (!message.trim()) return;
//         if (type === 'direct' && !selectedUser) {
//             alert('Please select a user for direct message');
//             return;
//         }

//         const recipientId = type === 'direct' ? selectedUser?.id || selectedUser?._id : 'all';
//         const defaultSubject = subject || (type === 'warning' ? 'Important Notice' : type === 'notice' ? 'System Message' : 'Message from Admin');

//         const success = await onSend({
//             userId: recipientId,
//             message,
//             type,
//             subject: defaultSubject,
//         });

//         if (!success) return;

//         const newPending: Message = {
//             id: Date.now().toString(),
//             senderId: 'admin',
//             recipientId,
//             type,
//             subject: defaultSubject,
//             message,
//             status: 'pending',
//             read: false,
//             createdAt: new Date().toISOString(),
//         };

//         setPendingPopups((prev) => [newPending, ...prev]);
//         setLocalPendingMessages((prev) => [newPending, ...prev]);

//         setMessage('');
//         setSubject('');
//         setSelectedUser(null);
//     };

//     const getTypeIcon = (t: string) => {
//         switch (t) {
//             case 'warning': return <FiAlertTriangle className="text-yellow-400" />;
//             case 'notice': return <FiInfo className="text-blue-400" />;
//             default: return <FiMail className="text-purple-400" />;
//         }
//     };

//     const getTypeColor = (t: string) => {
//         switch (t) {
//             case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
//             case 'notice': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
//             default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
//         }
//     };

//     const handleComplete = async (messageId: string) => {
//         const success = await onMarkComplete(messageId);
//         if (success) {
//             setPendingPopups((prev) => prev.filter((msg) => msg.id !== messageId));
//             onRefresh();
//         }
//     };

//     return (
//         <div className="relative">
//             <AnimatePresence>
//                 {pendingPopups.map((popup) => (
//                     <motion.div
//                         key={popup.id}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: 20 }}
//                         transition={{ duration: 0.2 }}
//                         className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/30"
//                     >
//                         <div className="flex items-start gap-3">
//                             <div className="rounded-full bg-purple-600 p-2 text-white">
//                                 <FiMail />
//                             </div>
//                             <div className="flex-1">
//                                 <p className="text-sm font-semibold text-white">
//                                 Message sent to {popup.recipientId === 'all' ? 'All Users' : popup.recipientId || 'user'}
//                             </p>
//                             <p className="text-xs text-slate-300 mt-1">{popup.subject || 'No subject'} · Pending completion</p>
//                             <p className="mt-3 text-sm text-slate-200 line-clamp-2">{popup.message}</p>
//                             </div>
//                         </div>
//                         <div className="mt-4 flex justify-end gap-2">
//                             <button
//                                 onClick={() => handleComplete(popup.id)}
//                                 className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
//                             >
//                                 Mark completed
//                             </button>
//                         </div>
//                     </motion.div>
//                 ))}
//             </AnimatePresence>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 {/* Left Panel - User Selection or Message History */}
//             <div className="lg:col-span-1 space-y-4">
//                 {type === 'direct' ? (
//                     <GlassCard className="p-0 overflow-hidden h-[600px] flex flex-col">
//                         <div className="p-4 border-b border-white/10">
//                             <div className="flex items-center gap-2 mb-3">
//                                 <FiUsers className="text-purple-400" />
//                                 <span className="text-white font-medium">Select Recipient</span>
//                             </div>
//                             <input
//                                 type="text"
//                                 placeholder="Search users..."
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
//                             />
//                         </div>

//                         <div className="flex-1 overflow-y-auto">
//                             {filteredUsers?.map((user) => (
//                                 <motion.div
//                                     key={user._id || user.id}
//                                     onClick={() => setSelectedUser(user)}
//                                     className={`
//                     p-3 cursor-pointer transition-all border-b border-white/5
//                     ${selectedUser?._id === user._id
//                                             ? 'bg-purple-500/20 border-l-4 border-l-purple-500'
//                                             : 'hover:bg-white/5 border-l-4 border-l-transparent'}
//                   `}
//                                     whileHover={{ x: 4 }}
//                                 >
//                                     <div className="flex items-center gap-3">
//                                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
//                                             {(user.firstName?.[0] || user.email[0]).toUpperCase()}
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <p className="text-white font-medium truncate">
//                                                 {user.firstName} {user.lastName}
//                                             </p>
//                                             <p className="text-white/50 text-xs truncate">{user.email}</p>
//                                         </div>
//                                         {user.banned && (
//                                             <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">
//                                                 Banned
//                                             </span>
//                                         )}
//                                     </div>
//                                 </motion.div>
//                             ))}
//                         </div>
//                     </GlassCard>
//                 ) : (
//                     <GlassCard className="p-0 overflow-hidden h-[600px] flex flex-col">
//                         <div className="p-4 border-b border-white/10">
//                             <div className="flex items-center gap-2">
//                                 <FiCheck className="text-emerald-400" />
//                                 <span className="text-white font-medium">Recent Broadcasts</span>
//                             </div>
//                         </div>

//                         <div className="flex-1 overflow-y-auto p-4 space-y-3">
//                             {recentBroadcasts.length === 0 ? (
//                                 <div className="p-4 text-sm text-slate-400">
//                                     No broadcasts yet. Send a warning or notice to get started.
//                                 </div>
//                             ) : (
//                                 recentBroadcasts.map((msg) => (
//                                     <div key={msg.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
//                                         <div className="flex items-center gap-2 mb-2">
//                                         {getTypeIcon(msg.type)}
//                                         <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(msg.type)}`}>
//                                             {msg.type}
//                                         </span>
//                                     </div>
//                                     <p className="text-white font-medium text-sm mb-1">{msg.subject || 'No subject'}</p>
//                                     <p className="text-white/50 text-xs mb-2">{msg.message || msg.content || 'No message content'}</p>
//                                     <div className="flex items-center justify-between text-xs text-white/40">
//                                         <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
//                                         <span className={msg.status === 'completed' ? 'text-emerald-400' : 'text-yellow-300'}>
//                                             {msg.status || 'pending'}
//                                         </span>
//                                     </div>
//                                 </div>
//                                 )))}
//                         </div>
//                     </GlassCard>
//                 )}
//             </div>

//             {/* Right Panel - Compose Message */}
//             <div className="lg:col-span-2">
//                 <GlassCard className="p-6 h-full">
//                     <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
//                         <FiMessageSquare />
//                         Compose Message
//                     </h3>

//                     <div className="space-y-4">
//                         {/* Message Type */}
//                         <div>
//                             <label className="block text-white/60 text-sm mb-3">Message Type</label>
//                             <div className="grid grid-cols-3 gap-3">
//                                 {([
//                                     { id: 'direct', icon: <FiMail />, label: 'Direct', desc: 'Private message to user' },
//                                     { id: 'warning', icon: <FiAlertTriangle />, label: 'Warning', desc: 'Account warning' },
//                                     { id: 'notice', icon: <FiInfo />, label: 'Notice', desc: 'System broadcast' }
//                                 ] as const).map((t) => (
//                                     <motion.button
//                                         key={t.id}
//                                         onClick={() => setType(t.id)}
//                                         className={`
//                       p-4 rounded-xl border-2 transition-all text-left
//                       ${type === t.id
//                                                 ? 'bg-purple-500/20 border-purple-500'
//                                                 : 'bg-white/5 border-white/10 hover:bg-white/10'}
//                     `}
//                                         whileHover={{ scale: 1.02 }}
//                                         whileTap={{ scale: 0.98 }}
//                                     >
//                                         <div className={`text-2xl mb-2 ${type === t.id ? 'text-purple-400' : 'text-white/60'}`}>
//                                             {t.icon}
//                                         </div>
//                                         <p className={`font-medium ${type === t.id ? 'text-white' : 'text-white/80'}`}>{t.label}</p>
//                                         <p className="text-xs text-white/50 mt-1">{t.desc}</p>
//                                     </motion.button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Selected User (for direct) */}
//                         <AnimatePresence>
//                             {type === 'direct' && selectedUser && (
//                                 <motion.div
//                                     initial={{ opacity: 0, height: 0 }}
//                                     animate={{ opacity: 1, height: 'auto' }}
//                                     exit={{ opacity: 0, height: 0 }}
//                                     className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center gap-3"
//                                 >
//                                     <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
//                                         {(selectedUser.firstName?.[0] || selectedUser.email[0]).toUpperCase()}
//                                     </div>
//                                     <div className="flex-1">
//                                         <p className="text-white text-sm">{selectedUser.email}</p>
//                                         <p className="text-white/50 text-xs">
//                                             {selectedUser.firstName} {selectedUser.lastName}
//                                         </p>
//                                     </div>
//                                     <button
//                                         onClick={() => setSelectedUser(null)}
//                                         className="text-white/60 hover:text-white"
//                                     >
//                                         ✕
//                                     </button>
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>

//                         {/* Subject */}
//                         <div>
//                             <label className="block text-white/60 text-sm mb-2">Subject</label>
//                             <input
//                                 type="text"
//                                 value={subject}
//                                 onChange={(e) => setSubject(e.target.value)}
//                                 placeholder="Message subject..."
//                                 className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
//                             />
//                         </div>

//                         {/* Message Content */}
//                         <div>
//                             <label className="block text-white/60 text-sm mb-2">Message</label>
//                             <textarea
//                                 value={message}
//                                 onChange={(e) => setMessage(e.target.value)}
//                                 placeholder="Type your message here..."
//                                 className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-purple-500/50 focus:outline-none"
//                                 rows={6}
//                             />
//                             <p className="text-xs text-white/40 mt-1 text-right">{message.length} characters</p>
//                         </div>

//                         {/* Delivery Method */}
//                         <div>
//                             <label className="block text-white/60 text-sm mb-2">Delivery Method</label>
//                             <div className="flex gap-2">
//                                 {(['app', 'email', 'both'] as const).map((method) => (
//                                     <button
//                                         key={method}
//                                         onClick={() => setSendMethod(method)}
//                                         className={`
//                       px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize
//                       ${sendMethod === method
//                                                 ? 'bg-purple-600 text-white'
//                                                 : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}
//                     `}
//                                     >
//                                         {method === 'both' ? 'App + Email' : method}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Send Button */}
//                         <motion.button
//                             whileHover={{ scale: 1.02 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={handleSend}
//                             disabled={!message.trim() || (type === 'direct' && !selectedUser) || loadingState}
//                             className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/40 rounded-lg text-white font-medium transition-colors"
//                         >
//                             <FiSend size={18} />
//                             {loadingState ? 'Sending...' : 'Send Message'}
//                         </motion.button>

//                         {/* Info Box */}
//                         <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
//                             <p className="text-sm text-blue-200 font-medium mb-2">Message Types:</p>
//                             <ul className="text-xs text-blue-200/70 space-y-1">
//                                 <li>• <strong>Direct:</strong> Private message visible only to selected user</li>
//                                 <li>• <strong>Warning:</strong> Formal warning about account issues</li>
//                                 <li>• <strong>Notice:</strong> Broadcast to all users or specific groups</li>
//                             </ul>
//                         </div>
//                     </div>
//                 </GlassCard>
//             </div>
//         </div>
//     </div>
//     );
// };
