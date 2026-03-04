import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../core/services/goals.service';
import { MonthCardComponent } from './components/month-card/month-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MonthCardComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Header -->
      <header class="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="font-display font-bold text-2xl text-foreground">Weekly Win Well</h1>
            <p class="text-sm text-muted-foreground">Track your goals month by month</p>
          </div>
          <span class="text-3xl">🎯</span>
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

  constructor(readonly goalsService: GoalsService) {}

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
