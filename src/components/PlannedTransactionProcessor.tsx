'use client';

import { useEffect } from 'react';
import { plannedTransactions } from '@/lib/planned-transactions';

export function PlannedTransactionProcessor() {
  useEffect(() => {
    // Process planned transactions on mount and periodically
    plannedTransactions.processPlannedTransactions();
    
    const interval = setInterval(() => {
      plannedTransactions.processPlannedTransactions();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}

