import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GoalsService } from '../../../../core/services/goals.service';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-month-card',
  standalone: true,
  imports: [CommonModule, ProgressBarComponent],
  template: `
    <div
      [id]="monthKey"
      class="rounded-2xl border p-5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      [class.border-accent]="isCurrent"
      [class.border-border]="!isCurrent"
      [class.bg-card]="!isCurrent"
      [class.bg-primary]="isCurrent"
      [class.text-primary-foreground]="isCurrent"
      (click)="navigate()"
    >
      <div class="flex items-start justify-between mb-3">
        <div>
          <h3 class="font-display font-semibold text-lg leading-tight">{{ label }}</h3>
          <p class="text-sm mt-0.5" [class.opacity-70]="isCurrent" [class.text-muted-foreground]="!isCurrent">
            {{ goalCount }} goal{{ goalCount !== 1 ? 's' : '' }} &bull; {{ taskCount }} task{{ taskCount !== 1 ? 's' : '' }}
          </p>
        </div>
        <span *ngIf="progress >= 100" class="text-2xl" title="All done!">🏆</span>
        <span *ngIf="isCurrent && progress < 100" class="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">Current</span>
      </div>

      <div class="space-y-1">
        <div class="flex justify-between text-xs font-medium mb-1" [class.opacity-80]="isCurrent" [class.text-muted-foreground]="!isCurrent">
          <span>Progress</span>
          <span>{{ progress }}%</span>
        </div>
        <app-progress-bar [value]="progress" size="sm"></app-progress-bar>
      </div>
    </div>
  `,
})
export class MonthCardComponent {
  @Input() monthKey!: string;

  get label() { return this.goalsService.getMonthLabel(this.monthKey); }
  get isCurrent() { return this.goalsService.isCurrentMonth(this.monthKey); }
  get progress() { return this.goalsService.getMonthProgress(this.monthKey).overallProgress; }
  get goalCount() { return this.goalsService.getMonthData(this.monthKey)?.goals.length ?? 0; }
  get taskCount() {
    const data = this.goalsService.getMonthData(this.monthKey);
    return data?.goals.flatMap(g => g.tasks).length ?? 0;
  }

  constructor(private goalsService: GoalsService, private router: Router) {}

  navigate(): void {
    this.router.navigate(['/month', this.monthKey]);
  }
}
