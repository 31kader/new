import React from 'react';
import { motion } from 'motion/react';
import { Package, History, Tag, RefreshCw, Trash2, Plus, FileSpreadsheet, Upload, ShoppingBag, FileText } from 'lucide-react';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../translations';
import { Product } from '../../types';

interface InventoryHeaderProps {
  inventoryTab: 'products' | 'history' | 'labels' | 'catalog' | 'sync' | 'losses';
  setInventoryTab: (tab: 'products' | 'history' | 'labels' | 'catalog' | 'sync' | 'losses') => void;
  productsCount: number;
  onAddProduct: () => void;
  onExportExcel: () => void;
  onCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLowStockOrder: () => void;
  isProcessing: boolean;
}

export const InventoryHeader = ({
  inventoryTab,
  setInventoryTab,
  productsCount,
  onAddProduct,
  onExportExcel,
  onCSVImport,
  onLowStockOrder,
  isProcessing
}: InventoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl space-y-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-indigo-500/10" />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-6">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Inventory<span className="text-indigo-500">.nexus</span></h3>
            <div className="text-[10px] font-black text-white/40 flex items-center gap-2 uppercase tracking-[0.2em] mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {productsCount} {t("Articles répertoriés")}
            </div>
          </div>
          <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
            {(['products', 'history', 'labels', 'catalog', 'sync', 'losses'] as const).map((tab) => (
              <button 
                key={tab}
                onClick={() => setInventoryTab(tab)}
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  inventoryTab === tab ? "bg-indigo-600 text-white shadow-neon-indigo border border-indigo-400/50" : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                {tab === 'products' ? <Package size={14} /> : tab === 'history' ? <History size={14} /> : tab === 'labels' ? <Tag size={14} /> : tab === 'catalog' ? <FileText size={14} /> : tab === 'losses' ? <Trash2 size={14} /> : <RefreshCw size={14} />}
                <span className="hidden sm:inline">
                  {tab === 'products' ? 'Produits' : tab === 'history' ? 'Historique' : tab === 'labels' ? 'Étiquettes' : tab === 'catalog' ? 'Catalogue A4' : tab === 'losses' ? 'Pertes' : 'Sync'}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onAddProduct} className="gap-2 px-4 shadow-md shadow-indigo-100">
            <Plus size={18} /> <span className="hidden sm:inline">Produit</span>
          </Button>
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <Button variant="secondary" onClick={onExportExcel} className="p-2 bg-emerald-50 text-emerald-600 border-none hover:bg-emerald-100" title="Excel">
            <FileSpreadsheet size={18} />
          </Button>
          <label className="cursor-pointer" title="Importer CSV/Excel">
            <input type="file" accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={onCSVImport} />
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
              <Upload size={18} />
            </div>
          </label>
          <Button variant="secondary" onClick={onLowStockOrder} disabled={isProcessing} className="p-2 bg-amber-50 text-amber-600 border-none" title="Commande Auto">
            <ShoppingBag size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
