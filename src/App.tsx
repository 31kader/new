import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';

import { Toaster, toast } from 'sonner';
import { useDataFetching } from './hooks/useDataFetching';
import { useAuthUser } from './hooks/useAuthUser';
import { useCategoryBrand } from './hooks/useCategoryBrand';
import { useStaffManagement } from './hooks/useStaffManagement';
import { useCartStore } from './store/useCartStore';
import { useAppInitialization } from './hooks/useAppInitialization';
import { useCartSync } from './hooks/useCartSync';
import { useAuthActions } from './hooks/useAuthActions';
import { useTranslation } from './translations';
import { useAppPermissionsAndTheme } from './hooks/useAppPermissionsAndStats';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useAuthStore } from './store/useAuthStore';
import { useCoreStore } from './store/useCoreStore';
import { useTransactionStore } from './store/useTransactionStore';
import { usePeopleStore } from './store/usePeopleStore';
import { useInventoryStore } from './store/useInventoryStore';
import { useFinanceStore } from './store/useFinanceStore';

import { 
  handleDatabaseError,
  OperationType, localDb } from './database';

import { 
  RolePermissions, Transaction, PurchaseOrder,
} from './types';

import { 
  generateUniqueId, logAction
} from './lib/utils';
import { playNotificationSound } from './services/notificationService';
import { 
  printPurchaseOrder, 
  printHistory,
  printPurchaseVoucher,
  printReceipt,
  printLabel
} from './services/printService';

import { DEFAULT_PERMISSIONS } from './constants';

// UI Components
import { SyncIndicator } from './components/SyncIndicator';
import { UnauthorizedView } from './components/UnauthorizedView';
import { LoginView } from './components/LoginView';
import { MainAppContent } from './components/MainAppContent';
import { TabRenderer } from './components/TabRenderer';
import { AppModals } from './components/AppModals';

// Legacy / Other views
import { SupplierLogin } from './components/SupplierLogin';
import { CustomerLogin } from './components/CustomerLogin';
import { CameraLogin } from './components/CameraLogin';
import { SupplierDashboard } from './components/SupplierDashboard';
import { CustomerDashboard } from './components/CustomerDashboard';
import { DeliveryDashboard } from './components/DeliveryDashboard';

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const { 
    isMobile, isOnline, isStandalone, deferredPrompt, 
    setDeferredPrompt, appMode, setAppMode,
    syncInfo, bgSyncActive, bgPendingChanges
  } = useAppInitialization();

  const [isMobileOverlayOpen, setIsMobileOverlayOpen] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [currentSupplier, setCurrentSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(() => {
    const cachedOffline = localStorage.getItem('nexus_active_offline_session');
    const cachedOnline = localStorage.getItem('nexus_active_online_session');
    return !(cachedOffline || cachedOnline);
  });

  const user = useAuthStore(s => s.user);
  const profile = useAuthStore(s => s.profile);
  const isLoggingIn = useAuthStore(s => s.isLoggingIn);
  const isUnauthorized = useAuthStore(s => s.isUnauthorized);
  const authError = useAuthStore(s => s.authError);
  const setAuthError = useAuthStore(s => s.setAuthError);
  const setProfile = useAuthStore(s => s.setProfile);

  const settings = useCoreStore(s => s.settings);
  const isDataLoading = useCoreStore(s => s.isDataLoading);

  const EMPTY_ARRAY = useRef<any[]>([]);
  const products = useCoreStore(s => appMode === 'supplier' ? s.products : EMPTY_ARRAY.current);
  const categories = useCoreStore(s => appMode === 'supplier' ? s.categories : EMPTY_ARRAY.current);
  const brands = useCoreStore(s => appMode === 'supplier' ? s.brands : EMPTY_ARRAY.current);

  const transactions = useTransactionStore(s => appMode === 'customer' ? s.transactions : EMPTY_ARRAY.current);
  const purchaseOrders = useTransactionStore(s => appMode === 'supplier' ? s.purchaseOrders : EMPTY_ARRAY.current);
  const onlineOrders = useTransactionStore(s => appMode === 'delivery' ? s.onlineOrders : EMPTY_ARRAY.current);

  const purchases = useFinanceStore(s => appMode === 'supplier' ? s.purchases : EMPTY_ARRAY.current);
  const supplierPayments = useFinanceStore(s => appMode === 'supplier' ? s.supplierPayments : EMPTY_ARRAY.current);

  const {
    handleLogin, handleAuthError
  } = useAuthUser(appMode, setLoading);

  const {
    handleIdentifierLogin, handleLogout
  } = useAuthActions(t);

  useDataFetching(user, profile, appMode, currentSupplier, currentCustomer, loading, playNotificationSound);

  const {
    isCategoryModalOpen, setIsCategoryModalOpen,
    isBrandModalOpen, setIsBrandModalOpen,
    editingCategory, setEditingCategory,
    editingBrand, setEditingBrand,
    newCategoryName, setNewCategoryName,
    parentCategoryId, setParentCategoryId,
    categoryImageUrl, setCategoryImageUrl,
    newBrandName, setNewBrandName,
    newBrandLogo, setNewBrandLogo,
    newBrandDesc, setNewBrandDesc,
    openCategoryModal, openBrandModal,
    handleSaveCategory, handleDeleteCategory,
    handleSaveBrand, handleDeleteBrand
  } = useCategoryBrand();

  const {
    isAddUserModalOpen, setIsAddUserModalOpen,
    activeStaffId, setActiveStaffId,
    handleAddStaffManual
  } = useStaffManagement();

  const {
    autoSyncOrders,
    setAutoSyncOrders,
    theme,
    setTheme,
    isThemeMenuOpen,
    setIsThemeMenuOpen,
    isLangMenuOpen,
    setIsLangMenuOpen,
    permissions,
    isOwner,
    canAccess,
    currentEmployee,
    isClockedIn,
    handleClockInOut
  } = useAppPermissionsAndTheme();

  const { syncOrder } = useCartSync(autoSyncOrders);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      // Check for updates periodically
      if (r) {
        const intervalId = setInterval(() => {
          r.update();
        }, 60 * 60 * 1000); // Check every hour
        // Store to allow cleanup if needed
        (window as any).__swUpdateIntervalId = intervalId;
      }
    },
    onRegisterError(error: any) {
      console.warn('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast("Une nouvelle mise à jour est disponible !", {
        description: "L'application a été mise à jour en arrière-plan. Rechargez pour appliquer.",
        duration: Infinity,
        action: {
          label: 'Rafraîchir',
          onClick: () => updateServiceWorker(true)
        },
        cancel: {
          label: 'Plus tard',
          onClick: () => setNeedRefresh(false)
        }
      });
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  const getInitialTab = useCallback(() => {
    if (profile?.role === 'camera_agent') return 'camera';
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash.includes('=') || hash.includes('&')) {
      return 'checkout';
    }
    return hash;
  }, [profile]);

  const [activeTab, setActiveTabState] = useState(getInitialTab());

  const setActiveTab = useCallback((tab: string) => {
    window.location.hash = tab;
    setActiveTabState(tab);
  }, []);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const {
    posSessions, setPosSessions,
    activeSessionId, setActiveSessionId,
    getCart, setCart,
    getSelectedCustomer, setSelectedCustomer,
    loadTransactionToCart,
    isWholesale, setIsWholesale,
    deliveryMethod, setDeliveryMethod
  } = useCartStore();

  const cart = getCart();
  const selectedCustomer = getSelectedCustomer();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [selectedTransactionForReturn, setSelectedTransactionForReturn] = useState<Transaction | null>(null);
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState<Transaction | null>(null);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isExpirationModalOpen, setIsExpirationModalOpen] = useState(false);
  const [isStockAdjustmentModalOpen, setIsStockAdjustmentModalOpen] = useState(false);
  const [isPriceCheckerModalOpen, setIsPriceCheckerModalOpen] = useState(false);
  const [isPOSCustomerModalOpen, setIsPOSCustomerModalOpen] = useState(false);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const [viewingPurchaseVoucher, setViewingPurchaseVoucher] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleCreatePurchaseOrder = useCallback(async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await localDb.push('purchaseOrders', {
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success('Commande créée avec succès');
    } catch (err) {
      handleDatabaseError(err, OperationType.WRITE, 'purchaseOrders');
      throw err;
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-industrial-950">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Initializing Systems...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized && !isOwner) {
    return <UnauthorizedView user={user} profile={profile} isOwner={isOwner} handleLogout={() => handleLogout(user)} />;
  }

  if (!user && appMode === 'pos') {
    return (
      <LoginView 
        loginIdentifier={loginIdentifier} setLoginIdentifier={setLoginIdentifier}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        showPassword={showPassword} setShowPassword={setShowPassword}
        isLoggingIn={isLoggingIn} authError={authError} setAuthError={setAuthError}
        handleIdentifierLogin={(e) => { e.preventDefault(); handleIdentifierLogin(loginIdentifier, loginPassword); }}
        handleLogin={handleLogin}
        language={language} setLanguage={setLanguage as any}
        isLangMenuOpen={isLangMenuOpen} setIsLangMenuOpen={setIsLangMenuOpen}
        t={t}
      />
    );
  }

  // Handle other modes
  if (!user) {
    if (appMode === 'customer') return <CustomerLogin onLogin={setCurrentCustomer} />;
    if (appMode === 'supplier') return <SupplierLogin onLogin={setCurrentSupplier} />;
    if (appMode === 'camera') return <CameraLogin onLogin={setProfile} />;
  }
  
  if (user && appMode === 'customer') return <CustomerDashboard customer={currentCustomer!} transactions={transactions} settings={settings} onLogout={() => handleLogout(user)} />;
  if (user && appMode === 'supplier') return (
    <SupplierDashboard 
      supplier={currentSupplier!} 
      onLogout={() => handleLogout(user)} 
      products={products} 
      categories={categories} 
      brands={brands} 
      settings={settings} 
      setActiveTab={setActiveTab}
      handleCreatePurchaseOrder={handleCreatePurchaseOrder} 
      purchaseOrders={purchaseOrders}
      user={user}
      setIsProductModalOpen={setIsProductModalOpen}
      setEditingProduct={setEditingProduct}
      editingProduct={editingProduct}
      isProductModalOpen={isProductModalOpen}
      purchases={purchases}
      supplierPayments={supplierPayments}
      setViewingPurchaseVoucher={setViewingPurchaseVoucher}
    />
  );
  if (user && appMode === 'delivery') return <DeliveryDashboard user={user} orders={onlineOrders} settings={settings} />;

  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-industrial-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" /></div>}>
      <Toaster position="top-right" richColors closeButton theme={theme === 'light' ? 'light' : 'dark'} />
      <SyncIndicator isOnline={isOnline} syncInfo={syncInfo} bgSyncActive={bgSyncActive} bgPendingChanges={bgPendingChanges} />
      
      <MainAppContent
        activeTab={activeTab} setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile} isMobileOverlayOpen={isMobileOverlayOpen} setIsMobileOverlayOpen={setIsMobileOverlayOpen}
        isDataLoading={isDataLoading}
        setIsLowStockModalOpen={setIsLowStockModalOpen} setIsExpirationModalOpen={setIsExpirationModalOpen}
        handleClockInOut={handleClockInOut}
        language={language} setLanguage={setLanguage as any} isLangMenuOpen={isLangMenuOpen} setIsLangMenuOpen={setIsLangMenuOpen}
        theme={theme} setTheme={setTheme} isThemeMenuOpen={isThemeMenuOpen} setIsThemeMenuOpen={setIsThemeMenuOpen}
        activeStaffId={activeStaffId} t={t} toast={toast}
        permissions={permissions} handleLogout={handleLogout} handleInstallApp={handleInstallApp}
        deferredPrompt={deferredPrompt} setIsPriceCheckerModalOpen={setIsPriceCheckerModalOpen}
      >
        <TabRenderer 
          activeTab={activeTab}
          cart={cart} setCart={setCart}
          setActiveTab={setActiveTab}
          setIsPOSCustomerModalOpen={setIsPOSCustomerModalOpen}
          selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
          posSessions={posSessions} setPosSessions={setPosSessions}
          activeSessionId={activeSessionId} setActiveSessionId={setActiveSessionId}
          setIsProductModalOpen={setIsProductModalOpen} setEditingProduct={setEditingProduct}
          isWholesale={isWholesale} setIsWholesale={setIsWholesale}
          deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
          activeStaffId={activeStaffId}
          canAccess={canAccess}
          onUpdateProduct={async (id: string, updates: any) => {
            try { 
              const prod = useCoreStore.getState().products.find(p => p.id === id);
              if (prod) {
                await localDb.insert(`products/${id}`, { ...prod, ...updates, updatedAt: new Date().toISOString() }); 
              } else {
                await localDb.update(`products/${id}`, { ...updates, updatedAt: new Date().toISOString() }); 
              }
            } catch (err) { handleDatabaseError(err, OperationType.WRITE, 'products'); }
          }}
          onAdjustStock={(p: any) => { setEditingProduct(p); setIsStockAdjustmentModalOpen(true); }}
          onEditProduct={(p: any) => { setEditingProduct(p); setIsProductModalOpen(true); }}
          onAddCategory={openCategoryModal} onEditCategory={openCategoryModal} onDeleteCategory={(cat: any) => handleDeleteCategory(cat)}
          onAddBrand={openBrandModal} onEditBrand={openBrandModal} onDeleteBrand={(brand: any) => handleDeleteBrand(brand)}
          setIsAddUserModalOpen={setIsAddUserModalOpen}
          onReturn={(t: any) => { setSelectedTransactionForReturn(t); setIsReturnModalOpen(true); }}
          onMarkAsDelivered={async (t: any) => { await localDb.insert(`transactions/${t.id}`, { ...t, status: 'delivered' }); }}
          onEdit={(t: any) => { setSelectedTransactionForEdit(t); setIsEditTransactionModalOpen(true); }}
          onRestore={(t: any) => loadTransactionToCart(t, setActiveTab)}
          handlePrintPurchaseHistory={(f: any) => printHistory(f, settings)}
          printPurchaseOrder={printPurchaseOrder}
          syncOrder={syncOrder} autoSyncOrders={autoSyncOrders} setAutoSyncOrders={setAutoSyncOrders}
          isStandalone={isStandalone} deferredPrompt={deferredPrompt} handleInstallApp={handleInstallApp}
          setViewingPurchaseVoucher={setViewingPurchaseVoucher}
        />
      </MainAppContent>

      <AppModals 
        isReturnModalOpen={isReturnModalOpen} setIsReturnModalOpen={setIsReturnModalOpen}
        selectedTransactionForReturn={selectedTransactionForReturn} setSelectedTransactionForReturn={setSelectedTransactionForReturn}
        isEditTransactionModalOpen={isEditTransactionModalOpen} setIsEditTransactionModalOpen={setIsEditTransactionModalOpen}
        selectedTransactionForEdit={selectedTransactionForEdit} setSelectedTransactionForEdit={setSelectedTransactionForEdit}
        isCategoryModalOpen={isCategoryModalOpen} setIsCategoryModalOpen={setIsCategoryModalOpen}
        editingCategory={editingCategory} setEditingCategory={setEditingCategory}
        newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName}
        parentCategoryId={parentCategoryId} setParentCategoryId={setParentCategoryId}
        categoryImageUrl={categoryImageUrl} setCategoryImageUrl={setCategoryImageUrl}
        handleSaveCategory={handleSaveCategory} handleDeleteCategory={handleDeleteCategory}
        isBrandModalOpen={isBrandModalOpen} setIsBrandModalOpen={setIsBrandModalOpen}
        editingBrand={editingBrand} setEditingBrand={setEditingBrand}
        newBrandName={newBrandName} setNewBrandName={setNewBrandName}
        newBrandLogo={newBrandLogo} setNewBrandLogo={setNewBrandLogo}
        newBrandDesc={newBrandDesc} setNewBrandDesc={setNewBrandDesc}
        handleSaveBrand={handleSaveBrand}
        isPriceCheckerModalOpen={isPriceCheckerModalOpen} setIsPriceCheckerModalOpen={setIsPriceCheckerModalOpen}
        isPOSCustomerModalOpen={isPOSCustomerModalOpen} setIsPOSCustomerModalOpen={setIsPOSCustomerModalOpen}
        handlePOSCustomerCreated={(c: any) => { setSelectedCustomer(c); setIsPOSCustomerModalOpen(false); }}
        isProductModalOpen={isProductModalOpen} setIsProductModalOpen={setIsProductModalOpen}
        editingProduct={editingProduct} setEditingProduct={setEditingProduct} setActiveTab={setActiveTab}
        isAddUserModalOpen={isAddUserModalOpen} setIsAddUserModalOpen={setIsAddUserModalOpen}
        handleAddStaffManual={(name: string, email: string, role: string, phone: string, password?: string) => handleAddStaffManual(name, email, role, phone, password)}
        viewingPurchaseVoucher={viewingPurchaseVoucher} setViewingPurchaseVoucher={setViewingPurchaseVoucher}
        printPurchaseVoucher={printPurchaseVoucher}
        isLowStockModalOpen={isLowStockModalOpen} setIsLowStockModalOpen={setIsLowStockModalOpen}
        isExpirationModalOpen={isExpirationModalOpen} setIsExpirationModalOpen={setIsExpirationModalOpen}
        isStockAdjustmentModalOpen={isStockAdjustmentModalOpen} setIsStockAdjustmentModalOpen={setIsStockAdjustmentModalOpen}
      />

    </Suspense>
  );
}

