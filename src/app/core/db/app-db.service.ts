import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Goal } from '../../shared/models/goal.model';
import { WalletCategory, WalletEntry } from '../../shared/models/wallet.model';
import { VocabEntry } from '../../shared/models/vocab.model';

export interface WalletSetting {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

const LEGACY_STORAGE_KEY = 'monthly-goals-data';

@Injectable({ providedIn: 'root' })
export class AppDatabase extends Dexie {
  goals!: Table<Goal, string>;
  walletCategories!: Table<WalletCategory, string>;
  walletEntries!: Table<WalletEntry, string>;
  walletSettings!: Table<WalletSetting, string>;
  vocabEntries!: Table<VocabEntry, string>;

  constructor() {
    super('FocusAppDB');

    this.version(1).stores({
      goals: '&id, monthKey',
    });

    this.version(2).stores({
      goals: '&id, monthKey',
      walletCategories: '&id',
      walletEntries: '&id, categoryId, monthKey',
    });

    this.version(3).stores({
      goals: '&id, monthKey',
      walletCategories: '&id',
      walletEntries: '&id, categoryId, monthKey',
      walletSettings: '&id',
    });

    this.version(4).stores({
      goals: '&id, monthKey',
      walletCategories: '&id',
      walletEntries: '&id, categoryId, monthKey',
      walletSettings: '&id',
      vocabEntries: '&id, known',
    });

    this.goals.hook('reading', (obj: Goal) => {
      if (obj.createdAt && !(obj.createdAt instanceof Date)) {
        obj.createdAt = new Date(obj.createdAt);
      }
      return obj;
    });

    this.vocabEntries.hook('reading', (obj: VocabEntry) => {
      if (obj.createdAt && !(obj.createdAt instanceof Date)) {
        obj.createdAt = new Date(obj.createdAt);
      }
      return obj;
    });

    this.walletEntries.hook('reading', (obj: WalletEntry) => {
      if (obj.createdAt && !(obj.createdAt instanceof Date)) {
        obj.createdAt = new Date(obj.createdAt);
      }
      return obj;
    });

    this.on('ready', async () => {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacy) return;

      try {
        const parsed = JSON.parse(legacy) as Record<string, { goals: any[]; monthKey: string }>;
        const goalsToMigrate: Goal[] = [];

        for (const [monthKey, monthData] of Object.entries(parsed)) {
          for (const goal of monthData.goals) {
            goalsToMigrate.push({
              ...goal,
              monthKey,
              createdAt: new Date(goal.createdAt),
            });
          }
        }

        if (goalsToMigrate.length > 0) {
          await this.goals.bulkPut(goalsToMigrate);
        }

        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // Ignore migration errors — app starts fresh
      }
    });
  }
}
