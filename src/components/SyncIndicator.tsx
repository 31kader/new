import React from 'react';

interface SyncIndicatorProps {
  syncInfo: {
    active: boolean;
    progress: number;
    currentTable: string;
  };
  isOnline: boolean;
  bgSyncActive: boolean;
  bgPendingChanges: number;
}

export const SyncIndicator = ({ 
  syncInfo, 
  isOnline, 
  bgSyncActive, 
  bgPendingChanges 
}: SyncIndicatorProps) => {
  return null;
};
