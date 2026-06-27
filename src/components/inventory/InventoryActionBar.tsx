import React from 'react';
import { Search, Filter, Scan, Trash2, Check, Star, LayoutList, Layers } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InventoryActionBarProps {
  search: string;
  setSearch: (s: string) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  hasActiveFilters: boolean;
  setIsScannerOpen: (v: boolean) => void;
  selectedProductIds: string[];
  onBulkDelete: () => void;
  onClearInventory: () => void;
  isQuickSelectMode: boolean;
  setIsQuickSelectMode: (v: boolean) => void;
  viewMode: 'list' | 'grouped';
  setViewMode: (v: 'list' | 'grouped') => void;
}

export const InventoryActionBar = ({
  search,
  setSearch,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  setIsScannerOpen,
  selectedProductIds,
  onBulkDelete,
  onClearInventory,
  isQuickSelectMode,
  setIsQuickSelectMode,
  viewMode,
  setViewMode
}: InventoryActionBarProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <div className="flex-1 relative group w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Chercher par nom, SKU, fournisseur..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-sm font-bold text-white placeholder:text-white/20 transition-all uppercase tracking-wider"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "px-6 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all",
            showFilters ? "bg-indigo-600 text-white border-indigo-400/50 shadow-neon-indigo" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          <Filter size={18} /> Filtres
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-rose-500 rounded-full shadow-neon-cyan animate-pulse" />
          )}
        </button>
        <button 
          onClick={() => setIsScannerOpen(true)}
          className="p-3.5 bg-white/5 text-white/60 border border-white/10 rounded-2xl hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all shadow-lg"
          title="Scanner"
        >
          <Scan size={20} />
        </button>
        <button 
          onClick={selectedProductIds.length > 0 ? onBulkDelete : onClearInventory}
          className={cn(
            "p-3.5 rounded-2xl border transition-all shadow-lg",
            selectedProductIds.length > 0 
              ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-700 font-bold" 
              : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
          )}
          title={selectedProductIds.length > 0 ? "Supprimer la sélection" : "Vider tout l'inventaire"}
        >
          <Trash2 size={20} />
        </button>
        <div className="h-8 w-px bg-white/10 mx-1" />
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setIsQuickSelectMode(!isQuickSelectMode)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
              isQuickSelectMode ? "bg-amber-500 text-white shadow-neon-amber" : "text-white/20 hover:text-white/40"
            )}
            title="Mode sélection Favoris sidebar"
          >
            <Star size={14} /> <span className="hidden sm:inline">Favoris</span>
          </button>
        </div>

        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white/10 text-white shadow-inner" : "text-white/20 hover:text-white/40")}>
            <LayoutList size={20} />
          </button>
          <button onClick={() => setViewMode('grouped')} className={cn("p-2 rounded-xl transition-all", viewMode === 'grouped' ? "bg-white/10 text-white shadow-inner" : "text-white/20 hover:text-white/40")}>
            <Layers size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
