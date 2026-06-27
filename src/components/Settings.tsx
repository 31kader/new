import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Gift, 
  Lock, 
  Save, 
  ChevronRight,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../translations';
import { localDb } from '../database';
import { CompanySettings } from '../types';
import { cn } from '../lib/utils';
import { DEFAULT_PERMISSIONS } from '../constants';
import { toast } from 'sonner';
import { 
  StoreSection, 
  PosSection, 
  AccountingSection, 
  StaffSection, 
  LoyaltySection, 
  SecuritySection 
} from './SettingsSections';

interface SettingsProps {
  settings: CompanySettings;
}

type SettingsSection = 'store' | 'pos' | 'accounting' | 'staff' | 'loyalty' | 'security';



export function Settings({ settings }: SettingsProps) {
const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SettingsSection>('store');
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    name: settings.name || '',
    logoUrl: settings.logoUrl || '',
    address: settings.address || '',
    phone: settings.phone || '',
    email: settings.email || '',
    taxNumber: settings.taxNumber || '',
    receiptTemplate: settings.receiptTemplate || 'standard',
    labelTemplate: settings.labelTemplate || 'standard',
    currency: settings.currency || 'DA',
    taxRate: settings.taxRate ?? 19,
    loyaltyPointsPerCurrencyUnit: settings.loyaltyPointsPerCurrencyUnit ?? 1,
    loyaltyPointValue: settings.loyaltyPointValue ?? 0.01,
    footerText: settings.footerText || '',
    accountingFormat: settings.accountingFormat || 'csv',
    lockingPeriodDays: settings.lockingPeriodDays ?? 0,
    paperFormat: settings.paperFormat || '80mm',
    silentPrinting: settings.silentPrinting ?? false,
    globalStockAlertThreshold: settings.globalStockAlertThreshold || 10,
    apiKeys: settings.apiKeys || { twilioSid: '', twilioToken: '', twilioNumber: '', googleMapsKey: '' },
    availableTaxes: settings.availableTaxes || [],
    displayPriceHT: settings.displayPriceHT ?? false,
    loyaltyTiers: settings.loyaltyTiers || [],
    enableTimeClock: settings.enableTimeClock ?? false,
    sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? 30,
    auditLogRetentionDays: settings.auditLogRetentionDays ?? 90,
    fastModeEnabled: settings.fastModeEnabled ?? false,
    allowNegativeStock: settings.allowNegativeStock ?? true,
    rolePermissions: settings.rolePermissions || DEFAULT_PERMISSIONS
  });

  useEffect(() => {
    setFormData({
      ...settings,
      name: settings.name || '',
      logoUrl: settings.logoUrl || '',
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || '',
      taxNumber: settings.taxNumber || '',
      receiptTemplate: settings.receiptTemplate || 'standard',
      labelTemplate: settings.labelTemplate || 'standard',
      currency: settings.currency || 'DA',
      taxRate: settings.taxRate ?? 19,
      loyaltyPointsPerCurrencyUnit: settings.loyaltyPointsPerCurrencyUnit ?? 1,
      loyaltyPointValue: settings.loyaltyPointValue ?? 0.01,
      footerText: settings.footerText || '',
      accountingFormat: settings.accountingFormat || 'csv',
      lockingPeriodDays: settings.lockingPeriodDays ?? 0,
      paperFormat: settings.paperFormat || '80mm',
      silentPrinting: settings.silentPrinting ?? false,
      globalStockAlertThreshold: settings.globalStockAlertThreshold || 10,
      apiKeys: settings.apiKeys || { twilioSid: '', twilioToken: '', twilioNumber: '', googleMapsKey: '' },
      availableTaxes: settings.availableTaxes || [],
      displayPriceHT: settings.displayPriceHT ?? false,
      loyaltyTiers: settings.loyaltyTiers || [],
      enableTimeClock: settings.enableTimeClock ?? false,
      sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? 30,
      auditLogRetentionDays: settings.auditLogRetentionDays ?? 90,
      fastModeEnabled: settings.fastModeEnabled ?? false,
      allowNegativeStock: settings.allowNegativeStock ?? true,
      rolePermissions: settings.rolePermissions || DEFAULT_PERMISSIONS
    });
  }, [settings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      // Save to settings/company in RTDB which triggers the Supabase sync
      await localDb.insert('settings/company', formData);
      toast.success(t("Paramètres enregistrés avec succès."));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("Erreur lors de l'enregistrement."));
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems: { id: SettingsSection; label: string; icon: any; color: string }[] = [
    { id: 'store', label: 'Magasin & Infos', icon: Store, color: 'text-blue-500' },
    { id: 'pos', label: 'Caisse & POS', icon: ShoppingCart, color: 'text-amber-500' },
    { id: 'accounting', label: 'Tarifs, Taxes & Devises', icon: DollarSign, color: 'text-emerald-500' },
    { id: 'staff', label: 'Personnel & Droits', icon: Users, color: 'text-indigo-500' },
    { id: 'loyalty', label: 'Fidélité & Promos', icon: Gift, color: 'text-rose-500' },
    { id: 'security', label: 'Sécurité & API', icon: Lock, color: 'text-slate-500' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'store':
        return <StoreSection formData={formData} setFormData={setFormData} />;
      case 'pos':
        return <PosSection formData={formData} setFormData={setFormData} />;
      case 'accounting':
        return <AccountingSection formData={formData} setFormData={setFormData} />;
      case 'staff':
        return <StaffSection formData={formData} setFormData={setFormData} />;
      case 'loyalty':
        return <LoyaltySection formData={formData} setFormData={setFormData} />;
      case 'security':
        return <SecuritySection formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 lg:p-12 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6 translate-y-[-10px] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">Settings <span className="text-white/10">OS</span></h1>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] ml-1">Système de gestion administrative Nexus Pro v1.2.6</p>
          </div>
          
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className={cn(
              "group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl",
              isSaving && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className={cn("absolute inset-0 bg-blue-500 transition-all transform translate-y-full group-hover:translate-y-0 duration-500", !isSaving && "flex", isSaving && "hidden")} />
            <AnimatePresence mode="wait">
              {isSaving ? (
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              ) : (
                <Save size={18} className="relative z-10 transition-colors group-hover:text-white" />
              )}
            </AnimatePresence>
            <span className="relative z-10 transition-colors group-hover:text-white">
              {isSaving ? 'Enregistrement...' : t('Sauvegarder les modifications')}
            </span>
          </button>
        </header>

        <main className="flex flex-col lg:flex-row gap-8 items-start relative">
          {/* Sidebar Menu */}
          <nav className="w-full lg:w-80 flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-left-4 duration-700">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "relative group flex items-center gap-4 h-16 px-6 rounded-3xl transition-all overflow-hidden",
                    isActive ? "bg-white/5 border border-white/10" : "hover:bg-white/[0.02]"
                  )}
                >
                  {/* Active Indicator Bar */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-md shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    )}
                  </AnimatePresence>

                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    isActive ? "bg-blue-500/10 text-blue-500 shadow-inner" : "bg-white/5 text-slate-600 shadow-inner"
                  )}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex flex-col items-start translate-y-[2px]">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest transition-colors",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                    )}>
                      {item.label}
                    </span>
                    <span className="text-[8px] font-black text-white/5 uppercase tracking-[0.2em]">Configuration</span>
                  </div>

                  <ChevronRight 
                    size={16} 
                    className={cn(
                      "ml-auto transition-all", 
                      isActive ? "text-blue-500 opacity-100 translate-x-0" : "text-slate-800 opacity-0 -translate-x-2"
                    )} 
                  />
                </button>
              );
            })}
            
            {/* Aesthetic Card under sidebar */}
            <div className="mt-6 p-6 bg-slate-900 border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
               <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700">
                  <Shield size={120} />
               </div>
               <p className="text-[10px] font-black text-white uppercase tracking-widest">NEXUS GUARD</p>
               <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 leading-relaxed">Protection temps réel active. Session auditée par l'agent IA.</p>
               <div className="flex gap-1 mt-4">
                  <div className="w-4 h-1 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-1.5 h-1 bg-white/10 rounded-full" />
                  <div className="w-1.5 h-1 bg-white/10 rounded-full" />
               </div>
            </div>
          </nav>

          {/* Content Pane */}
          <section className="flex-1 w-full bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 md:p-12 min-h-[600px] shadow-3xl animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="max-w-3xl space-y-12">
               {/* Section Title Header */}
               <div className="space-y-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="space-y-1">
                   {menuItems.map(item => item.id === activeSection && (
                      <div key={item.id} className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <item.icon className="text-blue-500" size={24} />
                          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{item.label}</h2>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Section ID: <span className="text-blue-500/60 font-mono tracking-tight lowercase">config_{item.id}_v3</span></p>
                      </div>
                   ))}
                 </div>
               </div>

               {/* Section Form Component */}
               <div className="relative">
                 {renderSection()}
               </div>
            </div>
          </section>
        </main>

        <footer className="pt-12 text-center border-t border-white/5">
           <div className="flex flex-col items-center gap-3 opacity-20 hover:opacity-100 transition-opacity duration-700">
              <div className="flex items-center gap-4">
                <div className="w-8 h-[1px] bg-white/40" />
                <SettingsIcon size={20} className="text-white hover:rotate-180 transition-transform duration-1000" />
                <div className="w-8 h-[1px] bg-white/40" />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] select-none">SYSTEM ADMINISTRATOR CONSOLE</p>
              <div className="flex gap-6 mt-2">
                 <span className="text-[8px] font-bold text-slate-600 uppercase">Latency: 24ms</span>
                 <span className="text-[8px] font-bold text-slate-600 uppercase">Region: Europe-West1</span>
                 <span className="text-[8px] font-bold text-slate-600 uppercase">Status: OK</span>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}