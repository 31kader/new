import { useState, useRef, useCallback } from 'react';
import { enqueueStockAdjustment, localDb } from '../database';
import { logAction, generateUniqueId } from '../lib/utils';
import { CartItem, Product, Customer, CompanySettings, Promotion, Transaction } from '../types';

interface UseCheckoutProcessParams {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  user: any;
  profile: any;
  activeStaffId: string;
  employees: any[];
  selectedCustomer: Customer | null;
  settings: CompanySettings;
  deliveryMethod: 'in_store' | 'delivery' | 'pickup';
  products: Product[];
  receivedAmount: string;
  keepExcessInBalance: boolean;
  total: number;
  discountAmount: number;
  pointsDiscount: number;
  voucherDiscount: number;
  promotionToApply: Promotion | null;
  useLoyaltyPoints: boolean;
  isWholesale: boolean;
  activeSessionId: string;
  setPosSessions: React.Dispatch<React.SetStateAction<any[]>>;
  appliedVoucher: any;
  setLastTransaction: (t: Transaction | null) => void;
  setShowSuccess: (s: boolean) => void;
  printReceipt: (t: Transaction, s: CompanySettings) => void;
}

export function useCheckoutProcess({
  cart,
  setCart,
  user,
  profile,
  activeStaffId,
  employees,
  selectedCustomer,
  settings,
  deliveryMethod,
  products,
  receivedAmount,
  keepExcessInBalance,
  total,
  discountAmount,
  pointsDiscount,
  voucherDiscount,
  promotionToApply,
  useLoyaltyPoints,
  isWholesale,
  activeSessionId,
  setPosSessions,
  appliedVoucher,
  setLastTransaction,
  setShowSuccess,
  printReceipt
}: UseCheckoutProcessParams) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (method: 'cash' | 'card' | 'balance', shouldPrint: boolean = false) => {
    if (isProcessing) return;
    if (cart.length === 0) return;
    
    if (method === 'balance') {
      if (!selectedCustomer) {
        alert("Veuillez sélectionner un client pour payer par solde.");
        return;
      }
      if ((selectedCustomer.balance || 0) < total) {
        alert("Solde insuffisant.");
        return;
      }
    }

    setIsProcessing(true);
    console.log("Checkout processing started");
    try {
      // 1. Prepare Transaction ID
      const transactionId = generateUniqueId();
      
      const sanitizedCart = cart.map((item: CartItem) => {
        const { imageUrl, imageUrls, description, bundleItems, ...rest } = item;
        return rest;
      }) as CartItem[];

      const pointsEarned = (selectedCustomer && deliveryMethod === 'in_store') 
        ? Math.floor(total * (settings.loyaltyPointsPerCurrencyUnit || 1)) 
        : 0;
        
      const parsedReceived = receivedAmount !== '' ? parseFloat(receivedAmount) || 0 : total;
      const parsedReturned = (receivedAmount !== '' && parsedReceived > total && !keepExcessInBalance) ? parsedReceived - total : 0;

      const transaction = {
        id: transactionId,
        items: sanitizedCart,
        total,
        discountAmount,
        pointsDiscount,
        balanceUsed: method === 'balance' ? total : 0,
        voucherDiscount,
        promotionId: promotionToApply?.id || null,
        paymentMethod: method,
        deliveryMethod,
        status: deliveryMethod === 'in_store' ? 'delivered' : 'pending',
        pointsEarned,
        amountReceived: parsedReceived,
        amountReturned: parsedReturned,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        isWholesale,
        customerId: selectedCustomer?.id || null,
        customerName: selectedCustomer?.name || null,
      };
      
      localDb.insert(`transactions/${transactionId}`, transaction);

      logAction(user.uid, user.displayName || 'Utilisateur', 'Vente', 'POS', `Vente de ${total.toFixed(2)} ${settings.currency} via ${method}`);
      
      // 2. Stock Updates via Atomic Sync Queue
      for (const item of cart) {
        if (!item.id || item.id === 'undefined') continue;
        if (item.isBundle && item.bundleItems) {
          for (const bundleItem of item.bundleItems) {
            const componentProduct = products.find((p: Product) => p.id === bundleItem.productId);
            if (componentProduct && componentProduct.id) {
              enqueueStockAdjustment(componentProduct.id, -(bundleItem.quantity * item.quantity));
              localDb.update(`products/${componentProduct.id}`, { updatedAt: new Date().toISOString() });
            }
          }
        } else {
          if (item.id && item.id.trim() !== '') {
            const product = products.find((p: Product) => p.id === item.id);
            if (product) {
              let newStock = product.stock - item.quantity;
              let updatedBatches = product.batches ? product.batches.map(b => ({ ...b })) : [];

              if (product.useMultiExpiry && updatedBatches.length > 0) {
                let remainingToDeduct = item.quantity;
                updatedBatches.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
                
                for (let b of updatedBatches) {
                  if (remainingToDeduct <= 0) break;
                  if (b.stock > 0) {
                    const deduct = Math.min(b.stock, remainingToDeduct);
                    b.stock -= deduct;
                    remainingToDeduct -= deduct;
                  }
                }
                if (remainingToDeduct > 0 && updatedBatches.length > 0) {
                  updatedBatches[updatedBatches.length - 1].stock -= remainingToDeduct;
                }
              }
              
              // Handle unpack (Parent/Child)
              if (newStock < 0 && product.autoUnpack && product.parentId && product.unitsPerParent) {
                const shortfall = -newStock;
                const parentsNeeded = Math.ceil(shortfall / product.unitsPerParent);
                const parentProduct = products.find((p: Product) => p.id === product.parentId);
                if (parentProduct && parentProduct.id) {
                  enqueueStockAdjustment(parentProduct.id, -parentsNeeded);
                  localDb.update(`products/${parentProduct.id}`, { updatedAt: new Date().toISOString() });
                  enqueueStockAdjustment(item.id, -item.quantity + (parentsNeeded * product.unitsPerParent));
                }
              } else {
                enqueueStockAdjustment(item.id, -item.quantity);
              }

              const prodUpdates: any = { updatedAt: new Date().toISOString() };
              if (product.useMultiExpiry) {
                prodUpdates.batches = updatedBatches;
              }
              localDb.update(`products/${item.id}`, prodUpdates);
            }
          }
        }
      }

      // 3. Customer Updates
      if (selectedCustomer) {
        const pointsSpent = useLoyaltyPoints ? Math.floor(pointsDiscount / (settings.loyaltyPointValue || 0.01)) : 0;
        
        let finalBalance = selectedCustomer.balance || 0;
        if (method === 'balance') {
          finalBalance -= total;
        }
        if (keepExcessInBalance && parsedReceived > total) {
          finalBalance += (parsedReceived - total);
        }

        const statsUpdates: any = {
           loyaltyPoints: Math.max(0, (selectedCustomer.loyaltyPoints || 0) - pointsSpent + pointsEarned),
           totalSpent: (selectedCustomer.totalSpent || 0) + total,
           lastVisit: new Date().toISOString(),
           balance: finalBalance
        };
        localDb.update(`customers/${selectedCustomer.id}`, statsUpdates);
      }

      // 4. Voucher Updates
      if (appliedVoucher) {
        if (appliedVoucher.type === 'fixed') {
          const remainingValue = Math.max(0, appliedVoucher.value - (total + discountAmount + pointsDiscount));
          if (remainingValue === 0) {
            localDb.update(`promotions/${appliedVoucher.id}`, { status: 'used' });
          } else {
            localDb.update(`promotions/${appliedVoucher.id}`, { value: remainingValue });
          }
        } else {
          localDb.update(`promotions/${appliedVoucher.id}`, { status: 'used' });
        }
      }

      // 5. Clear session data and show success
      if (shouldPrint) {
        try {
          printReceipt(transaction as any, settings);
        } catch (printErr) {
          console.error('Print failed:', printErr);
        }
      }

      setCart([]);
      setPosSessions((prev: any) => prev.map((s: any) => s.id === activeSessionId ? { ...s, cart: [], selectedCustomer: null } : s));
      
      setLastTransaction(transaction as any);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Erreur lors de la validation de la commande');
    } finally {
      setIsProcessing(false);
      console.log("Checkout processing ended");
    }
  };

  return { handleCheckout, isProcessing };
}
