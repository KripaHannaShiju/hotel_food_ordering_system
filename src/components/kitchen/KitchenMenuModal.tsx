'use client';

import { X, Camera, Utensils, IndianRupee, Clock, Tag, AlignLeft, Leaf, Sparkles, Flame, ChevronDown } from "lucide-react";

interface KitchenMenuModalProps {
    show: boolean;
    onClose: () => void;
    editingItem: any;
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImage: boolean;
    uploadProgress: number;
    imagePreview: string;
}

export default function KitchenMenuModal({
    show,
    onClose,
    editingItem,
    formData,
    setFormData,
    onSubmit,
    onImageUpload,
    uploadingImage,
    uploadProgress,
    imagePreview
}: KitchenMenuModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh] border border-slate-200 dark:border-slate-800">
                {/* Left Side: Image Upload Section */}
                <div className="w-full md:w-2/5 bg-slate-50 dark:bg-slate-800/20 p-8 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between min-h-[350px] md:min-h-0">
                    <div className="self-start mb-4">
                        <h3 className="text-lg font-bold text-foreground">Dish Image</h3>
                        <p className="text-xs text-muted-foreground font-medium">Upload a clear photo of the culinary item</p>
                    </div>
                    
                    <div className="relative group w-full aspect-square max-w-[240px] my-4">
                        <div className={`w-full h-full rounded-2xl bg-white dark:bg-slate-850 border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                            imagePreview || formData.image ? "border-primary" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"
                        }`}>
                            {imagePreview || formData.image ? (
                                <img src={imagePreview || formData.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <p className="text-xs font-semibold">Choose Image File</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={uploadingImage}
                        />
                        {uploadingImage && (
                            <div className="absolute inset-x-4 bottom-4 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden border border-border shadow-sm">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        )}
                    </div>
                    
                    <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
                         Images are automatically optimized for fast loading on the customer menu.
                    </div>
                </div>

                {/* Right Side: Configuration Form */}
                <div className="w-full md:w-3/5 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
                    <div className="p-8 pb-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{editingItem ? "Update Dish" : "Create New Dish"}</h2>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Configure asset details and production rules</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500 transition-all text-slate-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 pt-6 space-y-5 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-5">
                            {/* Dish Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Utensils className="w-3.5 h-3.5" /> Dish Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter dish title..."
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-805 transition-all outline-none font-semibold text-foreground placeholder:text-slate-400/50"
                                />
                            </div>

                            {/* Price & Prep Time Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <IndianRupee className="w-3.5 h-3.5" /> Base Price (₹)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-805 transition-all outline-none font-bold text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Lead Time (mins)
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="15"
                                        value={formData.prepTime}
                                        onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-805 transition-all outline-none font-bold text-foreground"
                                    />
                                </div>
                            </div>

                            {/* Category & Sub Category Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Catalog Category
                                    </label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all outline-none font-semibold text-foreground cursor-pointer"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Starters">Starters</option>
                                            <option value="Main Course">Main Course</option>
                                            <option value="Desserts">Desserts</option>
                                            <option value="Beverages">Beverages</option>
                                            <option value="Biryani">Biryani</option>
                                            <option value="Rice">Rice</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" /> Sub Category
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Spicy, Cold, Indian"
                                        value={formData.subCategory}
                                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all outline-none font-semibold text-foreground placeholder:text-slate-400/50"
                                    />
                                </div>
                            </div>

                            {/* Spice Level Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <Flame className="w-3.5 h-3.5" /> Spice Level
                                </label>
                                <div className="relative group">
                                    <select
                                        value={formData.spiceLevel}
                                        onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value as "Nil" | "Mild" | "Medium" | "Hot" })}
                                        className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-800 transition-all outline-none font-semibold text-foreground cursor-pointer"
                                    >
                                        <option value="Nil">🌿 Nil</option>
                                        <option value="Mild">🌶️ Mild</option>
                                        <option value="Medium">🌶️🌶️ Medium</option>
                                        <option value="Hot">🌶️🌶️🌶️ Hot</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-hover:text-primary transition-colors" />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                    <AlignLeft className="w-3.5 h-3.5" /> Description
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Brief description for customers..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/60 focus:border-primary focus:bg-white dark:focus:bg-slate-805 transition-all outline-none font-medium text-sm text-foreground resize-none"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <label className="flex items-center gap-3 cursor-pointer group flex-1">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVeg}
                                            onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                        <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Vegetarian
                                    </span>
                                </label>
                                
                                <label className="flex items-center gap-3 cursor-pointer group flex-1">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={formData.isAvailable}
                                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                                        ✓ In Stock
                                    </span>
                                </label>
                            </div>
                        </div>
                    </form>

                    {/* Submit Section */}
                    <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 flex gap-3">
                        <button
                            type="button"
                            onClick={onSubmit}
                            className="flex-1 py-4 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 cursor-pointer"
                        >
                            {editingItem ? "Save Changes" : "Create Dish Asset"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
