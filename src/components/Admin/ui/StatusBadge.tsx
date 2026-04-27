interface StatusBadgeProps {
    status: string;
    variant?: 'default' | 'small';
}

const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
    cancelled: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    closed: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    open: 'bg-red-500/20 text-red-300 border-red-500/30',
    'in-progress': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    resolved: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    banned: 'bg-red-600/30 text-red-200 border-red-500/40',
    frozen: 'bg-yellow-600/30 text-yellow-200 border-yellow-500/40',
    verified: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/40',
    win: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    loss: 'bg-red-500/20 text-red-300 border-red-500/30',
    breakeven: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export const StatusBadge = ({ status, variant = 'default' }: StatusBadgeProps) => {
    const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm';
    const sizeStyles = variant === 'small' ? 'px-2 py-0.5 text-[10px]' : '';

    return (
        <span className={`${baseStyles} ${sizeStyles} ${statusStyles[status.toLowerCase()] || statusStyles.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};