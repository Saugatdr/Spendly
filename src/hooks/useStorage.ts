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
  EVENTS,
} from '../store/storage';
import { Transaction, Category, Budget, AppSettings } from '../types';

function useStorageListener<T>(fetcher: () => T, event: string): { data: T; refresh: () => void } {
  const [data, setData] = useState<T>(fetcher);
  const refresh = useCallback(() => setData(fetcher()), [fetcher]);
  useEffect(() => {
    refresh();
    window.addEventListener(event, refresh);
    return () => window.removeEventListener(event, refresh);
  }, [refresh, event]);
  return { data, refresh };
}

export function useTransactions() {
  const { data: transactions, refresh } = useStorageListener(getTransactions, EVENTS.TRANSACTIONS);
  return { transactions, refresh };
}

export function useCategories() {
  const { data: categories, refresh } = useStorageListener(getCategories, EVENTS.CATEGORIES);
  return { categories, refresh };
}

export function useBudgets() {
  const { data: budgets, refresh } = useStorageListener(getBudgets, EVENTS.BUDGETS);
  return { budgets, refresh };
}

export function useSettings() {
  const { data: settings, refresh } = useStorageListener(getSettings, EVENTS.SETTINGS);
  return { settings, refresh };
}

export function useDashboard(month?: string) {
  const currentMonth = month || getCurrentMonth();
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();
  const { settings } = useSettings();

  const income = getTotalIncome(currentMonth, transactions);
  const expenses = getTotalExpenses(currentMonth, transactions);
  const balance = income - expenses;

  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  const categoryStats = categories.map(cat => {
    const spent = getCategorySpend(cat.id, currentMonth, transactions);
    const budget = budgets.find(b => b.categoryId === cat.id && b.month === currentMonth);
    return { category: cat, spent, budget: budget?.limit };
  }).filter(s => s.spent > 0 || s.budget);

  return { income, expenses, balance, monthTransactions, categoryStats, settings, currentMonth };
}