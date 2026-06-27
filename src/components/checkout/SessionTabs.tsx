import React, { memo } from 'react';
import { ShoppingCart, Plus, X, RotateCcw, Star, Cloud } from 'lucide-react';
import { cn } from '../../lib/utils';
import { POSSession } from '../../types';

interface SessionTabsProps {
  posSessions: POSSession[];
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  addNewSession: () => void;
  removeSession: (id: string, e: React.MouseEvent) => void;
  isReturnMode: boolean;
  setIsReturnMode: (v: boolean) => void;
  showQuickSelect: boolean;
  setShowQuickSelect: (v: boolean) => void;
}

export const SessionTabs = memo(function SessionTabs({ 
  posSessions, 
  activeSessionId, 
  setActiveSessionId, 
  addNewSession, 
  removeSession, 
  isReturnMode, 
  setIsReturnMode,
  showQuickSelect,
  setShowQuickSelect
}: SessionTabsProps) {
  const currentSession = posSessions.find(s => s.id === activeSessionId);
  const cartItemCount = currentSession ? currentSession.cart.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <div className="flex items-center gap-1.5 p-2 bg-slate-900/40 border-b border-slate-800/40 overflow-x-auto no-scrollbar flex-shrink-0">
      {posSessions.map((session) => (
        <div
          key={session.id}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveSessionId(session.id); }}
          onClick={() => setActiveSessionId(session.id)}
          className={cn(
            "cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap relative min-w-[120px] border border-transparent",
            activeSessionId === session.id 
              ? "bg-indigo-600 text-white shadow-neon-indigo border-indigo-400/50" 
              : "text-slate-500 hover:bg-slate-800/40 hover:text-slate-300"
          )}
        >
          <ShoppingCart size={14} className={session.cart.length > 0 ? (activeSessionId === session.id ? "text-white" : "text-indigo-400") : "text-slate-600"} />
          <span className="flex-1 text-left">{session.name}</span>
          {session.cart.length > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 rounded-full text-[10px] font-black",
              activeSessionId === session.id ? "bg-white/20 text-white" : "bg-indigo-500/10 text-indigo-400"
            )}>
              {session.cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
          {posSessions.length > 1 && (
            <button 
              onClick={(e) => removeSession(session.id, e)}
              className="opacity-0 group-hover:opacity-100 ml-1 p-0.5 hover:bg-rose-500/20 hover:text-rose-400 rounded-md transition-all"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
      <button 
        onClick={addNewSession}
        className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all flex items-center gap-1 px-3 border border-indigo-500/20 bg-indigo-500/5 shadow-sm"
        title="Nouveau Ticket"
      >
        <Plus size={18} />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Nouveau</span>
      </button>

      {/* Cloud-saved status banner */}
      <div className="ml-auto hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/5 border border-emerald-500/10 rounded-xl whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Cloud size={10} className="text-emerald-400/80 animate-pulse" />
        <span>Brouillon synchronisé</span>
      </div>

      <div className={cn("flex items-center gap-1.5", !cartItemCount && "ml-auto md:ml-0")}>
        {/* Toggle Favorites button */}
        <button
          onClick={() => setShowQuickSelect(!showQuickSelect)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
            showQuickSelect 
              ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 border-amber-400/50" 
              : "bg-slate-900/80 border border-slate-800/40 text-amber-500 hover:bg-slate-850 hover:text-amber-400"
          )}
        >
          <Star size={12} className={cn(showQuickSelect ? "fill-white text-white" : "text-amber-500")} /> 
          <span>{showQuickSelect ? 'Masquer Favoris' : 'Favoris'}</span>
        </button>

        {/* Mode Retour button */}
        <button
          onClick={() => setIsReturnMode(!isReturnMode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap",
            isReturnMode 
              ? "bg-rose-600 text-white shadow-neon-rose border-rose-500/50 animate-pulse" 
              : "bg-slate-900/80 border border-slate-800/40 text-slate-400 hover:bg-slate-850 hover:text-slate-300"
          )}
        >
          <RotateCcw size={12} className={cn(isReturnMode && "animate-spin-slow")} /> 
          <span>{isReturnMode ? 'Retour Activé' : 'Mode Retour'}</span>
        </button>
      </div>
    </div>
  );
});
