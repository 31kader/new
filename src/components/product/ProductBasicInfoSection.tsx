import React from 'react';
import { Mic, Camera, RefreshCw, Loader2 } from 'lucide-react';
import { cn, generateUniqueId } from '../../lib/utils';

interface ProductBasicInfoSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  startVoiceEntry: () => void;
  isVoiceScanning: boolean;
  skuError: string | null;
  isGlobalLoading: boolean;
  setIsScannerOpen: (val: boolean) => void;
}

export function ProductBasicInfoSection({
  formData,
  setFormData,
  startVoiceEntry,
  isVoiceScanning,
  skuError,
  isGlobalLoading,
  setIsScannerOpen
}: ProductBasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Nom du produit *</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input 
              required 
              className="industrial-input w-full" 
              placeholder="Nom de l'article..."
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button 
                type="button"
                onClick={startVoiceEntry}
                disabled={isVoiceScanning}
                className={cn(
                  "p-2 rounded-xl transition-all",
                  isVoiceScanning ? "text-rose-500 animate-pulse bg-rose-500/10" : "text-white/20 hover:text-indigo-400 hover:bg-indigo-400/10"
                )}
                title="Saisie vocale intelligente"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-white uppercase tracking-[0.2em]">SKU / Code-barre</label>
        <div className="relative">
          <input 
            className={cn(
              "industrial-input w-full pr-24",
              skuError ? 'border-rose-500 ring-4 ring-rose-500/10' : ''
            )}
            placeholder="Scanner ou saisir..."
            value={formData.sku} 
            onChange={e => setFormData({...formData, sku: e.target.value})} 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isGlobalLoading && <Loader2 size={16} className="text-indigo-400 animate-spin" />}
            <button 
              type="button" 
              onClick={() => setFormData({...formData, sku: `SKU-${generateUniqueId()}`})}
              className="p-1.5 text-white/20 hover:text-indigo-400 transition-colors"
              title="Générer SKU"
            >
              <RefreshCw size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => setIsScannerOpen(true)}
              className="p-3 bg-white/5 text-white/40 hover:text-indigo-400 hover:bg-white/10 rounded-xl transition-all"
              title="Scanner code-barres"
            >
              <Camera size={20} />
            </button>
          </div>
        </div>
        {skuError && <p className="text-[10px] font-black text-rose-400 animate-pulse tracking-wide mt-1 pl-2">{skuError}</p>}
        {!skuError && isGlobalLoading && <p className="text-[9px] text-indigo-400 font-black animate-pulse uppercase tracking-widest pl-2">Recherche globale...</p>}
      </div>
    </div>
  );
}
