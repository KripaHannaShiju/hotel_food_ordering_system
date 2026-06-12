'use client';

import { X, Clock, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

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

interface KitchenOrderDetailModalProps {
    order: Order | null;
    onClose: () => void;
    onUpdateStatus: (id: string, nextStatus: string) => void;
    onCancel: (id: string) => void;
    onUpdatePrepTime: (id: string, newTime: number) => void;
    elapsed: number;
    remaining: number;
    delay: 'critical' | 'warning' | 'normal';
    statusConfig: any;
    nextStatus: string;
    nextStatusLabel: string;
    nextStatusColor: string;
}

export default function KitchenOrderDetailModal({
    order: o,
    onClose,
    onUpdateStatus,
    onCancel,
    onUpdatePrepTime,
    elapsed,
    remaining,
    delay,
    statusConfig,
    nextStatus,
    nextStatusLabel,
    nextStatusColor
}: KitchenOrderDetailModalProps) {
    if (!o) return null;
    
    const cfg = statusConfig[o.status] || statusConfig["Pending"];

    return (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 p-4 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-card rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold">
                            {o.tableNumber}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Table #{o.tableNumber}</h2>
                            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: {o._id.slice(-8)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Info Bar */}
                <div className={`px-6 py-3 flex items-center justify-between border-b ${cfg.bg}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`}></div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                    </div>

                    <div className="flex items-center gap-3 bg-card px-3 py-1.5 rounded-xl border border-border shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase hidden sm:inline">Lead Time</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdatePrepTime(o._id, Math.max(1, (o.estimatedPrepTime || 15) - 5)); }}
                                className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-all active:scale-90"
                            ><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-bold min-w-[30px] text-center text-foreground">{o.estimatedPrepTime || 15}m</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdatePrepTime(o._id, (o.estimatedPrepTime || 15) + 5); }}
                                className="p-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground transition-all active:scale-90"
                            ><Plus className="w-3 h-3" /></button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {o.customerNote && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">Customer Note</p>
                                <p className="text-sm font-medium text-amber-900 italic leading-relaxed">"{o.customerNote}"</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Order Summary</h4>
                        <div className="space-y-2">
                            {o.items.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground shadow-sm">
                                            {item.quantity}×
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 text-lg">{item.name}</p>
                                            {item.notes && (
                                                <div className="mt-2 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg inline-block">
                                                    Note: {item.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-muted/20 border-t border-border space-y-3">
                    {nextStatus && (
                        <button
                            onClick={() => { onUpdateStatus(o._id, nextStatus); onClose(); }}
                            className={`w-full py-4 rounded-2xl text-white text-sm font-bold transition-all active:scale-95 shadow-md hover:shadow-lg ${nextStatusColor}`}
                        >
                            {nextStatusLabel}
                        </button>
                    )}
                    <button
                        onClick={() => { onCancel(o._id); onClose(); }}
                        className="w-full py-3 rounded-2xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100/50"
                    >
                        Cancel Production
                    </button>
                </div>
            </div>
        </div>
    );
}
