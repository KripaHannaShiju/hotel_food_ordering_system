
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
    const [billingSelectedOrder, setBillingSelectedOrder] = useState<Order | null>(null);
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

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/billing/login");
    };

    const itemSubtotal = billingSelectedOrder?.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0) || 0;
    const calculatedSubtotal = itemSubtotal > 0 ? itemSubtotal : (billingSelectedOrder?.totalAmount || 0);

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

    const handleMarkPaid = () => {
        if (billingSelectedOrder) {
            updateStatus(billingSelectedOrder._id, 'Paid');
            setBillingSelectedOrder(null);
            toast.success("Transaction settled successfully!");
        }
    };

    const billingOrders = orders.filter((o) => ['Preparing', 'Ready', 'Delivered'].includes(o.status));
    const filteredOrders = billingOrders.filter(o => 
        o.tableNumber.toString().includes(billingSearchQuery) ||
        o._id.toLowerCase().includes(billingSearchQuery.toLowerCase())
    );

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
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-20 opacity-50">
                                    <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                                    <p className="font-bold">No active bills</p>
                                </div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div 
                                        key={order._id}
                                        onClick={() => {
                                            setBillingSelectedOrder(order);
                                            setBillingAppliedDiscount(0);
                                            setBillingDiscount('');
                                        }}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                            billingSelectedOrder?._id === order._id 
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                                                : 'border-transparent bg-slate-50 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-black text-xl text-slate-800">Table {order.tableNumber}</h3>
                                                <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">#{order._id.slice(-6)}</p>
                                            </div>
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                order.status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200/50">
                                            <span className="text-slate-500 font-bold text-xs uppercase tracking-wide">{order.items.length} items</span>
                                            <span className="font-black text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200">₹{order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    {/* Right: Bill Preview & Actions */}
                    <div className="flex-1 h-full overflow-hidden flex flex-col print:block print:overflow-visible">
                      {billingSelectedOrder ? (
                          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6 h-full print:block">
                              {/* Receipt Column */}
                              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 p-10 flex flex-col overflow-y-auto print:shadow-none print:border-none print:p-0 print:overflow-visible">
                                  <div className="text-center mb-8 pb-8 border-b-2 border-dashed border-slate-200">
                                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic">Hotel Delish</h2>
                                      <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Fine Dining Experience</p>
                                      <div className="mt-6 space-y-1 text-slate-500 text-sm font-medium">
                                          <p>45 Gourmet Avenue, Downtown</p>
                                          <p>Phone: +91 98765 12345 | Web: www.hoteldelish.com</p>
                                      </div>
                                      <div className="mt-8 inline-block px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Tax Invoice / Receipt</div>
                                  </div>

                                  {/* Order Info */}
                                  <div className="flex justify-between text-xs mb-8 bg-slate-50 rounded-[1.5rem] p-6 font-bold uppercase tracking-wider print:bg-transparent print:p-0 print:border-none border border-slate-100">
                                      <div className="space-y-2">
                                          <p className="text-slate-400">Order ID: <span className="text-slate-900 font-black ml-2 font-mono">#{billingSelectedOrder._id.slice(-12).toUpperCase()}</span></p>
                                          <p className="text-slate-400">Date: <span className="text-slate-900 font-black ml-2">{new Date(billingSelectedOrder.createdAt).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}</span></p>
                                      </div>
                                      <div className="text-right space-y-2">
                                          <p className="text-slate-400 text-sm">Table Number</p>
                                          <p className="text-slate-900 font-black text-4xl italic -mt-1">{billingSelectedOrder.tableNumber}</p>
                                      </div>
                                  </div>

                                  {/* Itemized List */}
                                  <div className="flex-1 mb-8">
                                      <table className="w-full text-base">
                                          <thead>
                                              <tr className="border-b-2 border-slate-900 text-left">
                                                  <th className="pb-4 pt-2 font-black uppercase text-[11px] tracking-widest text-slate-400">Description</th>
                                                  <th className="pb-4 pt-2 text-center font-black uppercase text-[11px] tracking-widest text-slate-400">Qty</th>
                                                  <th className="pb-4 pt-2 text-right font-black uppercase text-[11px] tracking-widest text-slate-400">Price</th>
                                                  <th className="pb-4 pt-2 text-right font-black uppercase text-[11px] tracking-widest text-slate-400">Total</th>
                                              </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 font-bold">
                                              {billingSelectedOrder.items.map((item, idx) => {
                                                  const itemPrice = item.price || 0; 
                                                  const lineTotal = itemPrice * item.quantity;
                                                  return (
                                                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                                          <td className="py-4 text-slate-800">{item.name}</td>
                                                          <td className="py-4 text-center text-slate-600">
                                                              <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs">{item.quantity}</span>
                                                          </td>
                                                          <td className="py-4 text-right text-slate-500">₹{itemPrice.toFixed(2)}</td>
                                                          <td className="py-4 text-right text-slate-900">₹{lineTotal.toFixed(2)}</td>
                                                      </tr>
                                                  );
                                              })}
                                          </tbody>
                                      </table>
                                  </div>

                                  {/* Calculations */}
                                  <div className="border-t-2 border-dashed border-slate-200 pt-8 space-y-4">
                                      <div className="flex justify-between text-slate-500 font-bold text-sm uppercase tracking-wide">
                                          <span>Subtotal</span>
                                          <span className="text-slate-900 font-black">₹{calculatedSubtotal.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-wide">
                                          <span>Tax (GST 5%)</span>
                                          <span className="text-slate-900">₹{taxAmount.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-wide">
                                          <span>Service Charge (2%)</span>
                                          <span className="text-slate-900">₹{serviceCharge.toFixed(2)}</span>
                                      </div>
                                      {billingAppliedDiscount > 0 && (
                                          <div className="flex justify-between text-emerald-600 font-black text-sm p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                              <span>DISCOUNT APPLIED</span>
                                              <span>- ₹{billingAppliedDiscount.toFixed(2)}</span>
                                          </div>
                                      )}
                                      <div className="flex justify-between items-center border-t-2 border-slate-900 pt-6 mt-4">
                                          <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Total Amount Due</span>
                                          <span className="text-4xl font-black text-indigo-600 tracking-tight">₹{finalTotal.toFixed(2)}</span>
                                      </div>
                                      
                                      {/* Print Mode payment status */}
                                      <div className="hidden print:flex justify-between items-center pt-8 mt-8 border-t border-slate-200 font-black uppercase tracking-widest text-[10px]">
                                          <span>Settlement Status</span>
                                          <span className="bg-slate-100 px-4 py-2 rounded-full">Pending Physical Receipt</span>
                                      </div>
                                  </div>
                                  
                                  <div className="mt-10 text-center text-[10px] font-black text-slate-300 border-t border-slate-100 pt-8 print:block uppercase tracking-[0.5em]">
                                      Thank you for dining with us
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

