'use client';

import { Search, Loader2 } from 'lucide-react';

interface MenuItem {
    _id: string;
    name: string;
    category: string;
    image: string;
    isVeg: boolean;
    isAvailable: boolean;
}

interface StockControlModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
    stockSearchQuery: string;
    setStockSearchQuery: (val: string) => void;
    toggleAvailability: (item: MenuItem) => void;
}

export default function StockControlModal({
    isOpen,
    onClose,
    menuItems,
    stockSearchQuery,
    setStockSearchQuery,
    toggleAvailability
}: StockControlModalProps) {
    if (!isOpen) return null;

    const filteredItems = menuItems.filter(i => 
        i.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) || 
        i.category.toLowerCase().includes(stockSearchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                <div className="p-8 pb-6 flex justify-between items-center border-b border-border">
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight">Kitchen Stock Control</h3>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Manage Availability</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all font-black text-lg"
                    >✕</button>
                </div>

                <div className="p-6 bg-muted/30 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Search dishes to toggle status..."
                            value={stockSearchQuery}
                            onChange={(e) => setStockSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border-2 border-transparent focus:border-primary outline-none font-bold text-sm shadow-sm transition-all text-foreground"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    {filteredItems.map((item) => (
                        <div 
                            key={item._id}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 group ${
                                item.isAvailable 
                                    ? "bg-card border-border hover:border-emerald-500/50" 
                                    : "bg-muted/50 border-dashed border-muted-foreground/20 grayscale"
                            }`}
                        >
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-black text-foreground truncate">{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`}></span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.category}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                    item.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"
                                }`}>
                                    {item.isAvailable ? "● In Stock" : "○ Out of Stock"}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={item.isAvailable} 
                                        onChange={() => toggleAvailability(item)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    ))}
                    {menuItems.length === 0 && (
                        <div className="text-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                            <p className="text-muted-foreground font-bold mt-2">Loading inventory...</p>
                        </div>
                    )}
                    {menuItems.length > 0 && filteredItems.length === 0 && (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground font-bold italic">No matching dishes found</p>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-muted/50 border-t border-border">
                    <button 
                        onClick={onClose}
                        className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-black/10"
                    >Return to Dashboard</button>
                </div>
            </div>
        </div>
    );
}
