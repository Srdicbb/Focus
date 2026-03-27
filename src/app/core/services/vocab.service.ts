import { Injectable, signal } from '@angular/core';
import { AppDatabase } from '../db/app-db.service';
import { VocabEntry } from '../../shared/models/vocab.model';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

@Injectable({ providedIn: 'root' })
export class VocabService {
  private _entries = signal<VocabEntry[]>([]);
  isLoading = signal(true);

  readonly entries = this._entries.asReadonly();

  constructor(private db: AppDatabase) {
    this.init();
  }

  private async init(): Promise<void> {
    try {
      const entries = await this.db.vocabEntries.toArray();
      this._entries.set(entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } finally {
      this.isLoading.set(false);
    }
  }

  async add(word: string, translation: string, example?: string): Promise<void> {
    const entry: VocabEntry = {
      id: generateId(),
      word: word.trim(),
      translation: translation.trim(),
      example: example?.trim() || undefined,
      known: false,
      createdAt: new Date(),
    };
    this._entries.set([entry, ...this._entries()]);
    await this.db.vocabEntries.put(entry);
  }

  async toggleKnown(id: string): Promise<void> {
    const updated = this._entries().map(e =>
      e.id === id ? { ...e, known: !e.known } : e
    );
    this._entries.set(updated);
    const entry = updated.find(e => e.id === id);
    if (entry) await this.db.vocabEntries.put(entry);
  }

  async remove(id: string): Promise<void> {
    this._entries.set(this._entries().filter(e => e.id !== id));
    await this.db.vocabEntries.delete(id);
  }
}
