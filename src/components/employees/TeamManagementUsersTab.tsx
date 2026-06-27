import React from 'react';
import { ShieldCheck, CreditCard as CardIcon, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Employee, UserProfile } from '../../types';
import { Card, ConfirmDialog, Modal } from '../ui';
import { cn } from '../../lib/utils';
import { roles } from './useTeamManagementLogic';
import { auth } from '../../database';

interface TeamManagementUsersTabProps {
  users: UserProfile[];
  employees: Employee[];
  isProcessing: boolean;
  handleUpdateUserRole: (userId: string, newRole: 'admin' | 'manager' | 'cashier' | 'delivery' | 'picker') => void;
  handleDeleteUser: (userId: string) => void;
  setViewedUser: (user: UserProfile | null) => void;
  viewedUser: UserProfile | null;
  isUserDeleteConfirmOpen: boolean;
  setIsUserDeleteConfirmOpen: (open: boolean) => void;
  confirmDeleteUser: () => void;
}

export function TeamManagementUsersTab({
  users,
  employees,
  isProcessing,
  handleUpdateUserRole,
  handleDeleteUser,
  setViewedUser,
  viewedUser,
  isUserDeleteConfirmOpen,
  setIsUserDeleteConfirmOpen,
  confirmDeleteUser
}: TeamManagementUsersTabProps) {
  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex gap-6 relative overflow-hidden group"
      >
        <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-neon-indigo/20 shrink-0">
          <ShieldCheck size={28} />
        </div>
        <div className="text-[11px] font-black tracking-widest uppercase relative z-10">
          <p className="text-indigo-400 mb-2 italic">Différence entre "Personnel" et "Accès"</p>
          <p className="text-white/60 leading-relaxed max-w-2xl">
            L'onglet <span className="text-white">Personnel</span> gère l'aspect administratif, tandis que les <span className="text-white">Comptes</span> définissent qui peut s'authentifier et avec quel niveau de pouvoir.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none" />
      </motion.div>

      <Card className="overflow-hidden bg-white/5 border-white/5 backdrop-blur-md rounded-[2.5rem] shadow-2xl">
        <div className="overflow-x-auto text-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-white/30 uppercase border-b border-white/5">
                <th className="p-6 text-[10px] font-black tracking-[0.2em]">UTILISATEUR</th>
                <th className="p-6 text-[10px] font-black tracking-[0.2em]">IDENTIFIANTS</th>
                <th className="p-6 text-[10px] font-black tracking-[0.2em]">MOT DE PASSE</th>
                <th className="p-6 text-[10px] font-black tracking-[0.2em]">RÔLE & ACCÈS</th>
                <th className="p-6 text-[10px] font-black tracking-[0.2em]">STATUT</th>
                <th className="p-6 text-[10px] font-black tracking-[0.2em] text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u, idx) => {
                const employee = employees.find(e => e.id === u.employeeId);
                return (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black/40 border border-white/10 text-white rounded-2xl flex items-center justify-center font-black text-lg group-hover:border-indigo-400 transition-colors shadow-xl">
                          {u.displayName.charAt(0)}
                        </div>
                        <div>
                           <span className="font-black text-white uppercase tracking-widest block">{u.displayName}</span>
                           <span className="text-[9px] text-white/20 tracking-[0.2em]">UID: {u.uid?.slice(0, 12)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        {u.email && <span className="text-[11px] font-black text-white/60 tracking-widest">{u.email}</span>}
                        {u.phone && <span className="text-[10px] font-black text-indigo-400 tracking-[0.2em]">TEL: {u.phone}</span>}
                        {!u.email && !u.phone && <span className="text-[9px] text-white/20 italic tracking-widest font-black uppercase">Aucun identifiant</span>}
                      </div>
                    </td>
                    <td className="p-6">
                      {u.password ? (
                        <div className="flex items-center gap-3">
                          <code className="text-[10px] font-black tracking-[0.2em] bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-emerald-400 shadow-inner">
                            {u.password}
                          </code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(u.password || '');
                              alert("Mot de passe copié !");
                            }}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-all border border-white/5"
                            title="Copier"
                          >
                            <CardIcon size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest italic">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40" />
                           OAuth Google
                         </div>
                      )}
                    </td>
                    <td className="p-6">
                      <select 
                        value={u.role}
                        disabled={isProcessing}
                        onChange={(e) => handleUpdateUserRole(u.id!, e.target.value as any)}
                        className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        {roles.map(r => (
                          <option key={r} value={r} className="bg-slate-900">{r.toUpperCase()}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border",
                        employee?.status === 'inactive' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        {employee?.status?.toUpperCase() || 'ACTIF'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-indigo-400 rounded-xl transition-all border border-white/5 shadow-lg" onClick={() => setViewedUser(u)}>
                          <Eye size={18} />
                        </button>
                        <button 
                          className={cn(
                            "p-3 rounded-xl transition-all border shadow-lg", 
                            u.uid === auth.currentUser?.uid 
                              ? "bg-white/5 text-white/10 border-white/5 cursor-not-allowed" 
                              : "bg-white/5 hover:bg-rose-500/10 text-white/40 hover:text-rose-500 border-white/5 hover:border-rose-500/30"
                          )}
                          onClick={() => u.uid !== auth.currentUser?.uid && handleDeleteUser(u.id!)}
                          disabled={u.uid === auth.currentUser?.uid}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog 
        isOpen={isUserDeleteConfirmOpen}
        onClose={() => setIsUserDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteUser}
        title="SUPPRIMER ACCÈS"
        message="Cette action désactivera immédiatement la clé d'accès Nexus pour cet utilisateur. Les données de l'employé lié resteront en archive."
      />

      {viewedUser && (
        <Modal
          isOpen={!!viewedUser}
          onClose={() => setViewedUser(null)}
          title="IDENTITY PROFILE"
        >
          <div className="p-2 space-y-8 text-left text-white">
             <div className="flex items-center gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
               <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.8rem] flex items-center justify-center font-black text-3xl shadow-neon-indigo/40 border border-indigo-400/30">
                 {viewedUser.displayName.charAt(0)}
               </div>
               <div>
                  <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{viewedUser.displayName}</h4>
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-1">{viewedUser.role}</p>
               </div>
             </div>

             <div className="space-y-4">
               {[
                 { label: 'Nexus UID', value: viewedUser.uid || 'N/A', mono: true },
                 { label: 'Verified Email', value: viewedUser.email || 'N/A' },
                 { label: 'Last Authentication', value: viewedUser.lastLogin ? format(new Date(viewedUser.lastLogin), 'dd MMMM yyyy @ HH:mm', { locale: fr }).toUpperCase() : 'NEVER REGISTERED' }
               ].map((item, i) => (
                 <div key={i} className="p-5 bg-black/40 border border-white/10 rounded-[1.5rem] flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{item.label}</span>
                    <span className={cn("text-xs font-black text-white tracking-widest uppercase", item.mono && "font-mono text-indigo-400 tracking-normal")}>{item.value}</span>
                 </div>
               ))}
             </div>

             <button className="w-full py-5 rounded-[1.5rem] bg-white/10 text-white font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all border border-white/10 shadow-xl" onClick={() => setViewedUser(null)}>
               CLOSE PROFILE
             </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
