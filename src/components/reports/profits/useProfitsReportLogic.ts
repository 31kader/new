import { useState, useMemo } from 'react';
import { isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';
import { calculateItemPrice } from '../../../lib/utils';
import { Transaction, Product, Employee, ProductReturn, CompanySettings, Category, Customer } from '../../../types';

interface UseProfitsReportLogicProps {
  transactions: Transaction[];
  products: Product[];
  employees: Employee[];
  returns: ProductReturn[];
  settings: CompanySettings;
  categories: Category[];
  customers: Customer[];
}

export function useProfitsReportLogic({
  transactions,
  products,
  employees,
  returns,
  settings,
  categories,
  customers,
}: UseProfitsReportLogicProps) {
  const [profitFilterDate, setProfitFilterDate] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');
  const [profitFilterCategory, setProfitFilterCategory] = useState<string>('all');
  const [profitSortFormat, setProfitSortFormat] = useState<'revenue_desc' | 'revenue_asc' | 'profit_desc' | 'profit_asc' | 'margin_desc' | 'margin_asc' | 'qty_desc' | 'qty_asc'>('profit_desc');
  const [profitFilterCustomer, setProfitFilterCustomer] = useState<string>('all');
  const [profitFilterEmployee, setProfitFilterEmployee] = useState<string>('all');
  const [profitSearchProduct, setProfitSearchProduct] = useState<string>('');
  const [profitFilterSource, setProfitFilterSource] = useState<'all' | 'pos' | 'online'>('all');
  const [profitFilterTimeStart, setProfitFilterTimeStart] = useState<string>('');
  const [profitFilterTimeEnd, setProfitFilterTimeEnd] = useState<string>('');

  const productProfitData = useMemo(() => {
    let filteredTransactions = transactions.filter(t => t.status !== 'returned');

    filteredTransactions = filteredTransactions.filter(t => {
      const tDate = new Date(t.timestamp);
      if (isNaN(tDate.getTime())) return false;
      if (profitFilterDate === 'today' && !isToday(tDate)) return false;
      if (profitFilterDate === 'week' && !isThisWeek(tDate, { weekStartsOn: 1 })) return false;
      if (profitFilterDate === 'month' && !isThisMonth(tDate)) return false;
      if (profitFilterDate === 'year' && !isThisYear(tDate)) return false;
      
      if (profitFilterTimeStart) {
        const [hours, minutes] = profitFilterTimeStart.split(':').map(Number);
        if (tDate.getHours() < hours || (tDate.getHours() === hours && tDate.getMinutes() < minutes)) return false;
      }
      
      if (profitFilterTimeEnd) {
        const [hours, minutes] = profitFilterTimeEnd.split(':').map(Number);
        if (tDate.getHours() > hours || (tDate.getHours() === hours && tDate.getMinutes() > minutes)) return false;
      }
      
      if (profitFilterSource !== 'all') {
        const isOnline = !!t.onlineOrderId;
        if (profitFilterSource === 'online' && !isOnline) return false;
        if (profitFilterSource === 'pos' && isOnline) return false;
      }
      
      if (profitFilterCustomer !== 'all' && t.customerId !== profitFilterCustomer) return false;
      if (profitFilterEmployee !== 'all') {
         const empName = employees?.find(e => e.id === profitFilterEmployee)?.name;
         if (empName && t.employeeName !== empName) return false;
      }
      
      return true;
    });

    const productStats: Record<string, { qty: number, revenue: number, cost: number }> = {};
    
    // O(1) Speed optimization
    const productsById = new Map<string, Product>();
    products.forEach(p => productsById.set(p.id, p));

    filteredTransactions.forEach(t => {
      const subtotal = t.items.reduce((s, item) => s + (calculateItemPrice(item, t.isWholesale) * item.quantity), 0);
      const totalDiscounts = (t.discountAmount || 0) + (t.pointsDiscount || 0) + (t.voucherDiscount || 0);

      t.items.forEach(item => {
        if (!productStats[item.id]) {
          productStats[item.id] = { qty: 0, revenue: 0, cost: 0 };
        }
        productStats[item.id].qty += item.quantity;
        
        const itemSubtotal = calculateItemPrice(item, t.isWholesale) * item.quantity;
        const itemDiscount = subtotal > 0 ? (itemSubtotal / subtotal) * totalDiscounts : 0;
        const itemRevenue = itemSubtotal - itemDiscount;
        
        productStats[item.id].revenue += itemRevenue;
        
        const p = productsById.get(item.id);
        const baseCost = p?.costPrice || 0;
        
        // Dynamic operational costs
        const opCosts = p?.operationalCosts || {};
        const packaging = opCosts.packaging ?? (t.onlineOrderId ? (settings.operationalCosts?.basePackaging || 0) : 0);
        const shipping = opCosts.shipping ?? (t.onlineOrderId ? (settings.operationalCosts?.baseShipping || 0) : 0);
        const other = opCosts.other || 0;
        
        const totalUnitCost = baseCost + packaging + shipping + other;
        productStats[item.id].cost += totalUnitCost * item.quantity;
      });
    });

    // Subtract returns from stats
    returns.forEach(ret => {
        const tDate = new Date(ret.timestamp);
        if (isNaN(tDate.getTime())) return;
        if (profitFilterDate === 'today' && !isToday(tDate)) return;
        if (profitFilterDate === 'week' && !isThisWeek(tDate, { weekStartsOn: 1 })) return;
        if (profitFilterDate === 'month' && !isThisMonth(tDate)) return;
        if (profitFilterDate === 'year' && !isThisYear(tDate)) return;

        if (profitFilterTimeStart) {
          const [hours, minutes] = profitFilterTimeStart.split(':').map(Number);
          if (tDate.getHours() < hours || (tDate.getHours() === hours && tDate.getMinutes() < minutes)) return;
        }

        if (profitFilterTimeEnd) {
          const [hours, minutes] = profitFilterTimeEnd.split(':').map(Number);
          if (tDate.getHours() > hours || (tDate.getHours() === hours && tDate.getMinutes() > minutes)) return;
        }

        const originalTx = transactions.find(t => t.id === ret.transactionId);
        if (profitFilterSource !== 'all' || profitFilterCustomer !== 'all' || profitFilterEmployee !== 'all') {
          if (profitFilterSource !== 'all') {
            const isOnline = !!originalTx?.onlineOrderId;
            if (profitFilterSource === 'online' && !isOnline) return;
            if (profitFilterSource === 'pos' && isOnline) return;
          }
          
          if (profitFilterCustomer !== 'all' && originalTx?.customerId !== profitFilterCustomer) return;
          
          if (profitFilterEmployee !== 'all') {
            const empName = employees?.find(e => e.id === profitFilterEmployee)?.name;
            if (empName && originalTx?.employeeName !== empName) return;
          }
        }

        const retSubtotal = ret.items.reduce((s, it) => s + (calculateItemPrice(it, originalTx?.isWholesale) * it.quantity), 0);
        
        ret.items.forEach(item => {
            if (productStats[item.productId]) {
                productStats[item.productId].qty -= item.quantity;
                
                const itemSubtotal = calculateItemPrice(item, originalTx?.isWholesale) * item.quantity;
                const refundedRevenue = retSubtotal > 0 ? (itemSubtotal / retSubtotal) * (ret.totalRefund || itemSubtotal) : 0;
                
                productStats[item.productId].revenue -= refundedRevenue;
                
                const p = productsById.get(item.productId);
                const baseCost = p?.costPrice || 0;
                productStats[item.productId].cost -= (baseCost * item.quantity);
            }
        });
    });

    let result = products.map(p => {
      const stats = productStats[p.id] || { qty: 0, revenue: 0, cost: 0 };
      const profit = stats.revenue - stats.cost;
      const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;
      return {
        ...p,
        stats,
        profit,
        margin
      };
    });

    // Category Filter
    if (profitFilterCategory !== 'all') {
      result = result.filter(p => p.categoryId === profitFilterCategory);
    }

    // Search Filter
    if (profitSearchProduct) {
      const query = profitSearchProduct.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query));
    }

    // Sorting
    return result.sort((a, b) => {
      if (profitSortFormat === 'revenue_desc') return b.stats.revenue - a.stats.revenue;
      if (profitSortFormat === 'revenue_asc') return a.stats.revenue - b.stats.revenue;
      if (profitSortFormat === 'profit_desc') return b.profit - a.profit;
      if (profitSortFormat === 'profit_asc') return a.profit - b.profit;
      if (profitSortFormat === 'margin_desc') return b.margin - a.margin;
      if (profitSortFormat === 'margin_asc') return a.margin - b.margin;
      if (profitSortFormat === 'qty_desc') return b.stats.qty - a.stats.qty;
      if (profitSortFormat === 'qty_asc') return a.stats.qty - b.stats.qty;
      return 0;
    });
  }, [transactions, products, employees, returns, settings, profitFilterCategory, profitSortFormat, profitFilterCustomer, profitFilterEmployee, profitSearchProduct, profitFilterSource, profitFilterTimeStart, profitFilterTimeEnd]);

  const handleProfitSort = (key: 'revenue' | 'profit' | 'margin' | 'qty') => {
    setProfitSortFormat(prev => {
      if (key === 'revenue') return prev === 'revenue_desc' ? 'revenue_asc' : 'revenue_desc';
      if (key === 'profit') return prev === 'profit_desc' ? 'profit_asc' : 'profit_desc';
      if (key === 'margin') return prev === 'margin_desc' ? 'margin_asc' : 'margin_desc';
      return prev === 'qty_desc' ? 'qty_asc' : 'qty_desc';
    });
  };

  return {
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
  };
}
