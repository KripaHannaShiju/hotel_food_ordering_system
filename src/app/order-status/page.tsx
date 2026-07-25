"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTimer from "@/components/OrderTimer";
import {
  ShoppingBag,
  ChevronLeft,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import GameZone from "@/components/GameZone";
import CompensationModal from "@/components/CompensationModal";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  _id: string;
  tableNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | "Pending"
    | "Confirmed"
    | "Preparing"
    | "Ready"
    | "Delivered"
    | "Cancelled";
  paymentStatus: string;
  createdAt: string;
  estimatedPrepTime: number;
  isDelayedCompensationApplied?: boolean;
  compensationNote?: string;
}

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table") || "1";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [compensationNote, setCompensationNote] = useState("");
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);

  const [hasCompletedSession, setHasCompletedSession] = useState(false);

  const fetchOrders = async (sid: string) => {
    if (!sid) {
      setLoading(false);
      return;
    }
    try {
      const params = new URLSearchParams({ tableNumber, sessionId: sid });
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        const sessionOrders = data.filter(
          (o: Order) => !["Cancelled"].includes(o.status),
        );
        
        const allPaid = sessionOrders.length > 0 && sessionOrders.every((o: Order) => o.paymentStatus === "Paid");
        
        if (allPaid) {
          setHasCompletedSession(true);
          sessionStorage.removeItem(`table_session_${tableNumber}`);
          setOrders([]);
        } else {
          setOrders(sessionOrders);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const key = `table_session_${tableNumber}`;
    const sid = sessionStorage.getItem(key) || "";
    setSessionId(sid);
    if (!sid) {
      setLoading(false);
    }
  }, [tableNumber]);

  useEffect(() => {
    if (!sessionId) return;
    fetchOrders(sessionId);
    const interval = setInterval(() => fetchOrders(sessionId), 10000);
    return () => clearInterval(interval);
  }, [tableNumber, sessionId]);

  // Handle compensation detection
  useEffect(() => {
    const freshCompensation = orders.find((o) => {
      if (!o.isDelayedCompensationApplied) return false;
      const seenKey = `seen_comp_${o._id}`;
      return !localStorage.getItem(seenKey);
    });

    if (freshCompensation) {
      setCompensationNote(freshCompensation.compensationNote || "We have added a special benefit for you.");
      setIsCompModalOpen(true);
      localStorage.setItem(`seen_comp_${freshCompensation._id}`, "true");
    }
  }, [orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "Confirmed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "Preparing":
        return <Clock className="w-5 h-5 text-orange-500 animate-spin-slow" />;
      case "Ready":
        return <ShoppingBag className="w-5 h-5 text-green-500" />;
      case "Delivered":
        return <Truck className="w-5 h-5 text-gray-500" />;
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
    Preparing: "bg-orange-50 text-orange-700 border-orange-200",
    Ready: "bg-green-50 text-green-700 border-green-200",
    Delivered: "bg-gray-50 text-gray-700 border-gray-200",
  };

  // Aggregate items and status
  const allItems: (OrderItem & { orderId: string; status: string })[] = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      allItems.push({ ...item, orderId: order._id, status: order.status });
    });
  });

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header tableNumber={tableNumber} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={`/?table=${tableNumber}`}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-white border border-gray-200 rounded-full px-4 py-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Menu</span>
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Current Orders
            </h1>
            <Link
              href={`/bill?table=${tableNumber}`}
              className="flex items-center gap-2 text-sm font-black text-white hover:bg-indigo-700 transition-all bg-indigo-600 rounded-full px-5 py-2.5 shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>View Bill</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-bold tracking-tight">
                Fetching your orders...
              </p>
            </div>
          ) : hasCompletedSession ? (
            <div className="flex flex-col gap-12">
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 px-6 shadow-sm">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
                  Payment Complete
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                  Thank you for dining with us! Your session is complete.
                </p>
                <Link
                  href={`/?table=${tableNumber}`}
                  className="inline-flex items-center gap-2 bg-slate-900 text-white font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all active:scale-95 text-lg shadow-xl shadow-slate-200"
                >
                  <span>Grab your Menu</span>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Link>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col gap-12">
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 px-6 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                  No active orders
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                  You don't have any current orders.
                </p>
                <Link
                  href={`/?table=${tableNumber}`}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-black px-8 py-4 rounded-2xl hover:scale-105 transition-all active:scale-95 text-lg shadow-xl shadow-primary/20"
                >
                  <span>Grab your Menu</span>
                  <ChevronLeft className="w-5 h-5 rotate-180" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-12 mb-12">
              <div className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden shadow-xl">
                {/* Header with Table info */}
                <div className="p-8 pb-4 bg-gray-50 border-b border-gray-100">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">
                      Total Amount
                    </span>
                    <p className="text-2xl font-black text-primary">₹{totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <div className="space-y-4">
                    {allItems.map((item, i) => (
                      <div
                        key={`${item.orderId}-${i}`}
                        className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 text-white text-xs font-black shrink-0">
                              {item.quantity}×
                            </span>
                            <div>
                              <span className="font-bold text-gray-800 block leading-tight">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                REF: #{item.orderId.slice(-6).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${statusColors[item.status] || "bg-gray-50"} text-[10px]`}>
                            {getStatusIcon(item.status)}
                            <span className="font-bold uppercase tracking-tight">
                              {item.status}
                            </span>
                          </div>
                          
                          {item.status !== "Delivered" && (
                            <div className="flex-1 ml-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full bg-primary transition-all duration-1000 ${
                                  item.status === "Pending" ? "w-1/4" :
                                  item.status === "Confirmed" ? "w-2/4" :
                                  item.status === "Preparing" ? "w-3/4" :
                                  item.status === "Ready" ? "w-full" : "w-0"
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex flex-col gap-4">
                    <Link 
                      href={`/bill?table=${tableNumber}`}
                      className="w-full bg-primary text-primary-foreground font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 text-lg"
                    >
                      <Receipt className="w-6 h-6" />
                      <span>View Bill & Pay</span>
                    </Link>
                    <Link 
                      href={`/?table=${tableNumber}`}
                      className="w-full bg-white border-2 border-gray-100 text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                    >
                      <span>Add More Items</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
      <GameZone />
      <CompensationModal 
        isOpen={isCompModalOpen} 
        onClose={() => setIsCompModalOpen(false)} 
        note={compensationNote} 
      />
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-black text-gray-900">
              Loading Order Status...
            </p>
          </div>
        </div>
      }
    >
      <OrderStatusContent />
    </Suspense>
  );
}
