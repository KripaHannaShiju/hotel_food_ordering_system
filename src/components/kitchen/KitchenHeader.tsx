'use client';

import { LogOut, ShoppingBag } from 'lucide-react';

interface KitchenHeaderProps {
    kitchenNow: Date;
    onLogout: () => void;
    onOpenStock: () => void;
}

export default function KitchenHeader({
    kitchenNow,
    onLogout,
    onOpenStock
}: KitchenHeaderProps) {
    return (
        <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-500/20">👨‍🍳</div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Kitchen Terminal</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">Live Production Hub</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="text-right hidden md:block mr-2 px-4 border-r border-border">
                    <p className="text-lg font-black tracking-tighter" suppressHydrationWarning>
                        {kitchenNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest">System Active</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenStock}
                        className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-emerald-500/20 shadow-sm active:scale-95"
                    >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="hidden lg:inline">Live Stock</span>
                    </button>
                    
                    <button
                        onClick={onLogout}
                        className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border border-rose-500/20 shadow-sm active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:inline">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
