'use client';

import { ThemeToggle } from "@/components/ThemeToggle";
import { User, LogOut, Menu, X } from "lucide-react";

interface AdminTopNavProps {
    sidebarOpen: boolean;
    setSidebarOpen: (val: boolean) => void;
    activeSectionName: string;
    onLogout: () => void;
}

export default function AdminTopNav({
    sidebarOpen,
    setSidebarOpen,
    activeSectionName,
    onLogout
}: AdminTopNavProps) {
    return (
        <nav className="bg-card border-b border-border sticky top-0 z-40 shadow-sm print:hidden">
            <div className="px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 -ml-2 rounded-xl hover:bg-muted transition-all active:scale-95 lg:hidden border border-border text-muted-foreground"
                            aria-label="Toggle Menu"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                {activeSectionName}
                            </h1>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-bold tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col text-right pr-4 border-r border-border">
                            <p className="text-xs font-bold text-foreground">
                                Super Admin
                            </p>
                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">Active Session</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <div className="w-px h-8 bg-border mx-1 hidden sm:block"></div>
                            <button 
                                onClick={onLogout}
                                className="w-10 h-10 rounded-xl bg-card text-muted-foreground border border-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all duration-300 flex items-center justify-center group active:scale-95 shadow-sm"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
