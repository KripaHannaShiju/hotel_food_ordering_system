'use client';

interface KitchenStatsProps {
    kitchenOrdersCount: number;
    pendingCount: number;
    preparingCount: number;
    readyCount: number;
    delayedCount: number;
}

export default function KitchenStats({
    kitchenOrdersCount,
    pendingCount,
    preparingCount,
    readyCount,
    delayedCount
}: KitchenStatsProps) {
    const stats = [
        { label: "Active", count: kitchenOrdersCount, color: "bg-card border-border text-foreground", icon: "📋" },
        { label: "Pending", count: pendingCount, color: "bg-amber-50/50 border-amber-100 text-amber-700", icon: "⏳" },
        { label: "Cooking", count: preparingCount, color: "bg-indigo-50/50 border-indigo-100 text-indigo-700", icon: "🍳" },
        { label: "Ready", count: readyCount, color: "bg-emerald-50/50 border-emerald-100 text-emerald-700", icon: "🛎️" },
        { label: "Delayed", count: delayedCount, color: delayedCount > 0 ? "bg-rose-50 border-rose-100 text-rose-600 animate-pulse" : "bg-card border-border text-muted-foreground", icon: "⏰" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
                <div 
                    key={idx} 
                    className={`rounded-2xl p-5 border shadow-sm flex items-center justify-between group transition-all duration-300 hover:shadow-md ${stat.color}`}
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold tracking-tight">{stat.count}</p>
                    </div>
                    <div className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}
