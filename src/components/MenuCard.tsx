import { MenuItem } from "@/types";
import { Plus, Flame, Clock, Info } from "lucide-react";
import { forwardRef } from "react";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
}

const spiceLevelConfig: Record<string, { label: string; color: string; flames: number }> = {
  Nil:    { label: "Mild",   color: "text-emerald-500", flames: 0 },
  Mild:   { label: "Mild",   color: "text-amber-400",   flames: 1 },
  Medium: { label: "Medium", color: "text-orange-500",  flames: 2 },
  Hot:    { label: "Hot",    color: "text-rose-500",    flames: 3 },
};

const MenuCard = forwardRef<HTMLDivElement, MenuCardProps>(
  ({ item, onAdd, onViewDetail }, ref) => {
    const spice = item.spiceLevel ? spiceLevelConfig[item.spiceLevel] : null;

    return (
      <div
        ref={ref}
        className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer ${
          !item.isAvailable ? "opacity-60" : ""
        }`}
        onClick={() => item.isAvailable && onViewDetail(item)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                item.isAvailable ? "group-hover:scale-110" : "grayscale-[0.4]"
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium">No Image</span>
            </div>
          )}

          {/* Sold Out Overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                Sold Out
              </span>
            </div>
          )}

          {/* Veg / Non-Veg Badge */}
          <div className="absolute top-2.5 left-2.5">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border ${
              item.isVeg
                ? "border-emerald-200 dark:border-emerald-900"
                : "border-rose-200 dark:border-rose-900"
            } shadow-sm`}>
              <span className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                item.isVeg ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
              }`}>
                {item.isVeg ? "Veg" : "Non-Veg"}
              </span>
            </div>
          </div>

          {/* Prep Time Badge */}
          {item.prepTime && (
            <div className="absolute top-2.5 right-2.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                <Clock className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.prepTime}m</span>
              </div>
            </div>
          )}

          {/* View Detail hint on hover */}
          {item.isAvailable && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
              <span className="flex items-center gap-1.5 text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
                <Info className="w-3 h-3" /> Tap for details
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Category Pill */}
          {item.category && (
            <span className="self-start text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary mb-2">
              {item.category}
            </span>
          )}

          {/* Name */}
          <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight line-clamp-1 mb-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed flex-1">
            {item.description || "A delicious dish prepared fresh for you."}
          </p>

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Price + Spice */}
            <div>
              <p className="text-lg font-black text-primary leading-none">
                ₹{item.price.toFixed(2)}
              </p>
              {spice && spice.flames > 0 && (
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: spice.flames }).map((_, i) => (
                    <Flame key={i} className={`w-3 h-3 ${spice.color}`} />
                  ))}
                  <span className={`text-[9px] font-black uppercase ml-0.5 ${spice.color}`}>
                    {spice.label}
                  </span>
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              disabled={!item.isAvailable}
              onClick={(e) => {
                e.stopPropagation();
                if (item.isAvailable) onAdd(item);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm ${
                item.isAvailable
                  ? "bg-primary text-white hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 active:scale-95"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {item.isAvailable ? "Add" : "N/A"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MenuCard.displayName = "MenuCard";

export default MenuCard;
