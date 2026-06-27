
import { supabase } from '../supabase';
import { convertKeysToSnake, convertKeysToCamel, enqueueStockAdjustment, localDb } from '../database';
import { toast } from 'sonner';
import { DEFAULT_PERMISSIONS } from '../constants';
import { QuickAddProductModal } from './QuickAddProductModal';
import { DeliveryRequestModal } from './DeliveryRequestModal';
import { CustomerProfile } from './CustomerProfile';
import React, { useState, useMemo, memo, useEffect, useRef, useDeferredValue, useCallback } from 'react';
import { Package, Tag, RefreshCw, LayoutGrid, Plus, FileSpreadsheet, Upload, ShoppingBag, AlertTriangle, Zap, Info, Search, Filter, Scan, LayoutList, Layers, Truck, ArrowUpDown, Award, Calendar, FolderTree, AlertCircle, TrendingDown, ShieldCheck, RotateCcw, Check, Printer, Copy, PackageOpen, Trash2, ChevronUp, BarcodeIcon, ShoppingCart, Eye, X, MessageCircle, Phone, MapPin, Navigation, Edit, Clock, Mail, Percent, DollarSign, Star, Palette, FileText, AlignLeft, Shield, UserCog, Link2, MapIcon, Brain, Database, ArrowRight, CreditCard, Banknote, Minus, UserPlus, ChevronDown, Users, ArrowUpRight, ArrowDownRight, LogOut, Bell, TrendingUp, History, EyeOff, LogIn, Store, Gift, Wallet, Edit2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button, Card, Modal, ConfirmDialog, BlurCard, SortableHeader, SafeImage } from './ui';
import { Product, Category, Brand, StockAdjustment, CompanySettings, SupplierSync, Supplier, Purchase, Transaction, OnlineOrder, Employee, Customer, CartItem, ProductReturn, RolePermissions, Promotion, Voucher, PurchaseOrder, POSSession, CashShift } from '../types';
import { cn, logAction, safeDate, exportToExcel, getHierarchicalCategories, formatSafe, exportToCSV, generateUniqueId, isLocked, formatProductStock, calculateItemPrice, playScanSound, announcePrice, sanitizeProductForSupabase, mapDoc } from '../lib/utils';
import { printReceipt, printPurchaseOrder } from '../services/printService';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isToday, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';

import { CartItemRow } from './checkout/CartItemRow';
import { SessionTabs } from './checkout/SessionTabs';
import { CustomerSelection } from './checkout/CustomerSelection';
import { PaymentOrderSummary } from './checkout/PaymentOrderSummary';
import { SearchOverlay } from './checkout/SearchOverlay';
import { SessionInitialCard } from './checkout/SessionInitialCard';
import { PriceCheckerModal } from './checkout/PriceCheckerModal';
import { ItemDiscountModal } from './checkout/ItemDiscountModal';
import { BarcodeScanner } from './BarcodeScanner';
import { Categories } from './Categories';
import { Brands } from './Brands';
import { QuickSelect } from './QuickSelect';
import { CheckoutSuccessModal } from './checkout/CheckoutSuccessModal';
import { useCheckoutProcess } from '../hooks/useCheckoutProcess';
import { useCheckoutCalculations } from '../hooks/useCheckoutCalculations';
import { useCheckoutLogic } from './checkout/useCheckoutLogic';
import { QuickSelectPanel } from './checkout/QuickSelectPanel';
import { CheckoutHeader } from './checkout/CheckoutHeader';
import { CheckoutControlsPanel } from './checkout/CheckoutControlsPanel';
import { CartItemsList } from './checkout/CartItemsList';

import { useAuthStore } from '../store/useAuthStore';
import { useCoreStore } from '../store/useCoreStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { usePeopleStore } from '../store/usePeopleStore';
import { useCartStore } from '../store/useCartStore';

interface CheckoutProps {
  setActiveTab: (tab: string) => void;
  setIsPOSCustomerModalOpen: (open: boolean) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  setIsProductModalOpen: (open: boolean) => void;
  setEditingProduct: (product: Product | null) => void;
  activeStaffId: string;
}

export const Checkout = memo(function Checkout(props: CheckoutProps) {
  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const products = useCoreStore(s => s.products);
  const categories = useCoreStore(s => s.categories);
  const settings = useCoreStore(s => s.settings);
  const promotions = useCoreStore(s => s.promotions);
  const customers = usePeopleStore(s => s.customers);
  const employees = usePeopleStore(s => s.employees);
  const transactions = useTransactionStore(s => s.transactions);
  const activeShift = useTransactionStore(s => s.activeShift);
  const setActiveShift = useTransactionStore(s => s.setActiveShift);
  const posSessions = useCartStore(s => s.posSessions);
  const setPosSessions = useCartStore(s => s.setPosSessions);
  const activeSessionId = useCartStore(s => s.activeSessionId);
  const setActiveSessionId = useCartStore(s => s.setActiveSessionId);
  const setCart = useCartStore(s => s.setCart);
  const isWholesale = useCartStore(s => s.isWholesale);
  const setIsWholesale = useCartStore(s => s.setIsWholesale);
  const deliveryMethod = useCartStore(s => s.deliveryMethod);
  const setDeliveryMethod = useCartStore(s => s.setDeliveryMethod);
  const setSelectedCustomer = useCartStore(s => s.setSelectedCustomer);

  const activeSession = posSessions.find(s => s.id === activeSessionId) || posSessions[0];
  const cart = activeSession?.cart || [];
  const selectedCustomer = activeSession?.selectedCustomer || null;

  const mergedProps = {
    ...props,
    user, profile, products, categories, settings, promotions,
    customers, employees, transactions, activeShift, setActiveShift,
    cart, setCart, posSessions, setPosSessions, activeSessionId, setActiveSessionId,
    isWholesale, setIsWholesale, deliveryMethod, setDeliveryMethod,
    selectedCustomer, setSelectedCustomer
  };

  const {
    role,
    permissions,
    isMobile,
    setIsMobile,
    search,
    setSearch,
    showQuickSelect,
    setShowQuickSelect,
    searchRef,
    cartEndRef,
    deferredSearch,
    showSuccess,
    setShowSuccess,
    promoCode,
    setPromoCode,
    voucherCode,
    setVoucherCode,
    activePromotion,
    setActivePromotion,
    appliedVoucher,
    setAppliedVoucher,
    customerSearch,
    setCustomerSearch,
    useLoyaltyPoints,
    setUseLoyaltyPoints,
    useBalance,
    setUseBalance,
    lastTransaction,
    setLastTransaction,
    isScannerOpen,
    setIsScannerOpen,
    isReturnMode,
    setIsReturnMode,
    isPriceCheckerOpen,
    setIsPriceCheckerOpen,
    priceCheckResult,
    setPriceCheckResult,
    hasRestored,
    setHasRestored,
    selectedItemId,
    setSelectedItemId,
    isQuickAddModalOpen,
    setIsQuickAddModalOpen,
    isDeliveryModalOpen,
    setIsDeliveryModalOpen,
    newProductBarcode,
    setNewProductBarcode,
    initialCashInput,
    setInitialCashInput,
    isOpeningSession,
    setIsOpeningSession,
    receivedAmount,
    setReceivedAmount,
    keepExcessInBalance,
    setKeepExcessInBalance,
    quantityInputRefs,
    scannerBuffer,
    addNewSession,
    removeSession,
    handleDirectOpenShift,
    addToCart,
    removeFromCart,
    subtotal,
    total,
    handleCheckout,
    isProcessing,
    isCheckoutProcessing,
    customerHistory,
    handleBarcodeScan,
    filteredProducts,
    setQuantity,
    setDiscountingItemId,
    setPrice,
    discountingItemId,
    setLineDiscountType,
    lineDiscountType,
    lineDiscountValue,
    setLineDiscountValue,
    setLineDiscount,
    addCustomerNote,
    applyVoucher,
    discountAmount,
    pointsDiscount,
    voucherDiscount
  } = useCheckoutLogic(mergedProps as any);

  const {
    setActiveTab,
    setIsPOSCustomerModalOpen,
    setIsProductModalOpen, setEditingProduct,
    activeStaffId
  } = props;


  return (
    <div className="relative h-full flex flex-col w-full bg-nardo">
      <QuickAddProductModal 
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        barcode={newProductBarcode}
        user={user}
        onSuccess={(product) => addToCart(product, isReturnMode ? -1 : 1)}
      />
      <DeliveryRequestModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        cartTotal={total}
      />
       {/* Session Tabs */}
      {activeShift && (
        <SessionTabs 
          posSessions={posSessions}
          activeSessionId={activeSessionId}
          setActiveSessionId={setActiveSessionId}
          addNewSession={addNewSession}
          removeSession={removeSession}
          isReturnMode={isReturnMode}
          setIsReturnMode={setIsReturnMode}
          showQuickSelect={showQuickSelect}
          setShowQuickSelect={setShowQuickSelect}
        />
      )}

      {!activeShift && (
        <SessionInitialCard
          initialCashInput={initialCashInput}
          setInitialCashInput={setInitialCashInput}
          isOpeningSession={isOpeningSession}
          handleDirectOpenShift={handleDirectOpenShift}
          settings={settings}
          role={role}
          setActiveTab={setActiveTab}
        />
      )}

      <div className={cn(
        "flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden relative",
        isMobile && "overflow-y-auto"
      )}>
        <QuickSelectPanel 
          isMobile={isMobile}
          activeShift={activeShift}
          showQuickSelect={showQuickSelect}
          setShowQuickSelect={setShowQuickSelect}
          isReturnMode={isReturnMode}
          addToCart={addToCart}
          currency={settings.currency}
        />

        {/* Main Cart / Ticket View - Taking primary space */}
        <div className={cn(
          "flex-1 flex flex-col bg-workspace/20 border-r border-slate-800/40 shadow-sm relative z-0",
          isMobile ? "min-h-[50vh]" : "h-full"
        )}>
          {/* Header Search & Actions */}
          <CheckoutHeader 
            search={search}
            setSearch={setSearch}
            searchRef={searchRef}
            handleBarcodeScan={handleBarcodeScan}
            setIsScannerOpen={setIsScannerOpen}
            filteredProducts={filteredProducts}
            addToCart={addToCart}
            isReturnMode={isReturnMode}
            settings={settings}
          />

          <CartItemsList 
            cart={cart}
            cartEndRef={cartEndRef}
            selectedItemId={selectedItemId}
            setSelectedItemId={setSelectedItemId}
            removeFromCart={removeFromCart}
            setQuantity={setQuantity}
            setEditingProduct={setEditingProduct}
            setIsProductModalOpen={setIsProductModalOpen}
            setDiscountingItemId={setDiscountingItemId}
            setPrice={setPrice}
            isWholesale={isWholesale}
            permissions={permissions}
            settings={settings}
            products={products}
            quantityInputRefs={quantityInputRefs}
          />

          {/* Scanners & Price Checker Overlays */}
          {isScannerOpen && (
            <BarcodeScanner 
              onScan={handleBarcodeScan} 
              onClose={() => {
                setIsScannerOpen(false);
                setIsPriceCheckerOpen(false);
              }} 
            />
          )}

          <PriceCheckerModal
            priceCheckResult={priceCheckResult}
            onClose={() => setPriceCheckResult(null)}
            products={products}
            settings={settings}
            addToCart={addToCart}
          />

          <ItemDiscountModal
            discountingItemId={discountingItemId}
            onClose={() => setDiscountingItemId(null)}
            cart={cart}
            settings={settings}
            lineDiscountType={lineDiscountType}
            setLineDiscountType={setLineDiscountType}
            lineDiscountValue={lineDiscountValue}
            setLineDiscountValue={setLineDiscountValue}
            setLineDiscount={setLineDiscount}
          />
          <div className="flex items-center justify-between p-4 bg-slate-900/80 border-t border-slate-800/60 lg:hidden backdrop-blur-xl">
                      <div className="flex flex-col">
              <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Total</p>
              <p className="text-2xl font-black text-emerald-400 tracking-tighter drop-shadow-md">{total.toFixed(2)} <span className="text-[10px] uppercase font-serif tracking-widest opacity-60 ml-0.5">{settings.currency}</span></p>
            </div>
            <Button 
              disabled={cart.length === 0}
              onClick={() => {
                const checkoutPanel = document.getElementById('checkout-panel');
                checkoutPanel?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-neon-indigo active:scale-95 transition-transform"
            >
              Payer <ArrowRight size={18} />
            </Button>
          </div>
        </div>

        {/* Checkout Controls Panel */}
        <CheckoutControlsPanel 
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            customerSearch={customerSearch}
            setCustomerSearch={setCustomerSearch}
            customers={customers}
            isWholesale={isWholesale}
            setIsWholesale={setIsWholesale}
            useLoyaltyPoints={useLoyaltyPoints}
            setUseLoyaltyPoints={setUseLoyaltyPoints}
            settings={settings}
            total={total}
            receivedAmount={receivedAmount}
            setReceivedAmount={setReceivedAmount}
            keepExcessInBalance={keepExcessInBalance}
            setKeepExcessInBalance={setKeepExcessInBalance}
            handleCheckout={handleCheckout}
            addCustomerNote={addCustomerNote}
            setIsPOSCustomerModalOpen={setIsPOSCustomerModalOpen}
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            voucherCode={voucherCode}
            setVoucherCode={setVoucherCode}
            appliedVoucher={appliedVoucher}
            setAppliedVoucher={setAppliedVoucher}
            applyVoucher={applyVoucher}
            subtotal={subtotal}
            discountAmount={discountAmount}
            pointsDiscount={pointsDiscount}
            voucherDiscount={voucherDiscount}
            currency={settings.currency}
            cart={cart}
            isProcessing={isProcessing}
            setIsDeliveryModalOpen={setIsDeliveryModalOpen}
          />
      </div>


      {/* Success Notification */}
      <CheckoutSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        lastTransaction={lastTransaction}
        settings={settings}
        customers={customers}
        printReceipt={printReceipt}
      />
    </div>
  );
});

