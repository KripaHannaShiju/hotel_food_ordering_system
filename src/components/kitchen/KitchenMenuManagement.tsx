'use client';

import { Edit3, Trash2, Plus, Search } from "lucide-react";

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    isVeg: boolean;
    spiceLevel: string;
    prepTime: number;
    isAvailable: boolean;
    image?: string;
}

interface KitchenMenuManagementProps {
    menuItems: MenuItem[];
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggleAvailability: (item: MenuItem) => void;
    onAddNew: () => void;
    editingPriceId: string | null;
    setEditingPriceId: (id: string | null) => void;
    editingPriceValue: string;
    setEditingPriceValue: (val: string) => void;
    saveInlinePrice: (item: MenuItem) => void;
    editingPrepId: string | null;
    setEditingPrepId: (id: string | null) => void;
    editingPrepValue: string;
    setEditingPrepValue: (val: string) => void;
    saveInlinePrep: (item: MenuItem) => void;
}

export default function KitchenMenuManagement({
    menuItems,
    onEdit,
    onDelete,
    onToggleAvailability,
    onAddNew,
    editingPriceId,
    setEditingPriceId,
    editingPriceValue,
    setEditingPriceValue,
    saveInlinePrice,
    editingPrepId,
    setEditingPrepId,
    editingPrepValue,
    setEditingPrepValue,
    saveInlinePrep
}: KitchenMenuManagementProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Menu Header */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Menu Management</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Configure catalog assets and production timing</p>
                </div>
                <button
                    onClick={onAddNew}
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all text-sm flex items-center gap-2 shadow-sm active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Dish
                </button>
            </div>

            {/* Menu Items Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Asset</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground">Category</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Unit Price</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Type</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Spice</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Prep Time</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Status</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {menuItems.map((item) => (
                                <tr key={item._id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {item.image && (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border hidden sm:block">
                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {editingPriceId === item._id ? (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    autoFocus
                                                    value={editingPriceValue}
                                                    onChange={(e) => setEditingPriceValue(e.target.value)}
                                                    onBlur={() => saveInlinePrice(item)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveInlinePrice(item);
                                                        if (e.key === "Escape") setEditingPriceId(null);
                                                    }}
                                                    className="w-20 px-2 py-1 border border-primary rounded-lg text-sm font-semibold text-primary outline-none"
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingPriceId(item._id);
                                                        setEditingPriceValue(item.price.toString());
                                                    }}
                                                    className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                                                >
                                                    ₹{item.price.toFixed(2)}
                                                    <Edit3 className="w-3 h-3 text-muted-foreground/40" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                            item.isVeg ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                        }`}>
                                            {item.isVeg ? "Veg" : "Non-Veg"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase">{item.spiceLevel || "—"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            {editingPrepId === item._id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    autoFocus
                                                    value={editingPrepValue}
                                                    onChange={(e) => setEditingPrepValue(e.target.value)}
                                                    onBlur={() => saveInlinePrep(item)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveInlinePrep(item);
                                                        if (e.key === "Escape") setEditingPrepId(null);
                                                    }}
                                                    className="w-16 px-2 py-1 border border-primary rounded-lg text-sm font-semibold text-primary outline-none"
                                                />
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingPrepId(item._id);
                                                        setEditingPrepValue(item.prepTime ? item.prepTime.toString() : "");
                                                    }}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-all"
                                                >
                                                    {item.prepTime || "0"} min
                                                    <Edit3 className="w-3 h-3 text-muted-foreground/40" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => onToggleAvailability(item)}
                                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                                                item.isAvailable 
                                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {item.isAvailable ? "Available" : "Stock Out"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2 pr-4">
                                            <button
                                                onClick={() => onEdit(item)}
                                                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                                title="Edit"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(item._id)}
                                                className="p-2 rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
