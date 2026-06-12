'use client';

import { Search, Package, Check, X } from "lucide-react";

interface MenuItem {
    _id: string;
    name: string;
    category: string;
    image?: string;
    isAvailable: boolean;
}

interface KitchenLiveStockProps {
    menuItems: MenuItem[];
    stockSearchQuery: string;
    setStockSearchQuery: (val: string) => void;
    toggleAvailability: (item: MenuItem) => void;
}

export default function KitchenLiveStock({
    menuItems,
    stockSearchQuery,
    setStockSearchQuery,
    toggleAvailability
}: KitchenLiveStockProps) {
    const filteredItems = menuItems.filter(item => 
        item.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(stockSearchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Search Header */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Live Stock</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium flex items-center gap-2">
                         Toggle dish availability for the digital menu
                    </p>
                </div>
                <div className="w-full md:w-96 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for a dish to toggle..."
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-5 py-3 rounded-xl bg-muted/30 border border-border focus:border-primary focus:bg-card transition-all outline-none font-medium text-sm"
                    />
                </div>
            </div>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                    <div 
                        key={item._id}
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                            item.isAvailable 
                                ? "bg-card border-border hover:shadow-md hover:border-primary/20" 
                                : "bg-muted/30 border-dashed border-muted-foreground/20 opacity-80"
                        }`}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shadow-sm shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">No Img</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded uppercase tracking-wider">{item.category}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.isAvailable ? "bg-emerald-500" : "bg-rose-400"}`}></div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${item.isAvailable ? "text-emerald-700" : "text-rose-600"}`}>
                                        {item.isAvailable ? "Available" : "Sold Out"}
                                    </span>
                                </div>
                                
                                <button 
                                    onClick={() => toggleAvailability(item)}
                                    className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${
                                        item.isAvailable ? "bg-primary" : "bg-muted-foreground/30"
                                    }`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                                        item.isAvailable ? "translate-x-4" : "translate-x-0"
                                    }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border flex flex-col items-center gap-4">
                    <Package className="w-12 h-12 text-muted-foreground opacity-30" />
                    <p className="text-sm font-medium text-muted-foreground">No inventory matches found</p>
                </div>
            )}
        </div>
    );
}
