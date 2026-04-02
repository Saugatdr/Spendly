import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Transaction, Category, Budget, AppSettings } from '../types';

interface SpendlyDB extends DBSchema {
  transactions: { key: string; value: Transaction };
  categories: { key: string; value: Category };
  budgets: { key: string; value: Budget & { key: string } };
  settings: { key: string; value: { id: string; data: AppSettings } };
}

let _db: IDBPDatabase<SpendlyDB> | null = null;

async function getDB(): Promise<IDBPDatabase<SpendlyDB>> {
  if (_db) return _db;
  _db = await openDB<SpendlyDB>('spendly', 1, {
    upgrade(db) {
      db.createObjectStore('transactions', { keyPath: 'id' });
      db.createObjectStore('categories', { keyPath: 'id' });
      db.createObjectStore('budgets', { keyPath: 'key' });
      db.createObjectStore('settings', { keyPath: 'id' });
    }
  });
  return _db;
}

// Transactions
export async function dbGetTransactions(): Promise<Transaction[]> {
  return (await getDB()).getAll('transactions');
}

export async function dbPutTransaction(tx: Transaction): Promise<void> {
  await (await getDB()).put('transactions', tx);
}

export async function dbDeleteTransaction(id: string): Promise<void> {
  await (await getDB()).delete('transactions', id);
}

// Categories
export async function dbGetCategories(): Promise<Category[]> {
  return (await getDB()).getAll('categories');
}

export async function dbPutCategory(cat: Category): Promise<void> {
  await (await getDB()).put('categories', cat);
}

export async function dbDeleteCategory(id: string): Promise<void> {
  await (await getDB()).delete('categories', id);
}

// Budgets — composite key: categoryId+month
export async function dbGetBudgets(): Promise<Budget[]> {
  const all = await (await getDB()).getAll('budgets');
  return all.map(({ key: _key, ...b }) => b as Budget);
}

export async function dbPutBudget(budget: Budget): Promise<void> {
  await (await getDB()).put('budgets', { ...budget, key: `${budget.categoryId}__${budget.month}` });
}

export async function dbDeleteBudget(categoryId: string, month: string): Promise<void> {
  await (await getDB()).delete('budgets', `${categoryId}__${month}`);
}

// Settings
export async function dbGetSettings(): Promise<AppSettings | undefined> {
  const row = await (await getDB()).get('settings', 'main');
  return row?.data;
}

export async function dbPutSettings(settings: AppSettings): Promise<void> {
  await (await getDB()).put('settings', { id: 'main', data: settings });
}