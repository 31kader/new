import { supabase, isSupabaseConfigured } from './supabase';
import bcrypt from 'bcryptjs';
import { toast } from 'sonner';

// Import modular services
import { 
  generateLocalId,
  convertKeysToCamel,
  convertKeysToSnake,
} from './lib/db-converters';

import {
  dbState,
  getLocalValue,
  setLocalState,
  updateLocalState,
  removeLocalState,
  addObserver,
  removeObserver,
  loadInitialState,
  triggerObservers,
  saveStateToStorage,
  queryLocalState
} from './lib/local-db';
import type { QueryOptions } from './lib/local-db';

import {
  enqueueSync,
  enqueueSyncBatch,
  enqueueStockAdjustment,
  onBackgroundSyncStatus,
  loadPendingSyncQueue
} from './services/SyncService';

import {
  initAndSyncSupabase,
  onSyncUpdate,
  syncStatus
} from './services/SupabaseSync';

// Re-export constants and specialized status functions
export { 
  onSyncUpdate, 
  onBackgroundSyncStatus, 
  initAndSyncSupabase,
  syncStatus,
  generateLocalId,
  convertKeysToCamel,
  convertKeysToSnake,
  enqueueStockAdjustment,
  queryLocalState,
  getLocalValue
};
export type { QueryOptions };

// ----------------- Auth Emulator & Interface -----------------

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  providerData?: { email: string | null; [key: string]: any }[];
  getIdToken?: () => Promise<string>;
}

class AuthEmulator {
  currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nexus_auth_user');
      if (stored) {
        try { 
          const data = JSON.parse(stored);
          this.currentUser = { ...data, getIdToken: async () => "dummy-token" };
        } catch (e) {}
      }
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    setTimeout(() => callback(this.currentUser), 0);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  trigger(user: any) {
    if (user) {
      this.currentUser = { ...user, getIdToken: async () => "dummy-token" };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_auth_user', JSON.stringify(this.currentUser));
      }
    } else {
      this.currentUser = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_auth_user');
      }
    }
    this.listeners.forEach(cb => cb(this.currentUser));
  }
}

export const auth = new AuthEmulator();
export const db = { type: 'database_mock' };
export const rtdb = { type: 'realtime_mock' };

export function onAuthStateChanged(arg1: any, arg2?: any) {
  const callback = typeof arg1 === 'function' ? arg1 : arg2;
  const authInstance = typeof arg1 === 'function' ? auth : arg1;
  return (authInstance || auth).onAuthStateChanged(callback);
}

export class GoogleAuthProvider {}
export const googleProvider = new GoogleAuthProvider();
export const signInWithPopup = async (...args: any[]) => { 
  if (isSupabaseConfigured) {
    try {
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true
        }
      });
      if (error) throw error;
      
      if (data?.url) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          data.url,
          'google_auth',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
        );
        
        if (!popup) {
          console.warn("[OAuth Popup Blocked] Falling back to standard redirect");
          window.location.href = data.url;
        }
      }
      return { user: null };
    } catch (error: any) {
      if (error.message && error.message.includes("Popup login not supported")) {
        throw new Error("La connexion via popup (Google) n'est pas supportée dans cet environnement. Veuillez utiliser votre E-mail et Mot de passe à la place.");
      }
      throw error;
    }
  }
  throw new Error("Connexion par Google impossible : Supabase n'est pas configuré. Veuillez utiliser l'e-mail et le mot de passe."); 
};

// ----------------- RTDB Compat Logic -----------------

export const ref = (dbInstance: any, path = '') => {
  // If dbInstance is actually a path (old style)
  if (typeof dbInstance === 'string') return dbInstance;
  return path;
};

export const child = (parent: any, path: string) => {
  const parentPath = typeof parent === 'string' ? parent : (parent.path || '');
  return parentPath ? `${parentPath}/${path}` : path;
};

export function rtdbQuery(pathOrRef: any, ...constraints: any[]) {
  return pathOrRef; 
}

export const orderByChild = (_field: string) => ({ type: 'orderByChild' });
export const equalTo = (_val: any) => ({ type: 'equalTo' });
export const startAt = (_val: any) => ({ type: 'startAt' });
export const endAt = (_val: any) => ({ type: 'endAt' });
export const limitToLast = (_n: number) => ({ type: 'limitToLast' });

// ----------------- Public Core Database API -----------------

const normalizeSyncTable = (table: string): string => {
  const mappings: Record<string, string> = {
    'onlineOrders': 'online_orders',
    'stockAdjustments': 'stock_adjustments',
    'supplierPayments': 'supplier_payments',
    'supplierSyncs': 'supplier_syncs',
    'damagedItems': 'damaged_items',
    'auditLogs': 'audit_logs',
    'invoicePatterns': 'invoice_patterns',
    'purchaseOrders': 'purchase_orders',
    'shifts': 'cash_shifts',
    'cartDrafts': 'cart_drafts',
    'externalDeliveryRequests': 'external_delivery_requests'
  };
  return mappings[table] || table;
};

export const localDb = {
  get: async (pathOrRef: any): Promise<{ exists: () => boolean, val: () => any }> => {
    const path = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    const val = getLocalValue(path);
    return {
      exists: () => val !== undefined && val !== null,
      val: () => val
    };
  },

  insert: async (pathOrRef: any, value: any): Promise<void> => {
    const path = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    setLocalState(path, value);
    const parts = path.split('/');
    const table = parts[0];
    const id = parts.slice(1).join('/');
    
    saveStateToStorage(table);
    triggerObservers(table);
    if (id) triggerObservers(path);
    
    if (table === 'transactions' && value) {
      window.dispatchEvent(new CustomEvent('offline-transaction-created', { detail: value }));
    }
    
    if (table === 'returns' && value) {
      window.dispatchEvent(new CustomEvent('offline-return-created', { detail: value }));
    }
    
    enqueueSync(normalizeSyncTable(table), id || null, value);
  },

  insertBatch: async (table: string, records: Record<string, any>): Promise<void> => {
    for (const [id, value] of Object.entries(records)) {
      setLocalState(`${table}/${id}`, value);
    }
    saveStateToStorage(table);
    triggerObservers(table);
    for (const id of Object.keys(records)) {
      triggerObservers(`${table}/${id}`);
    }
    enqueueSyncBatch(normalizeSyncTable(table), records);
  },

  update: async (pathOrRef: any, value: any): Promise<void> => {
    const path = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    updateLocalState(path, value);
    const parts = path.split('/');
    const table = parts[0];
    const id = parts.slice(1).join('/');

    saveStateToStorage(table);
    triggerObservers(table);
    if (id) triggerObservers(path);
    
    const newValue = getLocalValue(path);
    if (table === 'transactions' && newValue) {
      window.dispatchEvent(new CustomEvent('offline-transaction-created', { detail: newValue }));
    }

    if (table === 'returns' && newValue) {
      window.dispatchEvent(new CustomEvent('offline-return-created', { detail: newValue }));
    }

    enqueueSync(normalizeSyncTable(table), id || null, newValue);
  },

  push: (pathOrRef: any, value?: any) => {
    const id = generateLocalId();
    const parentPath = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    const path = `${parentPath}/${id}`;
    if (value !== undefined) {
      localDb.insert(path, value);
    }
    return { key: id, path };
  },

  delete: async (pathOrRef: any): Promise<void> => {
    const path = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    removeLocalState(path);
    const parts = path.split('/');
    const table = parts[0];
    const id = parts.slice(1).join('/');

    saveStateToStorage(table);
    triggerObservers(table);
    if (id) triggerObservers(path);
    
    enqueueSync(normalizeSyncTable(table), id || null, null, true);
  },

  subscribe: (pathOrRef: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) => {
    const path = typeof pathOrRef === 'string' ? pathOrRef : (pathOrRef.path || pathOrRef);
    addObserver(path, callback);
    localDb.get(path).then(callback);
    return () => removeObserver(path, callback);
  }
};

// Atomic increments for stock specifically
export const incrementStock = async (productId: string, adjustment: number): Promise<void> => {
  const path = `products/${productId}`;
  const current = getLocalValue(path);
  if (current) {
    const newStock = (Number(current.stock) || 0) + adjustment;
    updateLocalState(path, { stock: newStock });
    triggerObservers('products');
    triggerObservers(path);
    saveStateToStorage('products');
  }
  enqueueStockAdjustment(productId, adjustment);
};

// ----------------- Authentication Support -----------------

const ensureOwnerExists = async (cleanEmail: string, password: string): Promise<any> => {
  const adminEmail = ((import.meta as any).env?.VITE_ADMIN_EMAIL || 'admin@nexus.local').toLowerCase().trim();
  if (cleanEmail !== adminEmail) return null;
  const users = getLocalValue('users') || {};
  let foundUser: any = Object.values(users).find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
  if (!foundUser) {
    const employees = getLocalValue('employees') || {};
    foundUser = Object.values(employees).find((e: any) => e.email?.toLowerCase().trim() === cleanEmail);
  }
  if (!foundUser) {
    const id = 'FaQiBWkg8uTxZ2np7BQjDINTyQc2'; // Main owner uid from useAuthUser.tsx
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = {
      id,
      uid: id,
      email: cleanEmail,
      passwordHash,
      role: 'admin',
      displayName: 'Administrateur',
      joinDate: new Date().toISOString()
    };
    await localDb.insert(`users/${id}`, newUser);
    foundUser = newUser;
  }
  return foundUser;
};

export const signInWithEmailAndPassword = async (_auth: any, email: string, password: string) => {
  const cleanEmail = email.toLowerCase().trim();
  await ensureOwnerExists(cleanEmail, password);
  
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        const user = { 
          uid: data.user.id, 
          email: data.user.email || null, 
          displayName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null 
        };
        auth.trigger(user);
        return { user };
      }
    } catch (err: any) {
      const errMsg = err?.message || '';
      console.warn("Supabase auth failed:", errMsg);
      
      const isNetwork = 
        errMsg.toLowerCase().includes('fetch') || 
        errMsg.toLowerCase().includes('network') || 
        err?.name === 'TypeError' ||
        err?.status === 502 || err?.status === 504 || err?.status === 503;
        
      if (isNetwork) {
        const fetchErr = new Error("Failed to fetch");
        (fetchErr as any).code = 'auth/network-request-failed';
        throw fetchErr;
      }
      
      if (errMsg === 'Invalid login credentials' || err?.status === 400 || errMsg.toLowerCase().includes('invalid')) {
        // Before throwing "wrong credentials" immediately, let's see if this is an offline-only user stored locally
        const users = getLocalValue('users') || {};
        let foundUser: any = Object.values(users).find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
        
        if (!foundUser) {
          const employees = getLocalValue('employees') || {};
          foundUser = Object.values(employees).find((e: any) => e.email?.toLowerCase().trim() === cleanEmail);
        }
        
        if (foundUser) {
          const hash = foundUser.passwordHash || foundUser.password_hash;
          if (hash) {
            const valid = bcrypt.compareSync(password, hash);
            if (valid) {
              const user = { uid: foundUser.uid || foundUser.id, email: foundUser.email, displayName: foundUser.displayName || foundUser.name };
              auth.trigger(user);
              return { user };
            }
          }
        }
        
        throw new Error("Identifiant ou mot de passe incorrect");
      }
      
      console.warn("Unsupported Supabase error, falling through to full database lookup:", errMsg);
    }
  }
  
  const users = getLocalValue('users') || {};
  let foundUser: any = Object.values(users).find((u: any) => u.email?.toLowerCase().trim() === cleanEmail);
  
  if (!foundUser) {
    const employees = getLocalValue('employees') || {};
    foundUser = Object.values(employees).find((e: any) => e.email?.toLowerCase().trim() === cleanEmail);
  }
  
  if (!foundUser) {
    const customers = getLocalValue('customers') || {};
    foundUser = Object.values(customers).find((c: any) => c.email?.toLowerCase().trim() === cleanEmail);
  }

  if (!foundUser) {
    const suppliers = getLocalValue('suppliers') || {};
    foundUser = Object.values(suppliers).find((s: any) => s.email?.toLowerCase().trim() === cleanEmail);
  }

  if (!foundUser) throw new Error("Utilisateur non trouvé");

  const hash = foundUser.passwordHash || foundUser.password_hash;
  if (!hash) {
    throw new Error("Ce compte n'a pas de mot de passe (probablement créé via Google). Veuillez utiliser le bouton de connexion Google au lieu du formulaire.");
  }

  const valid = bcrypt.compareSync(password, hash);
  if (!valid) throw new Error("Mot de passe incorrect");

  const user = { uid: foundUser.uid || foundUser.id, email: foundUser.email, displayName: foundUser.displayName || foundUser.name };
  auth.trigger(user);
  return { user };
};

export async function signOut(arg?: any) {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Error signing out from Supabase:", err);
    }
  }
  auth.trigger(null);
  return true;
}


export const createUserWithEmailAndPassword = async (_auth: any, email: string, password: string) => {
  const cleanEmail = email.toLowerCase().trim();
  
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      const user = { 
        uid: data.user.id, 
        email: data.user.email || null, 
        displayName: data.user.email?.split('@')[0] || null 
      };
      
      // Initial user profile in local DB (will sync to Supabase)
      const newUser = {
        id: data.user.id,
        uid: data.user.id,
        email: cleanEmail,
        displayName: user.displayName,
        role: 'cashier',
        joinDate: new Date().toISOString()
      };
      
      await localDb.insert(`users/${data.user.id}`, newUser);
      auth.trigger(user);
      return { user };
    }
  }

  const id = generateLocalId();
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    uid: id,
    email: cleanEmail,
    passwordHash,
    role: 'cashier',
    joinDate: new Date().toISOString()
  };
  
  await localDb.insert(`users/${id}`, newUser);
  const user = { uid: id, email: cleanEmail, displayName: cleanEmail.split('@')[0] };
  auth.trigger(user);
  return { user };
};

// Initialization helper
let initialized = false;
export async function initializeDatabase() {
  if (initialized) return;
  await loadInitialState();
  await loadPendingSyncQueue();
  if (isSupabaseConfigured) {
    // Ensure default 'uncategorized' category exists to prevent foreign key violations on products
    localDb.insert('categories/uncategorized', { id: 'uncategorized', name: 'Sans catégorie', level: 1 })
      .catch(err => console.warn('[Local Init] Could not ensure default category:', err));

    let lastUserId: string | null = null;
    let initialSyncDone = false;

    // Auto-login check
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        const userObj = {
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null
        };
        auth.trigger(userObj);
      }
    });
    
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log(`[Supabase Auth] event: ${event}, userId: ${session?.user?.id}`);
      if (session?.user) {
        const currentUserId = session.user.id;
        const userObj = {
          uid: currentUserId,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null
        };
        auth.trigger(userObj);
        
        // Trigger sync if user changed, or if it's the initial session and we haven't synced yet
        if (currentUserId !== lastUserId || !initialSyncDone) {
          lastUserId = currentUserId;
          initialSyncDone = true;
          
          toast.promise(initAndSyncSupabase(), {
            loading: 'Connexion active. Synchronisation de la caisse...',
            success: 'Données synchronisées avec succès !',
            error: 'Erreur lors de la synchronisation avec le cloud.'
          });
        }
      } else {
        auth.trigger(null);
        if (lastUserId !== null || !initialSyncDone) {
          lastUserId = null;
          initialSyncDone = true;
          // Synchronize public/guest state
          initAndSyncSupabase();
        }
      }
    });
  }
  initialized = true;
}

// Global initialization
if (typeof window !== 'undefined') {
  initializeDatabase();
}

// Legacy helpers from older code
export const handleDatabaseError = (_err: any, _type: any, _module: any) => {
    // Suppressing duplicate error logging as SyncService handles them
};

export enum OperationType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  LIST = 'LIST',
  GET = 'GET'
}

