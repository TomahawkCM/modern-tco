/**
 * Seed Data Module
 * Seeds the local IndexedDB (or supabase when online) with example transactions, accounts, and budgets.
 */
import { openDB } from 'idb';

export async function seedDatabase(): Promise<void> {
  console.log('[seed-data] seeding sample data');
  // Very small demo seed for offline mode using IndexedDB
  try{
    const db = await openDB('budget-db', 1, {
      upgrade(db){
        if (!db.objectStoreNames.contains('accounts')) db.createObjectStore('accounts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('transactions')) db.createObjectStore('transactions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('budgets')) db.createObjectStore('budgets', { keyPath: 'id' });
      }
    });

    const tx = db.transaction(['accounts','transactions','budgets'],'readwrite');
    const accounts = tx.objectStore('accounts');
    const transactions = tx.objectStore('transactions');
    const budgets = tx.objectStore('budgets');

    await accounts.put({ id: 'acct-checking', name: 'Checking', balance: 2345.67, currency: 'USD' });
    await accounts.put({ id: 'acct-savings', name: 'Savings', balance: 5000.0, currency: 'USD' });

    const now = Date.now();
    await transactions.put({ id: 't1', accountId: 'acct-checking', date: new Date(now - 86400000).toISOString(), amount: -12.34, merchant: 'Coffee Shop', category: 'Food & Drink' });
    await transactions.put({ id: 't2', accountId: 'acct-checking', date: new Date(now - 3600*1000).toISOString(), amount: -45.0, merchant: 'Grocery Store', category: 'Groceries' });
    await transactions.put({ id: 't3', accountId: 'acct-savings', date: new Date(now - 7*86400000).toISOString(), amount: 200.0, merchant: 'Paycheck', category: 'Income' });

    await budgets.put({ id: 'b1', name: 'Groceries', envelope: 400, spent: 45 });
    await budgets.put({ id: 'b2', name: 'Dining Out', envelope: 150, spent: 12.34 });

    await tx.done;
    console.log('[seed-data] sample seed complete');
  }catch(e){
    console.error('[seed-data] error seeding', e);
    throw e;
  }
}
