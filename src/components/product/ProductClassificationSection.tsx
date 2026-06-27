import React from 'react';
import { cn } from '../../lib/utils';
import { Brand, Category } from '../../types';
import { SearchableBrandSelect } from './SearchableBrandSelect';

interface ProductClassificationSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  brands: Brand[];
  categories: Category[];
  parentCatId: string;
  setParentCatId: (v: string) => void;
  subCatId: string;
  setSubCatId: (v: string) => void;
  setActiveTab?: (tab: string) => void;
  onClose: () => void;
}

export function ProductClassificationSection({
  formData,
  setFormData,
  brands,
  categories,
  parentCatId,
  setParentCatId,
  subCatId,
  setSubCatId,
  setActiveTab,
  onClose
}: ProductClassificationSectionProps) {
  return (
    <>
      {/* Section: Classification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex justify-between items-center group">
            Marque
            {setActiveTab && (
              <button 
                type="button" 
                onClick={() => { onClose(); setActiveTab('inventory_settings'); }} 
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-black"
              >
                + Gérer
              </button>
            )}
          </label>
          <SearchableBrandSelect 
            value={formData.brandId} 
            onChange={(val) => setFormData({...formData, brandId: val})} 
            brands={brands}
            onManage={setActiveTab ? () => { onClose(); setActiveTab('inventory_settings'); } : undefined}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex justify-between items-center">
            Catégorie (Principale)
            {setActiveTab && (
              <button 
                type="button" 
                onClick={() => { onClose(); setActiveTab('inventory_settings'); }} 
                className="text-indigo-400 hover:text-indigo-300 transition-colors font-black"
              >
                + Gérer
              </button>
            )}
          </label>
          <select 
            className="industrial-input w-full cursor-pointer" 
            value={parentCatId} 
            onChange={e => { setParentCatId(e.target.value); setSubCatId(''); }}
          >
            <option value="" className="bg-industrial-900 text-white/30">Sélectionner une catégorie</option>
            {categories.filter(c => !c.parentId).map((c: any) => (
              <option key={c.id} value={c.id} className="bg-industrial-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white bg-indigo-600/20 px-2 py-0.5 rounded-md inline-block uppercase tracking-[0.2em]">SOUS-CATÉGORIE *</label>
          <select 
            className={cn(
              "industrial-input w-full cursor-pointer disabled:opacity-30 border-2",
              parentCatId ? "border-indigo-500/50" : "border-white/5"
            )}
            value={subCatId} 
            disabled={!parentCatId}
            onChange={e => setSubCatId(e.target.value)}
          >
            <option value="" className="bg-industrial-900 text-white/30">Sélectionner une sous-catégorie</option>
            {categories.filter(c => c.parentId === parentCatId).map((c: any) => (
              <option key={c.id} value={c.id} className="bg-industrial-900 text-white">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Statut</label>
          <select 
            className="industrial-input w-full cursor-pointer" 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value as any})}
          >
            <option value="active" className="bg-industrial-900 text-white">Actif</option>
            <option value="inactive" className="bg-industrial-900 text-white">Inactif</option>
            <option value="discontinued" className="bg-industrial-900 text-white">Arrêté</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Emplacement (Rayon/Étagère)</label>
          <input 
            className="industrial-input w-full" 
            placeholder="Ex: A-12, B-05..." 
            value={formData.location} 
            onChange={e => setFormData({...formData, location: e.target.value.toUpperCase()})} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Référence (Modèle / Code Interne)</label>
          <input 
            className="industrial-input w-full" 
            placeholder="Ex: REF-2024-X1" 
            value={formData.reference} 
            onChange={e => setFormData({...formData, reference: e.target.value})} 
          />
        </div>
      </div>
    </>
  );
}
