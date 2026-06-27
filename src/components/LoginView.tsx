import React from 'react';
import { 
  ShoppingCart, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Plus, 
  LogOut, 
  ChevronRight, 
  Globe, 
  ShieldCheck, 
  Star, 
  Zap, 
  Palette, 
  Languages, 
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { LoginClock } from './LoginClock';
import { Button } from './ui';

interface LoginViewProps {
  loginIdentifier: string;
  setLoginIdentifier: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isLoggingIn: boolean;
  authError: any;
  setAuthError: (val: any) => void;
  handleIdentifierLogin: (e: React.FormEvent) => void;
  handleLogin: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  isLangMenuOpen: boolean;
  setIsLangMenuOpen: (val: boolean) => void;
  t: (key: string) => string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  loginIdentifier,
  setLoginIdentifier,
  loginPassword,
  setLoginPassword,
  showPassword,
  setShowPassword,
  isLoggingIn,
  authError,
  setAuthError,
  handleIdentifierLogin,
  handleLogin,
  language,
  setLanguage,
  isLangMenuOpen,
  setIsLangMenuOpen,
  t
}) => {
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-[#080B10] text-slate-100 overflow-hidden relative font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <div className="hidden lg:flex lg:w-[45%] bg-slate-950/40 border-r border-slate-900/60 flex-col justify-between p-12 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 relative">
            <div className="absolute inset-0 rounded-2xl bg-indigo-400 animate-ping opacity-10" />
            <ShoppingCart size={22} className="text-white relative" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Nexus <span className="text-indigo-500">POS Pro</span></h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Integrated Retail OS</p>
          </div>
        </div>
        
        <div className="space-y-10 z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">v1.2.6 Stable Release</span>
            </div>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tighter">
              LA GESTION <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">RÉIMAGINÉE.</span>
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-md leading-relaxed">
              Une infrastructure de point de vente cloud-native conçue pour la performance, l'analyse en temps réel et une expérience utilisateur sans friction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <ShieldCheck size={18} />, title: "Sécurisé", desc: "Chiffrement AES-256 complet" },
              { icon: <Zap size={18} />, title: "Temps Réel", desc: "Synchronisation instantanée" },
              { icon: <Star size={18} />, title: "Analytique", desc: "Tableaux de bord prédictifs" },
              { icon: <Palette size={18} />, title: "Interface", desc: "Design industriel premium" }
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50 hover:border-indigo-500/30 transition-all group">
                <div className="text-indigo-500 mb-2.5 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h4 className="text-xs font-black uppercase tracking-tight text-white">{feature.title}</h4>
                <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest leading-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between z-10 pt-8 border-t border-slate-900/60">
          <div className="flex items-center gap-4">
            <LoginClock />
            <div className="w-px h-3 bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Serveur: Europe-West</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">
            © 2026 Nexus Integrated Systems
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative">
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest group"
            >
              <Languages size={14} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
              {language === 'fr' ? 'FR' : 'العربية'}
              <ChevronDown size={14} className={cn("transition-transform duration-300", isLangMenuOpen && "rotate-180")} />
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0F141D] border border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => { setLanguage('fr'); setIsLangMenuOpen(false); }} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left", language === 'fr' ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-white")}>
                  <span className="text-sm">🇫🇷</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Français</span>
                </button>
                <button onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} className={cn("w-full flex items-center gap-3 p-3 rounded-xl transition-all text-right", language === 'ar' ? "bg-indigo-500/10 text-indigo-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-white")}>
                  <span className="text-xs font-bold uppercase tracking-widest font-sans-arabic ml-auto">العربية</span>
                  <span className="text-sm">🇩🇿</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-[440px] space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ShoppingCart size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Nexus <span className="text-indigo-500">POS</span></h2>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {t("ACCÈS SYSTÈME")}
            </h3>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
              {t("Authentification requise pour continuer")}
            </p>
          </div>

          <form onSubmit={handleIdentifierLogin} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">{t("IDENTIFIANT OU E-MAIL")}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-[#131924] border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                    placeholder={t("E-mail, Nom d'utilisateur ou Tél")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">{t("MOT DE PASSE")}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#131924] border border-slate-800/60 rounded-2xl py-4 pl-12 pr-12 text-white text-sm font-medium placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-7 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] relative overflow-hidden group"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {t("VALIDER L'ACCÈS")}
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </div>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#080B10] px-4 text-slate-600">{t("OU CONTINUER AVEC")}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#131924] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-xs font-bold transition-all active:scale-[0.98]"
            >
              <Globe size={16} className="text-indigo-400" />
              <span>GOOGLE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
