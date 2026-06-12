"use client";

import { MenuItem } from "@/types";
import { useState, useEffect } from "react";
import { Plus, Minus, X } from "lucide-react";

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

export default function ItemDetailModal({
  item,
  isOpen,
  onClose,
  onAddToCart,
}: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card animate-in zoom-in-95 duration-200 sm:rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        <div className="aspect-video w-full overflow-hidden bg-muted">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Images
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-foreground">
                {item.name}
              </h2>
              <span className="text-xl font-semibold text-foreground">
                ₹{item.price.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                  item.isVeg
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }`}
              >
                {item.isVeg ? "Veg" : "Non-Veg"}
              </span>
              {item.spiceLevel && (
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    item.spiceLevel === "Mild"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : item.spiceLevel === "Medium"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {item.spiceLevel}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 rounded-full border border-input flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium text-lg tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 rounded-full border border-input flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-bold text-foreground">
                ₹{(item.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onAddToCart(item, quantity);
              onClose();
            }}
            className="w-full bg-primary text-primary-foreground h-11 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
