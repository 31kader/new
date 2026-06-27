import { useState } from 'react';
import { 
  CompanySettings, Product, Category, Brand, Transaction, Promotion, Customer, Supplier, Employee,
  UserProfile, ProductReturn, PurchaseOrder, OnlineOrder, Purchase, InvoicePattern,
  StockAdjustment, Expense, InventoryAudit, SupplierSync, CashShift, AttendanceRecord,
  AdvanceRecord, SupplierPayment, AuditLog, DamagedRecord
} from '../types';
import { DEFAULT_SETTINGS } from './data-fetching/initialStates';

import { useProductsAndCoreData } from './data-fetching/useProductsAndCoreData';
import { useAdminStaticData } from './data-fetching/useAdminStaticData';
import { useFastChangingData } from './data-fetching/useFastChangingData';
import { useSupplierAndCustomerData } from './data-fetching/useSupplierAndCustomerData';
import { useCoreStore } from '../store/useCoreStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { usePeopleStore } from '../store/usePeopleStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useFinanceStore } from '../store/useFinanceStore';

export function useDataFetching(
  user: any,
  profile: any,
  appMode: string,
  currentSupplier: Supplier | null,
  currentCustomer: Customer | null,
  loading: boolean,
  playNotificationSound: () => void // Keep for interface compatibility
) {
  const { setSettings, setProducts, setCategories, setBrands, setPromotions, setPatterns, setIsDataLoading } = useCoreStore();
  const { setTransactions, setPurchaseOrders, setReturns, setOnlineOrders, setShifts, setActiveShift } = useTransactionStore();
  const { setCustomers, setSuppliers, setEmployees, setUsers } = usePeopleStore();
  const { setStockAdjustments, setAudits, setDamagedItems, setSupplierSyncs, setAttendance } = useInventoryStore();
  const { setPurchases, setExpenses, setSupplierPayments, setAdvances, setAuditLogs } = useFinanceStore();

  // Hook 1: Core real-time subscriptions with caching and syncing
  useProductsAndCoreData({
    loading, appMode, userId: user?.uid,
    setProducts, setCategories, setBrands, setTransactions, setPromotions, setCustomers, setSuppliers,
    setUsers, setReturns, setExpenses, setStockAdjustments, setPurchases, setSupplierPayments, setDamagedItems, setAuditLogs,
    setIsDataLoading
  });

  // Hook 2: Loading static admin configurations
  useAdminStaticData({
    loading, appMode, userId: user?.uid, userRole: profile?.role,
    setSettings, setEmployees, setPatterns, setSupplierSyncs
  });

  // Hook 3: Subscribing to fast-updating real-time shifts, online orders and live settings
  useFastChangingData({
    loading, userId: user?.uid,
    setOnlineOrders, setShifts, setActiveShift, setSettings
  });

  // Hook 4: Loading context-specific purchase orders or client orders depending on current supplier/customer selects
  useSupplierAndCustomerData({
    loading, appMode,
    currentSupplierId: currentSupplier?.id,
    currentCustomerId: currentCustomer?.id,
    setPurchaseOrders, setTransactions, setSettings
  });


}
export default useDataFetching;
