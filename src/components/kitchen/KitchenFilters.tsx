'use client';

import { Filter, SortAsc, RefreshCw } from 'lucide-react';

interface KitchenFiltersProps {
    kitchenFilter: string;
    setKitchenFilter: (val: string) => void;
    kitchenSort: string;
    setKitchenSort: (val: string) => void;
    onRefresh: () => void;
}

export default function KitchenFilters({
    kitchenFilter,
    setKitchenFilter,
    kitchenSort,
    setKitchenSort,
    onRefresh
}: KitchenFiltersProps) {
    const filters = ["active", "Pending", "Confirmed", "Preparing", "Ready"];
    
    return (
        <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setKitchenFilter(f)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${kitchenFilter === f
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-muted/30 text-muted-foreground border-transparent hover:border-slate-200 hover:bg-muted/50"
                            }`}
                    >
                        {f === "active" ? "All Active" : f}
                    </button>
                ))}
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/40 px-4 py-2 rounded-xl border border-border group focus-within:border-primary/50 transition-colors">
                    <SortAsc className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={kitchenSort}
                        onChange={(e) => setKitchenSort(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-foreground focus:ring-0 cursor-pointer outline-none"
                    >
                        <option value="oldest">Oldest First</option>
                        <option value="newest">Newest First</option>
                        <option value="table">Table No.</option>
                    </select>
                </div>
                
                <button
                    onClick={onRefresh}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border hover:bg-muted transition-all active:rotate-180 duration-500 shadow-sm text-muted-foreground"
                    title="Refresh orders"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
