import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import { ThemeService } from '../../core/services/theme.service';
import { MonthCardComponent } from './components/month-card/month-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MonthCardComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <button
            (click)="router.navigate(['/'])"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0"
            title="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="flex-1">
            <h1 class="font-display font-bold text-2xl text-foreground">Goals</h1>
            <p class="text-sm text-muted-foreground">Track your goals month by month</p>
          </div>
          <button
            (click)="themeService.toggle()"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0"
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

      <!-- Month Grid -->
      <main class="max-w-2xl mx-auto px-4 py-6">
        @if (goalsService.isLoading()) {
          <div class="flex justify-center items-center py-24">
            <div class="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-month-card
              *ngFor="let monthKey of monthKeys()"
              [monthKey]="monthKey"
            ></app-month-card>
          </div>
        }
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  monthKeys = computed(() => this.goalsService.allMonthKeys());

  constructor(
    readonly goalsService: GoalsService,
    readonly themeService: ThemeService,
    readonly router: Router,
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      const currentId = this.goalsService.currentMonthKey;
      const el = document.getElementById(currentId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}
