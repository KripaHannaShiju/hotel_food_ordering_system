import { MenuItem } from "@/types";
import { Plus } from "lucide-react";
import { forwardRef } from "react";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  onViewDetail: (item: MenuItem) => void;
}

const MenuCard = forwardRef<HTMLDivElement, MenuCardProps>(
  ({ item, onAdd, onViewDetail }, ref) => {
    return (
      <div
        ref={ref}
        className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all hover:border-foreground/20 cursor-pointer ${
          !item.isAvailable ? "opacity-60 grayscale-[0.5]" : ""
        }`}
        onClick={() => item.isAvailable && onViewDetail(item)}
      >
        <div className="aspect-[16/10] relative w-full overflow-hidden bg-muted">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`object-cover w-full h-full transition-transform duration-500 ${item.isAvailable ? "group-hover:scale-105" : ""}`}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-secondary/50 text-muted-foreground text-sm font-medium">
              No Images
            </div>
          )}
          
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-white/90 text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                Sold Out
              </span>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-medium rounded-full border bg-background/90 backdrop-blur-sm ${
                item.isVeg
                  ? "border-green-200 text-green-700"
                  : "border-red-200 text-red-700"
              }`}
            >
              {item.isVeg ? "Veg" : "Non-Veg"}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-medium text-base text-foreground line-clamp-1 text-inherit">
              {item.name}
            </h3>
            <span className="font-semibold text-sm text-foreground">
              ₹{item.price.toFixed(2)}
            </span>
          </div>

          <p className="text-[13px] text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex gap-1">
              {item.spiceLevel && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                  {item.spiceLevel}
                </span>
              )}
            </div>
            <button
              disabled={!item.isAvailable}
              onClick={(e) => {
                e.stopPropagation();
                if (item.isAvailable) onAdd(item);
              }}
              className={`h-8 px-3 flex items-center gap-1.5 rounded-full transition-all text-xs font-semibold ${
                item.isAvailable 
                ? "bg-foreground text-background hover:opacity-90" 
                : "bg-muted text-muted-foreground cursor-not-allowed border border-border"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              {item.isAvailable ? "Add to cart" : "Unavailable"}
            </button>
          </div>
        </div>
      </div>
    );
  },
);

MenuCard.displayName = "MenuCard";

export default MenuCard;
