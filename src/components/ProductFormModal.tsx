import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Product, Category, CompanySettings, Brand } from '../types';
import { Modal, Button } from './ui';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductMultiExpirySection } from './product/ProductMultiExpirySection';
import { ProductAdvancedOptions } from './product/ProductAdvancedOptions';
import { ProductClassificationSection } from './product/ProductClassificationSection';
import { ProductBasicInfoSection } from './product/ProductBasicInfoSection';
import { ProductPricingSection } from './product/ProductPricingSection';
import { ProductStockSection } from './product/ProductStockSection';
import { ProductMediaSection } from './product/ProductMediaSection';
import { useProductFormLogic } from './useProductFormLogic';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  products: Product[];
  categories: Category[];
  settings: CompanySettings;
  user: any;
  brands: Brand[];
  setIsPurchaseHistoryModalOpen?: (v: boolean) => void;
  setIsSalesHistoryModalOpen?: (v: boolean) => void;
  setActiveTab?: (tab: string) => void;
}

export function ProductFormModal(props: ProductFormModalProps) {
  const {
    isOpen, onClose, editingProduct, products, categories, settings, brands,
    setIsPurchaseHistoryModalOpen, setIsSalesHistoryModalOpen, setActiveTab
  } = props;

  const {
    isScannerOpen,
    setIsScannerOpen,
    isGeneratingDescription,
    isVoiceScanning,
    isGlobalLoading,
    isUploadingImage,
    parentCatId,
    setParentCatId,
    subCatId,
    setSubCatId,
    displayExpDate,
    newBatchNumber,
    setNewBatchNumber,
    newBatchExpiry,
    setNewBatchExpiry,
    newBatchStock,
    setNewBatchStock,
    formData,
    setFormData,
    skuError,
    handleDisplayDateChange,
    generateAiDescription,
    handleImageUpload,
    removeImage,
    handleSubmit,
    startVoiceEntry,
    handleKeyDown
  } = useProductFormLogic(props);

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={editingProduct ? "Modifier l'article" : "Nouvel article"}
        maxWidth="max-w-[95vw] lg:max-w-[1200px]"
        maxHeight="max-h-[90vh]"
      >
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-8 max-h-[82vh] overflow-y-auto pr-2 custom-scrollbar bg-industrial-950 p-6 rounded-[2.5rem]">
          {/* Section: Informations de base */}
          <ProductBasicInfoSection
            formData={formData}
            setFormData={setFormData}
            startVoiceEntry={startVoiceEntry}
            isVoiceScanning={isVoiceScanning}
            skuError={skuError}
            isGlobalLoading={isGlobalLoading}
            setIsScannerOpen={setIsScannerOpen}
          />

          {/* Section: Prix et Taxes */}
          <ProductPricingSection
            formData={formData}
            setFormData={setFormData}
            settings={settings}
          />

          {/* Section: Stock */}
          <ProductStockSection
            formData={formData}
            setFormData={setFormData}
            displayExpDate={displayExpDate}
            handleDisplayDateChange={handleDisplayDateChange}
          />

          {/* Section: Multi-lots / Multi-péremptions */}
          <ProductMultiExpirySection
            formData={formData}
            setFormData={setFormData}
            newBatchNumber={newBatchNumber}
            setNewBatchNumber={setNewBatchNumber}
            newBatchExpiry={newBatchExpiry}
            setNewBatchExpiry={setNewBatchExpiry}
            newBatchStock={newBatchStock}
            setNewBatchStock={setNewBatchStock}
          />

          {/* Section: Classification */}
          <ProductClassificationSection
            formData={formData}
            setFormData={setFormData}
            brands={brands}
            categories={categories}
            parentCatId={parentCatId}
            setParentCatId={setParentCatId}
            subCatId={subCatId}
            setSubCatId={setSubCatId}
            setActiveTab={setActiveTab}
            onClose={onClose}
          />

          {(setIsPurchaseHistoryModalOpen || setIsSalesHistoryModalOpen) && (
          <div className="flex gap-4 p-2">
            {setIsPurchaseHistoryModalOpen && <Button type="button" variant="secondary" className="flex-1 py-4 uppercase tracking-[0.2em] text-[10px]" onClick={() => setIsPurchaseHistoryModalOpen(true)}>Historique Achats</Button>}
            {setIsSalesHistoryModalOpen && <Button type="button" variant="secondary" className="flex-1 py-4 uppercase tracking-[0.2em] text-[10px]" onClick={() => setIsSalesHistoryModalOpen(true)}>Historique Ventes</Button>}
          </div>
          )}

          {/* Section: Media (Images) */}
          <ProductMediaSection
            formData={formData}
            setFormData={setFormData}
            removeImage={removeImage}
            isUploadingImage={isUploadingImage}
            handleImageUpload={handleImageUpload}
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-between">
              Description détaillée
              <button 
                type="button"
                onClick={generateAiDescription}
                disabled={isGeneratingDescription}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all uppercase tracking-[0.1em] disabled:opacity-50 group"
              >
                {isGeneratingDescription ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} className="group-hover:scale-110 transition-transform" />}
                Générer par IA
              </button>
            </label>
            <textarea rows={4} className="industrial-input w-full rounded-3xl" placeholder="Décrivez votre produit ici..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Tags / Mots-clés (séparés par des virgules)</label>
            <input className="industrial-input w-full" placeholder="Ex: bio, promotion, été..." value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
          </div>

          {/* Advanced Options */}
          <ProductAdvancedOptions
            formData={formData}
            setFormData={setFormData}
            products={products}
            settings={settings}
            editingProduct={editingProduct}
          />

          <div className="pt-10 sticky bottom-[-1px] bg-workspace/80 backdrop-blur-md pb-4 border-t border-white/5">
            <Button type="submit" disabled={!!skuError} className="w-full py-6 text-sm font-black uppercase tracking-[0.3em] industrial-button-primary rounded-3xl shadow-2xl shadow-indigo-500/20">
              {editingProduct ? "Enregistrer les modifications" : "Ajouter à l'inventaire"}
            </Button>
          </div>
        </form>
      </Modal>
      
      {isScannerOpen && (
        <BarcodeScanner 
          onScan={(code) => {
            setFormData(prev => ({ ...prev, sku: code }));
            setIsScannerOpen(false);
          }}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </>
  );
}
