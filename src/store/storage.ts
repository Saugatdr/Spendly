import { v4 as uuidv4 } from 'uuid';
import { Category, Transaction, Budget, AppSettings } from '../types';

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

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function emit(event: string): void {
  window.dispatchEvent(new Event(event));
}

// Categories
export function getCategories(): Category[] {
  const stored = load<Category[]>(KEYS.CATEGORIES, []);
  if (stored.length === 0) {
    save(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  save(KEYS.CATEGORIES, categories);
  emit(EVENTS.CATEGORIES);
}

export function addCategory(category: Omit<Category, 'id'>): Category {
  const categories = getCategories();
  const newCat: Category = { ...category, id: uuidv4() };
  save(KEYS.CATEGORIES, [...categories, newCat]);
  emit(EVENTS.CATEGORIES);
  return newCat;
}

export function deleteCategory(id: string): void {
  const categories = getCategories().filter(c => c.id !== id);
  save(KEYS.CATEGORIES, categories);
  emit(EVENTS.CATEGORIES);
}

// Transactions
export function getTransactions(): Transaction[] {
  return load<Transaction[]>(KEYS.TRANSACTIONS, []);
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
  const transactions = getTransactions();
  const newTx: Transaction = { ...tx, id: uuidv4(), createdAt: new Date().toISOString() };
  save(KEYS.TRANSACTIONS, [newTx, ...transactions]);
  emit(EVENTS.TRANSACTIONS);
  return newTx;
}

export function deleteTransaction(id: string): void {
  const transactions = getTransactions().filter(t => t.id !== id);
  save(KEYS.TRANSACTIONS, transactions);
  emit(EVENTS.TRANSACTIONS);
}

export function updateTransaction(updated: Transaction): void {
  const transactions = getTransactions().map(t => t.id === updated.id ? updated : t);
  save(KEYS.TRANSACTIONS, transactions);
  emit(EVENTS.TRANSACTIONS);
}

// Budgets
export function getBudgets(): Budget[] {
  return load<Budget[]>(KEYS.BUDGETS, []);
}

export function setBudget(budget: Budget): void {
  const budgets = getBudgets().filter(
    b => !(b.categoryId === budget.categoryId && b.month === budget.month)
  );
  save(KEYS.BUDGETS, [...budgets, budget]);
  emit(EVENTS.BUDGETS);
}

export function deleteBudget(categoryId: string, month: string): void {
  const budgets = getBudgets().filter(
    b => !(b.categoryId === categoryId && b.month === month)
  );
  save(KEYS.BUDGETS, budgets);
  emit(EVENTS.BUDGETS);
}

// Settings
export function getSettings(): AppSettings {
  return load<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  save(KEYS.SETTINGS, settings);
  emit(EVENTS.SETTINGS);
}

// Helpers
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