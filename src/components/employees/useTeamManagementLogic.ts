import { useState, useCallback } from 'react';
import { supabase } from '../../supabase';
import { CompanySettings, UserProfile, RolePermissions } from '../../types';
import { DEFAULT_PERMISSIONS } from '../../constants';
import { localDb } from '../../database';

const OWNER_EMAIL = (import.meta as any).env?.VITE_OWNER_EMAIL || 'hrskader305@gmail.com';

export const permissionKeys: (keyof RolePermissions)[] = [
  'canAccessInventory',
  'canAccessSales',
  'canAccessCustomers',
  'canAccessEmployees',
  'canAccessSuppliers',
  'canAccessSettings',
  'canAccessOnlineOrders',
  'canAccessExpenses',
  'canAccessReturns',
  'canAccessPurchases',
  'canAccessPromotions',
  'canAccessVouchers',
  'canAccessAnalytics',
  'canAccessShifts',
  'canAccessAuditLogs',
  'canModifyPrices',
  'canApplyDiscount',
  'canVoidTransaction',
  'canManageUsers'
];

export const permissionLabels: Record<keyof RolePermissions, string> = {
  canAccessInventory: 'Inventaire',
  canAccessSales: 'Ventes / Caisse',
  canAccessCustomers: 'Clients',
  canAccessEmployees: 'Employés & Équipe',
  canAccessSuppliers: 'Fournisseurs',
  canAccessSettings: 'Paramètres Système',
  canAccessOnlineOrders: 'Commandes en Ligne',
  canAccessExpenses: 'Dépenses',
  canAccessReturns: 'Retours Produits',
  canAccessPurchases: 'Achats / Entrées Stock',
  canAccessPromotions: 'Promotions',
  canAccessVouchers: 'Bons d\'Achat',
  canAccessAnalytics: 'Analytique & Rapports',
  canAccessShifts: 'Sessions de Caisse',
  canAccessAuditLogs: 'Journaux d\'Audit',
  canModifyPrices: 'Modifier les Prix',
  canApplyDiscount: 'Appliquer des Remises',
  canVoidTransaction: 'Annuler des Transactions',
  canManageUsers: 'Gérer les Utilisateurs'
};

export const roles: ('admin' | 'manager' | 'cashier' | 'delivery' | 'picker')[] = ['admin', 'manager', 'cashier', 'delivery', 'picker'];

export function useTeamManagementLogic({
  settings,
  users
}: {
  settings: CompanySettings;
  users: UserProfile[];
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserDeleteConfirmOpen, setIsUserDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [viewedUser, setViewedUser] = useState<UserProfile | null>(null);

  const handleTogglePermission = useCallback(async (role: 'admin' | 'manager' | 'cashier' | 'delivery' | 'picker', permission: keyof RolePermissions) => {
    if (role === 'admin') return; // Admin always has all permissions
    
    setIsProcessing(true);
    try {
      const currentPermissions = settings.rolePermissions?.[role] || DEFAULT_PERMISSIONS[role];
      const newPermissions = {
        ...currentPermissions,
        [permission]: !currentPermissions[permission]
      };

      const updatedRolePermissions = {
        ...(settings.rolePermissions || {}),
        [role]: newPermissions
      };

      const settingsId = settings.id || 'company';
      await localDb.update(`settings/${settingsId}`, { rolePermissions: updatedRolePermissions });
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [settings]);

  const handleUpdateUserRole = useCallback(async (userId: string, newRole: 'admin' | 'manager' | 'cashier' | 'delivery' | 'picker') => {
    setIsProcessing(true);
    try {
      await localDb.update(`users/${userId}`, { role: newRole });
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDeleteUser = useCallback((userId: string) => {
    setUserToDelete(userId);
    setIsUserDeleteConfirmOpen(true);
  }, []);

  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await localDb.delete(`users/${userToDelete}`);
      setIsUserDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Delete user error:", error);
      alert(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [userToDelete]);

  const handlePurgeAll = useCallback(async () => {
    const confirmation = window.confirm("⚠️ ZONE DE DANGER : Voulez-vous vraiment supprimer TOUS les comptes d'accès (sauf le vôtre) ? Cette action est irréversible.");
    if (!confirmation) return;
    
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserUid = user?.id;
      const ownerEmail = OWNER_EMAIL;

      const userVictims = users.filter(u => u.uid !== currentUserUid && u.email !== ownerEmail);
      for (const u of userVictims) {
        if (u.id) {
          await localDb.delete(`users/${u.id}`);
        }
      }

      alert("Purge terminée avec succès.");
    } catch (error: any) {
      alert("Erreur lors de la purge: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [users]);

  return {
    isProcessing,
    isUserDeleteConfirmOpen,
    setIsUserDeleteConfirmOpen,
    userToDelete,
    viewedUser,
    setViewedUser,
    handleTogglePermission,
    handleUpdateUserRole,
    handleDeleteUser,
    confirmDeleteUser,
    handlePurgeAll
  };
}
