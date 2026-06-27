import React from 'react';
import { supabase } from '../supabase';
import { cn } from '../lib/utils';
import { SafeImage } from './ui';
import { Product, Brand, Category, CompanySettings } from '../types';
import { Check, Package, RefreshCw, History, Printer, Copy, Trash2 } from 'lucide-react';

interface ProductMobileCardProps {
  product: Product;
  settings: CompanySettings;
  brands?: Brand[];
  categories?: Category[];
  onEdit: () => void;
  onAdjust: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onHistory: (e: React.MouseEvent) => void;
  onPrint: (e: React.MouseEvent) => void;
  isQuickSelectMode?: boolean;
  isDeleting?: boolean;
  selectedProductIds?: string[];
  onToggleSelect?: () => void;
  onCopy: (e: React.MouseEvent) => void;
}

export function ProductMobileCard({
  product,
  settings,
  brands,
  categories,
  onEdit,
  onAdjust,
  onDelete,
  onHistory,
  onPrint,
  isDeleting,
  selectedProductIds,
  onToggleSelect,
  onCopy
}: ProductMobileCardProps) {
  const margin = product.price - (product.costPrice || 0);
  const isLowStock = product.stock <= (product.minStock || 5);
  const isSelected = selectedProductIds && selectedProductIds.includes(product.id || '');

  return (
    <div 
      onClick={onEdit}
      className={cn(
        "bg-white/5 backdrop-blur-md p-5 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-5 active:scale-[0.98] transition-all relative overflow-hidden group",
        isLowStock && "border-rose-500/30 bg-rose-500/5 shadow-neon-cyan/20"
      )}
    >
      <div className="flex items-start gap-4">
        {selectedProductIds && onToggleSelect && (
          <div className="flex items-center self-center mr-1" onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}>
            <div className={cn(
              "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer",
              isSelected 
                ? "bg-indigo-600 border-indigo-500 shadow-neon-indigo" 
                : "border-white/10 bg-black/20 hover:border-white/30"
            )}>
              {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
            </div>
          </div>
        )}
        <div className="w-20 h-20 rounded-[1.5rem] bg-black/60 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0 shadow-2xl group-hover:border-indigo-500 transition-all duration-500">
          <SafeImage 
            src={product.imageUrl} 
            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" 
            containerClassName="w-full h-full"
            fallback={<Package size={28} className="text-white/10" />}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <h5 className="font-black text-white truncate uppercase text-sm tracking-widest">{product.name}</h5>
          </div>
          <p className="text-[10px] font-black font-mono text-white/30 mt-2 uppercase tracking-[0.2em]">{product.sku || '-'}</p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
             <span className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border",
                isLowStock ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
             )}>
                STOCK: {product.stock} {product.unit || ''}
             </span>
             {product.brandId && brands && (
                <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">
                  {brands.find((b) => b.id === product.brandId)?.name || 'Inconnu'}
                </span>
             )}
             {product.categoryId && categories && (
                <span className="bg-white/5 text-white/60 border border-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em]">
                  {(() => {
                    const cat = categories.find(c => c.id === product.categoryId);
                    if (!cat) return '-';
                    const parent = cat.parentId ? categories.find(p => p.id === cat.parentId) : null;
                    return parent ? `${parent.name} > ${cat.name}` : cat.name;
                  })()}
                </span>
             )}
             {product.location && (
                <span className="bg-amber-500/10 text-white border border-amber-500/50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-neon-amber/20">
                  LOC: {product.location}
                </span>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 bg-black/40 rounded-[1.5rem] border border-white/5">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 leading-none">PRIX UNITAIRE</span>
          <div className="flex items-baseline gap-1.5">
             <span className="text-2xl font-black text-white tracking-tighter">{product.price.toFixed(2)}</span>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{settings.currency}</span>
          </div>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 leading-none">MARGE NETTE</span>
          <span className={cn("text-lg font-black tracking-tighter", margin > 0 ? "text-emerald-400" : "text-rose-400")}>
            {margin > 0 ? '+' : ''}{margin.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onAdjust}
          className="flex-1 flex items-center justify-center gap-3 py-4 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-neon-indigo transition-all border border-indigo-400/20 active:scale-95"
        >
          <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Stock
        </button>
        <div className="flex gap-2">
           {[
             { icon: History, onClick: onHistory },
             { icon: Printer, onClick: onPrint },
             { icon: Copy, onClick: onCopy },
             { icon: Trash2, onClick: onDelete, danger: true, loading: isDeleting }
           ].map((btn, i) => (
             <button 
                key={i}
                onClick={btn.onClick}
                disabled={btn.loading}
                className={cn(
                  "h-12 w-12 flex items-center justify-center rounded-[1.25rem] border transition-all active:scale-90",
                  btn.danger 
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white" 
                    : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                )}
             >
                {btn.loading ? <RefreshCw size={18} className="animate-spin" /> : <btn.icon size={18} />}
              </button>
           ))}
        </div>
      </div>
    </div>
  );
}
