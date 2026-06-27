import React from 'react';
import { Package, Trash2, RefreshCw, Plus, Camera, ShoppingCart } from 'lucide-react';
import { SafeImage } from '../ui';

interface ProductMediaSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  removeImage: (idx: number) => void;
  isUploadingImage: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductMediaSection({
  formData,
  setFormData,
  removeImage,
  isUploadingImage,
  handleImageUpload
}: ProductMediaSectionProps) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Images du produit (Max 5)</label>
      <div className="flex flex-wrap gap-4">
        {formData.imageUrls.map((url: string, idx: number) => (
          <div key={`product-img-${idx}`} className="relative group w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-industrial-800 border border-industrial-700 overflow-hidden shadow-2xl transition-all hover:border-indigo-500/50">
            <SafeImage 
              src={url} 
              className="w-full h-full object-cover" 
              fallback={<Package size={24} className="text-white/10" />}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
              <button type="button" onClick={() => removeImage(idx)} className="p-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 shadow-lg active:scale-95">
                <Trash2 size={20} />
              </button>
            </div>
            {idx === 0 && <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg ring-1 ring-white/20">Principale</span>}
          </div>
        ))}
        
        {isUploadingImage && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-indigo-950/20 border-2 border-dashed border-indigo-500/50 flex flex-col items-center justify-center animate-pulse text-indigo-400">
            <RefreshCw size={24} className="animate-spin" />
            <span className="text-[8px] font-black mt-2 uppercase tracking-widest text-center px-1">Envoi Supabase...</span>
          </div>
        )}
        
        {formData.imageUrls.length < 5 && !isUploadingImage && (
          <label className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-white/20 hover:text-indigo-400 group">
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black mt-2 uppercase tracking-widest">Ajouter</span>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e)} />
          </label>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex-1 cursor-pointer min-w-[140px]">
          <div className="flex items-center justify-center w-full gap-2 px-4 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest shadow-lg">
            <Camera size={18} /> <span className="hidden sm:inline">Prendre une photo</span><span className="sm:hidden">Photo</span>
          </div>
          <input type="file" className="hidden" accept="image/*" capture="environment" onChange={(e) => handleImageUpload(e)} />
        </label>
        
        <button 
          type="button"
          onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(formData.name)}&tbm=shop`, '_blank')}
          className="flex flex-1 min-w-[140px] items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/60 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest shadow-lg"
        >
          <ShoppingCart size={18} className="text-rose-500" /> <span className="hidden sm:inline">Google Shopping</span><span className="sm:hidden">GShop</span>
        </button>
      </div>
      
      <div className="space-y-2">
        <label className="text-[9px] font-black text-white uppercase tracking-widest pl-2">Ou URL directe</label>
        <div className="flex gap-2">
          <input 
            placeholder="Coller l'URL de l'image ici..." 
            className="flex-1 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/50 font-bold placeholder:text-white/10 transition-all" 
            value={formData.imageUrl || ''} 
            onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
          />
          <button 
            type="button" 
            onClick={() => {
              if (formData.imageUrl && !formData.imageUrls.includes(formData.imageUrl) && formData.imageUrls.length < 5) {
                setFormData({...formData, imageUrls: [...formData.imageUrls, formData.imageUrl], imageUrl: ''});
              }
            }}
            className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg active:scale-95"
            disabled={!formData.imageUrl || formData.imageUrls.length >= 5}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
