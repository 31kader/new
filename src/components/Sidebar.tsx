import React from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingCart, ShoppingBag, Users, History, RotateCcw, Tag, Eye, 
  Package, CalendarClock, FolderTree, Truck, TrendingDown, 
  LayoutDashboard, Brain, FileText, Wallet, UserCog, ShieldCheck, 
  Camera, Settings as SettingsIcon, Database, HelpCircle, Download, 
  Menu, X, LogOut 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from '../translations';
import { RolePermissions, CompanySettings } from '../types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
  href?: string;
}

function NavItem({ icon, label, active, onClick, collapsed, href }: NavItemProps) {
  return (
    <a
      href={href || "#"}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative",
        active 
          ? "bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
      )}
    >
      <div className={cn(
        "transition-transform duration-300",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </div>
      {!collapsed && <span className="font-bold text-[11px] uppercase tracking-wider">{label}</span>}
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
        />
      )}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/5">
          {label}
        </div>
      )}
    </a>
  );
}

interface SidebarProps {
  user: any;
  profile: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isMobile: boolean;
  isMobileOverlayOpen: boolean;
  setIsMobileOverlayOpen: (open: boolean) => void;
  permissions: RolePermissions;
  settings: CompanySettings;
  isCameraAgent: boolean;
  isAdmin: boolean;
  isManager: boolean;
  handleLogout: () => void;
  handleInstallApp: () => void;
  deferredPrompt: any;
  setIsPriceCheckerModalOpen: (open: boolean) => void;
}

export const Sidebar = ({
  user,
  profile,
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  isMobile,
  isMobileOverlayOpen,
  setIsMobileOverlayOpen,
  permissions,
  settings,
  isCameraAgent,
  isAdmin,
  isManager,
  handleLogout,
  handleInstallApp,
  deferredPrompt,
  setIsPriceCheckerModalOpen
}: SidebarProps) => {
  const { t } = useTranslation();
  const canAccess = (perm: keyof RolePermissions) => permissions[perm];

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isMobile ? (isMobileOverlayOpen ? '100%' : 0) : (isSidebarOpen ? 260 : 80),
        x: isMobile && !isMobileOverlayOpen ? -300 : 0
      }}
      className={cn(
        "border-r flex flex-col h-full z-40 bg-workspace border-slate-800/40",
        isMobile ? "fixed inset-y-0 left-0" : "relative"
      )}
    >
      {isMobile && isMobileOverlayOpen && (
        <button 
          onClick={() => setIsMobileOverlayOpen(false)}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-slate-400 z-50"
        >
          <X size={20} />
        </button>
      )}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/40">
        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <ShoppingCart size={20} />
        </div>
        {(isSidebarOpen || isMobile) && <span className="font-black text-xl truncate text-white tracking-tighter">Nexus POS</span>}
      </div>

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar text-left rtl:text-right">
        {/* Ventes */}
        <div className="space-y-1">
          {(isSidebarOpen || isMobile) && <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">{t("Ventes")}</h3>}
          <NavItem href="#checkout" icon={<ShoppingCart size={20} />} label={t("Caisse")} active={activeTab === 'checkout'} onClick={() => { setActiveTab('checkout'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />
          {canAccess('canAccessOnlineOrders') && <NavItem href="#orders" icon={<ShoppingBag size={20} />} label={t("Commandes")} active={activeTab === 'orders'} onClick={() => { setActiveTab('orders'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessCustomers') && <NavItem href="#customers" icon={<Users size={20} />} label={t("Clients")} active={activeTab === 'customers'} onClick={() => { setActiveTab('customers'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessSales') && <NavItem href="#transactions" icon={<History size={20} />} label={t("Transactions")} active={activeTab === 'transactions'} onClick={() => { setActiveTab('transactions'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessReturns') && <NavItem href="#returns" icon={<RotateCcw size={20} />} label={t("Retours")} active={activeTab === 'returns'} onClick={() => { setActiveTab('returns'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessPromotions') && <NavItem href="#promotions" icon={<Tag size={20} />} label={t("Promotions")} active={activeTab === 'promotions'} onClick={() => { setActiveTab('promotions'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          <NavItem icon={<Eye size={20} />} label={t("Vérificateur")} active={false} onClick={() => { setIsPriceCheckerModalOpen(true); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />
        </div>

        {/* Gestion */}
        <div className="space-y-1">
          {(isSidebarOpen || isMobile) && <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">{t("Gestion")}</h3>}
          {canAccess('canAccessInventory') && <NavItem href="#inventory" icon={<Package size={20} />} label={t("Inventaire")} active={activeTab === 'inventory'} onClick={() => { setActiveTab('inventory'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessInventory') && <NavItem href="#expiry" icon={<CalendarClock size={20} />} label={t("Suivi Péremption")} active={activeTab === 'expiry'} onClick={() => { setActiveTab('expiry'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessInventory') && <NavItem href="#inventory_settings" icon={<FolderTree size={20} />} label={t("Classifications")} active={activeTab === 'inventory_settings'} onClick={() => { setActiveTab('inventory_settings'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessVouchers') && <NavItem href="#vouchers" icon={<Tag size={20} />} label={t("Cartes Cadeaux & Bons")} active={activeTab === 'vouchers'} onClick={() => { setActiveTab('vouchers'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessSuppliers') && <NavItem href="#suppliers" icon={<Truck size={20} />} label={t("Fournisseurs")} active={activeTab === 'suppliers'} onClick={() => { setActiveTab('suppliers'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessPurchases') && <NavItem href="#purchases" icon={<ShoppingBag size={20} />} label={t("Achats")} active={activeTab === 'purchases'} onClick={() => { setActiveTab('purchases'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessExpenses') && <NavItem href="#expenses" icon={<TrendingDown size={20} />} label={t("Dépenses")} active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
        </div>

        {/* Administration */}
        <div className="space-y-1">
          {(isSidebarOpen || isMobile) && <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2 mb-2">{t("Administration")}</h3>}
          {canAccess('canAccessAnalytics') && <NavItem href="#dashboard" icon={<LayoutDashboard size={20} />} label={t("Tableau de bord")} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessAnalytics') && <NavItem href="#ai_assistant" icon={<Brain size={20} />} label={t("Assistant IA")} active={activeTab === 'ai_assistant'} onClick={() => { setActiveTab('ai_assistant'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessAnalytics') && <NavItem href="#reports" icon={<FileText size={20} />} label={t("Rapports")} active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessShifts') && <NavItem href="#shifts" icon={<Wallet size={20} />} label={t("Clôture")} active={activeTab === 'shifts'} onClick={() => { setActiveTab('shifts'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessEmployees') && <NavItem href="#employees" icon={<UserCog size={20} />} label={t("Personnel & Accès")} active={activeTab === 'employees'} onClick={() => { setActiveTab('employees'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessAuditLogs') && <NavItem href="#audit_logs" icon={<ShieldCheck size={20} />} label={t("Audit")} active={activeTab === 'audit_logs'} onClick={() => { setActiveTab('audit_logs'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {(isCameraAgent || isAdmin || isManager) && settings.enableCameraPortal !== false && <NavItem href="#camera" icon={<Camera size={20} />} label={t("Audit Caméra")} active={activeTab === 'camera'} onClick={() => { setActiveTab('camera'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessSettings') && <NavItem href="#settings" icon={<SettingsIcon size={20} />} label={t("Paramètres")} active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          {canAccess('canAccessSettings') && <NavItem href="#archives" icon={<Database size={20} />} label={t("Clôture de Mois")} active={activeTab === 'archives'} onClick={() => { setActiveTab('archives'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />}
          <NavItem href="#help" icon={<HelpCircle size={20} />} label={t("Aide")} active={activeTab === 'help'} onClick={() => { setActiveTab('help'); setIsMobileOverlayOpen(false); }} collapsed={!isSidebarOpen && !isMobile} />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/40 space-y-2">
        {deferredPrompt && (
          <button 
            onClick={handleInstallApp}
            className="w-full p-2.5 rounded-xl flex items-center justify-center gap-3 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 transition-all font-black text-[10px] uppercase tracking-widest ring-1 ring-indigo-400/20"
          >
            <Download size={18} />
            {(isSidebarOpen || isMobile) && "Installer l'App"}
          </button>
        )}
        {!isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 rounded-lg flex items-center justify-center transition-colors hover:bg-slate-800/40 text-slate-500"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="mt-4 flex items-center gap-3 p-2">
          {user.photoURL ? (
            <img src={user.photoURL} className="w-8 h-8 rounded-full border border-slate-800" referrerPolicy="no-referrer" alt={user.displayName} />
          ) : (
            <div className="w-8 h-8 bg-slate-800 text-slate-400 border border-slate-700/50 rounded-full flex items-center justify-center font-black text-[10px]">
              {user.displayName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {(isSidebarOpen || isMobile) && (
            <div className="flex-1 truncate">
              <p className="text-sm font-black truncate text-white uppercase tracking-tight">{user.displayName}</p>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-industrial-500 truncate uppercase font-black tracking-widest">{profile?.role}</p>
                <span className="text-[8px] px-1 bg-industrial-800 text-indigo-400 rounded font-bold border border-industrial-700">v1.2.6</span>
              </div>
            </div>
          )}
          {(isSidebarOpen || isMobile) && (
            <button onClick={handleLogout} className="p-2 text-industrial-500 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
