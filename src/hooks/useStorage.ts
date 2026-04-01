import { useState, useEffect, useCallback } from 'react';
import {
  getTransactions,
  getCategories,
  getBudgets,
  getSettings,
  getCurrentMonth,
  getTotalIncome,
  getTotalExpenses,
  getCategorySpend,
} from '../store/storage';
import { Transaction, Category, Budget, AppSettings } from '../types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const refresh = useCallback(() => setTransactions(getTransactions()), []);
  useEffect(() => { refresh(); }, [refresh]);
  return { transactions, refresh };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const refresh = useCallback(() => setCategories(getCategories()), []);
  useEffect(() => { refresh(); }, [refresh]);
  return { categories, refresh };
}

export function useBudgets() {
  const [budgets, setBudgetsState] = useState<Budget[]>([]);
  const refresh = useCallback(() => setBudgetsState(getBudgets()), []);
  useEffect(() => { refresh(); }, [refresh]);
  return { budgets, refresh };
}

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(getSettings());
  const refresh = useCallback(() => setSettingsState(getSettings()), []);
  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('spendly:settings-changed', handler);
    return () => window.removeEventListener('spendly:settings-changed', handler);
  }, [refresh]);
  return { settings, refresh };
}

export function useDashboard(month?: string) {
  const currentMonth = month || getCurrentMonth();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();
  const { settings } = useSettings();

  const income = getTotalIncome(currentMonth);
  const expenses = getTotalExpenses(currentMonth);
  const balance = income - expenses;

  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const categoryStats = categories.map(cat => {
    const spent = getCategorySpend(cat.id, currentMonth);
    const budget = budgets.find(b => b.categoryId === cat.id && b.month === currentMonth);
    return { category: cat, spent, budget: budget?.limit };
  }).filter(s => s.spent > 0 || s.budget);

  return { income, expenses, balance, monthTransactions, categoryStats, settings, currentMonth };
}
