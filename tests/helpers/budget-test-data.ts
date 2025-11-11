/**
 * Budget App Test Data Helper
 * Seeds sample data directly into IndexedDB for fast, reliable E2E testing
 */

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

/**
 * Seed sample budget data directly into IndexedDB
 * Fast and reliable - bypasses UI interactions
 */
export async function seedBudgetData(page: any) {
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      const dbName = 'HouseholdBudgetApp';
      const request = indexedDB.open(dbName, 9); // Use version 9 to match current schema

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;

        // Create object stores with proper indexes (matching budget-db.ts schema)
        if (!db.objectStoreNames.contains('accounts')) {
          const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountStore.createIndex('name', 'name');
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const txnStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txnStore.createIndex('accountId', 'accountId');
          txnStore.createIndex('date', 'date');
          txnStore.createIndex('category', 'category');
        }
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { keyPath: 'id' });
          budgetStore.createIndex('categoryId', 'categoryId');
        }
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('name', 'name');
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        // Sample account (required for transactions)
        const accounts = [
          {
            id: 'acc-1',
            name: 'Test Checking Account',
            type: 'checking',
            institution: 'Test Bank',
            balance: 8000.00,
            currency: 'CAD',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        // Sample categories (matching budget-db.ts schema)
        const categories = [
          { id: 'cat-1', name: 'Groceries', type: 'expense', subcategories: [], color: '#10b981', icon: 'shopping-cart', isDefault: true, order: 1, createdAt: new Date(), updatedAt: new Date() },
          { id: 'cat-2', name: 'Dining', type: 'expense', subcategories: [], color: '#f59e0b', icon: 'utensils', isDefault: true, order: 2, createdAt: new Date(), updatedAt: new Date() },
          { id: 'cat-3', name: 'Transportation', type: 'expense', subcategories: [], color: '#3b82f6', icon: 'car', isDefault: true, order: 3, createdAt: new Date(), updatedAt: new Date() },
          { id: 'cat-4', name: 'Utilities', type: 'expense', subcategories: [], color: '#8b5cf6', icon: 'bolt', isDefault: true, order: 4, createdAt: new Date(), updatedAt: new Date() },
          { id: 'cat-5', name: 'Salary', type: 'income', subcategories: [], color: '#14b8a6', icon: 'dollar-sign', isDefault: true, order: 5, createdAt: new Date(), updatedAt: new Date() },
          { id: 'cat-6', name: 'Freelance', type: 'income', subcategories: [], color: '#06b6d4', icon: 'briefcase', isDefault: true, order: 6, createdAt: new Date(), updatedAt: new Date() },
        ];

        // Sample transactions (matching budget-db.ts Transaction interface)
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const transactions = [
          { id: 'txn-1', accountId: 'acc-1', description: 'Whole Foods', amount: -125.50, date: new Date(thisYear, thisMonth, 5), category: 'Groceries', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-2', accountId: 'acc-1', description: 'Safeway', amount: -89.25, date: new Date(thisYear, thisMonth, 10), category: 'Groceries', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-3', accountId: 'acc-1', description: 'Restaurant Meal', amount: -65.00, date: new Date(thisYear, thisMonth, 8), category: 'Dining', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-4', accountId: 'acc-1', description: 'Coffee Shop', amount: -12.50, date: new Date(thisYear, thisMonth, 12), category: 'Dining', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-5', accountId: 'acc-1', description: 'Gas Station', amount: -55.00, date: new Date(thisYear, thisMonth, 6), category: 'Transportation', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-6', accountId: 'acc-1', description: 'Electric Bill', amount: -120.00, date: new Date(thisYear, thisMonth, 1), category: 'Utilities', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-7', accountId: 'acc-1', description: 'Monthly Salary', amount: 5000.00, date: new Date(thisYear, thisMonth, 1), category: 'Salary', subcategory: null, notes: '', isRecurring: true, recurringPattern: 'monthly', tags: [], createdAt: new Date(), updatedAt: new Date() },
          { id: 'txn-8', accountId: 'acc-1', description: 'Freelance Project', amount: 1500.00, date: new Date(thisYear, thisMonth, 15), category: 'Freelance', subcategory: null, notes: '', isRecurring: false, tags: [], createdAt: new Date(), updatedAt: new Date() },
        ];

        // Sample budgets (matching budget-db.ts Budget interface)
        const budgets = [
          { id: 'budget-1', categoryId: 'cat-1', category: 'Groceries', amount: 500, spent: 214.75, period: 'monthly', startDate: new Date(thisYear, thisMonth, 1), endDate: new Date(thisYear, thisMonth + 1, 0), isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 'budget-2', categoryId: 'cat-2', category: 'Dining', amount: 200, spent: 77.50, period: 'monthly', startDate: new Date(thisYear, thisMonth, 1), endDate: new Date(thisYear, thisMonth + 1, 0), isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 'budget-3', categoryId: 'cat-3', category: 'Transportation', amount: 300, spent: 55.00, period: 'monthly', startDate: new Date(thisYear, thisMonth, 1), endDate: new Date(thisYear, thisMonth + 1, 0), isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: 'budget-4', categoryId: 'cat-4', category: 'Utilities', amount: 200, spent: 120.00, period: 'monthly', startDate: new Date(thisYear, thisMonth, 1), endDate: new Date(thisYear, thisMonth + 1, 0), isActive: true, createdAt: new Date(), updatedAt: new Date() },
        ];

        const transaction = db.transaction(['accounts', 'categories', 'transactions', 'budgets'], 'readwrite');

        // Add accounts
        const accountStore = transaction.objectStore('accounts');
        accounts.forEach(acc => accountStore.put(acc));

        // Add categories
        const categoryStore = transaction.objectStore('categories');
        categories.forEach(cat => categoryStore.put(cat));

        // Add transactions
        const transactionStore = transaction.objectStore('transactions');
        transactions.forEach(txn => transactionStore.put(txn));

        // Add budgets
        const budgetStore = transaction.objectStore('budgets');
        budgets.forEach(budget => budgetStore.put(budget));

        transaction.oncomplete = () => {
          db.close();
          console.log('✅ Seeded test data: 1 account, 6 categories, 8 transactions, 4 budgets');
          resolve(true);
        };

        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  });
}

/**
 * Clear all budget data from IndexedDB
 */
export async function clearBudgetData(page: any) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const dbName = 'HouseholdBudgetApp';
      const deleteRequest = indexedDB.deleteDatabase(dbName);

      deleteRequest.onsuccess = () => {
        console.log('✅ Cleared all test data');
        resolve(true);
      };

      deleteRequest.onerror = () => {
        console.log('⚠️  Error clearing test data');
        resolve(false);
      };
    });
  });
}

// Legacy UI-based functions (kept for backward compatibility)
export async function createSampleTransactions(page: any) {
  await page.goto('/budget-app/transactions');
  await page.waitForLoadState('networkidle');

  const addButton = page.locator('button:has-text("Add Transaction"), button[aria-label="Add transaction"]').first();
  const hasAddButton = await addButton.isVisible().catch(() => false);

  if (!hasAddButton) {
    console.log('⚠️  No "Add Transaction" button found - using IndexedDB seeding instead');
    await seedBudgetData(page);
    return true;
  }

  await addButton.click();
  await page.waitForTimeout(500);

  const descriptionInput = page.locator('input[name="description"], input[placeholder*="description" i]').first();
  const amountInput = page.locator('input[name="amount"], input[type="number"]').first();
  const dateInput = page.locator('input[name="date"], input[type="date"]').first();

  await descriptionInput.fill('Test Grocery Shopping');
  await amountInput.fill('-100.00');
  await dateInput.fill('2025-11-01');

  const categorySelect = page.locator('select[name="category"], [role="combobox"]').first();
  const hasCategory = await categorySelect.isVisible().catch(() => false);
  if (hasCategory) {
    await categorySelect.selectOption({ index: 1 });
  }

  const saveButton = page.locator('button:has-text("Save"), button:has-text("Add")').first();
  await saveButton.click();
  await page.waitForTimeout(500);

  await addButton.click();
  await page.waitForTimeout(500);

  await descriptionInput.fill('Test Restaurant Meal');
  await amountInput.fill('-75.00');
  await dateInput.fill('2025-11-02');

  if (hasCategory) {
    await categorySelect.selectOption({ index: 2 });
  }

  await saveButton.click();
  await page.waitForTimeout(500);

  await page.reload();
  await page.waitForLoadState('networkidle');

  const transactions = await page.locator('table tr, .transaction-card').count();
  console.log(`✅ Created ${transactions > 0 ? transactions : '0'} sample transactions`);

  return transactions > 0;
}

export async function cleanupTestTransactions(page: any) {
  await clearBudgetData(page);
}
