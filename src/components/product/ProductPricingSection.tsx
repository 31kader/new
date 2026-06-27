import React from 'react';
import { CompanySettings } from '../../types';

interface ProductPricingSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  settings: CompanySettings;
}

export function ProductPricingSection({
  formData,
  setFormData,
  settings
}: ProductPricingSectionProps) {
  return (
    <div className="bg-industrial-900 p-6 rounded-[2rem] border border-industrial-800 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-xl">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Prix Vente ({settings?.currency}) *</label>
        <input required type="number" step="0.01" className="industrial-input w-full" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Prix Ligne ({settings?.currency})</label>
        <input type="number" step="0.01" className="industrial-input w-full" value={formData.onlinePrice} onChange={e => setFormData({...formData, onlinePrice: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Prix Achat ({settings?.currency})</label>
        <input type="number" step="0.01" className="industrial-input w-full" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">TVA (%)</label>
        <input type="number" className="industrial-input w-full" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} />
      </div>
    </div>
  );
}
