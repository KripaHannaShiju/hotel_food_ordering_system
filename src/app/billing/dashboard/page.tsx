
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Printer, CreditCard, Banknote, Smartphone, Percent, 
    CheckCircle2, LogOut, Receipt, Search 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    items: OrderItem[];
    status: string;
    paymentStatus: "Pending" | "Paid" | "Failed";
    createdAt: string;
    totalAmount: number;
}

export default function BillingDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [billingSelectedTable, setBillingSelectedTable] = useState<string | null>(null);
    const [billingDiscount, setBillingDiscount] = useState<string>('');
    const [billingAppliedDiscount, setBillingAppliedDiscount] = useState<number>(0);
    const [billingPaymentMethod, setBillingPaymentMethod] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
    const [billingSearchQuery, setBillingSearchQuery] = useState('');
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

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/billing/login");
    };

    const activeOrders = orders.filter(o => 
        ['Preparing', 'Ready', 'Delivered'].includes(o.status) && 
        o.paymentStatus !== 'Paid'
    );

    const tableGroups = activeOrders.reduce((acc, order) => {
        if (!acc[order.tableNumber]) acc[order.tableNumber] = [];
        acc[order.tableNumber].push(order);
        return acc;
    }, {} as Record<string, Order[]>);

    const tables = Object.keys(tableGroups).map(tableNumber => ({
        tableNumber,
        orders: tableGroups[tableNumber],
        itemCount: tableGroups[tableNumber].reduce((sum, o) => sum + o.items.length, 0),
        total: tableGroups[tableNumber].reduce((sum, o) => sum + o.totalAmount, 0),
        primaryOrder: tableGroups[tableNumber][0]
    }));

    const filteredTables = tables.filter(t => 
        t.tableNumber.toLowerCase().includes(billingSearchQuery.toLowerCase()) ||
        t.orders.some(o => o._id.toLowerCase().includes(billingSearchQuery.toLowerCase()))
    );

    const selectedOrders = billingSelectedTable ? tableGroups[billingSelectedTable] : null;

    let aggregatedItems: { name: string; quantity: number; price: number }[] = [];
    if (selectedOrders) {
        selectedOrders.forEach(order => {
            order.items.forEach(item => {
                const existing = aggregatedItems.find(i => i.name === item.name && i.price === (item.price || 0));
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    aggregatedItems.push({ name: item.name, quantity: item.quantity, price: item.price || 0 });
                }
            });
        });
    }

    const itemSubtotal = aggregatedItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    const calculatedSubtotal = itemSubtotal > 0 ? itemSubtotal : (selectedOrders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0);

    const taxAmount = calculatedSubtotal * 0.05; // 5% GST
    const serviceCharge = calculatedSubtotal * 0.02; // 2% Service Charge
    const finalTotal = Math.max(0, calculatedSubtotal + taxAmount + serviceCharge - billingAppliedDiscount);

    const handleApplyDiscount = () => {
        const d = parseFloat(billingDiscount);
        if (!isNaN(d) && d >= 0) {
            setBillingAppliedDiscount(d);
            toast.success(`Discount of ₹${d} applied`);
        } else {
            setBillingAppliedDiscount(0);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleMarkPaid = async () => {
        if (selectedOrders) {
            try {
                await Promise.all(selectedOrders.map(o => 
                    fetch(`/api/orders/${o._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ paymentStatus: 'Paid' }),
                    })
                ));
                setBillingSelectedTable(null);
                fetchOrders();
                toast.success("Transaction settled successfully!");
            } catch (error) {
                toast.error("Failed to settle transaction");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Billing Counter</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">POS Terminal System</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={logout}
                        className="bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm border border-slate-200"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-6 overflow-hidden flex gap-6 print:block print:p-0">
                <div className="flex flex-col lg:flex-row gap-6 w-full h-full print:block">
                    {/* Left: Orders List */}
                    <div className="w-full lg:w-[380px] bg-white border border-slate-200 rounded-3xl flex flex-col shrink-0 overflow-hidden print:hidden shadow-sm">
                        <div className="p-5 border-b border-slate-100 bg-white">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Pending Payments</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="Table # or ID..."
                                    value={billingSearchQuery}
                                    onChange={(e) => setBillingSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoading ? (
                                <div className="text-center py-20 opacity-50">
                                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="font-bold">Loading orders...</p>
                                </div>
                            ) : filteredTables.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                    <p className="font-bold">No active bills</p>
                                </div>
                            ) : (
                                filteredTables.map(table => (
                                    <div 
                                        key={table.tableNumber}
                                        onClick={() => {
                                            setBillingSelectedTable(table.tableNumber);
                                            setBillingAppliedDiscount(0);
                                            setBillingDiscount('');
                                        }}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                            billingSelectedTable === table.tableNumber 
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                                                : 'border-transparent bg-slate-50 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-black text-xl text-slate-800">Table {table.tableNumber}</h3>
                                                <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">{table.orders.length} Order(s)</p>
                                            </div>
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border bg-blue-50 text-blue-700 border-blue-100">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200/50">
                                            <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">{table.itemCount} items</span>
                                            <span className="font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">₹{table.total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Right: Bill Preview & Actions */}
                    <div className="flex-1 h-full overflow-hidden flex flex-col print:block print:overflow-visible">
                      {selectedOrders ? (
                          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 h-full print:block">
                              {/* Receipt Column */}
                              <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-2xl print:shadow-none print:border-none print:rounded-none flex flex-col">
                                <div className="p-8 pb-6 text-center border-b-2 border-dashed border-gray-200 mb-6 bg-gray-50/50 print:bg-white print:p-4">
                                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-1">Hotel Delish</h2>
                                    <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Fine Dining Experience</p>
                                    <div className="flex justify-center gap-6 text-[11px] font-bold text-gray-600">
                                      <span className="py-1">{new Date(selectedOrders[0].createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="px-8 mb-8 print:px-4 flex-1 overflow-y-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-900">
                                                <th className="pb-4 text-left font-black uppercase text-[10px] tracking-widest text-gray-400">Description</th>
                                                <th className="pb-4 text-center font-black uppercase text-[10px] tracking-widest text-gray-400">Qty</th>
                                                <th className="pb-4 text-right font-black uppercase text-[10px] tracking-widest text-gray-400">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {aggregatedItems.map((item, idx) => (
                                                <tr key={idx} className="group">
                                                    <td className="py-5">
                                                      <span className="font-bold text-gray-800 block leading-tight">{item.name}</span>
                                                      <span className="text-[10px] text-gray-400 font-medium">₹{(item.price || 0).toFixed(2)} / unit</span>
                                                    </td>
                                                    <td className="py-5 text-center text-gray-600 font-bold">{item.quantity}</td>
                                                    <td className="py-5 text-right font-black text-gray-900">₹{((item.price || 0) * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="px-8 py-8 space-y-3 bg-gray-50 print:bg-white print:px-4 border-t-2 border-dashed border-gray-100 mt-auto">
                                    <div className="flex justify-between text-gray-500 font-bold text-sm">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">₹{calculatedSubtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 font-bold text-sm">
                                        <span>GST (5%)</span>
                                        <span className="text-gray-900">₹{taxAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 font-bold text-sm pb-4 border-b border-gray-200">
                                        <span>Service Charge (2%)</span>
                                        <span className="text-gray-900">₹{serviceCharge.toFixed(2)}</span>
                                    </div>
                                    {billingAppliedDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-black text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <span>DISCOUNT APPLIED</span>
                                            <span>- ₹{billingAppliedDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Payable</span>
                                        <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Print Mode payment status */}
                                    <div className="hidden print:flex justify-between items-center pt-8 mt-8 border-t border-gray-200 font-black uppercase tracking-widest text-[10px]">
                                        <span>Settlement Status</span>
                                        <span className="bg-gray-100 px-4 py-2 rounded-full">Pending Physical Receipt</span>
                                    </div>
                                </div>

                                <div className="hidden print:block text-center p-8 border-t-2 border-dashed border-gray-100">
                                    <p className="font-bold text-gray-900">Thank You for Dining!</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Please Visit Again</p>
                                </div>
                              </div>
                              
                              {/* Actions Area */}
                              <div className="flex flex-col gap-6 print:hidden">
                                {/* Discount Section */}
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                        <Percent className="w-4 h-4 text-indigo-500" /> Promotional Discount
                                    </h3>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                            <input 
                                                type="number"
                                                value={billingDiscount}
                                                onChange={(e) => setBillingDiscount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-black text-lg transition-all"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleApplyDiscount}
                                            className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                                        >
                                            APPLY
                                        </button>
                                    </div>
                                </div>

                                {/* Payment Options */}
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Payment Instrument</h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            {id: 'Cash', icon: Banknote},
                                            {id: 'UPI', icon: Smartphone},
                                            {id: 'Card', icon: CreditCard},
                                        ].map(method => (
                                            <button 
                                                key={method.id}
                                                onClick={() => setBillingPaymentMethod(method.id as any)}
                                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                                                    billingPaymentMethod === method.id 
                                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' 
                                                        : 'border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/50'
                                                }`}
                                            >
                                                <method.icon className="w-6 h-6" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">{method.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <button 
                                        onClick={handlePrint}
                                        className="w-full py-5 bg-white border-2 border-slate-200 text-slate-700 font-black rounded-[1.5rem] hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-3 shadow-sm group"
                                    >
                                        <Printer className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                        PRINT GUEST RECEIPT
                                    </button>
                                    <button 
                                        onClick={handleMarkPaid}
                                        className="w-full py-6 bg-emerald-600 text-white font-black text-xl rounded-[1.5rem] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-3 group"
                                    >
                                        <CheckCircle2 className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                        SETTLE TRANSACTION
                                    </button>
                                </div>
                              </div>
                          </div>
                      ) : (
                          <div className="flex-1 h-full flex flex-col items-center justify-center text-slate-300 print:hidden p-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                                  <Receipt className="w-12 h-12 text-slate-200" />
                              </div>
                              <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Financial Terminal Standby</h2>
                              <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest">Select an active order from the left to begin the settlement process</p>
                          </div>
                      )}
                    </div>
                </div>
            </main>
        </div>
    );
}

