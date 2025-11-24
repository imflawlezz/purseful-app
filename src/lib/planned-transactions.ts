import { storage } from './storage';
import { generateId } from './utils';
import type { PlannedTransaction, Transaction } from '@/types';

export const plannedTransactions = {
  /**
   * Process planned transactions and convert them to actual transactions
   * when their date has arrived
   */
  processPlannedTransactions(): void {
    const data = storage.getData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactionsToCreate: Transaction[] = [];
    const plannedToRemove: string[] = [];

    data.plannedTransactions.forEach((planned) => {
      const startDate = new Date(planned.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = planned.endDate ? new Date(planned.endDate) : null;
      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
      }

      // Check if this is a "once" transaction that should be executed
      if (planned.frequency === 'once') {
        if (startDate <= today) {
          // Check if transaction already exists
          const exists = data.transactions.some(
            t => t.date === planned.startDate &&
                 t.accountId === planned.accountId &&
                 t.categoryId === planned.categoryId &&
                 t.type === planned.type &&
                 t.amount === planned.amount
          );

          if (!exists) {
            // Create the transaction
            const transaction: Transaction = {
              id: generateId(),
              accountId: planned.accountId,
              categoryId: planned.categoryId,
              type: planned.type,
              amount: planned.amount,
              currency: planned.currency,
              date: planned.startDate,
              note: planned.note,
              toAccountId: planned.toAccountId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            transactionsToCreate.push(transaction);
            plannedToRemove.push(planned.id);
          } else {
            // Transaction already exists, remove planned
            plannedToRemove.push(planned.id);
          }
        }
      } else {
        // For recurring transactions, process each occurrence up to today
        if (startDate <= today) {
          let currentDate = new Date(startDate);
          
          while (currentDate <= today) {
            // Check if we haven't exceeded end date
            if (endDate && currentDate > endDate) {
              break;
            }

            // Check if a transaction for this date already exists
            const existingTransaction = data.transactions.find(
              t => {
                const tDate = new Date(t.date);
                tDate.setHours(0, 0, 0, 0);
                return tDate.getTime() === currentDate.getTime() &&
                       t.accountId === planned.accountId &&
                       t.categoryId === planned.categoryId &&
                       t.type === planned.type &&
                       Math.abs(t.amount - planned.amount) < 0.01; // Allow small floating point differences
              }
            );

            if (!existingTransaction) {
              const transaction: Transaction = {
                id: generateId(),
                accountId: planned.accountId,
                categoryId: planned.categoryId,
                type: planned.type,
                amount: planned.amount,
                currency: planned.currency,
                date: currentDate.toISOString().split('T')[0],
                note: planned.note,
                toAccountId: planned.toAccountId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              transactionsToCreate.push(transaction);
            }

            // Move to next occurrence based on frequency
            if (planned.frequency === 'daily') {
              currentDate.setDate(currentDate.getDate() + 1);
            } else if (planned.frequency === 'weekly') {
              currentDate.setDate(currentDate.getDate() + 7);
            } else if (planned.frequency === 'monthly') {
              currentDate.setMonth(currentDate.getMonth() + 1);
            } else if (planned.frequency === 'yearly') {
              currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
          }
        }
      }
    });

    // Add all new transactions
    transactionsToCreate.forEach(transaction => {
      storage.addTransaction(transaction);
    });

    // Remove processed "once" transactions
    plannedToRemove.forEach(id => {
      storage.deletePlannedTransaction(id);
    });
  },
};
