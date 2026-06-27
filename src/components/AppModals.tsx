import React from 'react';
import { Printer } from 'lucide-react';
import { fr } from 'date-fns/locale';
import { formatSafe } from '../lib/utils';
import { Button, Modal } from './ui';
import { ReturnModal } from './ReturnModal';
import { EditTransactionModal } from './EditTransactionModal';
import { CategoryModal } from './CategoryModal';
import { BrandModal } from './BrandModal';
import { PriceCheckerModal } from './PriceCheckerModal';
import { POSCustomerModal } from './POSCustomerModal';
import { ProductFormModal } from './ProductFormModal';
import { AddStaffModal } from './AddStaffModal';
import { LowStockModal } from './LowStockModal';
import { ExpirationModal } from './ExpirationModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';

import { useAuthStore } from '../store/useAuthStore';
import { useCoreStore } from '../store/useCoreStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { usePeopleStore } from '../store/usePeopleStore';
import { useProductStats } from '../hooks/useAppPermissionsAndStats';

interface AppModalsProps {
  isReturnModalOpen: boolean;
  setIsReturnModalOpen: (open: boolean) => void;
  selectedTransactionForReturn: any;
  setSelectedTransactionForReturn: (t: any) => void;
  user: any;
  products: any[];
  customers: any[];
  settings: any;
  returns: any[];
  isEditTransactionModalOpen: boolean;
  setIsEditTransactionModalOpen: (open: boolean) => void;
  selectedTransactionForEdit: any;
  setSelectedTransactionForEdit: (t: any) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  editingCategory: any;
  setEditingCategory: (c: any) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  parentCategoryId: string;
  setParentCategoryId: (id: string) => void;
  categoryImageUrl: string;
  setCategoryImageUrl: (url: string) => void;
  handleSaveCategory: (e?: any) => Promise<void>;
  handleDeleteCategory: (category: any) => Promise<void>;
  categories: any[];
  isBrandModalOpen: boolean;
  setIsBrandModalOpen: (open: boolean) => void;
  editingBrand: any;
  setEditingBrand: (b: any) => void;
  newBrandName: string;
  setNewBrandName: (name: string) => void;
  newBrandLogo: string;
  setNewBrandLogo: (logo: string) => void;
  newBrandDesc: string;
  setNewBrandDesc: (desc: string) => void;
  handleSaveBrand: (e?: any) => Promise<void>;
  brands: any[];
  isPriceCheckerModalOpen: boolean;
  setIsPriceCheckerModalOpen: (open: boolean) => void;
  isPOSCustomerModalOpen: boolean;
  setIsPOSCustomerModalOpen: (open: boolean) => void;
  handlePOSCustomerCreated: (customer: any) => void;
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  editingProduct: any;
  setEditingProduct: (p: any) => void;
  setActiveTab: (tab: string) => void;
  isAddUserModalOpen: boolean;
  setIsAddUserModalOpen: (open: boolean) => void;
  handleAddStaffManual: (name: string, email: string, role: string, phone?: string, password?: string) => Promise<void>;
  viewingPurchaseVoucher: any;
  setViewingPurchaseVoucher: (p: any) => void;
  printPurchaseVoucher: (p: any, s: any) => void;
  isLowStockModalOpen: boolean;
  setIsLowStockModalOpen: (open: boolean) => void;
  lowStockProducts: any[];
  isExpirationModalOpen: boolean;
  setIsExpirationModalOpen: (open: boolean) => void;
  expiringProducts: any[];
  isStockAdjustmentModalOpen: boolean;
  setIsStockAdjustmentModalOpen: (open: boolean) => void;
}

export const AppModals: React.FC<any> = ({
  ...props
}) => {
  const user = useAuthStore(s => s.user);
  const products = useCoreStore(s => s.products);
  const settings = useCoreStore(s => s.settings);
  const categories = useCoreStore(s => s.categories);
  const brands = useCoreStore(s => s.brands);
  const returns = useTransactionStore(s => s.returns);
  const customers = usePeopleStore(s => s.customers);
  const { expiringProducts, lowStockProducts } = useProductStats();

  const p = {
    ...props,
    user, products, settings, categories, brands, returns, customers,
    expiringProducts, lowStockProducts
  };

  return (
    <>
      {p.isReturnModalOpen && (
        <ReturnModal 
          isOpen={p.isReturnModalOpen} 
          onClose={() => { p.setIsReturnModalOpen(false); p.setSelectedTransactionForReturn(null); }}
          transaction={p.selectedTransactionForReturn}
          user={p.user}
          products={p.products}
          customers={p.customers}
          settings={p.settings}
          allReturns={p.returns}
        />
      )}

      {p.isEditTransactionModalOpen && (
        <EditTransactionModal
          isOpen={p.isEditTransactionModalOpen}
          onClose={() => { p.setIsEditTransactionModalOpen(false); p.setSelectedTransactionForEdit(null); }}
          transaction={p.selectedTransactionForEdit}
          products={p.products}
          settings={p.settings}
        />
      )}

      {p.isCategoryModalOpen && (
        <CategoryModal 
          isOpen={p.isCategoryModalOpen} 
          onClose={() => {
            p.setIsCategoryModalOpen(false);
            p.setEditingCategory(null);
            p.setNewCategoryName('');
            p.setParentCategoryId('');
            p.setCategoryImageUrl('');
          }}
          onSave={p.handleSaveCategory}
          onDelete={() => {
            if (p.editingCategory) p.handleDeleteCategory(p.editingCategory);
          }}
          name={p.newCategoryName}
          setName={p.setNewCategoryName}
          parentId={p.parentCategoryId}
          setParentId={p.setParentCategoryId}
          imageUrl={p.categoryImageUrl}
          setImageUrl={p.setCategoryImageUrl}
          categories={p.categories}
          editingCategory={p.editingCategory}
        />
      )}

      {p.isBrandModalOpen && (
        <BrandModal
          isOpen={p.isBrandModalOpen}
          onClose={() => {
            p.setIsBrandModalOpen(false);
            p.setEditingBrand(null);
            p.setNewBrandName('');
            p.setNewBrandLogo('');
            p.setNewBrandDesc('');
          }}
          onSave={p.handleSaveBrand}
          name={p.newBrandName}
          setName={p.setNewBrandName}
          logo={p.newBrandLogo}
          setLogo={p.setNewBrandLogo}
          description={p.newBrandDesc}
          setDescription={p.setNewBrandDesc}
          editingBrand={p.editingBrand}
        />
      )}

      {p.isPriceCheckerModalOpen && (
        <PriceCheckerModal 
          isOpen={p.isPriceCheckerModalOpen} 
          onClose={() => p.setIsPriceCheckerModalOpen(false)} 
          products={p.products} 
          settings={p.settings}
          categories={p.categories}
          brands={p.brands}
        />
      )}

      {p.isPOSCustomerModalOpen && (
        <POSCustomerModal
          isOpen={p.isPOSCustomerModalOpen}
          onClose={() => p.setIsPOSCustomerModalOpen(false)}
          onCreated={p.handlePOSCustomerCreated}
        />
      )}
      
      {p.isProductModalOpen && (
        <ProductFormModal
          isOpen={p.isProductModalOpen}
          onClose={() => { p.setIsProductModalOpen(false); p.setEditingProduct(null); }}
          editingProduct={p.editingProduct}
          products={p.products}
          categories={p.categories}
          settings={p.settings}
          user={p.user}
          brands={p.brands}
          setActiveTab={p.setActiveTab}
        />
      )}

      {p.isAddUserModalOpen && (
        <AddStaffModal 
          isOpen={p.isAddUserModalOpen} 
          onClose={() => p.setIsAddUserModalOpen(false)} 
          onSave={p.handleAddStaffManual} 
        />
      )}

      {p.viewingPurchaseVoucher && (
        <Modal 
          isOpen={!!p.viewingPurchaseVoucher} 
          onClose={() => p.setViewingPurchaseVoucher(null)} 
          title={`Bon de Réception - ${p.viewingPurchaseVoucher.invoiceNumber || p.viewingPurchaseVoucher.id.slice(-6).toUpperCase()}`}
        >
          <div className="space-y-6 print:p-0">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fournisseur</p>
                <h4 className="text-xl font-black text-slate-900">{p.viewingPurchaseVoucher.supplierName}</h4>
                <p className="text-sm text-slate-500">{formatSafe(p.viewingPurchaseVoucher.date, "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">N° Document</p>
                <p className="text-lg font-mono font-bold text-indigo-600">{p.viewingPurchaseVoucher.invoiceNumber || 'REC-' + p.viewingPurchaseVoucher.id.slice(-6).toUpperCase()}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-[10px] font-black uppercase ${p.viewingPurchaseVoucher.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.viewingPurchaseVoucher.status === 'completed' ? 'Réceptionné' : 'En attente'}
                </span>
              </div>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase">Article</th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-center">Qté</th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">Prix HT</th>
                    <th className="p-3 text-[10px] font-black text-slate-400 uppercase text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {p.viewingPurchaseVoucher.items.map((item: any, idx: number) => (
                    <tr key={`purchase-item-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-slate-400">Réf: {item.productId ? item.productId.slice(-6).toUpperCase() : 'NO-SKU'}</p>
                      </td>
                      <td className="p-3 text-sm text-slate-600 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-sm text-slate-600 text-right">{item.costPrice.toFixed(2)} {p.settings?.currency}</td>
                      <td className="p-3 text-sm font-bold text-slate-900 text-right">{(item.quantity * item.costPrice).toFixed(2)} {p.settings?.currency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={3} className="p-4 text-right text-slate-500">Total Général</td>
                    <td className="p-4 text-right text-lg text-indigo-700 font-black">{p.viewingPurchaseVoucher.total.toFixed(2)} {p.settings?.currency}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button onClick={() => p.printPurchaseVoucher(p.viewingPurchaseVoucher, p.settings)} variant="secondary" className="flex-1 gap-2">
                <Printer size={16} /> Imprimer
              </Button>
              <Button onClick={() => p.setViewingPurchaseVoucher(null)} className="flex-1">
                Fermer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {p.isLowStockModalOpen && (
        <LowStockModal 
          isOpen={p.isLowStockModalOpen}
          onClose={() => p.setIsLowStockModalOpen(false)}
          products={p.lowStockProducts}
          settings={p.settings}
        />
      )}

      {p.isExpirationModalOpen && (
        <ExpirationModal
          isOpen={p.isExpirationModalOpen}
          onClose={() => p.setIsExpirationModalOpen(false)}
          products={p.expiringProducts}
        />
      )}

      {p.isStockAdjustmentModalOpen && (
        <StockAdjustmentModal
          isOpen={p.isStockAdjustmentModalOpen}
          onClose={() => { p.setIsStockAdjustmentModalOpen(false); p.setEditingProduct(null); }}
          product={p.editingProduct}
          user={p.user}
          settings={p.settings}
        />
      )}
    </>
  );
};
