import { Injectable, signal } from '@angular/core';
import { AppDatabase } from '../db/app-db.service';
import {
  WalletCategory,
  WalletEntry,
  WalletMonthSummary,
  CategoryBalance,
} from '../../shared/models/wallet.model';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function prevMonthKey(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  const d = new Date(y, m - 2, 1); // m-2: month is 0-indexed, go back 1
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private _categories = signal<WalletCategory[]>([]);
  private _entries = signal<WalletEntry[]>([]);
  isLoading = signal(true);

  readonly categories = this._categories.asReadonly();
  readonly entries = this._entries.asReadonly();

  constructor(private db: AppDatabase) {
    this.init();
  }

  private async init(): Promise<void> {
    const [cats, entries] = await Promise.all([
      this.db.walletCategories.toArray(),
      this.db.walletEntries.toArray(),
    ]);
    this._categories.set(cats);
    this._entries.set(entries);
    this.isLoading.set(false);
  }

  async addCategory(name: string): Promise<void> {
    const cat: WalletCategory = { id: generateId(), name };
    this._categories.set([...this._categories(), cat]);
    await this.db.walletCategories.put(cat);
  }

  async updateCategoryPercent(id: string, defaultPercent: number): Promise<void> {
    const updated = this._categories().map(c =>
      c.id === id ? { ...c, defaultPercent } : c
    );
    this._categories.set(updated);
    const cat = updated.find(c => c.id === id);
    if (cat) await this.db.walletCategories.put(cat);
  }

  async removeCategory(id: string): Promise<void> {
    const hasEntries = this._entries().some(e => e.categoryId === id);
    if (hasEntries) return;
    this._categories.set(this._categories().filter(c => c.id !== id));
    await this.db.walletCategories.delete(id);
  }

  async addEntry(monthKey: string, categoryId: string, amount: number, note?: string, batchId?: string): Promise<void> {
    const entry: WalletEntry = {
      id: generateId(),
      categoryId,
      amount,
      note,
      monthKey,
      createdAt: new Date(),
      batchId,
    };
    this._entries.set([...this._entries(), entry]);
    await this.db.walletEntries.put(entry);
  }

  async removeEntry(id: string): Promise<void> {
    this._entries.set(this._entries().filter(e => e.id !== id));
    await this.db.walletEntries.delete(id);
  }

  async removeEntriesByBatch(batchId: string): Promise<void> {
    const matches = (e: WalletEntry) => e.batchId === batchId || (!e.batchId && e.id === batchId);
    const toRemove = this._entries().filter(matches).map(e => e.id);
    this._entries.set(this._entries().filter(e => !matches(e)));
    await Promise.all(toRemove.map(id => this.db.walletEntries.delete(id)));
  }

  /** Returns % allocation per categoryId inferred from previous month's income entries. */
  getPrevMonthAllocations(monthKey: string): Record<string, number> {
    const prev = prevMonthKey(monthKey);
    const prevIncome = this._entries().filter(e => e.monthKey === prev && e.amount > 0);
    const total = prevIncome.reduce((s, e) => s + e.amount, 0);
    if (total === 0) return {};

    const raw: Record<string, number> = {};
    for (const e of prevIncome) {
      raw[e.categoryId] = (raw[e.categoryId] || 0) + (e.amount / total) * 100;
    }

    // Round to integers, fix remainder on largest category to keep sum = 100
    const ids = Object.keys(raw);
    const rounded: Record<string, number> = {};
    let sum = 0;
    for (const id of ids) {
      rounded[id] = Math.floor(raw[id]);
      sum += rounded[id];
    }
    const remainder = 100 - sum;
    if (remainder > 0 && ids.length > 0) {
      // Give remainder to the category with the largest fractional part
      const largest = ids.reduce((a, b) => (raw[a] % 1) >= (raw[b] % 1) ? a : b);
      rounded[largest] += remainder;
    }
    return rounded;
  }

  getMonthSummary(monthKey: string): WalletMonthSummary {
    const allEntries = this._entries();
    const carryOver = allEntries
      .filter(e => e.monthKey < monthKey)
      .reduce((s, e) => s + e.amount, 0);

    const entries = allEntries.filter(e => e.monthKey === monthKey);

    if (entries.length === 0 && carryOver === 0) {
      return { monthKey, totalIncome: 0, totalExpenses: 0, netBalance: 0, carryOver: 0, categories: [] };
    }

    const totalIncome = entries.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const totalExpenses = Math.abs(entries.filter(e => e.amount < 0).reduce((s, e) => s + e.amount, 0));
    const netBalance = totalIncome - totalExpenses + carryOver;

    const cats = this._categories();
    const categoryMap = new Map<string, CategoryBalance>();
    for (const cat of cats) {
      categoryMap.set(cat.id, { category: cat, income: 0, expenses: 0, balance: 0 });
    }
    for (const entry of entries) {
      const cb = categoryMap.get(entry.categoryId);
      if (!cb) continue;
      if (entry.amount > 0) { cb.income += entry.amount; }
      else { cb.expenses += Math.abs(entry.amount); }
      cb.balance += entry.amount;
    }
    const categories = Array.from(categoryMap.values()).filter(cb => cb.income > 0 || cb.expenses > 0);

    return { monthKey, totalIncome, totalExpenses, netBalance, carryOver, categories };
  }
}
