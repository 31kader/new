import React, { useState, memo } from 'react';
import { 
  Download, 
  Trash2,
  Brain,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { cn, formatSafe } from '../lib/utils';
import { Button } from './ui';
import { AIAssistant } from './AIAssistant';
import { MarketingPosters } from './MarketingPosters';
import { AccountingChartsReport } from './reports/AccountingChartsReport';
import { ProfitsReport } from './reports/ProfitsReport';
import { FidelityStatsReport } from './reports/FidelityStatsReport';
import { CashflowReport } from './reports/CashflowReport';
import { StockValueReport } from './reports/StockValueReport';
import { LossesReport } from './reports/LossesReport';
import { Transaction, Product, Employee, Expense, SupplierPayment, ProductReturn, CompanySettings, Category, Customer, StockAdjustment } from '../types';

interface DetailedReportsProps {
  transactions: Transaction[];
  products: Product[];
  employees: Employee[];
  expenses: Expense[];
  supplierPayments: SupplierPayment[];
  returns: ProductReturn[];
  settings: CompanySettings;
  categories: Category[];
  customers: Customer[];
  stockAdjustments: StockAdjustment[];
}

export const DetailedReports = memo(function DetailedReports({ 
  transactions, 
  products, 
  employees, 
  expenses, 
  supplierPayments, 
  returns, 
  settings, 
  categories, 
  customers,
  stockAdjustments
}: DetailedReportsProps) {
  const [reportsTab, setReportsTab] = useState<'charts' | 'profits' | 'marketing' | 'cashflow' | 'fidelity_stats' | 'stock_value' | 'ai_assistant' | 'losses'>('charts');
  const [marketingFilterDate, setMarketingFilterDate] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

  const exportAccountingCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Total', 'Tax', 'Payment Method', 'Status'];
    const rows = transactions.map(t => [
      formatSafe(t.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      t.id,
      t.total.toFixed(2),
      (t.total * (settings.taxRate / 100)).toFixed(2),
      t.paymentMethod || 'N/A',
      t.status || 'completed'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `accounting_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.status === 'returned' ? 0 : t.total), 0);

  return (
    <div className="space-y-8 text-slate-800">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Rapports de Ventes Détaillés</h3>
          <p className="text-sm text-white/40">Analysez vos performances sous tous les angles.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 flex-wrap">
            <button 
              onClick={() => setReportsTab('charts')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                reportsTab === 'charts' ? "bg-white text-indigo-600 shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              Graphiques
            </button>
            <button 
              onClick={() => setReportsTab('profits')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                reportsTab === 'profits' ? "bg-white text-indigo-600 shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              Analyse des Bénéfices
            </button>
            <button 
              onClick={() => setReportsTab('fidelity_stats')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                reportsTab === 'fidelity_stats' ? "bg-white text-indigo-600 shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              Fidélité & Remises
            </button>
            <button 
              onClick={() => setReportsTab('cashflow')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                reportsTab === 'cashflow' ? "bg-white text-indigo-600 shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              Trésorerie
            </button>
            <button 
              onClick={() => setReportsTab('stock_value')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                reportsTab === 'stock_value' ? "bg-white text-indigo-600 shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              Valorisation Stock
            </button>
            <button 
              onClick={() => setReportsTab('losses')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                reportsTab === 'losses' ? "bg-rose-600 text-white shadow-xl" : "text-rose-400 hover:bg-white/5"
              )}
            >
              <Trash2 size={14} />
              Pertes
            </button>
            <button 
              onClick={() => setReportsTab('ai_assistant')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                reportsTab === 'ai_assistant' ? "bg-indigo-600 text-white shadow-xl" : "text-indigo-400 hover:bg-white/5"
              )}
            >
              <Brain size={14} />
              Intelligence IA
            </button>
            <button 
              onClick={() => setReportsTab('marketing')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                reportsTab === 'marketing' ? "bg-indigo-600 text-white shadow-xl" : "text-indigo-400 hover:bg-white/5"
              )}
            >
              <Zap size={14} />
              Marketing
            </button>
          </div>
          <Button onClick={exportAccountingCSV} variant="secondary" className="flex items-center gap-2">
            <Download size={18} /> Export Comptable
          </Button>
        </div>
      </div>

      {reportsTab === 'charts' ? (
        <AccountingChartsReport 
          transactions={transactions}
          products={products}
          expenses={expenses}
          settings={settings}
        />
      ) : reportsTab === 'profits' ? (
        <ProfitsReport 
          transactions={transactions}
          products={products}
          employees={employees}
          returns={returns}
          settings={settings}
          categories={categories}
          customers={customers}
        />
      ) : reportsTab === 'fidelity_stats' ? (
        <FidelityStatsReport 
          transactions={transactions}
          settings={settings}
          marketingFilterDate={marketingFilterDate}
          setMarketingFilterDate={setMarketingFilterDate}
        />
      ) : reportsTab === 'cashflow' ? (
        <CashflowReport 
          transactions={transactions}
          expenses={expenses}
          supplierPayments={supplierPayments}
          settings={settings}
        />
      ) : reportsTab === 'stock_value' ? (
        <StockValueReport 
          products={products}
          categories={categories}
          settings={settings}
        />
      ) : reportsTab === 'losses' ? (
        <LossesReport 
          stockAdjustments={stockAdjustments}
          products={products}
          categories={categories}
          settings={settings}
          totalRevenue={totalRevenue}
        />
      ) : reportsTab === 'ai_assistant' ? (
        <AIAssistant 
          products={products}
          transactions={transactions}
          expenses={expenses}
          settings={settings}
          stockAdjustments={stockAdjustments}
        />
      ) : (
        <MarketingPosters products={products} settings={settings} />
      )}
    </div>
  );
});
