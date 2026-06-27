import React, { memo } from 'react';
import { Search, X, Gift, Wallet, DollarSign, AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import { Customer, CompanySettings } from '../../types';
import { cn } from '../../lib/utils';
import { Button } from '../ui';
import { CustomerProfile } from '../CustomerProfile';

interface CustomerSelectionProps {
  selectedCustomer: Customer | null;
  setSelectedCustomer: (c: Customer | null) => void;
  customerSearch: string;
  setCustomerSearch: (s: string) => void;
  customers: Customer[];
  isWholesale: boolean;
  setIsWholesale: (v: boolean) => void;
  useLoyaltyPoints: boolean;
  setUseLoyaltyPoints: (v: boolean) => void;
  settings: CompanySettings;
  total: number;
  receivedAmount: string;
  setReceivedAmount: (s: string) => void;
  keepExcessInBalance: boolean;
  setKeepExcessInBalance: (v: boolean) => void;
  handleCheckout: (method: 'cash' | 'card' | 'balance', shouldPrint?: boolean) => void;
  addCustomerNote: (note: string) => void;
  setIsPOSCustomerModalOpen: (v: boolean) => void;
}

export const CustomerSelection = memo(function CustomerSelection({
  selectedCustomer,
  setSelectedCustomer,
  customerSearch,
  setCustomerSearch,
  customers,
  isWholesale,
  setIsWholesale,
  useLoyaltyPoints,
  setUseLoyaltyPoints,
  settings,
  total,
  receivedAmount,
  setReceivedAmount,
  keepExcessInBalance,
  setKeepExcessInBalance,
  handleCheckout,
  addCustomerNote,
  setIsPOSCustomerModalOpen
}: CustomerSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Client</h4>
        <button 
          onClick={() => setIsWholesale(!isWholesale)}
          className={cn(
            "px-3 py-1.5 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all border",
            isWholesale ? "bg-indigo-600 text-white border-indigo-400/50 shadow-neon-indigo" : "bg-slate-800/40 text-white/40 border-slate-700/50 hover:border-slate-600"
          )}
        >
          {isWholesale ? "Mode Gros" : "Standard"}
        </button>
      </div>

      {selectedCustomer ? (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800/60 rounded-[2rem] shadow-inner space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1">
               <div className="w-20 h-20 bg-indigo-500/5 rounded-full absolute -top-10 -right-10 blur-2xl" />
            </div>
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center font-black border border-indigo-500/20 shadow-neon-indigo">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate uppercase tracking-tight">{selectedCustomer.name}</p>
                <p className="text-[10px] font-black text-white/40 tracking-wider font-mono opacity-80">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => { setSelectedCustomer(null); setUseLoyaltyPoints(false); }} className="text-slate-600 hover:text-rose-400 p-2 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Fidélité</p>
                <p className="text-sm font-black text-amber-400">{selectedCustomer.loyaltyPoints} Points</p>
              </div>
              {selectedCustomer.loyaltyPoints >= 10 && (
                <button 
                  onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                    useLoyaltyPoints ? "bg-amber-500 text-white border-amber-400/50 shadow-neon-cyan" : "bg-slate-900/60 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                  )}
                >
                  <Gift size={14} />
                  {useLoyaltyPoints ? "Utilisé" : "Utiliser"}
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                  {(selectedCustomer.balance || 0) < 0 ? "Ardoise / Dette" : "Solde Prépayé"}
                </p>
                <p className={cn(
                  "text-sm font-black", 
                  (selectedCustomer.balance || 0) > 0 
                    ? "text-emerald-400" 
                    : (selectedCustomer.balance || 0) < 0 
                      ? "text-rose-400 font-bold" 
                      : "text-white/30"
                )}>
                  {(selectedCustomer.balance || 0) < 0
                    ? `Dette: ${Math.abs(selectedCustomer.balance).toFixed(2)}`
                    : (selectedCustomer.balance || 0).toFixed(2)
                  } <span className="text-[10px] font-black opacity-60 ml-0.5">{settings.currency}</span>
                </p>
              </div>
              {(selectedCustomer.balance || 0) >= total && total > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-neon-cyan">
                  <Wallet size={14} />
                  Prêt
                </div>
              )}
            </div>
          </div>

          {/* Calculateur de Règlement & Co-crédit */}
          {total > 0 && (
            <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-[2rem] space-y-4 relative overflow-hidden text-left shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-400" />
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Enregistrement Règlement</h4>
                </div>
                {receivedAmount !== '' && (
                  <button
                    onClick={() => { setReceivedAmount(''); setKeepExcessInBalance(false); }}
                    className="text-[9px] font-black text-rose-400/80 hover:text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/10"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">Montant Reçu</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCheckout('cash');
                        }
                      }}
                      placeholder={(total || 0).toFixed(2)}
                      className="w-full bg-slate-950/80 border border-slate-800 text-white text-sm font-black font-mono rounded-xl pl-3 pr-8 py-2.5 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all text-left placeholder:text-white/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-black font-mono leading-none">{settings.currency}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.15em]">Rendu / Solde</label>
                  <div className="w-full bg-slate-950/30 border border-slate-800/40 text-white rounded-xl px-3 py-2.5 font-mono flex items-center justify-between min-h-[44px]">
                    {(() => {
                      const typed = parseFloat(receivedAmount);
                      if (isNaN(typed)) return <span className="text-white/20 text-[10px] font-black uppercase tracking-wider leading-none">Automatique</span>;
                      if (typed > total) {
                        return (
                          <div className="flex flex-col text-right w-full">
                            <span className="text-emerald-400 text-xs font-black leading-none">
                              +{(typed - total).toFixed(2)} {settings.currency}
                            </span>
                            <span className="text-[7.5px] font-bold text-emerald-400/60 uppercase tracking-tighter mt-1">À RENDRE</span>
                          </div>
                        );
                      } else if (typed < total) {
                        return (
                          <div className="flex flex-col text-right w-full">
                            <span className="text-rose-400 text-xs font-black leading-none">
                              -{(total - typed).toFixed(2)} {settings.currency}
                            </span>
                            <span className="text-[7.5px] font-bold text-rose-400/60 uppercase tracking-tighter mt-1">NOUVELLE DETTE</span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex flex-col text-right w-full">
                            <span className="text-white/50 text-xs font-black leading-none">0.00 {settings.currency}</span>
                            <span className="text-[7.5px] font-bold text-white/30 uppercase tracking-tighter mt-1">COMPLET</span>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>

              {/* Raccourcis de paiement rapides */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setReceivedAmount(total.toFixed(2))}
                  className="px-2 py-1 bg-slate-800/60 hover:bg-slate-700/80 active:scale-95 text-slate-300 font-mono text-[9px] font-bold rounded-lg border border-slate-700/30 transition-all"
                >
                  Total exact
                </button>
                {[10, 20, 50, 100].map(val => {
                  const currentVal = parseFloat(receivedAmount) || 0;
                  return (
                    <button
                      key={val}
                      onClick={() => setReceivedAmount((currentVal + val).toString())}
                      className="px-2 py-1 bg-slate-800/40 hover:bg-slate-700/50 active:scale-95 text-[9px] text-slate-400 font-mono font-medium rounded-lg border border-slate-800 transition-all"
                    >
                      +{val}
                    </button>
                  );
                })}
              </div>

              {/* Explications & Options du Crédit */}
              {(() => {
                const typed = parseFloat(receivedAmount);
                if (!isNaN(typed)) {
                  if (typed < total) {
                    const diff = total - typed;
                    return (
                      <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-2.5">
                        <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[8.5px] font-black uppercase text-rose-400 tracking-wider">Achat à Crédit (Dette)</p>
                          <p className="text-[10px] text-rose-300/80 leading-normal font-medium">
                            Le montant restant de <span className="font-bold text-white">{diff.toFixed(2)} {settings.currency}</span> sera déduit du solde du client, qui passera à <span className="font-bold text-white">{((selectedCustomer.balance || 0) - diff).toFixed(2)} {settings.currency}</span>.
                          </p>
                        </div>
                      </div>
                    );
                  } else if (typed > total) {
                    const diff = typed - total;
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-2.5">
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="text-[8.5px] font-black uppercase text-emerald-400 tracking-wider">Surplus constaté</p>
                            <p className="text-[10px] text-emerald-300/80 leading-normal font-medium">
                              Le client a donné un surplus de <span className="font-bold text-white">{diff.toFixed(2)} {settings.currency}</span>.
                            </p>
                          </div>
                        </div>
                        
                        <label className="flex items-center gap-2.5 cursor-pointer p-3 bg-slate-950/60 hover:bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500/20 transition-all select-none group">
                          <input 
                            type="checkbox"
                            checked={keepExcessInBalance}
                            onChange={(e) => setKeepExcessInBalance(e.target.checked)}
                            className="accent-amber-500 rounded cursor-pointer w-3.5 h-3.5"
                          />
                          <div className="text-left">
                            <p className="text-[9px] font-black uppercase text-slate-200 tracking-wider group-hover:text-white transition-colors">Garder le surplus en crédit</p>
                            <p className="text-[8.5px] text-slate-500 font-bold leading-none mt-0.5">Le solde du client passera à {((selectedCustomer.balance || 0) + diff).toFixed(2)} {settings.currency}</p>
                          </div>
                        </label>
                      </div>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          <CustomerProfile customer={selectedCustomer} onAddNote={addCustomerNote} hideHeader />
        </div>
       ) : (
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Chercher un client..."
                className="w-full pl-10 pr-4 py-3.5 bg-slate-900/60 border border-slate-800/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-slate-600 shadow-inner"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl z-50 max-h-64 overflow-y-auto backdrop-blur-xl ring-1 ring-white/5 no-scrollbar">
                  {customers.length === 0 ? (
                    <div className="p-8 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">Aucun client en base</div>
                  ) : (
                    customers
                      .filter((c: Customer) => customerSearch ? (c.name.toLowerCase().includes(customerSearch.trim().toLowerCase()) || (c.phone || '').includes(customerSearch.trim())) : true)
                      .slice(0, customerSearch ? 50 : 5)
                      .map((c: Customer) => (
                        <button
                          key={c.id}
                          className="w-full p-5 text-left hover:bg-white/5 border-b border-white/5 flex items-center justify-between transition-colors group"
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerSearch('');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center font-black text-indigo-400 border border-indigo-500/20">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">{c.name}</p>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{c.phone || 'Pas de téléphone'}</p>
                            </div>
                          </div>
                          {(c.balance || 0) !== 0 && (
                            <span className={cn(
                              "text-[10px] font-black uppercase",
                              (c.balance || 0) > 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                              {(c.balance || 0).toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsPOSCustomerModalOpen(true)}
              className="px-4 bg-slate-900/60 border border-slate-800/50 rounded-2xl hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition-all flex items-center justify-center shadow-inner"
              title="Ajouter un client"
            >
              <UserPlus size={20} />
            </button>
          </div>
       )}
    </div>
  );
});
