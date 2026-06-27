import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FolderTree, AlertCircle, TrendingDown, ShieldCheck, RotateCcw, Calendar, Award, ArrowUpDown, Truck } from 'lucide-react';
import { Category, Brand, Product } from '../../types';
import { Button } from '../ui';
import { cn } from '../../lib/utils';

export interface InventoryFiltersProps {
  showFilters: boolean;
  selectedSupplier: string;
  setSelectedSupplier: (val: string) => void;
  sortKey: string;
  onSortChange: (key: any) => void;
  selectedBrand: string;
  setSelectedBrand: (val: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
  categories: Category[];
  selectedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  setSelectedCategories: (cats: string[]) => void;
  categoryProductCounts: Record<string, number>;
  productSuppliers: string[];
  brands: Brand[];
  stockLevelFilter: 'all' | 'low' | 'out';
  setStockLevelFilter: (val: 'all' | 'low' | 'out') => void;
  statusFilter: 'all' | 'active' | 'inactive' | 'discontinued';
  setStatusFilter: (val: 'all' | 'active' | 'inactive' | 'discontinued') => void;
  onResetAll: () => void;
}

export function InventoryFilters({
  showFilters,
  selectedSupplier,
  setSelectedSupplier,
  sortKey,
  onSortChange,
  selectedBrand,
  setSelectedBrand,
  dateRange,
  setDateRange,
  categories,
  selectedCategories,
  toggleCategory,
  setSelectedCategories,
  categoryProductCounts,
  productSuppliers,
  brands,
  stockLevelFilter,
  setStockLevelFilter,
  statusFilter,
  setStatusFilter,
  onResetAll
}: InventoryFiltersProps) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-2xl space-y-8 mt-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Fournisseur</span>
                </div>
                <select 
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-[11px] font-black uppercase tracking-widest text-white transition-all cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-[#1E1E1E] text-white">Tous les fournisseurs</option>
                  {productSuppliers.map(s => (
                    <option key={s} value={s} className="bg-[#1E1E1E] text-white">{s}</option>
                  ))}
                  <option value="Sans fournisseur" className="bg-[#1E1E1E] text-white">Sans fournisseur</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tri par</span>
                </div>
                <select 
                  value={sortKey}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-[11px] font-black uppercase tracking-widest text-white transition-all cursor-pointer appearance-none"
                >
                  <option value="" className="bg-[#1E1E1E] text-white">Sélectionner un tri</option>
                  <option value="name" className="bg-[#1E1E1E] text-white">Désignation (A-Z)</option>
                  <option value="price" className="bg-[#1E1E1E] text-white">Prix croissant</option>
                  <option value="margin" className="bg-[#1E1E1E] text-white">Marge bénéficiaire (Profit)</option>
                  <option value="stock" className="bg-[#1E1E1E] text-white">Stock disponible</option>
                  <option value="updatedAt" className="bg-[#1E1E1E] text-white">Dernière modification</option>
                  <option value="createdAt" className="bg-[#1E1E1E] text-white">Date de création</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Marque</span>
                </div>
                <select 
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-[11px] font-black uppercase tracking-widest text-white transition-all cursor-pointer appearance-none"
                >
                  <option value="all" className="bg-[#1E1E1E] text-white">Toutes les marques</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id} className="bg-[#1E1E1E] text-white">{b.name}</option>
                  ))}
                  <option value="none" className="bg-[#1E1E1E] text-white">Sans marque</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Période</span>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] text-[10px] font-black uppercase text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    value={dateRange.start}
                    onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <span className="text-white/20 font-black">→</span>
                  <input 
                    type="date"
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] text-[10px] font-black uppercase text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    value={dateRange.end}
                    onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderTree size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Catégories</span>
                  </div>
                  <button onClick={() => setSelectedCategories([])} className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Tout réinitialiser</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.filter(c => !c.parentId).map((parent: Category) => {
                    const subs = categories.filter(c => c.parentId === parent.id);
                    const isParentSelected = selectedCategories.includes(parent.id);
                    const parentCount = categoryProductCounts[parent.id] || 0;
                    
                    return (
                      <div 
                        key={parent.id} 
                        className={cn(
                          "p-5 rounded-[1.5rem] border transition-all duration-300 flex flex-col justify-between space-y-4",
                          isParentSelected 
                            ? "bg-indigo-600/10 border-indigo-500/35 ring-1 ring-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                            : "bg-white/[0.02] border-white/5 hover:border-indigo-500/15"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleCategory(parent.id)}
                            className="flex items-center gap-2 text-left group"
                          >
                            <FolderTree 
                              size={14} 
                              className={cn(
                                "transition-colors",
                                isParentSelected ? "text-indigo-400" : "text-white/40 group-hover:text-white/60"
                              )} 
                            />
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-[11px] font-black uppercase tracking-wider transition-colors",
                                isParentSelected ? "text-white" : "text-white/70 group-hover:text-white"
                              )}>
                                {parent.name}
                              </span>
                              <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-0.5">
                                {parentCount} article{parentCount > 1 ? 's' : ''}
                              </span>
                            </div>
                          </button>
                          
                          <input 
                            type="checkbox"
                            checked={isParentSelected}
                            onChange={() => toggleCategory(parent.id)}
                            className="w-4 h-4 rounded text-indigo-600 bg-white/5 border-white/10 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>

                        {subs.length > 0 && (
                          <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                            {subs.map((sub: Category) => {
                              const isSubSelected = selectedCategories.includes(sub.id);
                              const subCount = categoryProductCounts[sub.id] || 0;
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => toggleCategory(sub.id)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-[0.8rem] text-[9px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5",
                                    isSubSelected
                                      ? "bg-indigo-500/25 text-indigo-300 border-indigo-500/40 shadow-sm"
                                      : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/15 hover:text-white"
                                  )}
                                >
                                  <span>{sub.name}</span>
                                  <span className="text-[8px] font-bold opacity-60">({subCount})</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* Non classés Card */}
                  <div 
                    className={cn(
                      "p-5 rounded-[1.5rem] border transition-all duration-300 flex items-center justify-between",
                      selectedCategories.includes('uncategorized')
                        ? "bg-rose-500/10 border-rose-500/35 ring-1 ring-rose-500/25 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
                        : "bg-white/[0.02] border-white/5 hover:border-rose-500/15"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory('uncategorized')}
                      className="flex items-center gap-2 text-left group"
                    >
                      <AlertCircle 
                        size={14} 
                        className={cn(
                          "transition-colors",
                          selectedCategories.includes('uncategorized') ? "text-rose-400" : "text-rose-400/40 group-hover:text-rose-400/60"
                        )} 
                      />
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-wider transition-colors",
                          selectedCategories.includes('uncategorized') ? "text-white" : "text-white/70 group-hover:text-white"
                        )}>
                          Sans Catégorie
                        </span>
                        <span className="text-[9px] font-bold text-rose-400/50 uppercase tracking-widest mt-0.5">
                          {categoryProductCounts['uncategorized'] || 0} article{(categoryProductCounts['uncategorized'] || 0) > 1 ? 's' : ''}
                        </span>
                      </div>
                    </button>
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes('uncategorized')}
                      onChange={() => toggleCategory('uncategorized')}
                      className="w-4 h-4 rounded text-rose-600 bg-white/5 border-white/10 focus:ring-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">État Stocks</span>
                  </div>
                  <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 h-fit">
                    {(['all', 'low', 'out'] as const).map((level) => (
                      <button 
                        key={level}
                        onClick={() => setStockLevelFilter(level)}
                        className={cn(
                          "flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer",
                          stockLevelFilter === level
                            ? "bg-white/10 text-white shadow-inner" 
                            : "text-white/40 hover:text-white/60"
                        )}
                      >
                        {level === 'all' ? 'Tous' : level === 'low' ? 'Faible' : 'Rupture'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Statut</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {(['all', 'active', 'inactive', 'discontinued'] as const).map((status) => (
                      <button 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={cn(
                          "whitespace-nowrap px-5 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer",
                          statusFilter === status
                            ? "bg-indigo-600 text-white border-indigo-400/50 shadow-neon-indigo" 
                            : "bg-white/5 text-white/40 border-white/5 hover:text-white"
                        )}
                      >
                        {status === 'all' ? 'Tous' : status}
                      </button>
                    ))}
                  </div>
                </div>



                <div className="flex flex-col justify-end">
                  <Button 
                    variant="ghost" 
                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/5 py-6 rounded-[1.25rem] cursor-pointer"
                    onClick={onResetAll}
                  >
                    <RotateCcw size={14} className="mr-3" /> Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
