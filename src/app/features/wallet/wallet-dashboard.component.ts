import { Component, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import { WalletService } from '../../core/services/wallet.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-wallet-dashboard',
  standalone: true,
  template: `
    <div class="min-h-screen bg-background">

      <!-- Sticky header -->
      <header class="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <button
            (click)="router.navigate(['/'])"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0"
            title="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="flex-1">
            <h1 class="font-display font-bold text-2xl text-foreground">Wallet</h1>
            <p class="text-xs text-muted-foreground">Monthly budget tracker</p>
          </div>
          <button
            (click)="themeService.toggle()"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors"
            [title]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            @if (themeService.isDark()) {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>
        </div>
      </header>

      <!-- Month grid -->
      <main class="max-w-2xl mx-auto px-4 py-6">
        @if (walletService.isLoading()) {
          <div class="flex justify-center items-center py-24">
            <div class="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @for (monthKey of monthKeys(); track monthKey) {
              <div
                class="rounded-2xl border p-5 shadow-sm transition-all duration-200"
                [class.border-accent]="isCurrent(monthKey)"
                [class.border-border]="!isCurrent(monthKey)"
                [class.bg-primary]="isCurrent(monthKey)"
                [class.text-primary-foreground]="isCurrent(monthKey)"
                [class.bg-card]="!isCurrent(monthKey)"
                [class.opacity-40]="isFuture(monthKey)"
                [class.cursor-not-allowed]="isFuture(monthKey)"
                [class.cursor-pointer]="!isFuture(monthKey)"
                [class.hover:shadow-md]="!isFuture(monthKey)"
                [class.hover:-translate-y-0.5]="!isFuture(monthKey)"
                (click)="!isFuture(monthKey) && router.navigate(['/wallet', monthKey])"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h3 class="font-display font-semibold text-lg leading-tight">{{ getMonthLabel(monthKey) }}</h3>
                    <p
                      class="text-sm mt-0.5 font-semibold"
                      [class.opacity-80]="isCurrent(monthKey)"
                      [class.text-success]="!isCurrent(monthKey) && !isFuture(monthKey) && getSummary(monthKey).netBalance >= 0"
                      [class.text-destructive]="!isCurrent(monthKey) && getSummary(monthKey).netBalance < 0"
                    >
                      @if (isFuture(monthKey)) {
                        <span class="font-normal text-muted-foreground">Upcoming</span>
                      } @else if (getSummary(monthKey).totalIncome === 0 && getSummary(monthKey).totalExpenses === 0) {
                        <span class="font-normal" [class.opacity-60]="isCurrent(monthKey)" [class.text-muted-foreground]="!isCurrent(monthKey)">No data</span>
                      } @else {
                        {{ getSummary(monthKey).netBalance >= 0 ? '+' : '' }}{{ getSummary(monthKey).netBalance | number:'1.0-0' }}
                      }
                    </p>
                  </div>
                  @if (isCurrent(monthKey)) {
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Current</span>
                  }
                </div>

                <!-- Progress bar -->
                @if (!isFuture(monthKey) && (getSummary(monthKey).totalIncome > 0 || getSummary(monthKey).totalExpenses > 0)) {
                  <div>
                    <div class="flex justify-between text-xs mb-1" [class.opacity-80]="isCurrent(monthKey)" [class.text-muted-foreground]="!isCurrent(monthKey)">
                      <span>In: {{ getSummary(monthKey).totalIncome | number:'1.0-0' }}</span>
                      <span>Out: {{ getSummary(monthKey).totalExpenses | number:'1.0-0' }}</span>
                    </div>
                    <div class="w-full h-2 rounded-full overflow-hidden bg-secondary">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        [class.bg-success]="getSummary(monthKey).netBalance >= 0"
                        [class.bg-destructive]="getSummary(monthKey).netBalance < 0"
                        [style.width.%]="getIncomeRatio(monthKey)"
                      ></div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  imports: [DecimalPipe],
})
export class WalletDashboardComponent {
  monthKeys = computed(() => this.goalsService.allMonthKeys());

  constructor(
    readonly router: Router,
    readonly themeService: ThemeService,
    readonly walletService: WalletService,
    private goalsService: GoalsService,
  ) {}

  isCurrent(monthKey: string): boolean {
    return monthKey === this.goalsService.currentMonthKey;
  }

  isFuture(monthKey: string): boolean {
    return monthKey > this.goalsService.currentMonthKey;
  }

  getMonthLabel(monthKey: string): string {
    return this.goalsService.getMonthLabel(monthKey);
  }

  getSummary(monthKey: string) {
    return this.walletService.getMonthSummary(monthKey);
  }

  getIncomeRatio(monthKey: string): number {
    const s = this.getSummary(monthKey);
    const total = s.totalIncome + s.totalExpenses;
    if (total === 0) return 0;
    return Math.round((s.totalIncome / total) * 100);
  }
}
