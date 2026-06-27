import React, { memo } from 'react';
import { Package, Trash2, Minus, Plus, Edit2, Tag, Percent } from 'lucide-react';
import { CartItem, Product, CompanySettings, RolePermissions } from '../../types';
import { cn } from '../../lib/utils';
import { SafeImage } from '../ui';
import { QuantityInput } from './QuantityInput';

interface CartItemRowProps {
  item: CartItem;
  idx: number;
  isSelected: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
  onRemove: (cartItemId: string) => void;
  onSetQuantity: (cartItemId: string, q: number) => void;
  onOpenProductModal: (product: Product) => void;
  onOpenDiscountModal: (cartItemId: string) => void;
  onSetPrice: (cartItemId: string, price: number) => void;
  isWholesale: boolean;
  permissions: RolePermissions;
  settings: CompanySettings;
  products: Product[];
  inputRef: React.Ref<HTMLInputElement>;
}

export const CartItemRow = memo(({
  item,
  idx,
  isSelected,
  isLast,
  onSelect,
  onRemove,
  onSetQuantity,
  onOpenProductModal,
  onOpenDiscountModal,
  onSetPrice,
  isWholesale,
  permissions,
  settings,
  products,
  inputRef
}: CartItemRowProps) => {
  const productInfo = products.find((p: Product) => p.id === item.id);
  const imageUrl = item.imageUrl || productInfo?.imageUrl;
  const unit = (item as any).unit || 'PCS';

  return (
    <div 
      key={`${item.cartItemId || item.id}-${item.quantity}`} 
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border group relative overflow-hidden",
        isLast || isSelected ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50" : "border-slate-800/40 hover:border-slate-700/60"
      )}
      onClick={() => onSelect(item.id)}
    >
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex-shrink-0 overflow-hidden border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-300">
        {imageUrl ? (
          <SafeImage 
            src={imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover" 
            fallback={<Package size={14} className="text-slate-500/20" />}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Package size={24} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h5 className="text-base font-black text-white truncate tracking-tight">{item.name}</h5>
            <p className="text-[9px] font-black font-mono text-white/30 uppercase tracking-widest mt-0.5 opacity-60">SKU: {item.sku}</p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(item.cartItemId || ''); }}
            className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900/60 rounded-2xl p-1 border border-slate-800/80 ring-1 ring-white/5" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetQuantity(item.cartItemId || '', item.quantity - 1); }}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 hover:text-white rounded-xl transition-all text-white/30"
              >
                <Minus size={16} />
              </button>
              <QuantityInput 
                item={item} 
                setQuantity={onSetQuantity} 
                ref={inputRef}
              />
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); onSetQuantity(item.cartItemId || '', item.quantity + 1); }}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-800 hover:text-white rounded-xl transition-all text-white/30"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest bg-slate-950/45 px-2 py-1 rounded-lg border border-slate-800/40">
              {unit.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {permissions.canAccessInventory && (
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const { quantity, overriddenPrice, lineDiscount, productName, cartItemId, ...product } = item as any;
                  onOpenProductModal(product as Product); 
                }}
                className="p-2 rounded-xl text-slate-600 hover:bg-amber-500/10 hover:text-amber-400 transition-all border border-transparent hover:border-amber-500/20"
                title="Modifier le produit"
              >
                <Edit2 size={16} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenDiscountModal(item.cartItemId || ''); }}
              className={cn(
                "p-2 rounded-xl transition-all border",
                item.lineDiscount ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-neon-cyan" : "text-slate-600 hover:bg-indigo-500/10 hover:text-indigo-400 border-transparent hover:border-indigo-500/20"
              )}
              title="Remise par ligne"
            >
              <Tag size={16} fill={item.lineDiscount ? "currentColor" : "none"} />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <input
                    type="number"
                    value={item.overriddenPrice !== undefined ? item.overriddenPrice : (isWholesale && item.wholesalePrice ? item.wholesalePrice : item.price)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onSetPrice(item.cartItemId || '', parseFloat(e.target.value) || 0)}
                    className={cn(
                      "w-20 p-1 text-right text-sm font-black bg-transparent border-b border-dashed outline-none transition-all",
                      item.lineDiscount ? "text-amber-400 border-amber-500/40" : "text-white border-slate-700/50 focus:border-indigo-500"
                    )}
                  />
                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", item.lineDiscount ? "text-amber-500/60" : "text-slate-500")}>{settings.currency}</span>
                </div>
                {item.lineDiscount && (
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-tighter mt-0.5">
                    -{item.lineDiscount.value}{item.lineDiscount.type === 'percentage' ? '%' : settings.currency} OFF
                  </p>
                )}
                <p className="text-[9px] font-black text-white/20 line-through opacity-40">
                  {((item.overriddenPrice || item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartItemRow.displayName = 'CartItemRow';
