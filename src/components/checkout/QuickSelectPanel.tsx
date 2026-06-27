import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuickSelect } from '../QuickSelect';
import { Product } from '../../types';

interface Props {
  isMobile: boolean;
  activeShift: any;
  showQuickSelect: boolean;
  setShowQuickSelect: (v: boolean) => void;
  isReturnMode: boolean;
  addToCart: (p: Product, qty: number) => void;
  currency: string;
}

export const QuickSelectPanel: React.FC<Props> = ({ 
  isMobile, activeShift, showQuickSelect, isReturnMode, addToCart, currency 
}) => {
  return (
    <AnimatePresence mode="wait">
      {!isMobile && activeShift && showQuickSelect && (
        <motion.div 
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="h-full w-80 flex-shrink-0 relative z-40 bg-slate-900/40 shadow-2xl border-r border-white/5"
        >
          <QuickSelect 
            onAddProduct={(p) => addToCart(p, isReturnMode ? -1 : 1)} 
            currency={currency} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
