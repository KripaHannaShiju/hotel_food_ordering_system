'use client';

import { LogOut, LayoutDashboard, ShoppingBag, UtensilsCrossed, Settings } from "lucide-react";

interface NavigationItem {
    id: string;
    name: string;
    icon: any;
    badge?: number;
}

interface KitchenSidebarProps {
    sidebarOpen: boolean;
    activeSection: string;
    setActiveSection: (id: string) => void;
    setSidebarOpen: (open: boolean) => void;
    navigationItems: NavigationItem[];
    onLogout: () => void;
    isLoggingOut?: boolean;
}

export default function KitchenSidebar({
    sidebarOpen,
    activeSection,
    setActiveSection,
    setSidebarOpen,
    navigationItems,
    onLogout,
    isLoggingOut
}: KitchenSidebarProps) {
    return (
        <aside
            className={`${
                sidebarOpen ? "w-64" : "w-20"
            } bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            } print:hidden`}
        >
            <div className={`p-6 border-b border-border flex items-center ${sidebarOpen ? "justify-between" : "justify-center"}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-xl">
                        👨‍🍳
                    </div>
                    {sidebarOpen && (
                        <div>
                            <h2 className="text-sm font-bold text-foreground tracking-tight">Kitchen Hub</h2>
                            <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">Fulfillment</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded-lg hover:bg-muted lg:hidden outline-none text-muted-foreground"
                >
                    ✕
                </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveSection(item.id);
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${activeSection === item.id
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <div className={`transition-transform duration-200 ${activeSection === item.id ? "scale-105" : ""}`}>
                            {item.icon}
                        </div>
                        {sidebarOpen && (
                            <>
                                <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span
                                        className={`${activeSection === item.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"} text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={onLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group text-muted-foreground hover:bg-rose-50 hover:text-rose-600 active:scale-95 border border-transparent"
                >
                    <LogOut className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isLoggingOut ? "animate-pulse" : ""}`} />
                    {sidebarOpen && (
                        <span className="text-sm font-semibold">
                            {isLoggingOut ? "Signing out..." : "Logout"}
                        </span>
                    )}
                </button>
            </div>
        </aside>
    );
}
