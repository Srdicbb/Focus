import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import { WalletService } from '../../core/services/wallet.service';
import { ThemeService } from '../../core/services/theme.service';


@Component({
  selector: 'app-wallet-month-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-background">

      <!-- Header -->
      <header class="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <button (click)="router.navigate(['/wallet'])"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="font-display font-bold text-xl text-foreground truncate">{{ monthLabel }}</h1>
          </div>
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

        <!-- ── Single card ── -->
        <div class="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

          <!-- Card header: stats + action buttons -->
          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center gap-3">
            <div class="flex-1 grid grid-cols-3 gap-2">
              <div>
                <p class="text-xs text-muted-foreground">Income</p>
                <p class="font-display font-bold text-base text-success">+{{ summary().totalIncome | number:'1.0-0' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Expenses</p>
                <p class="font-display font-bold text-base text-destructive">-{{ summary().totalExpenses | number:'1.0-0' }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Balance</p>
                <p class="font-display font-bold text-base"
                  [class.text-success]="summary().netBalance >= 0"
                  [class.text-destructive]="summary().netBalance < 0">
                  {{ summary().netBalance >= 0 ? '+' : '' }}{{ summary().netBalance | number:'1.0-0' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- History -->
              <button (click)="showHistory = true"
                class="p-2 rounded-xl border border-border bg-background hover:bg-secondary transition-colors relative"
                title="Transaction history">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                @if (transactionHistory().length > 0) {
                  <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">{{ transactionHistory().length }}</span>
                }
              </button>
              <button (click)="openSettingsModal()"
                class="p-2 rounded-xl border border-border bg-background hover:bg-secondary transition-colors"
                title="Manage categories">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </button>
              <button (click)="openIncomeModal()"
                class="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                title="Add income">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>

          <!-- Categories table -->
          <div class="px-5 py-4">
            @if (walletService.categories().length === 0) {
              <p class="text-sm text-muted-foreground text-center py-6">
                No categories yet — open settings to add some.
              </p>
            } @else {
              <div class="grid gap-2 px-2 mb-1" style="grid-template-columns: 1fr 3rem 5rem 5rem 3.5rem">
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</span>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">%</span>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Amount</span>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Current</span>
                <span></span>
              </div>

              @for (row of allCategoryRows(); track row.cat.id) {
                <div class="grid items-center gap-2 py-2.5 rounded-xl px-2 hover:bg-secondary/50 transition-colors" style="grid-template-columns: 1fr 3rem 5rem 5rem 3.5rem">
                  <span class="text-sm font-medium truncate">{{ row.cat.name }}</span>
                  <span class="text-sm text-right"
                    [class.text-foreground]="row.percent > 0"
                    [class.text-muted-foreground]="row.percent === 0">
                    {{ row.percent > 0 ? (row.percent | number:'1.0-0') + '%' : '—' }}
                  </span>
                  <span class="text-sm font-semibold text-right"
                    [class.text-success]="row.income > 0"
                    [class.text-muted-foreground]="row.income === 0">
                    {{ row.income > 0 ? (row.income | number:'1.0-0') : '—' }}
                  </span>
                  <span class="text-sm font-semibold text-right"
                    [class.text-success]="row.current > 0"
                    [class.text-destructive]="row.current < 0"
                    [class.text-muted-foreground]="row.current === 0">
                    {{ row.current === 0 ? '—' : ((row.current > 0 ? '+' : '') + (row.current | number:'1.0-0')) }}
                  </span>
                  <div class="flex justify-end">
                    <button
                      (click)="openExpenseModal(row.cat.id, row.cat.name)"
                      class="p-1.5 rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      [title]="'Add expense — ' + row.cat.name"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                  </div>
                </div>
              }
            }
          </div>
        </div>


      </main>
    </div>

    <!-- ══════════ Expense modal ══════════ -->
    @if (showExpenseModal) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        (click)="showExpenseModal = false">
        <div class="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border"
          (click)="$event.stopPropagation()">

          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 class="font-display font-bold text-lg">Add Expense</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ expenseCatName }}</p>
            </div>
            <button (click)="showExpenseModal = false"
              class="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-5 py-5">
            <input
              [(ngModel)]="quickExpenseAmount"
              type="number" min="0" placeholder="Amount"
              class="w-full text-lg font-semibold rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-destructive/40 placeholder:text-muted-foreground placeholder:font-normal"
            />
          </div>

          <div class="px-5 pb-5 flex gap-2">
            <button (click)="submitQuickExpense(activeExpenseCatId!)"
              [disabled]="!quickExpenseAmount"
              class="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
              Confirm
            </button>
            <button (click)="showExpenseModal = false"
              class="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>

        </div>
      </div>
    }

    <!-- ══════════ History modal ══════════ -->
    @if (showHistory) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        (click)="showHistory = false">
        <div class="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[80vh]"
          (click)="$event.stopPropagation()">

          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-display font-bold text-lg">History</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ monthLabel }}</p>
            </div>
            <button (click)="showHistory = false"
              class="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto min-h-0">
            @if (transactionHistory().length === 0) {
              <p class="text-sm text-muted-foreground text-center py-10">No transactions yet.</p>
            }
            @for (event of transactionHistory(); track event.batchId) {
              <div class="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold"
                    [class.text-success]="event.total > 0"
                    [class.text-destructive]="event.total < 0">
                    {{ event.total > 0 ? '+' : '' }}{{ event.total | number:'1.0-2' }}
                  </p>
                  @if (event.label) {
                    <p class="text-xs text-muted-foreground">{{ event.label }}</p>
                  }
                </div>
                <p class="text-xs text-muted-foreground flex-shrink-0">{{ event.createdAt | date:'MMM d, HH:mm' }}</p>
                <button (click)="walletService.removeEntriesByBatch(event.batchId)"
                  class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                  title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            }
          </div>

        </div>
      </div>
    }

    <!-- ══════════ Settings modal: categories + default % ══════════ -->
    @if (showSettingsModal) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        (click)="closeSettings()">
        <div class="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[85vh]"
          (click)="$event.stopPropagation()">

          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-display font-bold text-lg">Categories</h3>
              <p class="text-xs text-muted-foreground mt-0.5">Name and default allocation %</p>
            </div>
            <button (click)="closeSettings()"
              class="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Category list with % inputs -->
          <div class="flex-1 overflow-y-auto min-h-0">
            @if (settingsCats.length === 0) {
              <p class="text-sm text-muted-foreground text-center py-8">No categories yet.</p>
            } @else {
              <!-- Header row -->
              <div class="flex items-center gap-3 px-5 pt-4 pb-1">
                <span class="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</span>
                <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20 text-right">Default %</span>
                <span class="w-7"></span>
              </div>
              @for (row of settingsCats; track row.id) {
                <div class="flex items-center gap-3 px-5 py-2.5 hover:bg-secondary/50 transition-colors">
                  <span class="flex-1 text-sm font-medium truncate">{{ row.name }}</span>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <input
                      type="number"
                      [(ngModel)]="row.defaultPercent"
                      min="0" max="100"
                      class="w-16 text-sm text-right rounded-lg border border-border bg-background px-2 py-1.5 outline-none focus:ring-2 focus:ring-accent/50"
                      placeholder="0"
                    />
                    <span class="text-xs text-muted-foreground">%</span>
                  </div>
                  <button (click)="removeSettingsCat(row.id)"
                    class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
                    title="Delete (only if no entries)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              }

            }
          </div>

          <!-- Add new category + progress + save -->
          <div class="px-5 pb-5 pt-3 border-t border-border space-y-3 flex-shrink-0">
            <div class="flex gap-2">
              <input
                [(ngModel)]="newCatName"
                placeholder="New category name..."
                (keydown.enter)="addCategory()"
                class="flex-1 text-sm rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
              />
              <button (click)="addCategory()"
                [disabled]="!newCatName.trim()"
                class="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Add
              </button>
            </div>

            <!-- Allocation progress bar -->
            <div class="space-y-1.5">
              <div class="flex justify-between text-xs font-medium">
                <span class="text-muted-foreground">Allocated</span>
                <span
                  [class.text-success]="settingsTotal === 100"
                  [class.text-destructive]="settingsTotal > 100"
                  [class.text-muted-foreground]="settingsTotal < 100">
                  {{ settingsTotal }}%
                </span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden bg-secondary">
                <div class="h-full rounded-full transition-all duration-300"
                  [class.bg-success]="settingsTotal === 100"
                  [class.bg-accent]="settingsTotal > 0 && settingsTotal < 100"
                  [class.bg-destructive]="settingsTotal > 100"
                  [style.width]="(settingsTotal > 100 ? 100 : settingsTotal) + '%'">
                </div>
              </div>
              @if (settingsTotal !== 100) {
                <p class="text-xs text-muted-foreground">
                  @if (settingsTotal < 100) { {{ 100 - settingsTotal }}% unallocated }
                  @else { Over by {{ settingsTotal - 100 }}% — reduce some categories }
                </p>
              }
            </div>

            <button (click)="saveSettings()"
              [disabled]="settingsTotal !== 100"
              class="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
              Save
            </button>
          </div>

        </div>
      </div>
    }

    <!-- ══════════ Income modal ══════════ -->
    @if (showIncomeModal) {
      <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        (click)="showIncomeModal = false">
        <div class="w-full max-w-sm bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh]"
          (click)="$event.stopPropagation()">

          <div class="px-5 pt-5 pb-4 border-b border-border flex items-center justify-between flex-shrink-0">
            <div>
              <h3 class="font-display font-bold text-lg">Add Income</h3>
              <p class="text-xs text-muted-foreground mt-0.5">{{ monthLabel }}</p>
            </div>
            <button (click)="showIncomeModal = false"
              class="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="px-5 py-5 flex-shrink-0">
            <input
              [(ngModel)]="incomeAmount"
              type="number" min="0" placeholder="Amount"
              class="w-full text-lg font-semibold rounded-xl border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-success/40 placeholder:text-muted-foreground placeholder:font-normal"
            />
          </div>

          <div class="px-5 pb-5 pt-0 flex gap-2 flex-shrink-0">
            <button (click)="confirmIncome()"
              [disabled]="!incomeAmount || walletService.categories().length === 0"
              class="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
              Confirm
            </button>
            <button (click)="showIncomeModal = false"
              class="px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors">
              Cancel
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class WalletMonthDetailComponent implements OnInit {
  private monthKeySignal = signal('');
  monthLabel = '';

  showIncomeModal = false;
  showSettingsModal = false;
  showHistory = false;
  showExpenseModal = false;
  expenseCatName = '';

  incomeAmount: number | null = null;

  newCatName = '';

  // Local editable copy of categories for the settings modal
  settingsCats: { id: string; name: string; defaultPercent: number }[] = [];

  activeExpenseCatId: string | null = null;
  quickExpenseAmount: number | null = null;

  summary = computed(() => this.walletService.getMonthSummary(this.monthKeySignal()));

  allCategoryRows = computed(() => {
    const s = this.summary();
    const balanceMap = new Map(s.categories.map(cb => [cb.category.id, cb]));
    const allEntries = this.walletService.entries();
    const monthKey = this.monthKeySignal();
    return this.walletService.categories().map(cat => {
      const cb = balanceMap.get(cat.id);
      const income = cb?.income ?? 0;
      const expenses = cb?.expenses ?? 0;
      const balance = cb?.balance ?? 0;
      const percent = s.totalIncome > 0 ? (income / s.totalIncome) * 100 : 0;
      const current = allEntries
        .filter(e => e.categoryId === cat.id && e.monthKey <= monthKey)
        .reduce((sum, e) => sum + e.amount, 0);
      return { cat, income, expenses, balance, percent, current };
    }).sort((a, b) => b.percent - a.percent);
  });

  /** All transactions for this month grouped: income by batchId, expenses individually */
  transactionHistory = computed(() => {
    const monthKey = this.monthKeySignal();
    const entries = this.walletService.entries().filter(e => e.monthKey === monthKey);
    const catMap = new Map(this.walletService.categories().map(c => [c.id, c.name]));

    const groups = new Map<string, { batchId: string; total: number; label?: string; createdAt: Date }>();
    for (const e of entries) {
      const key = e.batchId ?? e.id;
      if (!groups.has(key)) {
        const label = e.amount < 0 ? catMap.get(e.categoryId) : undefined;
        groups.set(key, { batchId: key, total: 0, label, createdAt: e.createdAt });
      }
      groups.get(key)!.total += e.amount;
    }
    return Array.from(groups.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  get settingsTotal(): number {
    return this.settingsCats.reduce((s, r) => s + (+r.defaultPercent || 0), 0);
  }

  constructor(
    private route: ActivatedRoute,
    readonly router: Router,
    readonly themeService: ThemeService,
    readonly walletService: WalletService,
    private goalsService: GoalsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const key = params.get('monthKey') ?? '';
      this.monthKeySignal.set(key);
      this.monthLabel = this.goalsService.getMonthLabel(key);
    });
  }

  openSettingsModal(): void {
    this.settingsCats = this.walletService.categories()
      .map(c => ({ id: c.id, name: c.name, defaultPercent: c.defaultPercent ?? 0 }))
      .sort((a, b) => b.defaultPercent - a.defaultPercent);
    this.newCatName = '';
    this.showSettingsModal = true;
  }

  async addCategory(): Promise<void> {
    const name = this.newCatName.trim();
    if (!name) return;
    await this.walletService.addCategory(name);
    const cats = this.walletService.categories();
    const newCat = cats[cats.length - 1];
    if (newCat) {
      this.settingsCats.push({ id: newCat.id, name: newCat.name, defaultPercent: 0 });
    }
    this.newCatName = '';
  }

  async saveSettings(): Promise<void> {
    for (const row of this.settingsCats) {
      await this.walletService.updateCategoryPercent(row.id, +row.defaultPercent || 0);
    }
    this.showSettingsModal = false;
  }

  removeSettingsCat(id: string): void {
    this.walletService.removeCategory(id);
    this.settingsCats = this.settingsCats.filter(r => r.id !== id);
  }

  closeSettings(): void {
    this.showSettingsModal = false;
  }

  openIncomeModal(): void {
    this.incomeAmount = null;
    this.showIncomeModal = true;
  }

  async confirmIncome(): Promise<void> {
    if (!this.incomeAmount) return;
    const cats = this.walletService.categories();
    if (cats.length === 0) return;

    const monthKey = this.monthKeySignal();
    const amount = Math.abs(this.incomeAmount);
    const batchId = Math.random().toString(36).substring(2, 9);

    for (const cat of cats) {
      const pct = +cat.defaultPercent! || 0;
      if (!pct) continue;
      const share = Math.round(amount * pct) / 100;
      await this.walletService.addEntry(monthKey, cat.id, share, undefined, batchId);
    }

    this.showIncomeModal = false;
    this.incomeAmount = null;
  }

  openExpenseModal(catId: string, catName: string): void {
    this.activeExpenseCatId = catId;
    this.expenseCatName = catName;
    this.quickExpenseAmount = null;
    this.showExpenseModal = true;
  }

  async submitQuickExpense(catId: string): Promise<void> {
    if (!this.quickExpenseAmount) return;
    await this.walletService.addEntry(
      this.monthKeySignal(),
      catId,
      -Math.abs(this.quickExpenseAmount),
    );
    this.showExpenseModal = false;
    this.activeExpenseCatId = null;
    this.quickExpenseAmount = null;
  }
}
