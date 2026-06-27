import React from 'react';
import { cn } from '../../lib/utils';

interface ProductStockSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  displayExpDate: string;
  handleDisplayDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductStockSection({
  formData,
  setFormData,
  displayExpDate,
  handleDisplayDateChange
}: ProductStockSectionProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
          Stock Actuel * {formData.useMultiExpiry && <span className="text-indigo-400 font-extrabold">(Auto)</span>}
        </label>
        <input 
          required 
          type="number" 
          className={cn("industrial-input w-full", formData.useMultiExpiry ? "opacity-60 bg-white/5 cursor-not-allowed" : "")} 
          value={formData.stock} 
          disabled={formData.useMultiExpiry}
          onChange={e => setFormData({...formData, stock: e.target.value})} 
        />
        {formData.useMultiExpiry && (
          <p className="text-[9px] text-indigo-400 font-bold block mt-1">Calculé (Somme des lots)</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Seuil d'alerte</label>
        <input type="number" className="industrial-input w-full" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Unité</label>
        <input className="industrial-input w-full" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Expiration (JJ MM AA)</label>
        <input 
          type="text" 
          inputMode="numeric"
          className={cn("industrial-input w-full text-center font-mono text-lg tracking-widest", formData.useMultiExpiry ? "opacity-40 bg-white/5 cursor-not-allowed" : "")} 
          placeholder="10 10 26"
          value={formData.useMultiExpiry ? "MULTI" : displayExpDate} 
          disabled={formData.useMultiExpiry}
          onChange={handleDisplayDateChange} 
        />
      </div>
      <div className="space-y-2 col-span-2 lg:col-span-1">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">N° Lot / Batch</label>
        <input 
          className={cn("industrial-input w-full text-center font-mono uppercase", formData.useMultiExpiry ? "opacity-40 bg-white/5 cursor-not-allowed" : "")} 
          placeholder="LOT-X8" 
          value={formData.useMultiExpiry ? "MULTI-LOTS" : formData.batchNumber} 
          disabled={formData.useMultiExpiry}
          onChange={e => setFormData({...formData, batchNumber: e.target.value})} 
        />
      </div>
    </div>
  );
}
