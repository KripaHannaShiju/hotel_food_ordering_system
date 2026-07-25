"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UtensilsCrossed, ShoppingBag, Clock, Receipt, ChevronDown } from "lucide-react";

export default function Header({
  cartCount = 0,
  openCart,
  tableNumber,
}: {
  cartCount?: number;
  openCart?: () => void;
  tableNumber?: string;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTableSelect = (num: string) => {
    setIsDropdownOpen(false);
    router.push(`${pathname}?table=${num}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href={`/?table=${tableNumber}`} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Hotel Delish
            </span>
            <span className="hidden md:block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">
              Fine Dining Experience
            </span>
          </div>
        </Link>



        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {tableNumber && (
            <>
              <Link
                href={`/order-status?table=${tableNumber}`}
                className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/8 dark:hover:bg-primary/10 transition-all"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden md:inline text-xs">Track</span>
              </Link>
              <Link
                href={`/bill?table=${tableNumber}`}
                className="flex items-center gap-1.5 px-2.5 py-2 sm:px-3 rounded-xl text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/8 dark:hover:bg-primary/10 transition-all"
              >
                <Receipt className="w-4 h-4" />
                <span className="hidden md:inline text-xs">Bill</span>
              </Link>
            </>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">


            {openCart && (
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all group active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md animate-in zoom-in duration-200">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
