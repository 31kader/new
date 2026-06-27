import React from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, localDb } from '../database';
import { logAction } from '../lib/utils';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';
import { useAuthStore } from '../store/useAuthStore';

export function useAuthActions(
  t: (key: string) => string
) {
  const { setUser, setProfile, setAuthError, setIsLoggingIn, setIsUnauthorized, isLoggingIn } = useAuthStore();

  const handleIdentifierLogin = async (loginIdentifier: string, loginPassword: string) => {
    if (isLoggingIn) return;
    if (!loginIdentifier || !loginPassword) {
      setAuthError(t("Veuillez entrer un identifiant et un mot de passe."));
      return;
    }
    setAuthError(null);
    setIsLoggingIn(true);
    
    const inputIdentifier = loginIdentifier.trim();
    const cleanPassword = loginPassword;

    const tryOfflineLogin = () => {
      try {
        const offlineCreds = JSON.parse(localStorage.getItem('nexus_offline_credentials') || '{}');
        const phoneKey = inputIdentifier.replace(/\s+/g, '');
        const matchedRecord = offlineCreds[inputIdentifier.toLowerCase()] || offlineCreds[phoneKey];
        
        if (matchedRecord && matchedRecord.hash) {
          const isMatch = bcrypt.compareSync(cleanPassword, matchedRecord.hash);
          if (isMatch) {
            const session = {
              uid: "offline_" + (matchedRecord.employeeId || 'admin_' + Date.now()),
              displayName: matchedRecord.displayName,
              email: matchedRecord.email,
              phone: matchedRecord.phone,
              role: matchedRecord.role,
              employeeId: matchedRecord.employeeId
            };
            localStorage.setItem('nexus_active_offline_session', JSON.stringify(session));
            setUser({
              uid: session.uid,
              email: session.email,
              displayName: session.displayName,
              isOffline: true
            } as any);
            setProfile({
              uid: session.uid,
              displayName: session.displayName,
              email: session.email,
              role: session.role as any,
              employeeId: session.employeeId
            });
            setIsUnauthorized(false);
            toast.success(t("Connexion réussie en mode hors ligne."));
            return true;
          }
        }
      } catch (offlineErr) {
        console.error("Local offline auth check failed:", offlineErr);
      }
      return false;
    };

    if (!navigator.onLine) {
      const success = tryOfflineLogin();
      setIsLoggingIn(false);
      if (!success) {
        setAuthError(t("Connexion hors ligne échouée : Identifiant ou mot de passe incorrect pour le mode hors ligne."));
      }
      return;
    }

    try {
      let email = inputIdentifier;
      if (!email.includes('@')) {
        email = `${email.replace(/\s+/g, '')}@nexus-pos.internal`;
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, cleanPassword);
      
      if (userCredential.user) {
        try {
          const bcryptHash = bcrypt.hashSync(cleanPassword, 10);
          const userSnap = await localDb.get(`users/${userCredential.user.uid}`);
          const userData = userSnap.exists() ? userSnap.val() : null;
          const role = userData ? (userData.role || 'cashier') : 'cashier';
          const displayName = userCredential.user.displayName || userData?.displayName || 'Utilisateur';
          const empId = userData ? (userData.employeeId || null) : null;
          const phone = userData ? (userData.phone || '') : '';

          const offlineCreds = JSON.parse(localStorage.getItem('nexus_offline_credentials') || '{}');
          const credRecord = {
            displayName,
            email: email,
            phone: phone,
            hash: bcryptHash,
            role,
            employeeId: empId
          };
          offlineCreds[email.toLowerCase()] = credRecord;
          if (phone) offlineCreds[phone] = credRecord;
          localStorage.setItem('nexus_offline_credentials', JSON.stringify(offlineCreds));
        } catch (cacheErr) {
          console.warn("Failed to cache offline credentials", cacheErr);
        }
      }
    } catch (error: any) {
      console.error("Online login failed:", error);
      
      const isNetworkError = 
        error.code === 'auth/network-request-failed' || 
        error.code === 'auth/internal-error' || 
        error.code === 'auth/quota-exceeded' ||
        (error.message && (
          error.message.toLowerCase().includes('failed to fetch') ||
          error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('load failed')
        )) ||
        error.name === 'TypeError';

      if (isNetworkError) {
        const success = tryOfflineLogin();
        if (success) {
          setIsLoggingIn(false);
          return;
        }
        setAuthError(t("Erreur de réseau (Failed to fetch). Connectez-vous avec de bons identifiants hors-ligne ou vérifiez votre connexion Internet."));
      } else if (
        error.code === 'auth/invalid-credential' || 
        (error.message && error.message.toLowerCase().includes('invalid login credentials')) || 
        error.code === 'invalid_credentials' ||
        (error.message && error.message.toLowerCase().includes('incorrect'))
      ) {
        const success = tryOfflineLogin();
        if (success) {
          setIsLoggingIn(false);
          return;
        }
        setAuthError("L'identifiant ou le mot de passe est incorrect. Si vous êtes l'administrateur, veuillez utiliser le bouton 'Connexion avec Google'. Les employés doivent avoir un compte créé par le manager.");
      } else {
        setAuthError(error.message || "Erreur de connexion");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async (user: any) => {
    localStorage.removeItem('nexus_active_offline_session');
    localStorage.removeItem('nexus_active_online_session');
    if (user && !(user as any).isOffline) {
      try {
        await logAction(user.uid, user.displayName || 'Utilisateur', 'Déconnexion', 'Auth', 'Utilisateur déconnecté');
      } catch (e) {}
    }
    try {
      await signOut(auth);
    } catch (e) {}
    setUser(null);
    setProfile(null);
  };

  return { handleIdentifierLogin, handleLogout };
}
