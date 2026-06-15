"use client";

import { useEffect, useState, Suspense, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import CartSidebar, { CartItem } from "@/components/CartSidebar";
import ItemDetailModal from "@/components/ItemDetailModal";
import MenuCardSkeleton from "@/components/MenuCardSkeleton";
import Footer from "@/components/Footer";
import OrderConfirmationModal from "@/components/OrderConfirmationModal";
import { MenuItem } from "@/types";
import GameZone from "@/components/GameZone";
import CompensationModal from "@/components/CompensationModal";
import { ShoppingBag } from "lucide-react";


function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table") || "1";

  // Core shop state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [cart, setCart] = useState<CartItem[]>([]); // Array of {menuItem, quantity}
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "non-veg">("all");
  // Search query states for real-time list and debounced grid update
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] =
    useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentCustomerName, setPaymentCustomerName] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [compensationNote, setCompensationNote] = useState("");
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Column detection for responsive trigger
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280)
        setColumns(4); // xl
      else if (window.innerWidth >= 1024)
        setColumns(3); // lg
      else if (window.innerWidth >= 640)
        setColumns(2); // sm
      else setColumns(1);
    };
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const limit = 8;
  const observer = useRef<IntersectionObserver | null>(null);

  /**
   * Infinite scroll observer logic.
   * Tracks the visibility of the 'last' element in the grid and triggers a 
   * page increment when the user reaches the bottom.
   */
  const lastMenuItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: "100px" },
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  // Generate or retrieve table session ID — isolates each new group of customers
  useEffect(() => {
    const key = `table_session_${tableNumber}`;
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = `${tableNumber}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem(key, sid);
    }
    setSessionId(sid);
  }, [tableNumber]);

  // Fetch menu when page or filters change
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          category: selectedCategory,
          veg: vegFilter,
          search: debouncedSearch,
        });

        const res = await fetch(`/api/menu/list?${queryParams}`, { signal });
        if (res.ok) {
          const data = await res.json();
          setMenuItems((prev) => {
            // If page 1, replace.
            if (page === 1) return data.items;
            // Else append unique items
            const existingIds = new Set(prev.map((i) => i._id));
            const newItems = data.items.filter(
              (i: MenuItem) => !existingIds.has(i._id as string),
            );
            return [...prev, ...newItems];
          });
          setHasMore(data.hasMore);
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch menu", error);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setInitialLoading(false);
        }
      }
    };

    fetchMenu();

    return () => {
      controller.abort();
    };
  }, [page, selectedCategory, vegFilter]);
  
  // Polling for compensations even on menu
  useEffect(() => {
    if (!sessionId) return;

    const checkCompensations = async () => {
      try {
        const params = new URLSearchParams({ tableNumber, sessionId });
        const res = await fetch(`/api/orders?${params}`);
        if (res.ok) {
           const orders = await res.json();
           const fresh = orders.find((o: any) => {
             if (!o.isDelayedCompensationApplied) return false;
             return !localStorage.getItem(`seen_comp_${o._id}`);
           });

           if (fresh) {
              setCompensationNote(fresh.compensationNote || "A special benefit has been added for you.");
              setIsCompModalOpen(true);
              localStorage.setItem(`seen_comp_${fresh._id}`, "true");
           }
        }
      } catch (err) {
        console.error("Comp polling err", err);
      }
    };

    const interval = setInterval(checkCompensations, 30000); // 30s is enough for menu
    checkCompensations(); // Initial check
    return () => clearInterval(interval);
  }, [sessionId, tableNumber]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
    // Logic note: check dependencies to ensure we don't double fetch.
    // The main fetch effect depends on [page, selectedCategory, vegFilter]
    // Changing selectedCategory/vegFilter triggers that effect.
    // Setting page to 1 triggers it AGAIN if page was not 1.
    // If page was 1, it runs once (because categories changed).
    // If page was 2, setPage(1) queues update. effect runs for category change. effect runs for page change.
    // However, react might batch these or we might get 2 requests.
    // It's acceptable for now given the complexity of perfect debouncing here.
  }, [selectedCategory, vegFilter, debouncedSearch]);

  // Real-time search result list for the "box"
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const searchItems = async () => {
        try {
          const res = await fetch(`/api/menu/list?page=1&limit=5&search=${searchQuery}`);
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.items);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Search failed", error);
        }
      };
      const timer = setTimeout(searchItems, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Debounce search input for main grid
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/menu/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const seedData = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || "Failed to seed");

      // Reset and reload
      setPage(1);
      setHasMore(true);
      const queryParams = new URLSearchParams({
        page: "1",
        limit: limit.toString(),
        category: selectedCategory,
        veg: vegFilter,
      });
      const menuRes = await fetch(`/api/menu/list?${queryParams}`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenuItems(menuData.items);
        setHasMore(menuData.hasMore);
      }
      await fetchCategories();
    } catch (error: any) {
      console.error(error);
      toast.error(`Failed to seed data: ${error.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem._id === item._id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { menuItem: item, quantity: quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((i) =>
        i.menuItem._id === itemId ? { ...i, quantity: newQuantity } : i,
      ),
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItem._id !== itemId));
  };

  const handleProceedToPayment = (customerName: string, notes: string) => {
    setPaymentCustomerName(customerName);
    setPaymentNotes(notes);
    setIsCartOpen(false);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (orderId: string) => {
    toast.success("🎉 Your order is confirmed! Sent to kitchen.");
    setCart([]);
    setIsPaymentOpen(false);
    router.push(`/order-status?table=${tableNumber}`);
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setIsPaymentOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header
        cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        tableNumber={tableNumber}
      />

      {/* Live Stock Floating Button */}
      <button
        onClick={() => setIsStockModalOpen(true)}
        className="fixed bottom-28 right-5 z-40 bg-emerald-500 text-white p-3.5 rounded-2xl shadow-2xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group border-2 border-white/30"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-emerald-500 rounded-full animate-ping" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black whitespace-nowrap text-xs uppercase tracking-widest">
          Live Stock
        </span>
      </button>

      <main className="container mx-auto px-4 py-6 sm:py-8 flex-1">

        {/* Hero Greeting */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/80 dark:to-primary/50 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Welcome to Table {tableNumber}</p>
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">What would you<br />like to eat today? 🍽️</h1>
            <p className="text-white/70 text-sm mt-2 font-medium">Browse our freshly prepared dishes below</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col gap-4 mb-8">

          {/* Top Row: Categories + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-md shadow-primary/30 scale-[1.03]"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/5 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div ref={searchRef} className="flex-1 sm:max-w-sm w-full relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all shadow-sm"
                />
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all text-xs font-bold">
                    ✕
                  </button>
                )}
              </div>

              {/* Search Results */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">Suggestions</p>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {searchResults.map((item) => (
                      <button
                        key={item._id as string}
                        onClick={() => { setSelectedItemForModal(item); setShowResults(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                          <p className="text-xs font-semibold text-primary">₹{item.price}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="p-2.5 text-center bg-slate-50 dark:bg-slate-800/50">
                    <button onClick={() => setShowResults(false)} className="text-[10px] font-black text-primary hover:underline uppercase tracking-wider">
                      Show all results →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Veg Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Filter:</span>
            {(["all", "veg", "non-veg"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setVegFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  vegFilter === filter
                    ? filter === "all"
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : filter === "veg"
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:text-slate-700"
                }`}
              >
                {filter === "all" ? "All" : filter === "veg" ? "🌿 Veg" : "🍖 Non-Veg"}
              </button>
            ))}
            {debouncedSearch && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
              >
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black">"{debouncedSearch}"</span>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Menu Grid */}
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <MenuCardSkeleton key={i} />)}
          </div>
        ) : menuItems.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-5xl">
              🍽️
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">No dishes found</h2>
              <p className="text-sm text-slate-400 mt-1">Try a different category or load sample items</p>
            </div>
            <button
              onClick={seedData}
              className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              Load Sample Menu
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {menuItems.map((item, index) => {
                const isTrigger = index === menuItems.length - 1;
                return (
                  <MenuCard
                    ref={isTrigger ? lastMenuItemRef : null}
                    key={item._id as string}
                    item={item}
                    onAdd={addToCart}
                    onViewDetail={setSelectedItemForModal}
                  />
                );
              })}
            </div>
            {loading && !initialLoading && (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onProceedToPayment={handleProceedToPayment}
        isOrdering={ordering}
      />

      <ItemDetailModal
        item={selectedItemForModal}
        isOpen={!!selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onAddToCart={addToCart}
      />

      <OrderConfirmationModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cart={cart}
        tableNumber={tableNumber}
        customerName={paymentCustomerName}
        notes={paymentNotes}
        sessionId={sessionId}
        onOrderSuccess={handlePaymentSuccess}
        onOrderFailure={handlePaymentFailure}
      />

      <GameZone />
      <CompensationModal isOpen={isCompModalOpen} onClose={() => setIsCompModalOpen(false)} note={compensationNote} />

      {/* Stock Modal */}
      {isStockModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Available Today</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Fresh from the kitchen</p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[55vh] overflow-y-auto space-y-2">
              {menuItems.filter(i => i.isAvailable).map((item) => (
                <div key={item._id as string} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 hover:border-primary/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 dark:text-white truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-primary">₹{item.price}</p>
                    <button
                      onClick={() => { addToCart(item); setIsStockModalOpen(false); }}
                      className="text-[10px] font-black uppercase text-primary hover:text-primary/70 mt-0.5 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all"
              >
                Close & Browse Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          Loading Application...
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
