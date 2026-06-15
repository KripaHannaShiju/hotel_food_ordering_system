'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, UtensilsCrossed, ShoppingBag, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

// Modular Components
import KitchenSidebar from '@/components/kitchen/KitchenSidebar';
import KitchenStats from '@/components/kitchen/KitchenStats';
import KitchenFilters from '@/components/kitchen/KitchenFilters';
import KitchenOrderCard from '@/components/kitchen/KitchenOrderCard';
import KitchenOrderDetailModal from '@/components/kitchen/KitchenOrderDetailModal';
import KitchenMenuManagement from '@/components/kitchen/KitchenMenuManagement';
import KitchenMenuModal from '@/components/kitchen/KitchenMenuModal';
import KitchenLiveStock from '@/components/kitchen/KitchenLiveStock';

interface OrderItem {
    menuItem: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

interface Order {
    _id: string;
    tableNumber: string;
    customerName?: string;
    customerNote?: string;
    items: OrderItem[];
    totalAmount: number;
    status: string;
    createdAt: string;
    preparationStartedAt?: string;
    estimatedPrepTime: number;
}

export default function KitchenDashboard() {
    const router = useRouter();
    
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState("orders");
    const [isLoading, setIsLoading] = useState(true);
    
    // Core Data
    const [orders, setOrders] = useState<Order[]>([]);
    const [menuItems, setMenuItems] = useState<any[]>([]);
    const [kitchenNow, setKitchenNow] = useState<Date>(new Date());
    
    // Filter/Sort State
    const [kitchenFilter, setKitchenFilter] = useState("active");
    const [kitchenSort, setKitchenSort] = useState("oldest");
    const [selectedKitchenOrder, setSelectedKitchenOrder] = useState<Order | null>(null);
    const [prevOrderIds, setPrevOrderIds] = useState<string[]>([]);
    
    // Menu Management State
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [menuFormData, setMenuFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        subCategory: "",
        image: "",
        isAvailable: true,
        isVeg: true,
        spiceLevel: "Nil" as "Nil" | "Mild" | "Medium" | "Hot",
        prepTime: "15",
    });
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [uploadProgress, setUploadProgress] = useState(0);

    // Inline Editing State
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [editingPriceValue, setEditingPriceValue] = useState<string>("");
    const [editingPrepId, setEditingPrepId] = useState<string | null>(null);
    const [editingPrepValue, setEditingPrepValue] = useState("");
    const [stockSearchQuery, setStockSearchQuery] = useState("");

    const navigationItems = [
        { id: "orders", name: "Orders", icon: <LayoutDashboard className="w-5 h-5" />, badge: orders.filter(o => !["Delivered", "Cancelled"].includes(o.status)).length },
        { id: "menu", name: "Menu Management", icon: <UtensilsCrossed className="w-5 h-5" /> },
        { id: "stock", name: "Live Stock", icon: <ShoppingBag className="w-5 h-5" /> },
    ];

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?t=${Date.now()}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Orders fetch failed:", error);
        }
    };

    const fetchMenuItems = async () => {
        try {
            const res = await fetch(`/api/menu?t=${Date.now()}`, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setMenuItems(data);
            }
        } catch (error) {
            console.error("Menu fetch failed:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchMenuItems();
        const interval = setInterval(() => {
            fetchOrders();
            if (activeSection === 'menu') fetchMenuItems();
        }, 10000);
        return () => clearInterval(interval);
    }, [activeSection]);

    useEffect(() => {
        const tick = setInterval(() => setKitchenNow(new Date()), 30000);
        return () => clearInterval(tick);
    }, []);

    useEffect(() => {
        const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Handlers: Orders
    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchOrders();
                toast.success(`Order status updated to ${newStatus}`);
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const updateOrderPrepTime = async (id: string, newTime: number) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estimatedPrepTime: newTime }),
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => o._id === id ? updatedOrder : o));
                if (selectedKitchenOrder?._id === id) setSelectedKitchenOrder(updatedOrder);
                toast.success("Preparation time adjusted");
            }
        } catch (error) {
            toast.error("Cloud synchronization failed");
        }
    };

    // Handlers: Menu Management
    const resetMenuForm = () => {
        setEditingItem(null);
        setMenuFormData({
            name: "",
            description: "",
            price: "",
            category: "",
            subCategory: "",
            image: "",
            isAvailable: true,
            isVeg: true,
            spiceLevel: "Nil",
            prepTime: "15",
        });
        setImagePreview("");
        setUploadProgress(0);
    };

    const handleEditMenuItem = (item: any) => {
        setEditingItem(item);
        setMenuFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category: item.category,
            subCategory: item.subCategory || "",
            image: item.image || "",
            isAvailable: item.isAvailable,
            isVeg: item.isVeg,
            spiceLevel: item.spiceLevel || "Nil",
            prepTime: item.prepTime ? item.prepTime.toString() : "15",
        });
        setImagePreview(item.image || "");
        setShowMenuModal(true);
    };

    const handleDeleteMenuItem = async (id: string) => {
        if (!confirm("Confirm permanent deletion of this culinary asset?")) return;
        try {
            const res = await fetch("/api/menu", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (res.ok) {
                fetchMenuItems();
                toast.success("Asset Liquidated");
            }
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }

        setUploadingImage(true);
        setUploadProgress(0);

        // Show local preview immediately via FileReader
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);

        try {
            const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

            if (!API_KEY || API_KEY === "your_imgbb_api_key_here") {
                toast.error("Image API key not configured");
                setUploadingImage(false);
                return;
            }

            const formData = new FormData();
            formData.append("image", file);

            // Use XMLHttpRequest for real progress tracking
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://api.imgbb.com/1/upload?key=${API_KEY}`);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    setUploadProgress(Math.round(percentComplete));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        setMenuFormData((prev) => ({ ...prev, image: data.data.url }));
                        setImagePreview(data.data.url);
                        toast.success("Image uploaded successfully!");
                    } else {
                        toast.error("Upload failed: " + (data.error?.message || "Unknown error"));
                        setImagePreview("");
                    }
                } else {
                    toast.error("Upload failed with status " + xhr.status);
                    setImagePreview("");
                }
                setUploadingImage(false);
                setUploadProgress(0);
            };

            xhr.onerror = () => {
                toast.error("Failed to upload image. Please try again.");
                setUploadingImage(false);
                setUploadProgress(0);
                setImagePreview("");
            };

            xhr.send(formData);
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Failed to upload image. Please try again.");
            setUploadingImage(false);
            setUploadProgress(0);
        }
    };

    const handleMenuSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingItem ? "PUT" : "POST";
            const payload = editingItem ? { ...menuFormData, _id: editingItem._id } : menuFormData;
            
            const res = await fetch("/api/menu", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                fetchMenuItems();
                setShowMenuModal(false);
                resetMenuForm();
                toast.success(editingItem ? "Profile Updated" : "Asset Created");
            }
        } catch (error) {
            toast.error("Operation failed");
        }
    };

    const saveInlinePrice = async (item: any) => {
        if (editingPriceValue === "" || isNaN(parseFloat(editingPriceValue))) {
            setEditingPriceId(null);
            return;
        }
        try {
            const res = await fetch("/api/menu", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...item, price: parseFloat(editingPriceValue) }),
            });
            if (res.ok) {
                fetchMenuItems();
                toast.success("Price Adjustment Sync");
            }
        } catch (error) {
            toast.error("Price sync failed");
        } finally {
            setEditingPriceId(null);
        }
    };

    const saveInlinePrep = async (item: any) => {
        if (editingPrepValue === "" || isNaN(parseInt(editingPrepValue))) {
            setEditingPrepId(null);
            return;
        }
        try {
            const res = await fetch("/api/menu", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...item, prepTime: parseInt(editingPrepValue) }),
            });
            if (res.ok) {
                fetchMenuItems();
                toast.success("Temporal Sync");
            }
        } catch (error) {
            toast.error("Sync failed");
        } finally {
            setEditingPrepId(null);
        }
    };

    const toggleAvailability = async (item: any) => {
        try {
            const res = await fetch("/api/menu", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
            });
            if (res.ok) {
                fetchMenuItems();
                toast.success(`${item.name}: ${!item.isAvailable ? 'LIVE' : 'LOCKED'}`);
            }
        } catch (error) {
            toast.error("Inventory sync failed");
        }
    };

    const logout = async () => {
        if (!confirm("Terminate production session?")) return;
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/kitchen/login");
    };

    // Calculations
    const getWaitMinutes = (createdAt: string) =>
        Math.floor((kitchenNow.getTime() - new Date(createdAt).getTime()) / 60000);

    const getElapsedMinutes = (createdAt: string, startedAt?: string) => {
        if (!startedAt) return 0;
        return Math.floor((kitchenNow.getTime() - new Date(startedAt).getTime()) / 60000);
    };

    const getRemainingMinutes = (order: Order) => {
        const elapsed = getElapsedMinutes(order.createdAt, order.preparationStartedAt);
        const prep = order.estimatedPrepTime || 15;
        if (!order.preparationStartedAt) return prep;
        return prep - elapsed;
    };

    const getDelayLevel = (order: Order) => {
        const remaining = getRemainingMinutes(order);
        if (remaining <= -10) return "critical";
        if (remaining <= 0) return "warning";
        return "normal";
    };

    const statusConfig = {
        Pending: { bg: "bg-amber-50/40 border-amber-200/50", text: "text-amber-600", dot: "bg-amber-400", label: "⏳ Pending" },
        Confirmed: { bg: "bg-sky-50/40 border-sky-200/50", text: "text-sky-600", dot: "bg-sky-400", label: "✅ Confirmed" },
        Preparing: { bg: "bg-orange-50/40 border-orange-200/50", text: "text-orange-600", dot: "bg-orange-400", label: "🍳 Preparing" },
        Ready: { bg: "bg-emerald-50/40 border-emerald-200/50", text: "text-emerald-600", dot: "bg-emerald-400", label: "🛎️ Ready" },
    };

    const nextStatus = { Pending: "Confirmed", Confirmed: "Preparing", Preparing: "Ready", Ready: "Delivered" };
    const nextStatusLabel = { Pending: "Confirm", Confirmed: "Start Preparing", Preparing: "Mark as Ready", Ready: "Mark Delivered" };
    const nextStatusColor = { Pending: "bg-sky-500 hover:bg-sky-600", Confirmed: "bg-orange-400 hover:bg-orange-500", Preparing: "bg-emerald-500 hover:bg-emerald-600", Ready: "bg-slate-600 hover:bg-slate-700" };

    const kitchenOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));

    let filteredKitchenOrders = kitchenFilter === "active"
        ? kitchenOrders
        : kitchenOrders.filter((o) => o.status === kitchenFilter);

    filteredKitchenOrders = [...filteredKitchenOrders].sort((a, b) => {
        if (kitchenSort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (kitchenSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (kitchenSort === "table") return parseInt(a.tableNumber) - parseInt(b.tableNumber);
        return 0;
    });

    const delayedCount = kitchenOrders.filter((o) => getElapsedMinutes(o.createdAt) >= 10).length;

    return (
        <div className="flex h-screen bg-background overflow-hidden relative">
            <KitchenSidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                navigationItems={navigationItems}
                onLogout={logout}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Nav (Mobile) */}
                <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center lg:hidden sticky top-0 z-40">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-2 rounded-xl hover:bg-muted border border-border outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold text-foreground">{navigationItems.find(i => i.id === activeSection)?.name}</h1>
                    <div suppressHydrationWarning className="text-right">
                        <p className="text-sm font-semibold text-muted-foreground" suppressHydrationWarning>
                             {kitchenNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </nav>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-background relative custom-scrollbar">
                    {activeSection === "orders" && (
                        <>
                            <KitchenStats 
                                kitchenOrdersCount={kitchenOrders.length}
                                pendingCount={kitchenOrders.filter(o => o.status === "Pending").length}
                                preparingCount={kitchenOrders.filter(o => o.status === "Preparing").length}
                                readyCount={kitchenOrders.filter(o => o.status === "Ready").length}
                                delayedCount={delayedCount}
                            />

                            <KitchenFilters 
                                kitchenFilter={kitchenFilter}
                                setKitchenFilter={setKitchenFilter}
                                kitchenSort={kitchenSort}
                                setKitchenSort={setKitchenSort}
                                onRefresh={fetchOrders}
                            />

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                    <p className="text-sm font-semibold text-muted-foreground">Synchronizing live orders...</p>
                                </div>
                            ) : filteredKitchenOrders.length === 0 ? (
                                <div className="bg-card rounded-2xl border border-dashed border-border py-24 text-center opacity-60">
                                    <div className="text-6xl mb-6">📋</div>
                                    <p className="text-muted-foreground text-lg font-semibold">No active orders to display</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500 pb-10">
                                    {filteredKitchenOrders.map((order) => (
                                        <KitchenOrderCard 
                                            key={order._id}
                                            order={order}
                                            isSelected={selectedKitchenOrder?._id === order._id}
                                            onClick={() => setSelectedKitchenOrder(selectedKitchenOrder?._id === order._id ? null : order)}
                                            onUpdateStatus={updateStatus}
                                            onCancel={(id) => updateStatus(id, "Cancelled")}
                                            totalWait={getWaitMinutes(order.createdAt)}
                                            remaining={getRemainingMinutes(order)}
                                            delay={getDelayLevel(order)}
                                            progress={order.preparationStartedAt ? Math.min(100, Math.max(0, (getElapsedMinutes(order.createdAt, order.preparationStartedAt) / (order.estimatedPrepTime || 15)) * 100)) : 0}
                                            statusConfig={statusConfig}
                                            nextStatus={(nextStatus as any)[order.status]}
                                            nextStatusLabel={(nextStatusLabel as any)[order.status]}
                                            nextStatusColor={(nextStatusColor as any)[order.status]}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {activeSection === "menu" && (
                        <KitchenMenuManagement 
                            menuItems={menuItems}
                            onEdit={handleEditMenuItem}
                            onDelete={handleDeleteMenuItem}
                            onToggleAvailability={toggleAvailability}
                            onAddNew={() => {
                                resetMenuForm();
                                setShowMenuModal(true);
                            }}
                            editingPriceId={editingPriceId}
                            setEditingPriceId={setEditingPriceId}
                            editingPriceValue={editingPriceValue}
                            setEditingPriceValue={setEditingPriceValue}
                            saveInlinePrice={saveInlinePrice}
                            editingPrepId={editingPrepId}
                            setEditingPrepId={setEditingPrepId}
                            editingPrepValue={editingPrepValue}
                            setEditingPrepValue={setEditingPrepValue}
                            saveInlinePrep={saveInlinePrep}
                        />
                    )}
                    {activeSection === "stock" && (
                        <KitchenLiveStock 
                            menuItems={menuItems}
                            stockSearchQuery={stockSearchQuery}
                            setStockSearchQuery={setStockSearchQuery}
                            toggleAvailability={toggleAvailability}
                        />
                    )}
                </main>
            </div>

            <KitchenOrderDetailModal 
                order={selectedKitchenOrder}
                onClose={() => setSelectedKitchenOrder(null)}
                onUpdateStatus={updateStatus}
                onCancel={(id) => updateStatus(id, "Cancelled")}
                onUpdatePrepTime={updateOrderPrepTime}
                elapsed={selectedKitchenOrder ? getWaitMinutes(selectedKitchenOrder.createdAt) : 0}
                remaining={selectedKitchenOrder ? getRemainingMinutes(selectedKitchenOrder) : 0}
                delay={selectedKitchenOrder ? getDelayLevel(selectedKitchenOrder) : 'normal'}
                statusConfig={statusConfig}
                nextStatus={selectedKitchenOrder ? (nextStatus as any)[selectedKitchenOrder.status] : ""}
                nextStatusLabel={selectedKitchenOrder ? (nextStatusLabel as any)[selectedKitchenOrder.status] : ""}
                nextStatusColor={selectedKitchenOrder ? (nextStatusColor as any)[selectedKitchenOrder.status] : ""}
            />

            <KitchenMenuModal 
                show={showMenuModal}
                onClose={() => setShowMenuModal(false)}
                editingItem={editingItem}
                formData={menuFormData}
                setFormData={setFormData => setMenuFormData(setFormData)}
                onSubmit={handleMenuSubmit}
                onImageUpload={handleImageUpload}
                uploadingImage={uploadingImage}
                uploadProgress={uploadProgress}
                imagePreview={imagePreview}
            />
        </div>
    );
}
