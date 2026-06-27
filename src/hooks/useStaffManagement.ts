import { useState } from 'react';
import { handleDatabaseError, OperationType, localDb, generateLocalId } from '../database';
import bcrypt from 'bcryptjs';

export function useStaffManagement() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [activeStaffId, setActiveStaffId] = useState<string | null>(null);

  const handleAddStaffManual = async (name: string, email: string, role: string, phone?: string, password?: string) => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      if (cleanEmail) {
        const { val: valEmail } = await localDb.get('users');
        const users = valEmail() || {};
        const exists = Object.values(users).some((u: any) => u.email === cleanEmail);
        if (exists) {
          alert("Un utilisateur avec cet email existe déjà dans les comptes.");
          return;
        }
      }

      if (phone) {
        const { val: valPhone } = await localDb.get('users');
        const users = valPhone() || {};
        const exists = Object.values(users).some((u: any) => u.phone === phone);
        if (exists) {
          alert("Un utilisateur avec ce numéro de téléphone existe déjà.");
          return;
        }
      }

      const newId = generateLocalId();
      const passwordHash = password ? bcrypt.hashSync(password, 10) : '';

      const uid = `auth-${Date.now()}`;
      await localDb.insert(`users/${newId}`, {
        id: newId,
        uid: uid,
        displayName: name,
        email: cleanEmail,
        phone: phone || '',
        role: role as any,
        employeeId: null,
        passwordHash,
        createdAt: new Date().toISOString()
      });

      alert(`Membre "${name}" ajouté avec succès.`);
      setIsAddUserModalOpen(false);
    } catch (error) {
      handleDatabaseError(error, OperationType.CREATE, 'users');
    }
  };

  return {
    isAddUserModalOpen, setIsAddUserModalOpen,
    activeStaffId, setActiveStaffId,
    handleAddStaffManual
  };
}
