import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VocabService } from '../../core/services/vocab.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-english',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background">

      <!-- Header -->
      <header class="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/'])"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="flex-1">
            <h1 class="font-display font-bold text-2xl text-foreground">English</h1>
            <p class="text-xs text-muted-foreground">{{ vocabService.entries().length }} words &amp; phrases</p>
          </div>

          <!-- Filter toggle -->
          <button (click)="showUnknownOnly.set(!showUnknownOnly())"
            class="px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors"
            [class.bg-primary]="showUnknownOnly()"
            [class.text-primary-foreground]="showUnknownOnly()"
            [class.border-primary]="showUnknownOnly()"
            [class.bg-card]="!showUnknownOnly()"
            [class.border-border]="!showUnknownOnly()"
            [class.text-muted-foreground]="!showUnknownOnly()">
            To learn
          </button>

          <!-- Add button -->
          <button (click)="openAddModal()"
            class="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            title="Add word or phrase">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>

          <button (click)="themeService.toggle()"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0">
            @if (themeService.isDark()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </header>

      <main class="max-w-2xl mx-auto px-4 py-6">

        @if (vocabService.isLoading()) {
          <div class="flex justify-center py-24">
            <div class="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
          </div>
        } @else if (filtered().length === 0) {
          <div class="text-center py-24 space-y-2">
            <p class="text-4xl">📖</p>
            <p class="text-muted-foreground text-sm">
              {{ showUnknownOnly() ? 'No words left to learn!' : 'No words yet — add your first one.' }}
            </p>
          </div>
        } @else {
          <div class="space-y-3">
            @for (entry of filtered(); track entry.id) {
              <div class="rounded-2xl border bg-card shadow-sm p-4 flex gap-4 transition-all duration-200"
                [class.border-border]="!entry.known"
                [class.border-success]="entry.known"
                [class.opacity-60]="entry.known">

                <div class="flex-1 min-w-0">
                  <p class="font-display font-bold text-base text-foreground">{{ entry.word }}</p>
                  <p class="text-sm text-muted-foreground mt-0.5">{{ entry.translation }}</p>
                  @if (entry.example) {
                    <p class="text-xs text-muted-foreground/70 mt-2 italic border-l-2 border-border pl-2">{{ entry.example }}</p>
                  }
                </div>

                <div class="flex flex-col items-end gap-2 flex-shrink-0">
                  <!-- Known toggle -->
                  <button (click)="vocabService.toggleKnown(entry.id)"
                    class="p-1.5 rounded-lg transition-colors hover:bg-success/10 hover:text-success"
                    [ngClass]="entry.known ? 'text-success bg-success/10' : 'text-muted-foreground'"
                    [title]="entry.known ? 'Mark as unknown' : 'Mark as known'">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  <!-- Delete -->
                  <button (click)="vocabService.remove(entry.id)"
                    class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>

              </div>
            }
          </div>
        }

      </main>
    </div>

    <!-- ══════════ Add modal ══════════ -->
    @if (showModal) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        (click)="showModal = false">
        <div class="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border"
          (click)="$event.stopPropagation()">

          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
            <h3 class="font-display font-bold text-lg">Add word / phrase</h3>
            <button (click)="showModal = false"
              class="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-5 py-5 space-y-3">
            <input
              [(ngModel)]="newWord"
              placeholder="Word or phrase"
              class="w-full text-base font-semibold rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground placeholder:font-normal"
            />
            <input
              [(ngModel)]="newTranslation"
              placeholder="Translation / meaning"
              class="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
            />
            <input
              [(ngModel)]="newExample"
              placeholder="Example sentence (optional)"
              class="w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
            />
          </div>

          <div class="px-5 pb-5 flex gap-2">
            <button (click)="save()"
              [disabled]="!newWord.trim() || !newTranslation.trim()"
              class="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
              Save
            </button>
            <button (click)="showModal = false"
              class="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class EnglishComponent {
  showUnknownOnly = signal(false);
  showModal = false;

  newWord = '';
  newTranslation = '';
  newExample = '';

  filtered = computed(() => {
    const entries = this.vocabService.entries();
    return this.showUnknownOnly() ? entries.filter(e => !e.known) : entries;
  });

  constructor(
    readonly router: Router,
    readonly themeService: ThemeService,
    readonly vocabService: VocabService,
  ) {}

  openAddModal(): void {
    this.newWord = '';
    this.newTranslation = '';
    this.newExample = '';
    this.showModal = true;
  }

  async save(): Promise<void> {
    if (!this.newWord.trim() || !this.newTranslation.trim()) return;
    await this.vocabService.add(this.newWord, this.newTranslation, this.newExample);
    this.showModal = false;
  }
}
