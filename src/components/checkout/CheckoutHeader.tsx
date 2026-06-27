import React from 'react';
import { Search, Scan } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SearchOverlay } from './SearchOverlay';
import { Product } from '../../types';

interface Props {
  search: string;
  setSearch: (s: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  handleBarcodeScan: (val: string) => void;
  setIsScannerOpen: (v: boolean) => void;
  filteredProducts: Product[];
  addToCart: (p: Product, qty?: number) => void;
  isReturnMode: boolean;
  settings: any;
}

export const CheckoutHeader: React.FC<Props> = ({
  search, setSearch, searchRef, handleBarcodeScan, setIsScannerOpen, filteredProducts, addToCart, isReturnMode, settings
}) => {
  const [localSearch, setLocalSearch] = React.useState(search);

  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const debouncedSetSearch = React.useRef(
    (() => {
      let timeout: any;
      return (val: string) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
          setSearch(val);
        }, 150);
      };
    })()
  ).current;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
    debouncedSetSearch(val);
  };

  return (
    <div className="p-4 border-b border-slate-800/40 bg-workspace/40 sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            ref={searchRef}
            type="text"
            placeholder="Rechercher un produit... (F3)"
            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/60 border border-slate-800/50 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none transition-all text-white font-black text-xs uppercase tracking-widest placeholder:text-white/20"
            value={localSearch}
            onChange={handleChange}
            onKeyDown={(e) => {
              const val = e.currentTarget.value;
              if (e.key === 'Enter' && val.trim() !== '') {
                handleBarcodeScan(val);
                setSearch('');
                setLocalSearch('');
              }
            }}
          />
          <SearchOverlay 
            search={search}
            setSearch={setSearch}
            filteredProducts={filteredProducts}
            addToCart={addToCart}
            isReturnMode={isReturnMode}
            settings={settings}
            searchRef={searchRef}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="p-3 bg-slate-900/60 border border-slate-800/50 rounded-xl hover:bg-slate-800 text-white/40 hover:text-indigo-400 transition-all shadow-sm"
            title="Scanner"
          >
            <Scan size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
