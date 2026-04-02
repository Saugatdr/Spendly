import { v4 as uuidv4 } from 'uuid';
import { Category, Transaction, Budget, AppSettings } from '../types';
import {
  dbPutTransaction, dbDeleteTransaction,
  dbPutCategory, dbDeleteCategory,
  dbGetCategories, dbGetTransactions, dbGetBudgets, dbGetSettings,
  dbPutBudget, dbDeleteBudget, dbPutSettings
} from './db';

const KEYS = {
  TRANSACTIONS: 'spendly_transactions',
  CATEGORIES: 'spendly_categories',
  BUDGETS: 'spendly_budgets',
  SETTINGS: 'spendly_settings',
};

export const EVENTS = {
  TRANSACTIONS: 'spendly:transactions-changed',
  CATEGORIES: 'spendly:categories-changed',
  BUDGETS: 'spendly:budgets-changed',
  SETTINGS: 'spendly:settings-changed',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#f97316' },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#a855f7' },
  { id: 'housing', name: 'Housing', icon: 'home', color: '#10b981' },
  { id: 'health', name: 'Health', icon: 'medkit', color: '#ef4444' },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#f59e0b' },
  { id: 'utilities', name: 'Utilities', icon: 'flash', color: '#06b6d4' },
  { id: 'savings', name: 'Savings', icon: 'wallet', color: '#84cc16' },
  { id: 'income', name: 'Income', icon: 'cash', color: '#22c55e' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#6b7280' },
];

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  currencySymbol: '$',
  darkMode: true,
};

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

function saveLS<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function emit(event: string): void {
  window.dispatchEvent(new Event(event));
}

// ─── Categories ───────────────────────────────────────────────
export function getCategories(): Category[] {
  const stored = loadLS<Category[]>(KEYS.CATEGORIES, []);
  if (stored.length === 0) {
    saveLS(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    DEFAULT_CATEGORIES.forEach(c => dbPutCategory(c));
    return DEFAULT_CATEGORIES;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  saveLS(KEYS.CATEGORIES, categories);
  categories.forEach(c => dbPutCategory(c));
  emit(EVENTS.CATEGORIES);
}

export function addCategory(category: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const newCat: Category = { ...category, id: uuidv4() };
  const updated = [...categories, newCat];
  saveLS(KEYS.CATEGORIES, updated);
  dbPutCategory(newCat);
  emit(EVENTS.CATEGORIES);
  return newCat;
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter(c => c.id !== id);
  saveLS(KEYS.CATEGORIES, categories);
  dbDeleteCategory(id);
  emit(EVENTS.CATEGORIES);
}

// ─── Transactions ─────────────────────────────────────────────
export function getTransactions(): Transaction[] {
  return loadLS<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions();
  const newTx: Transaction = { ...tx, id: uuidv4(), createdAt: new Date().toISOString() };
  const updated = [newTx, ...transactions];
  saveLS(KEYS.TRANSACTIONS, updated);
  dbPutTransaction(newTx);
  emit(EVENTS.TRANSACTIONS);
  return newTx;
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter(t => t.id !== id);
  saveLS(KEYS.TRANSACTIONS, transactions);
  dbDeleteTransaction(id);
  emit(EVENTS.TRANSACTIONS);
}

export function updateTransaction(updated: Transaction): void {
  const transactions = getTransactions().map(t => t.id === updated.id ? updated : t);
  saveLS(KEYS.TRANSACTIONS, transactions);
  dbPutTransaction(updated);
  emit(EVENTS.TRANSACTIONS);
}

// ─── Budgets ──────────────────────────────────────────────────
export function getBudgets(): Budget[] {
  return loadLS<Budget[]>(KEYS.BUDGETS, []);
}

export function setBudget(budget: Budget): void {
  const budgets = getBudgets().filter(
    b => !(b.categoryId === budget.categoryId && b.month === budget.month)
  );
  const updated = [...budgets, budget];
  saveLS(KEYS.BUDGETS, updated);
  dbPutBudget(budget);
  emit(EVENTS.BUDGETS);
}

export function deleteBudget(categoryId: string, month: string): void {
  const budgets = getBudgets().filter(
    b => !(b.categoryId === categoryId && b.month === month)
  );
  saveLS(KEYS.BUDGETS, budgets);
  dbDeleteBudget(categoryId, month);
  emit(EVENTS.BUDGETS);
}

// ─── Settings ─────────────────────────────────────────────────
export function getSettings(): AppSettings {
  return loadLS<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  saveLS(KEYS.SETTINGS, settings);
  dbPutSettings(settings);
  emit(EVENTS.SETTINGS);
}

// ─── Helpers ──────────────────────────────────────────────────
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthTransactions(month: string): Transaction[] {
  return getTransactions().filter(t => t.date.startsWith(month));
}

export function getCategorySpend(categoryId: string, month: string, txList?: Transaction[]): number {
  const list = txList ?? getTransactions();
  return list
    .filter(t => t.type === 'expense' && t.categoryId === categoryId && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalIncome(month: string, txList?: Transaction[]): number {
  const list = txList ?? getTransactions();
  return list
    .filter(t => t.type === 'income' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(month: string, txList?: Transaction[]): number {
  const list = txList ?? getTransactions();
  return list
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
}

// ─── IndexedDB restore on cold start ─────────────────────────
// If localStorage is empty (e.g. cleared by browser), restore from IndexedDB
export async function restoreFromIndexedDB(): Promise<void> {
  const hasTransactions = localStorage.getItem(KEYS.TRANSACTIONS);
  const hasCategories = localStorage.getItem(KEYS.CATEGORIES);
  const hasBudgets = localStorage.getItem(KEYS.BUDGETS);
  const hasSettings = localStorage.getItem(KEYS.SETTINGS);

  const [txs, cats, budgets, settings] = await Promise.all([
    hasTransactions ? null : dbGetTransactions(),
    hasCategories ? null : dbGetCategories(),
    hasBudgets ? null : dbGetBudgets(),
    hasSettings ? null : dbGetSettings(),
  ]);

  if (txs?.length) saveLS(KEYS.TRANSACTIONS, txs);
  if (cats?.length) saveLS(KEYS.CATEGORIES, cats);
  if (budgets?.length) saveLS(KEYS.BUDGETS, budgets);
  if (settings) saveLS(KEYS.SETTINGS, settings);
}