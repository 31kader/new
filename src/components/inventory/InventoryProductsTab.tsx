import React from 'react';
import { localDb } from '../../database';
import { toast } from 'sonner';
import { Package, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../translations';
import { useCoreStore } from '../../store/useCoreStore';

import { DuplicateSKUAlert } from './DuplicateSKUAlert';
import { InventoryActionBar } from './InventoryActionBar';
import { BarcodeScanner } from '../BarcodeScanner';
import { Modal, Button } from '../ui';
import { ProductMobileCard } from '../ProductMobileCard';
import { InventorySupplierView } from './InventorySupplierView';

import { InventoryProductRow } from './InventoryProductRow';

export function InventoryProductsTab(props: any) {
  const { t } = useTranslation();
  const isDataLoading = useCoreStore(s => s.isDataLoading);
  const storeProducts = useCoreStore(s => s.products);
  const {
    products, duplicateSKUGroups, setIsDuplicateModalOpen, handleAutoResolveAll, isAutoMerging, autoMergeProgress, setConfirmAction, setIsProcessing, search, setSearch, showFilters, setShowFilters, hasActiveFilters, isScannerOpen, setIsScannerOpen, selectedProductIds, handleBulkDelete, setIsMassDeleteConfirmOpen, setIsQuickSelectMode, isQuickSelectMode, setViewMode, viewMode, handleBarcodeScan, setIsPriceCheckerOpen, priceCheckResult, setPriceCheckResult, settings, setEditingProduct, setIsProductModalOpen, sortedProducts, isMobile, paginatedProducts, brands, categories, toggleSelectProduct, setSelectedProductForAdjustment, setIsAdjustmentModalOpen, handleDelete, setViewingHistoryProduct, setIsProductHistoryModalOpen, setHistoryTab, printQuickLabel, isDeletingId, setIsDeletingId, isMassDeleting, marginExtremes, requestSort, showMarginExtremes, setShowMarginExtremes, currentPage, setCurrentPage, totalPages, productsBySupplier
  } = props;

  // Afficher un spinner si les données chargent encore (synchronisation réseau)
  const isSyncing = isDataLoading || (storeProducts.length === 0 && sortedProducts.length === 0);

  return (
    <>
      <div className="space-y-4">
        <DuplicateSKUAlert duplicateGroupsCount={duplicateSKUGroups.length} onOpenDetails={() => setIsDuplicateModalOpen(true)} onAutoResolveAll={handleAutoResolveAll} isAutoMerging={isAutoMerging} autoMergeProgress={autoMergeProgress} />
        
        <InventoryActionBar 
          search={search} setSearch={setSearch} showFilters={showFilters} setShowFilters={setShowFilters} hasActiveFilters={hasActiveFilters} setIsScannerOpen={setIsScannerOpen} selectedProductIds={selectedProductIds} onBulkDelete={handleBulkDelete} onClearInventory={() => setIsMassDeleteConfirmOpen(true)} isQuickSelectMode={isQuickSelectMode} setIsQuickSelectMode={setIsQuickSelectMode} viewMode={viewMode} setViewMode={setViewMode}
        />
      </div>
      {isScannerOpen && ( <BarcodeScanner onScan={handleBarcodeScan} onClose={() => { setIsScannerOpen(false); setIsPriceCheckerOpen(false); }} /> )}
      {priceCheckResult && (
        <Modal 
          isOpen={!!priceCheckResult} 
          onClose={() => { setPriceCheckResult(null); setIsPriceCheckerOpen(false); }} 
          title="Vérificateur de Prix"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-900/60 rounded-[2rem] border border-slate-800/40 shadow-inner">
              <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700/50 overflow-hidden shadow-2xl">
                {priceCheckResult.imageUrl ? (
                  <img src={priceCheckResult.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Package className="text-slate-600" size={32} />
                )}
              </div>
              <div className="text-left">
                <h4 className="font-black text-white text-lg tracking-tight uppercase tracking-widest">{priceCheckResult.name}</h4>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">SKU: {priceCheckResult.sku}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-emerald-500/10 rounded-[2rem] border border-emerald-500/20 text-center">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Prix Final</p>
                <p className="text-3xl font-black text-emerald-400 tracking-tighter">{priceCheckResult.price.toFixed(2)} <span className="text-xs uppercase tracking-widest opacity-60">{settings.currency}</span></p>
              </div>
              <div className="p-6 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 text-center">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Stock Dispo</p>
                <p className="text-3xl font-black text-indigo-400 tracking-tighter">{priceCheckResult.trackStock ? priceCheckResult.stock : '∞'}</p>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <Button onClick={() => { setEditingProduct(priceCheckResult); setPriceCheckResult(null); setIsProductModalOpen(true); }} className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] bg-indigo-500 text-xs">MODIFIER</Button>
              <Button onClick={() => { setPriceCheckResult(null); setIsPriceCheckerOpen(false); }} variant="secondary" className="flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs">FERMER</Button>
            </div>
          </div>
        </Modal>
      )}
      {viewMode === 'list' ? (
        <div className="flex-1 flex flex-col min-h-0 min-w-0 animate-in fade-in duration-300">
           <div className="flex-1 min-h-[600px] h-[calc(100vh-320px)] bg-black/10 rounded-[3rem] border border-white/5 relative overflow-hidden backdrop-blur-sm group/catalog">
            {isSyncing ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 p-20 text-center">
                <Loader2 size={48} className="text-indigo-400 animate-spin" />
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-xs">Synchronisation du catalogue...</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="virtual-catalog-container flex flex-col h-full min-h-0 pt-4 pb-4">
                {isMobile ? (
                  <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar pb-24">
                    {paginatedProducts.map((product: any) => (
                      <ProductMobileCard key={product.id} product={product} settings={settings} brands={brands} categories={categories} isQuickSelectMode={isQuickSelectMode} selectedProductIds={selectedProductIds} onToggleSelect={() => toggleSelectProduct(product.id)} onEdit={() => { setEditingProduct(product); setIsProductModalOpen(true); }} onAdjust={() => { setSelectedProductForAdjustment(product); setIsAdjustmentModalOpen(true); }} onDelete={() => handleDelete(product.id)} onHistory={() => { setViewingHistoryProduct(product); setIsProductHistoryModalOpen(true); setHistoryTab('sales'); }} onPrint={() => printQuickLabel(product)} onCopy={() => { setEditingProduct({...product, id: undefined, name: product.name + " (Copie)"}); setIsProductModalOpen(true); }} isDeleting={isDeletingId === product.id} />
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex items-center gap-6 px-10 mb-4 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <div className="w-10"></div>
                      <div className="w-14">IMG</div>
                      <div className="flex-1 cursor-pointer hover:text-white transition-colors uppercase tracking-[0.2em]" onClick={() => requestSort('name')}>Nom</div>
                      <div className="w-24 flex flex-col items-end gap-1 uppercase tracking-[0.2em]">
                        <div className="cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('margin')}>PRIX / MARGE</div>
                        <button onClick={() => setShowMarginExtremes(!showMarginExtremes)} className={cn("text-[9px] px-2 py-0.5 rounded border transition-all", showMarginExtremes ? "bg-indigo-500/50 text-white border-indigo-400" : "bg-white/5 text-white/30 border-white/10")}>Extrêmes</button>
                      </div>
                      <div className="w-32 text-right cursor-pointer hover:text-white transition-colors uppercase tracking-[0.2em]" onClick={() => requestSort('stock')}>Stock</div>
                      <div className="w-48"></div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto px-10 py-1 space-y-3 custom-scrollbar">
                      {paginatedProducts.map((product: any) => (
                        <InventoryProductRow 
                          key={product.id}
                          product={product}
                          isSelected={selectedProductIds.includes(product.id)}
                          onToggleSelect={toggleSelectProduct}
                          isQuickSelectMode={isQuickSelectMode}
                          onToggleQuickSelect={async (p: any) => {
                            const updatedAt = new Date().toISOString();
                            const newVal = !p.isQuickSelect;
                            try {
                              await localDb.update(`products/${p.id}`, { isQuickSelect: newVal, updatedAt });
                              window.dispatchEvent(new CustomEvent('product-cache-update', { detail: { ...p, isQuickSelect: newVal, updatedAt } }));
                              toast.success(newVal ? "Ajouté aux favoris" : "Retiré des favoris");
                            } catch (err) {
                              console.error(err);
                              toast.error("Erreur lors de la mise à jour");
                            }
                          }}
                          onEdit={(p: any) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                          onDelete={handleDelete}
                          onPrintLabel={printQuickLabel}
                          onCopy={(p: any) => { setEditingProduct({...p, id: undefined, name: p.name + " (Copie)"}); setIsProductModalOpen(true); }}
                          onViewHistory={(p: any) => { setViewingHistoryProduct(p); setIsProductHistoryModalOpen(true); setHistoryTab('sales'); }}
                          onOpenAdjustment={(p: any) => { setSelectedProductForAdjustment(p); setIsAdjustmentModalOpen(true); }}
                          settings={settings}
                          isDeleting={isDeletingId === product.id || isMassDeleting}
                          isExtremeMargin={{ isMax: marginExtremes?.maxId === product.id && showMarginExtremes, isMin: marginExtremes?.minId === product.id && showMarginExtremes }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-center items-center gap-6 p-4 border-t border-white/5">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))} className="p-3 bg-white/5 disabled:opacity-30 text-white rounded-xl hover:bg-white/10 transition-all">
                     <ChevronLeft size={20} />
                  </button>
                  <span className="text-white/60 text-xs font-black tracking-widest uppercase">Page {currentPage} / {totalPages || 1}</span>
                  <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))} className="p-3 bg-white/5 disabled:opacity-30 text-white rounded-xl hover:bg-white/10 transition-all">
                     <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              ) : (
                <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                  <Package size={64} className="opacity-10 mb-6" />
                  <p className="text-white/30 font-black uppercase tracking-[0.2em]">{t("Aucun produit trouvé")}</p>
                </div>
              )}
           </div>
        </div>
      ) : (
        <InventorySupplierView productsBySupplier={productsBySupplier} settings={settings} isDeletingId={isDeletingId} onViewHistory={(p: any) => { setViewingHistoryProduct(p); setIsProductHistoryModalOpen(true); setHistoryTab('sales'); }} onOpenAdjustment={(p: any) => { setSelectedProductForAdjustment(p); setIsAdjustmentModalOpen(true); }} onPrintLabel={printQuickLabel} onEdit={(p: any) => { setEditingProduct(p); setIsProductModalOpen(true); }} onDelete={async (id: string) => { setIsDeletingId(id); try { await handleDelete(id); } finally { setIsDeletingId(null); } }} />
      )}
    </>
  );
}
