
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Loader2, LogOut, Receipt, Search, Clock, CheckCircle, ShoppingBag, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    customerNote?: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
    preparationStartedAt?: string;
    estimatedPrepTime: number;
}

export default function KitchenDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [kitchenNow, setKitchenNow] = useState<Date>(new Date());
    const [kitchenFilter, setKitchenFilter] = useState<string>("active");
    const [kitchenSort, setKitchenSort] = useState<string>("oldest");
    const [selectedKitchenOrder, setSelectedKitchenOrder] = useState<Order | null>(null);
    const [kitchenNotifications, setKitchenNotifications] = useState<string[]>([]);
    const [prevOrderIds, setPrevOrderIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?t=${Date.now()}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const tick = setInterval(() => setKitchenNow(new Date()), 30000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        const currentIds = orders.map((o) => o._id);
        const newOnes = currentIds.filter((id) => !prevOrderIds.includes(id));
        if (prevOrderIds.length > 0 && newOnes.length > 0) {
            const msg = `🆕 ${newOnes.length} new order${newOnes.length > 1 ? "s" : ""} received!`;
            setKitchenNotifications((prev) => [msg, ...prev].slice(0, 5));
            toast.success(msg, { duration: 4000 });
        }
        setPrevOrderIds(currentIds);
    }, [orders]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const updateOrderPrepTime = async (id: string, newTime: number) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estimatedPrepTime: newTime }),
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => o._id === id ? updatedOrder : o));
                if (selectedKitchenOrder?._id === id) {
                    setSelectedKitchenOrder(updatedOrder);
                }
                toast.success(`Prep time updated to ${newTime}m`);
            }
        } catch (error) {
            console.error("Failed to update prep time:", error);
            toast.error("Time update failed");
        }
    };

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/kitchen/login");
    };

    // Helper functions
    const getWaitMinutes = (createdAt: string) =>
        Math.floor((kitchenNow.getTime() - new Date(createdAt).getTime()) / 60000);

    const getElapsedMinutes = (createdAt: string, startedAt?: string) => {
        if (!startedAt) return 0;
        return Math.floor((kitchenNow.getTime() - new Date(startedAt).getTime()) / 60000);
    };

    const getRemainingMinutes = (order: Order) => {
        const elapsed = getElapsedMinutes(order.createdAt, order.preparationStartedAt);
        const prep = order.estimatedPrepTime || 15;
        if (!order.preparationStartedAt) return prep;
        return prep - elapsed;
    };

    const getDelayLevel = (order: Order) => {
        const remaining = getRemainingMinutes(order);
        if (remaining <= -10) return "critical";
        if (remaining <= 0) return "warning";
        return "normal";
    };

    const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
        Pending: { bg: "bg-amber-50/40 border-amber-200/50", text: "text-amber-600", dot: "bg-amber-400", label: "⏳ Pending" },
        Confirmed: { bg: "bg-sky-50/40 border-sky-200/50", text: "text-sky-600", dot: "bg-sky-400", label: "✅ Confirmed" },
        Preparing: { bg: "bg-orange-50/40 border-orange-200/50", text: "text-orange-600", dot: "bg-orange-400", label: "🍳 Preparing" },
        Ready: { bg: "bg-emerald-50/40 border-emerald-200/50", text: "text-emerald-600", dot: "bg-emerald-400", label: "🛎️ Ready" },
    };

    const nextStatus: Record<string, string> = {
        Pending: "Confirmed",
        Confirmed: "Preparing",
        Preparing: "Ready",
        Ready: "Delivered",
    };

    const nextStatusLabel: Record<string, string> = {
        Pending: "Confirm",
        Confirmed: "Start Preparing",
        Preparing: "Mark as Ready",
        Ready: "Mark Delivered",
    };

    const nextStatusColor: Record<string, string> = {
        Pending: "bg-sky-500 hover:bg-sky-600",
        Confirmed: "bg-orange-400 hover:bg-orange-500",
        Preparing: "bg-emerald-500 hover:bg-emerald-600",
        Ready: "bg-slate-600 hover:bg-slate-700",
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock className="w-5 h-5 text-amber-500" />;
            case "Confirmed": return <CheckCircle className="w-5 h-5 text-blue-500" />;
            case "Preparing": return <Clock className="w-5 h-5 text-orange-500 animate-spin-slow" />;
            case "Ready": return <ShoppingBag className="w-5 h-5 text-green-500" />;
            case "Delivered": return <Receipt className="w-5 h-5 text-gray-500" />;
            case "Cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const kitchenOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));

    let filteredKitchenOrders = kitchenFilter === "active"
        ? kitchenOrders
        : kitchenOrders.filter((o) => o.status === kitchenFilter);

    filteredKitchenOrders = [...filteredKitchenOrders].sort((a, b) => {
        if (kitchenSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (kitchenSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (kitchenSort === "table") return parseInt(a.tableNumber) - parseInt(b.tableNumber);
        return 0;
    });

    const delayedCount = kitchenOrders.filter((o) => getElapsedMinutes(o.createdAt) >= 10).length;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xl">👨‍🍳</div>
                    <div>
                        <h1 className="text-xl font-bold">Kitchen Module</h1>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Live Preparation Counter</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold" suppressHydrationWarning>{kitchenNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">System Ready</p>
                    </div>
                    <button
                        onClick={logout}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all p-3 rounded-xl flex items-center gap-2 font-bold text-sm border border-red-500/20"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">Logout Staff</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
                {/* Stats bar */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: "All Active", count: kitchenOrders.length, color: "bg-slate-50 border border-slate-200 text-slate-700", icon: "🍽️" },
                        { label: "Pending", count: kitchenOrders.filter(o => o.status === "Pending").length, color: "bg-amber-50 border border-amber-200 text-amber-700", icon: "⏳" },
                        { label: "Preparing", count: kitchenOrders.filter(o => o.status === "Preparing").length, color: "bg-orange-50 border border-orange-200 text-orange-700", icon: "🍳" },
                        { label: "Ready", count: kitchenOrders.filter(o => o.status === "Ready").length, color: "bg-emerald-50 border border-emerald-200 text-emerald-700", icon: "🛎️" },
                        { label: "⚠️ Delayed", count: delayedCount, color: delayedCount > 0 ? "bg-rose-50 border border-rose-200 text-rose-700 animate-pulse" : "bg-slate-50 border border-slate-100 text-slate-400", icon: "🚨" },
                    ].map((stat) => (
                        <div key={stat.label} className={`rounded-xl p-4 flex items-center gap-3 ${stat.color} transition-all duration-300`}>
                            <span className="text-2xl">{stat.icon}</span>
                            <div>
                                <p className="text-2xl font-black leading-none">{stat.count}</p>
                                <p className="text-xs font-semibold opacity-80 mt-0.5">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notification banner */}
                {kitchenNotifications.length > 0 && (
                    <div className="bg-sky-500/90 text-white rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
                        <span className="font-semibold text-sm tracking-wide">{kitchenNotifications[0]}</span>
                        <button onClick={() => setKitchenNotifications([])} className="text-white/70 hover:text-white text-lg font-bold transition-colors">✕</button>
                    </div>
                )}

                {/* Filters & Sort */}
                <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {["active", "Pending", "Confirmed", "Preparing", "Ready"].map((f) => (
                            <button
                                key={f}
                                onClick={() => setKitchenFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${kitchenFilter === f
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-card text-muted-foreground border-border hover:border-gray-400 font-bold"
                                    }`}
                            >
                                {f === "active" ? "🍽️ All Active" : f}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">Sort:</span>
                        <select
                            value={kitchenSort}
                            onChange={(e) => setKitchenSort(e.target.value)}
                            className="px-3 py-2 rounded-lg border-2 border-border text-sm font-bold focus:border-gray-900 focus:outline-none"
                        >
                            <option value="oldest">⬆ Oldest First</option>
                            <option value="newest">⬇ Newest First</option>
                            <option value="table">🪑 By Table</option>
                        </select>
                        <button
                            onClick={fetchOrders}
                            className="p-2 rounded-lg bg-background border border-border hover:bg-muted transition-colors text-lg"
                            title="Refresh orders"
                        >🔄</button>
                    </div>
                </div>

                {/* Order Cards Grid */}
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="font-bold text-muted-foreground">Synchronizing kitchen state...</p>
                  </div>
                ) : filteredKitchenOrders.length === 0 ? (
                    <div className="bg-card rounded-xl border border-dashed border-border py-20 text-center">
                        <div className="text-6xl mb-3">🍽️</div>
                        <p className="text-muted-foreground text-lg font-bold tracking-tight">No orders to display</p>
                        <p className="text-muted-foreground text-sm mt-1">New orders will appear here in real time</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filteredKitchenOrders.map((order) => {
                            const totalWait = getWaitMinutes(order.createdAt);
                            const elapsed = getElapsedMinutes(order.createdAt, order.preparationStartedAt);
                            const remaining = getRemainingMinutes(order);
                            const delay = getDelayLevel(order);
                            const cfg = statusConfig[order.status] || statusConfig["Pending"];
                            const isSelected = selectedKitchenOrder?._id === order._id;

                            const progress = order.preparationStartedAt
                                ? Math.min(100, Math.max(0, (elapsed / (order.estimatedPrepTime || 15)) * 100))
                                : 0;

                            return (
                                <div
                                    key={order._id}
                                    onClick={() => setSelectedKitchenOrder(isSelected ? null : order)}
                                    className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300 ${delay === "critical" ? "border-rose-300 shadow-rose-100 shadow-xl" :
                                        delay === "warning" ? "border-orange-200 shadow-orange-50 shadow-lg" :
                                            isSelected ? "border-slate-400 shadow-xl" : "border-slate-100/80 shadow-sm"
                                        } ${isSelected ? "ring-4 ring-slate-400/10 scale-[1.02]" : "hover:shadow-md hover:scale-[1.01]"}`}
                                >
                                    {/* Card Header */}
                                    <div className={`px-5 py-3 flex items-center justify-between ${delay === "critical" ? "bg-rose-50 text-rose-900 border-b border-rose-100" :
                                        delay === "warning" ? "bg-orange-50 text-orange-900 border-b border-orange-100" :
                                            "bg-slate-50 text-slate-800 border-b border-slate-100"
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-black tracking-tight italic">T-{order.tableNumber}</span>
                                            <span className="text-[10px] font-bold bg-card/60 border border-black/5 rounded-full px-2 py-0.5 text-muted-foreground uppercase tracking-widest">#{order._id.slice(-5)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!order.preparationStartedAt ? (
                                                <span className="text-[10px] font-black tracking-widest bg-slate-900/5 text-slate-400 px-2.5 py-1 rounded-full border border-slate-900/5 uppercase">
                                                    ⏳ Not Started
                                                </span>
                                            ) : remaining <= 0 ? (
                                                <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full animate-pulse ${remaining <= -10 ? 'bg-rose-500 text-white' : 'bg-orange-500 text-white'}`}>
                                                    {remaining <= -10 ? '🚨 CRITICAL' : '⚠️ DELAYED'}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black tracking-widest bg-slate-900/5 text-slate-500 px-2.5 py-1 rounded-full border border-slate-900/5 uppercase">
                                                    ⏱ {remaining}m left
                                                </span>
                                            )}
                                            <div className="flex items-center gap-1 text-sm font-bold">
                                                <span>{totalWait}m</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge & Progress */}
                                    <div className={`px-5 py-2 border-b ${cfg.bg}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} inline-block`}></span>
                                            <span className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</span>
                                            {order.customerName && (
                                                <span className="ml-auto text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {order.customerName}
                                                </span>
                                            )}
                                        </div>
                                        {order.customerNote && (
                                            <div className="mt-2 text-xs text-rose-600 font-bold bg-rose-50/50 p-2 rounded-lg border border-rose-100 flex items-start gap-2">
                                                <span className="text-base leading-none mt-0.5">📝</span>
                                                <span>{order.customerNote}</span>
                                            </div>
                                        )}
                                        <div className="mt-2 w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${remaining <= -10 ? 'bg-rose-400' : remaining <= 0 ? 'bg-orange-400' : 'bg-emerald-400'}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="px-5 py-3 bg-card">
                                        <ul className="space-y-2">
                                            {order.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-black shrink-0 border border-slate-200">{item.quantity}</span>
                                                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                                                    </div>
                                                    {item.notes && (
                                                        <span className="text-xs text-orange-600 font-bold bg-orange-50 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">📝 {item.notes}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-3 pt-3 border-t border-border flex justify-between items-center text-xs font-bold text-muted-foreground">
                                            <span>Requested: {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                            <span>{order.items.length} {order.items.length === 1 ? "Item" : "Items"}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-5 py-3 bg-muted border-t border-border flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        {nextStatus[order.status] && (
                                            <button
                                                onClick={() => updateStatus(order._id, nextStatus[order.status])}
                                                className={`flex-1 py-3 rounded-xl text-white text-sm font-black transition-all active:scale-95 ${nextStatusColor[order.status]}`}
                                            >
                                                {nextStatusLabel[order.status]}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateStatus(order._id, "Cancelled")}
                                            className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm font-black hover:bg-red-100 transition-colors border border-red-100"
                                            title="Cancel order"
                                        >✕</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Same Drawer logic as Admin for consistency */}
            {selectedKitchenOrder && (() => {
                const o = selectedKitchenOrder;
                const elapsed = getElapsedMinutes(o.createdAt);
                const remaining = getRemainingMinutes(o);
                const delay = getDelayLevel(o);
                const cfg = statusConfig[o.status] || statusConfig["Pending"];
                return (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelectedKitchenOrder(null)}>
                        <div
                            className="bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Drawer Header */}
                            <div className={`px-8 py-6 flex items-center justify-between ${delay === "critical" ? "bg-rose-50 text-rose-900 border-b border-rose-100" :
                                delay === "warning" ? "bg-orange-50 text-orange-900 border-b border-orange-100" :
                                    "bg-slate-50 text-slate-800 border-b border-slate-100"
                                }`}>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black italic">Table {o.tableNumber}</h2>
                                        <span className="bg-card/20 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">#{o._id.slice(-8)}</span>
                                    </div>
                                    <p className="text-sm opacity-75 font-bold">Ordered {elapsed} min ago • {o.items.length} Items</p>
                                </div>
                                <button onClick={() => setSelectedKitchenOrder(null)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-2xl hover:bg-black/10 transition-colors">✕</button>
                            </div>

                            {/* Status strip */}
                            <div className={`px-8 py-4 flex items-center gap-3 ${cfg.bg} border-b`}>
                                <span className={`w-3 h-3 rounded-full ${cfg.dot}`}></span>
                                <span className={`font-black uppercase tracking-tight ${cfg.text}`}>{cfg.label}</span>

                                <div className="ml-auto flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-card/40 rounded-xl px-2 py-1.5 border border-black/5">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Time Adj</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateOrderPrepTime(o._id, Math.max(1, (o.estimatedPrepTime || 15) - 5)); }}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-card text-muted-foreground hover:bg-background shadow-sm font-bold"
                                        >-</button>
                                        <span className="text-sm font-black min-w-[25px] text-center">{o.estimatedPrepTime || 15}m</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); updateOrderPrepTime(o._id, (o.estimatedPrepTime || 15) + 5); }}
                                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-card text-muted-foreground hover:bg-background shadow-sm font-bold"
                                        >+</button>
                                    </div>
                                </div>
                            </div>

                            {/* Items Scroll Area */}
                            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                                {o.customerNote && (
                                    <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-2xl border border-rose-100 flex items-start gap-3 animate-in slide-in-from-top-1">
                                        <span className="text-2xl leading-none">📝</span>
                                        <div className="flex-1">
                                            <p className="text-[10px] uppercase font-black opacity-60 mb-1 tracking-widest">Customer Instructions</p>
                                            <p className="font-bold text-base leading-tight">"{o.customerNote}"</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {o.items.map((item, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border">
                                            <div className="flex items-center gap-4">
                                                <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 text-white text-lg font-black shrink-0">{item.quantity}×</span>
                                                <div className="flex-1">
                                                    <p className="font-black text-foreground text-lg leading-tight">{item.name}</p>
                                                    {item.notes && (
                                                        <p className="text-sm text-orange-600 font-bold mt-1 bg-orange-50 inline-block px-2 py-0.5 rounded-lg border border-orange-100">📝 {item.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-8 pt-0 space-y-3" onClick={(e) => e.stopPropagation()}>
                                {nextStatus[o.status] && (
                                    <button
                                        onClick={() => { updateStatus(o._id, nextStatus[o.status]); setSelectedKitchenOrder(null); }}
                                        className={`w-full py-5 rounded-2xl text-white text-xl font-black transition-all active:scale-95 shadow-lg ${nextStatusColor[o.status]}`}
                                    >
                                        {nextStatusLabel[o.status].toUpperCase()}
                                    </button>
                                )}
                                <button
                                    onClick={() => { updateStatus(o._id, "Cancelled"); setSelectedKitchenOrder(null); }}
                                    className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    ✕ CANCEL ORDER
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

