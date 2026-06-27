import React from 'react';
import { Banknote } from 'lucide-react';
import { Card } from '../ui';
import { Transaction, Product, Employee, ProductReturn, CompanySettings, Category, Customer } from '../../types';
import { useProfitsReportLogic } from './profits/useProfitsReportLogic';
import { ProfitsReportFilters } from './profits/ProfitsReportFilters';
import { ProfitsReportTable } from './profits/ProfitsReportTable';

interface ProfitsReportProps {
  transactions: Transaction[];
  products: Product[];
  employees: Employee[];
  returns: ProductReturn[];
  settings: CompanySettings;
  categories: Category[];
  customers: Customer[];
}

export const ProfitsReport = React.memo(function ProfitsReport({
  transactions,
  products,
  employees,
  returns,
  settings,
  categories,
  customers,
}: ProfitsReportProps) {
  const {
    profitFilterDate,
    setProfitFilterDate,
    profitFilterCategory,
    setProfitFilterCategory,
    profitSortFormat,
    setProfitSortFormat,
    profitFilterCustomer,
    setProfitFilterCustomer,
    profitFilterEmployee,
    setProfitFilterEmployee,
    profitSearchProduct,
    setProfitSearchProduct,
    profitFilterSource,
    setProfitFilterSource,
    profitFilterTimeStart,
    setProfitFilterTimeStart,
    profitFilterTimeEnd,
    setProfitFilterTimeEnd,
    productProfitData,
    handleProfitSort
  } = useProfitsReportLogic({
    transactions,
    products,
    employees,
    returns,
    settings,
    categories,
    customers,
  });

  return (
    <Card id="card-profits-report" className="overflow-hidden border-white/10 bg-white/5 animate-in fade-in duration-500">
      <div className="bg-white/5 p-4 border-b border-white/10">
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
          <h4 className="font-black text-white uppercase tracking-tighter flex items-center gap-2 text-sm">
            <Banknote size={18} className="text-emerald-400" />
            Bénéfices & Marges par Produit
          </h4>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full uppercase border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              Total Bénéfices: {productProfitData.reduce((s, p) => s + p.profit, 0).toFixed(2)} {settings.currency}
            </span>
            <span className="text-[11px] font-black bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full uppercase border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
              CA Total: {productProfitData.reduce((s, p) => s + p.stats.revenue, 0).toFixed(2)} {settings.currency}
            </span>
          </div>
        </div>
        
        <ProfitsReportFilters 
          profitFilterDate={profitFilterDate}
          setProfitFilterDate={setProfitFilterDate}
          profitFilterTimeStart={profitFilterTimeStart}
          setProfitFilterTimeStart={setProfitFilterTimeStart}
          profitFilterTimeEnd={profitFilterTimeEnd}
          setProfitFilterTimeEnd={setProfitFilterTimeEnd}
          profitFilterSource={profitFilterSource}
          setProfitFilterSource={setProfitFilterSource}
          profitFilterCategory={profitFilterCategory}
          setProfitFilterCategory={setProfitFilterCategory}
          categories={categories}
          profitFilterCustomer={profitFilterCustomer}
          setProfitFilterCustomer={setProfitFilterCustomer}
          customers={customers}
          profitSearchProduct={profitSearchProduct}
          setProfitSearchProduct={setProfitSearchProduct}
        />
      </div>
      
      <ProfitsReportTable 
        productProfitData={productProfitData}
        categories={categories}
        handleProfitSort={handleProfitSort}
        profitSortFormat={profitSortFormat}
      />
    </Card>
  );
});
