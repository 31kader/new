import React from 'react';
import { InventoryHeader } from './InventoryHeader';
import { InventoryProductsTab } from './InventoryProductsTab';
import { StockHistory } from '../StockHistory';
import { LabelPrinter } from '../LabelPrinter';
import { CatalogPrinter } from '../CatalogPrinter';
import { LossReport } from '../LossReport';
import { SupplierSyncManager } from '../SupplierSyncManager';
import { InventoryModalsGroup } from './InventoryModalsGroup';
import { ConfirmAction, InventoryTab } from '../../types';

interface InventoryContentProps {
  inventoryTab: InventoryTab;
  setInventoryTab: (tab: InventoryTab) => void;
  products: any[];
  setEditingProduct: (p: any) => void;
  setIsProductModalOpen: (v: boolean) => void;
  isProcessing: boolean;
  generateLowStockOrder: () => void;
  handleCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  productTabProps: any;
  stockAdjustments: any[];
  user: any;
  settings: any;
  damagedRecords: any[];
  selectedProductIds: string[];
  supplierSyncs: any[];
  allSuppliers: any[];
  modalsProps: any;
  setConfirmAction: (action: ConfirmAction | null) => void;
}

export const InventoryContent: React.FC<InventoryContentProps> = ({
  inventoryTab,
  setInventoryTab,
  products,
  setEditingProduct,
  setIsProductModalOpen,
  isProcessing,
  generateLowStockOrder,
  handleCSVImport,
  productTabProps,
  stockAdjustments,
  user,
  settings,
  damagedRecords,
  selectedProductIds,
  supplierSyncs,
  allSuppliers,
  modalsProps,
  setConfirmAction
}) => {
  return (
    <div className="space-y-4">
      <InventoryHeader 
        inventoryTab={inventoryTab}
        setInventoryTab={setInventoryTab}
        productsCount={products.length}
        onAddProduct={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
        onExportExcel={() => {/* import from utils */}}
        onCSVImport={handleCSVImport}
        onLowStockOrder={generateLowStockOrder}
        isProcessing={isProcessing}
      />

      {inventoryTab === 'products' ? (
        <InventoryProductsTab {...productTabProps} />
      ) : inventoryTab === 'history' ? (
        <StockHistory adjustments={stockAdjustments} products={products} user={user} />
      ) : inventoryTab === 'labels' ? (
        <div className="space-y-4">
          <LabelPrinter products={products} settings={settings} initialSelectedProductIds={selectedProductIds} />
        </div>
      ) : inventoryTab === 'catalog' ? (
        <div className="space-y-4">
          <CatalogPrinter products={products} settings={settings} initialSelectedProductIds={selectedProductIds} />
        </div>
      ) : inventoryTab === 'losses' ? (
        <LossReport 
          damagedRecords={damagedRecords} 
          products={products} 
          categories={productTabProps.categories || []}
          onPrintReport={() => window.print()}
        />
      ) : (
        <div className="space-y-4">
          <SupplierSyncManager supplierSyncs={supplierSyncs} suppliers={allSuppliers} products={products} />
          
          <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-bold mb-1">Restauration Complète</h3>
              <p className="text-slate-400 text-sm">Si vous rencontrez des problèmes d'affichage ou que certains produits semblent manquer, forcez une récupération depuis le cloud.</p>
            </div>
            <button
              onClick={() => {
                setConfirmAction({
                  title: "Restauration Complète",
                  message: "Êtes-vous sûr de vouloir forcer la récupération de vos produits depuis le cloud ?",
                  onConfirm: () => {
                    localStorage.setItem('nexus_products_last_sync', '2000-01-01T00:00:00Z');
                    window.location.reload();
                  }
                });
              }}
              className="bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white px-4 py-2 rounded-xl transition-colors font-bold whitespace-nowrap"
            >
              Forcer la Synchronisation
            </button>
          </div>
        </div>
      )}
      
      <InventoryModalsGroup {...modalsProps} />
    </div>
  );
};
