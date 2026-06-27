import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: React.ReactNode, 
  label: string, 
  value: string | number, 
  trend: string, 
  color: 'emerald' | 'indigo' | 'rose' 
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, color }) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
    rose: "bg-rose-500/10 text-rose-400"
  };
  return (
    <Card className="p-4 sm:p-6 flex items-center gap-4 sm:gap-6 bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-[2rem] hover:bg-white/10 transition-all group overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
      <div className={cn(
        "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg",
        colors[color]
      )}>
        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { 
          size: 24, 
          strokeWidth: 2.5,
          className: cn((icon as any).props?.className, "text-current")
        })}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-[11px] text-white/40 font-black uppercase tracking-[0.2em]">{label}</p>
        <h4 className="text-xl sm:text-3xl font-black text-white mt-1 truncate font-mono tracking-tighter">{value}</h4>
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-black mt-1.5 shadow-sm border",
          trend.includes('+') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : color === 'rose' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        )}>
          {trend.includes('+') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend}
        </div>
      </div>
    </Card>
  );
};
