import React, { memo } from 'react';
import { Store, Truck, ShoppingBag, X, Gift, Banknote, CreditCard, Wallet, Printer, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CompanySettings, Promotion, Voucher, Customer, CartItem } from '../../types';
import { Button } from '../ui';

interface PaymentOrderSummaryProps {
  deliveryMethod: 'in_store' | 'delivery' | 'pickup';
  setDeliveryMethod: (m: 'in_store' | 'delivery' | 'pickup') => void;
  voucherCode: string;
  setVoucherCode: (s: string) => void;
  appliedVoucher: Voucher | null;
  setAppliedVoucher: (v: Voucher | null) => void;
  applyVoucher: () => void;
  subtotal: number;
  discountAmount: number;
  pointsDiscount: number;
  voucherDiscount: number;
  total: number;
  currency: string;
  cart: CartItem[];
  selectedCustomer: Customer | null;
  handleCheckout: (method: 'cash' | 'card' | 'balance', shouldPrint?: boolean) => void;
  isProcessing: boolean;
  setIsDeliveryModalOpen: (v: boolean) => void;
  settings: CompanySettings;
}

export const PaymentOrderSummary = memo(function PaymentOrderSummary({
  deliveryMethod,
  setDeliveryMethod,
  voucherCode,
  setVoucherCode,
  appliedVoucher,
  setAppliedVoucher,
  applyVoucher,
  subtotal,
  discountAmount,
  pointsDiscount,
  voucherDiscount,
  total,
  currency,
  cart,
  selectedCustomer,
  handleCheckout,
  isProcessing,
  setIsDeliveryModalOpen,
  settings
}: PaymentOrderSummaryProps) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        {/* Delivery Methods */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Passage en caisse</h4>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'in_store', icon: Store, label: 'Magasin' },
              { id: 'delivery', icon: Truck, label: 'Livraison' },
              { id: 'pickup', icon: ShoppingBag, label: 'Retrait' }
            ].map((m) => (
              <button 
                key={m.id}
                onClick={() => setDeliveryMethod(m.id as any)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border transition-all active:scale-95",
                  deliveryMethod === m.id 
                    ? "bg-indigo-600 text-white border-indigo-400/50 shadow-neon-indigo" 
                    : "bg-slate-800/40 text-slate-500 border-slate-700/50 hover:border-slate-600 hover:text-white"
                )}
              >
                <div className={cn("p-2 rounded-xl transition-colors", deliveryMethod === m.id ? "bg-white/20" : "bg-slate-900/40")}>
                  <m.icon size={22} className={deliveryMethod === m.id ? "text-white" : "text-slate-400 group-hover:text-white"} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vouchers & Gift Cards & Promos */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text"
              placeholder="Carte cadeau / Code..."
              className="flex-1 px-4 py-3 text-[10px] bg-slate-900/60 border border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-white font-black uppercase tracking-widest placeholder:text-slate-600 shadow-inner"
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
            />
            <button 
              onClick={applyVoucher}
              className="px-6 bg-slate-800/80 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:shadow-neon-indigo transition-all border border-slate-700/50 shadow-sm"
            >
              OK
            </button>
          </div>
          {appliedVoucher && (
            <div className="flex items-center justify-between p-3 bg-amber-500/10 text-amber-400 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <span>Carte cadeau/Bon utilisé: -{appliedVoucher.value}{appliedVoucher.type === 'percent' ? '%' : ` ${currency}`}</span>
              <button onClick={() => setAppliedVoucher(null)} className="hover:text-rose-400 transition-colors"><X size={14} /></button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border-t border-slate-800/60 space-y-3 backdrop-blur-xl">
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">
            <span>Sous-total</span>
            <span>{(isNaN(subtotal) ? 0 : subtotal).toFixed(2)} {currency}</span>
          </div>
          {(discountAmount || 0) > 0 && (
            <div className="flex justify-between text-rose-400 text-[10px] font-black uppercase tracking-widest px-1">
              <span>Remises</span>
              <span>-{(isNaN(discountAmount) ? 0 : discountAmount).toFixed(2)} {currency}</span>
            </div>
          )}
          {(pointsDiscount || 0) > 0 && (
            <div className="flex justify-between text-amber-400 text-[10px] font-black uppercase tracking-widest px-1">
              <span>Points Fidélité</span>
              <span>-{(isNaN(pointsDiscount) ? 0 : pointsDiscount).toFixed(2)} {currency}</span>
            </div>
          )}
          {(voucherDiscount || 0) > 0 && (
            <div className="flex justify-between text-emerald-400 text-[10px] font-black uppercase tracking-widest px-1">
              <span>Carte Cadeau / Réduction</span>
              <span>-{(isNaN(voucherDiscount) ? 0 : voucherDiscount).toFixed(2)} {currency}</span>
            </div>
          )}
          <div className="flex justify-between text-emerald-400 font-black text-3xl pt-2 border-t border-slate-800/60 items-center tracking-tighter">
            <span className="text-sm opacity-80 text-emerald-500 uppercase tracking-wider font-extrabold flex flex-col">
              TOTAL
              <span className="text-[9px] text-emerald-600 tracking-widest font-bold mt-0.5">{totalItems} {totalItems > 1 ? 'articles' : 'article'}</span>
            </span>
            <div className="text-right">
              {(selectedCustomer && total > 0) && (
                <div className="text-[9px] font-black text-amber-500 mb-0.5 flex items-center justify-end gap-1 uppercase tracking-widest animate-pulse">
                  <Gift size={10} /> +{Math.floor(total * (settings.loyaltyPointsPerCurrencyUnit || 1))} pts
                </div>
              )}
              <span className="flex items-baseline justify-end gap-1 text-emerald-400 drop-shadow-md">
                {(isNaN(total) ? 0 : total).toFixed(2)}
                <span className="text-xs text-emerald-500 uppercase tracking-widest font-black ml-0.5">{currency}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button 
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-inner group active:scale-95" 
            onClick={() => handleCheckout('cash')}
            disabled={cart.length === 0 || isProcessing}
            title="Raccourci: F1"
          >
            <Banknote size={16} className="text-slate-400 group-hover:text-white transition-colors" />
            <span>Espèces</span>
          </button>
          <button 
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm group active:scale-95 hover:shadow-neon-indigo"
            onClick={() => handleCheckout('card')}
            disabled={cart.length === 0 || isProcessing}
          >
            <CreditCard size={16} className="text-indigo-400 group-hover:text-white transition-colors" />
            <span>Carte / Digital</span>
          </button>
        </div>
        
        {selectedCustomer && (selectedCustomer.balance || 0) >= total && total > 0 && (
          <button 
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/5 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all font-black text-[9px] uppercase tracking-widest shadow-sm group hover:shadow-neon-cyan active:scale-95"
            onClick={() => handleCheckout('balance')}
            disabled={cart.length === 0 || isProcessing}
          >
            <Wallet size={14} />
            <span>Payer avec le solde ({(selectedCustomer.balance || 0).toFixed(2)})</span>
          </button>
        )}
        
        <div className="flex flex-wrap gap-1.5 justify-center opacity-60">
          <button 
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-rose-650 border border-rose-500/20 rounded-lg hover:bg-rose-500/5 transition-colors bg-rose-500/5"
            onClick={() => setIsDeliveryModalOpen(true)}
          >
            <Truck size={10} /> Livraison
          </button>
          {[
            { key: 'F3', label: 'Search' },
            { key: 'F2', label: 'Qty' },
            { key: 'F1', label: 'Cash' },
            { key: 'F4', label: 'Print' },
            { key: 'Vider', label: 'Clear' }
          ].map(s => (
            <div key={s.key} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-800/40 border border-slate-700/55 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-tighter">
              <span className="bg-slate-900 px-1 rounded text-indigo-400 border border-indigo-400/20">{s.key}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        
        <button 
          className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.15em] hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-neon-cyan active:scale-95"
          onClick={() => handleCheckout('cash', true)}
          disabled={cart.length === 0 || isProcessing}
        >
          <Printer size={16} />
          CONFIRMER & IMPRIMER (F4)
        </button>
      </div>
    </div>
  );
});
