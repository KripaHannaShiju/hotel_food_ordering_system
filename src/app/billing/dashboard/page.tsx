'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Receipt, History, BarChart3, 
    LogOut, CheckCircle2, AlertCircle, RefreshCcw, Search, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import SplitPaymentModal from '@/components/billing/SplitPaymentModal';
import InvoicePrinter from '@/components/billing/InvoicePrinter';

export default function BillingDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'active' | 'history' | 'analytics'>('active');
    
    // Data states
    const [orders, setOrders] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Active Orders State
    const [selectedTableNumber, setSelectedTableNumber] = useState<string | null>(null);
    const [discount, setDiscount] = useState<string>('');
    const [coupon, setCoupon] = useState<string>('');
    const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
    
    // Split Payment State
    const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
    
    // Printing State
    const [billToPrint, setBillToPrint] = useState<any>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'active') {
                const res = await fetch(`/api/orders?t=${Date.now()}`);
                if (res.ok) setOrders(await res.json());
            } else if (activeTab === 'history') {
                const res = await fetch(`/api/bills?t=${Date.now()}`);
                if (res.ok) setBills(await res.json());
            } else if (activeTab === 'analytics') {
                const res = await fetch(`/api/analytics/sales?t=${Date.now()}`);
                if (res.ok) setAnalytics(await res.json());
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to sync data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/billing/login");
    };

    // --- ACTIVE TABLES LOGIC ---
    // Get orders that are ready/delivered but NOT yet linked to a paid bill
    const activeOrders = orders.filter(o => 
        ['Ready', 'Delivered'].includes(o.status) && 
        o.paymentStatus !== 'Paid' && !o.billId
    );

    // Group active orders by table
    const tableGroups = activeOrders.reduce((acc, order) => {
        const tableStr = order.tableNumber.toString();
        if (!acc[tableStr]) {
            acc[tableStr] = {
                tableNumber: order.tableNumber,
                orderIds: [],
                items: [],
            };
        }
        acc[tableStr].orderIds.push(order._id);
        order.items.forEach((item: any) => {
            const existingItem = acc[tableStr].items.find((i: any) => i.name === item.name);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                acc[tableStr].items.push({ ...item });
            }
        });
        return acc;
    }, {} as Record<string, any>);

    const groupedActiveOrders = Object.values(tableGroups);

    const selectedTableData = groupedActiveOrders.find(g => g.tableNumber.toString() === selectedTableNumber);
    
    let subtotal = 0;
    if (selectedTableData) {
        subtotal = selectedTableData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    }
    const gstAmount = subtotal * 0.05;
    const serviceChargeAmount = subtotal * 0.02;
    const totalAmount = Math.max(0, subtotal + gstAmount + serviceChargeAmount - appliedDiscount);

    const handleApplyDiscount = () => {
        const d = parseFloat(discount);
        if (!isNaN(d) && d >= 0) {
            setAppliedDiscount(d);
            toast.success('Discount applied');
        }
    };

    const handleGenerateBill = async (payments: any[]) => {
        if (!selectedTableData) return;

        const payload = {
            tableNumber: selectedTableData.tableNumber,
            orders: selectedTableData.orderIds,
            subtotal,
            gstAmount,
            serviceChargeAmount,
            discountAmount: appliedDiscount,
            couponCode: coupon,
            totalAmount,
            paymentStatus: 'Paid',
            splitPayments: payments
        };

        try {
            const res = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newBill = await res.json();
                toast.success('Bill generated and settled!');
                setSelectedTableNumber(null);
                setAppliedDiscount(0);
                setDiscount('');
                setCoupon('');
                setIsSplitModalOpen(false);
                
                // Trigger print
                // We need to fetch the populated bill to print
                const printRes = await fetch(`/api/bills/${newBill._id}`);
                if (printRes.ok) {
                    const populatedBill = await printRes.json();
                    setBillToPrint(populatedBill);
                    setTimeout(() => window.print(), 500); // give it time to render
                }
                
                fetchData();
            } else {
                toast.error('Failed to generate bill');
            }
        } catch (err) {
            toast.error('Error generating bill');
        }
    };


    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex print:hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Invoice</h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Billing Portal</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'active' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <LayoutDashboard className="w-5 h-5" /> Active Orders
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <History className="w-5 h-5" /> Billing History
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                            activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        <BarChart3 className="w-5 h-5" /> Sales Analytics
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col print:block">
                <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center print:hidden">
                    <h2 className="text-2xl font-black text-slate-800 capitalize">
                        {activeTab === 'active' ? 'Active Orders Invoicing' : 
                         activeTab === 'history' ? 'Invoice History' : 
                         'Sales Analytics'}
                    </h2>
                    <button onClick={fetchData} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-xl transition-all">
                        <RefreshCcw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8 print:p-0">
                    {/* ACTIVE ORDERS TAB */}
                    {activeTab === 'active' && (
                        <div className="flex h-full gap-8 print:hidden">
                            {/* Orders Grid */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
                                {activeOrders.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                        <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-400" />
                                        <p className="text-lg font-bold">All orders billed up!</p>
                                    </div>
                                ) : (
                                    groupedActiveOrders.map(group => (
                                        <button 
                                            key={group.tableNumber}
                                            onClick={() => {
                                                setSelectedTableNumber(group.tableNumber.toString());
                                                setAppliedDiscount(0);
                                                setDiscount('');
                                                setCoupon('');
                                            }}
                                            className={`p-6 rounded-3xl border-2 text-left transition-all duration-300 flex flex-col justify-between ${
                                                selectedTableNumber === group.tableNumber.toString()
                                                    ? 'border-indigo-600 bg-white shadow-xl shadow-indigo-100 scale-[1.02]'
                                                    : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'
                                            }`}
                                        >
                                            <div className="w-full">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-2xl font-black text-slate-800">Table {group.tableNumber}</h3>
                                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-widest">
                                                        Unbilled
                                                    </span>
                                                </div>
                                                <p className="text-xs font-mono text-slate-400 mb-4">Orders: {group.orderIds.map((id: string) => '#' + id.slice(-6)).join(', ')}</p>
                                            </div>
                                            <div className="text-slate-500 font-medium">
                                                {group.items.length} items ordered
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Billing Panel */}
                            {selectedTableData && (
                                <div className="w-[450px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden shrink-0">
                                    <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
                                        <h3 className="text-xl font-black mb-1">Invoice Summary</h3>
                                        <p className="text-sm text-slate-400">Table {selectedTableData.tableNumber} • Orders: {selectedTableData.orderIds.map((id: string) => '#' + id.slice(-6)).join(', ')}</p>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {/* Order Items */}
                                        <div className="space-y-3">
                                            {selectedTableData.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <div>
                                                        <p className="font-bold text-slate-800">{item.name}</p>
                                                        <p className="text-xs text-slate-400">{item.quantity} x ₹{item.price}</p>
                                                    </div>
                                                    <p className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Coupon Code" 
                                                value={coupon}
                                                onChange={e => setCoupon(e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                            />
                                            <div className="flex-1 relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                <input 
                                                    type="number" 
                                                    placeholder="Discount" 
                                                    value={discount}
                                                    onChange={e => setDiscount(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                            <button onClick={handleApplyDiscount} className="px-4 bg-slate-800 text-white rounded-xl font-bold text-sm">
                                                Apply
                                            </button>
                                        </div>

                                        <div className="space-y-2 text-sm font-medium text-slate-500">
                                            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span>GST (5%)</span><span>₹{gstAmount.toFixed(2)}</span></div>
                                            <div className="flex justify-between"><span>Service Charge (2%)</span><span>₹{serviceChargeAmount.toFixed(2)}</span></div>
                                            {appliedDiscount > 0 && <div className="flex justify-between text-emerald-600 font-bold"><span>Discount</span><span>-₹{appliedDiscount.toFixed(2)}</span></div>}
                                        </div>

                                        <div className="flex justify-between items-end pt-4 border-t border-slate-200">
                                            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                                            <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{totalAmount.toFixed(2)}</span>
                                        </div>

                                        <button 
                                            onClick={() => setIsSplitModalOpen(true)}
                                            className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                                        >
                                            Process Payment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Bill ID</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Table</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Items</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {bills.map(bill => {
                                        const allItems = bill.orders?.flatMap((o: any) => o?.items || []) || [];
                                        const itemsSummary = allItems.length > 0 
                                            ? allItems.slice(0, 3).map((i: any) => `${i?.quantity || 0}x ${i?.name || 'Item'}`).join(', ') + (allItems.length > 3 ? '...' : '')
                                            : 'No items';

                                        return (
                                        <tr key={bill._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-mono text-sm font-bold text-slate-600">#{bill._id.slice(-6)}</td>
                                            <td className="p-4 text-sm font-medium text-slate-600">{new Date(bill.createdAt).toLocaleString()}</td>
                                            <td className="p-4 font-bold text-slate-800">{bill.tableNumber}</td>
                                            <td className="p-4 text-sm text-slate-500 max-w-[200px] truncate" title={allItems.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}>
                                                {itemsSummary}
                                            </td>
                                            <td className="p-4 font-black text-slate-900">₹{bill.totalAmount.toFixed(2)}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                    bill.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    bill.paymentStatus === 'Refunded' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {bill.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => {
                                                        setBillToPrint(bill);
                                                        setTimeout(() => window.print(), 500);
                                                    }}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs transition-colors inline-flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" /> Receipt
                                                </button>
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {bills.length === 0 && (
                                <div className="text-center py-20 text-slate-400 font-bold">No bills generated yet</div>
                            )}
                        </div>
                    )}

                    {/* ANALYTICS TAB */}
                    {activeTab === 'analytics' && analytics && (
                        <div className="space-y-8 print:hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Today's Revenue", data: analytics.daily, color: 'from-blue-500 to-indigo-600' },
                                    { label: "This Week", data: analytics.weekly, color: 'from-emerald-500 to-teal-600' },
                                    { label: "This Month", data: analytics.monthly, color: 'from-purple-500 to-fuchsia-600' },
                                ].map((stat, idx) => (
                                    <div key={idx} className={`bg-gradient-to-br ${stat.color} p-6 rounded-3xl text-white shadow-xl`}>
                                        <h3 className="text-white/80 font-bold uppercase tracking-widest text-sm mb-4">{stat.label}</h3>
                                        <div className="flex items-end gap-4">
                                            <p className="text-5xl font-black tracking-tighter">₹{stat.data.revenue.toLocaleString()}</p>
                                        </div>
                                        <p className="mt-4 font-medium text-white/90 bg-white/10 inline-block px-3 py-1 rounded-lg">
                                            {stat.data.orders} Completed Orders
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-xl font-black text-slate-800 mb-6">Recent Transactions</h3>
                                <div className="space-y-4">
                                    {analytics.recentTransactions.map((tx: any) => (
                                        <div key={tx._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-800">
                                                    T{tx.tableNumber}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">Payment Received</p>
                                                    <p className="text-xs text-slate-500 font-medium">{new Date(tx.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-xl text-emerald-600">+₹{tx.totalAmount.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modals & Print Overlays */}
            <SplitPaymentModal 
                isOpen={isSplitModalOpen}
                onClose={() => setIsSplitModalOpen(false)}
                totalAmount={totalAmount}
                onComplete={handleGenerateBill}
            />

            <InvoicePrinter bill={billToPrint} />
        </div>
    );
}
