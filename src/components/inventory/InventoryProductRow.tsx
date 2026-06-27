import React from 'react';
import { motion } from 'motion/react';
import { Package, Tag, Layers, RefreshCw, BarcodeIcon, Eye, Trash2, Printer, Check, Star, AlertTriangle, TrendingDown, History as HistoryIcon, Copy } from 'lucide-react';
import { Product, CompanySettings } from '../../types';
import { cn, safeDate } from '../../lib/utils';
import { SafeImage, Button } from '../ui';
import { format } from 'date-fns';

interface InventoryProductRowProps {
  product: Product;
  style?: React.CSSProperties;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isQuickSelectMode: boolean;
  onToggleQuickSelect: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string | null) => void;
  onPrintLabel: (product: Product) => void;
  onViewHistory: (product: Product) => void;
  onOpenAdjustment: (product: Product) => void;
  onCopy: (product: Product) => void;
  settings: CompanySettings;
  isDeleting: boolean;
  isExtremeMargin: { isMax: boolean; isMin: boolean };
}

export const InventoryProductRow = React.memo(({
  product,
  style,
  isSelected,
  onToggleSelect,
  isQuickSelectMode,
  onToggleQuickSelect,
  onEdit,
  onDelete,
  onPrintLabel,
  onViewHistory,
  onOpenAdjustment,
  onCopy,
  settings,
  isDeleting,
  isExtremeMargin
}: InventoryProductRowProps) => {
  const margin = product.price - (product.costPrice || 0);
  const isLowStock = product.stock <= (product.minStock || 5);

  return (
    <div style={style}>
      <motion.div 
        initial={false}
        className={cn(
          "group flex items-center gap-6 p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden mb-3 h-[88px] box-border px-10",
          isLowStock ? "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10" : "bg-white/5 border-white/10 hover:bg-white/10",
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
        onClick={() => onEdit(product)}
      >
        <div className="flex items-center gap-2 min-w-0" onClick={(e) => { e.stopPropagation(); onToggleSelect(product.id || ''); }}>
          <div className={cn(
            "w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
            isSelected 
              ? "bg-indigo-600 border-indigo-500 shadow-neon-indigo" 
              : "border-white/10 bg-black/20 hover:border-white/30"
          )}>
            {isSelected && <Check size={16} className="text-white" strokeWidth={4} />}
          </div>
        </div>

        {isQuickSelectMode && (
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleQuickSelect(product); }}
              className={cn(
                "w-10 h-10 rounded-2xl border flex items-center justify-center transition-all",
                product.isQuickSelect ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-neon-amber" : "bg-white/5 border-white/10 text-white/30"
              )}
            >
              <Star size={18} fill={product.isQuickSelect ? "currentColor" : "none"} />
            </button>
          </div>
        )}

        {/* Selection Placeholder */}
        <div className="w-10 flex-shrink-0" />

        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex-shrink-0 relative group-hover:scale-105 transition-transform duration-300 shadow-lg">
          {product.imageUrl ? (
            <SafeImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <Package size={24} />
            </div>
          )}
          {isExtremeMargin.isMax && (
             <div className="absolute top-0 right-0 p-0.5 bg-emerald-500 rounded-bl-lg shadow-lg" title="Meilleure Marge">
                <TrendingDown size={10} className="text-white rotate-180" strokeWidth={4} />
             </div>
          )}
          {isExtremeMargin.isMin && (
             <div className="absolute top-0 right-0 p-0.5 bg-rose-500 rounded-bl-lg shadow-lg" title="Marge Faible / Perte">
                <AlertTriangle size={10} className="text-white" strokeWidth={4} />
             </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-black text-white truncate tracking-tight uppercase">{product.name}</h4>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-black text-white/30 truncate flex items-center gap-1.5 uppercase tracking-widest">
              <Tag size={12} className="opacity-40" /> 
              {product.sku || 'SANS SKU'}
            </p>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <p className="text-[10px] font-black text-indigo-400/60 flex items-center gap-1.5 uppercase tracking-widest">
              <Layers size={12} className="opacity-40" />
              {product.unit || 'PCS'}
            </p>
          </div>
        </div>

        {/* Inventory Stats - Fixed Layout */}
        <div className="hidden md:flex items-center gap-6">
          <div className="w-24 text-right flex flex-col justify-center items-end px-2">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">PRIX / MARGE</p>
            <p className="text-sm font-black text-white tabular-nums tracking-tighter">{product.price.toFixed(2)}</p>
            <p className="text-[8px] text-white/40 font-black tracking-widest uppercase">{margin.toFixed(2)}</p>
          </div>
          <div className="w-32 text-right px-2">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5">STOCK</p>
            <p className={cn("text-sm font-black tabular-nums", isLowStock ? "text-rose-400" : "text-white")}>
              {product.stock} {product.unit || 'PCS'}
            </p>
          </div>
        </div>

        {/* Actions Overlay */}
        <div className="w-48 flex items-center justify-end gap-1.5 transition-all z-20" onClick={(e) => e.stopPropagation()}>
           <button 
             onClick={() => onOpenAdjustment(product)}
             className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg border border-indigo-500/20"
             title="Ajuster Stock"
           >
             <RefreshCw size={16} />
           </button>
           <button 
             onClick={() => onCopy(product)}
             className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
             title="Dupliquer"
           >
             <Copy size={16} />
           </button>
           <button 
             onClick={() => onPrintLabel(product)}
             className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
             title="Étiquette"
           >
             <Printer size={16} />
           </button>
           <button 
             onClick={() => onViewHistory(product)}
             className="p-2.5 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
             title="Historique"
           >
             <HistoryIcon size={16} />
           </button>
           <div className="w-px h-6 bg-white/10 mx-1" />
           <button 
             onClick={() => onDelete(product.id || null)}
             className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
             title="Supprimer"
           >
             <Trash2 size={16} />
           </button>
        </div>
      </motion.div>
    </div>
  );
});

InventoryProductRow.displayName = 'InventoryProductRow';
