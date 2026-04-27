import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import type { AdminTab } from '../../../types/admin';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    title: string;
    onLogout?: () => void;
}

export const AdminLayout = ({ children, activeTab, onTabChange, title, onLogout }: AdminLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
            <AnimatedBackground />

            <div className="relative z-10 flex">
                <Sidebar
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    isMobileOpen={isMobileMenuOpen}
                    onMobileClose={() => setIsMobileMenuOpen(false)}
                />

                <div className="flex-1 min-w-0">
                    <TopBar
                        onMenuClick={() => setIsMobileMenuOpen(true)}
                        title={title}
                        onLogout={onLogout}
                    />

                    <main className="p-6">
                        <div className="animate-fadeIn">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};