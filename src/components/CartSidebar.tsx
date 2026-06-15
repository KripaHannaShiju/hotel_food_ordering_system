'use client';
import { MenuItem } from "@/types";
import { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ChevronRight, UtensilsCrossed, Receipt } from "lucide-react";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onProceedToPayment: (customerName: string, notes: string) => void;
  isOrdering: boolean;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemove,
  onProceedToPayment,
  isOrdering,
}: CartSidebarProps) {
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const total = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onRemove(id);
      setRemovingId(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative flex h-full w-full max-w-[420px] flex-col bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Your Order</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount > 1 ? "s" : ""} selected`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-5">
              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-800 dark:text-white">Your plate is empty</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 font-medium">Add delicious items from the menu</p>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all active:scale-95"
              >
                Browse Menu <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item, idx) => (
                <div
                  key={item.menuItem._id as string}
                  className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 transition-all duration-300 ${
                    removingId === item.menuItem._id ? "opacity-0 scale-95 -translate-x-4" : "opacity-100"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-600">
                    {item.menuItem.image ? (
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate pr-1">
                        {item.menuItem.name}
                      </p>
                      <button
                        onClick={() => handleRemove(item.menuItem._id as string)}
                        className="flex-shrink-0 w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.menuItem.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                        {item.menuItem.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.menuItem._id as string, Math.max(1, item.quantity - 1))}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-600 hover:bg-primary hover:text-white flex items-center justify-center transition-all active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-black text-slate-800 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.menuItem._id as string, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-600 hover:bg-primary hover:text-white flex items-center justify-center transition-all active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      {/* Item Total */}
                      <p className="text-sm font-black text-primary">
                        ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (only when cart has items) */}
        {cart.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">

            {/* Order Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 space-y-2.5 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Summary</span>
              </div>
              {cart.map((item) => (
                <div key={item.menuItem._id as string} className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[55%]">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center">
                <span className="text-sm font-black text-slate-800 dark:text-white">Total</span>
                <span className="text-lg font-black text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Special Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Allergies, extra spicy, no onion..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Order Now Button */}
            <button
              id="btn-order-now"
              onClick={() => onProceedToPayment(customerName, notes)}
              disabled={isOrdering}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {isOrdering ? "Placing Order..." : `Place Order · ₹${total.toFixed(2)}`}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-xs font-bold text-slate-400 hover:text-primary transition-colors py-1"
            >
              ← Continue Browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
