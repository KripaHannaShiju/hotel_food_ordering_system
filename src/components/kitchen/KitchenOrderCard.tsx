'use client';

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface OrderItem {
    name: string;
    quantity: number;
    notes?: string;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    customerNote?: string;
    items: OrderItem[];
    status: string;
    createdAt: string;
    preparationStartedAt?: string;
    estimatedPrepTime: number;
}

interface KitchenOrderCardProps {
    order: Order;
    isSelected: boolean;
    onClick: () => void;
    onUpdateStatus: (id: string, nextStatus: string) => void;
    onCancel: (id: string) => void;
    totalWait: number;
    remaining: number;
    delay: 'critical' | 'warning' | 'normal';
    progress: number;
    statusConfig: any;
    nextStatus: string;
    nextStatusLabel: string;
    nextStatusColor: string;
}

export default function KitchenOrderCard({
    order,
    isSelected,
    onClick,
    onUpdateStatus,
    onCancel,
    totalWait,
    remaining,
    delay,
    progress,
    statusConfig,
    nextStatus,
    nextStatusLabel,
    nextStatusColor
}: KitchenOrderCardProps) {
    const cfg = statusConfig[order.status] || statusConfig["Pending"];

    return (
        <div
            onClick={onClick}
            className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                isSelected 
                    ? "border-primary ring-4 ring-primary/5 shadow-lg scale-[1.02]" 
                    : "border-border bg-card shadow-sm hover:border-primary/20 hover:shadow-md"
            }`}
        >
            {/* Header: Table & Timer */}
            <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${
                delay === "critical" ? "bg-rose-50/50" : delay === "warning" ? "bg-amber-50/50" : "bg-card"
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                        isSelected ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"
                    }`}>
                        {order.tableNumber}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Table #{order.tableNumber}</h3>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">#{order._id.slice(-5)}</p>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${
                        delay === 'critical' ? 'text-rose-600' : delay === 'warning' ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                        <Clock className="w-4 h-4" />
                        {totalWait}m
                    </div>
                    {order.preparationStartedAt && (
                        <p className={`text-[10px] font-bold ${remaining <= 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {remaining <= 0 ? "Delayed" : `${remaining}m left`}
                        </p>
                    )}
                </div>
            </div>

            {/* Status & Patient Info */}
            <div className={`px-5 py-3 border-b border-border flex items-center justify-between bg-muted/20 ${cfg.bg}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`}></div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                </div>
                {order.customerName && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                        {order.customerName}
                    </span>
                )}
            </div>

            {/* Items List */}
            <div className="px-5 py-4 h-36 overflow-y-auto custom-scrollbar space-y-3">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-bold">
                                {item.quantity}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                        </div>
                        {item.notes && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
                    </div>
                ))}
                {order.customerNote && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-[11px] font-medium text-amber-800 italic">
                        "{order.customerNote}"
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-4 py-4 bg-muted/30 border-t border-border flex gap-2" onClick={e => e.stopPropagation()}>
                {nextStatus ? (
                    <button
                        onClick={() => onUpdateStatus(order._id, nextStatus)}
                        className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-sm hover:opacity-90 ${nextStatusColor}`}
                    >
                        {nextStatusLabel}
                    </button>
                ) : (
                    <div className="flex-1 py-2.5 flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl text-xs font-bold">
                        <CheckCircle className="w-4 h-4" /> Ready for Pickup
                    </div>
                )}
                <button
                    onClick={() => onCancel(order._id)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors border border-rose-100 flex items-center justify-center active:scale-90"
                    title="Terminate Order"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Bar Layer */}
            {order.status === "Preparing" && (
                <div className="h-1 bg-muted w-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${remaining <= 0 ? 'bg-amber-400' : 'bg-primary'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
