import { Component, OnInit, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GoalsService } from '../../core/services/goals.service';
import { ThemeService } from '../../core/services/theme.service';
import { GoalCardComponent } from './components/goal-card/goal-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { TaskStatus } from '../../shared/models/goal.model';

@Component({
  selector: 'app-month-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, GoalCardComponent, ProgressBarComponent],
  template: `
    <div class="min-h-screen bg-background">

      <!-- Header (clean — no progress bar) -->
      <header class="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-4">
        <div class="max-w-2xl mx-auto flex items-center gap-3">
          <button
            (click)="goBack()"
            class="p-2 rounded-xl border border-border bg-card hover:bg-secondary transition-colors flex-shrink-0"
            title="Back to goals"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="font-display font-bold text-xl text-foreground truncate">{{ monthLabel }}</h1>
            <p class="text-xs text-muted-foreground" *ngIf="isCurrent">Current month</p>
          </div>
          <span *ngIf="overallProgress() >= 100" class="text-2xl flex-shrink-0">🏆</span>
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

      <main class="max-w-2xl mx-auto px-4 py-6 space-y-5">

        <!-- Progress card (always visible, + button to add goal) -->
        <div class="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-display font-semibold text-base">Overall Progress</h2>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-display font-bold text-accent">{{ overallProgress() }}%</span>
              <!-- + button to add goal -->
              <button
                (click)="toggleAddGoal()"
                class="p-1.5 rounded-lg transition-colors flex-shrink-0"
                [class.bg-accent]="showAddGoal"
                [class.text-accent-foreground]="showAddGoal"
                [class.text-muted-foreground]="!showAddGoal"
                [class.hover:bg-secondary]="!showAddGoal"
                title="Add goal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>

          <app-progress-bar [value]="overallProgress()" size="lg"></app-progress-bar>

          <div class="flex gap-4 text-sm">
            <span class="text-muted-foreground">{{ totalTasks() }} tasks</span>
            <span class="text-success font-medium">✓ {{ doneTasks() }} done</span>
            <span *ngIf="failedTasks() > 0" class="text-destructive font-medium">✗ {{ failedTasks() }} failed</span>
          </div>

          <!-- Inline add-goal input -->
          <div *ngIf="showAddGoal" class="pt-1">
            <div class="flex items-center gap-2">
              <input
                #goalInput
                [(ngModel)]="newGoalTitle"
                (keydown.enter)="submitGoal()"
                (keydown.escape)="cancelAddGoal()"
                placeholder="Goal name..."
                class="flex-1 font-display font-medium text-sm rounded-xl border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground placeholder:font-normal"
              />
              <button
                (click)="submitGoal()"
                [disabled]="!newGoalTitle.trim()"
                class="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <!-- Celebration -->
        <div
          *ngIf="totalTasks() > 0 && overallProgress() >= 100"
          class="rounded-2xl bg-success/10 border border-success/30 p-5 text-center"
        >
          <div class="text-4xl mb-2">🎉</div>
          <h3 class="font-display font-bold text-lg text-success">Month complete!</h3>
          <p class="text-sm text-muted-foreground mt-1">Amazing work — all tasks done!</p>
        </div>

        <!-- Goals List -->
        <div *ngIf="goals().length > 0" class="flex flex-col gap-6">
          <app-goal-card
            *ngFor="let goal of goals()"
            [goal]="goal"
            (deleteGoal)="onDeleteGoal($event)"
            (renameGoal)="onRenameGoal(goal.id, $event)"
            (addTask)="onAddTask($event)"
            (updateTask)="onUpdateTask($event)"
            (deleteTask)="onDeleteTask($event)"
          ></app-goal-card>
        </div>

        <!-- Empty State -->
        <div *ngIf="goals().length === 0" class="text-center py-16 space-y-3">
          <div class="text-5xl">🎯</div>
          <h3 class="font-display font-semibold text-lg text-foreground">No goals yet</h3>
          <p class="text-muted-foreground text-sm">Press <strong>+</strong> above to add your first goal for {{ monthLabel }}.</p>
        </div>

      </main>
    </div>
  `,
})
export class MonthDetailComponent implements OnInit {
  private monthKeySignal = signal('');
  monthLabel = '';
  isCurrent = false;
  newGoalTitle = '';
  showAddGoal = false;

  @ViewChild('goalInput') goalInputRef?: ElementRef<HTMLInputElement>;

  goals = computed(() => {
    const data = this.goalsService.getMonthData(this.monthKeySignal());
    return data?.goals ?? [];
  });

  private progressData = computed(() => this.goalsService.getMonthProgress(this.monthKeySignal()));
  totalTasks = computed(() => this.progressData().totalTasks);
  doneTasks = computed(() => this.progressData().doneTasks);
  failedTasks = computed(() => this.progressData().failedTasks);
  overallProgress = computed(() => this.progressData().overallProgress);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private goalsService: GoalsService,
    readonly themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const key = params.get('monthKey') ?? '';
      this.monthKeySignal.set(key);
      this.monthLabel = this.goalsService.getMonthLabel(key);
      this.isCurrent = this.goalsService.isCurrentMonth(key);
    });
  }

  get monthKey() { return this.monthKeySignal(); }

  goBack(): void {
    this.router.navigate(['/goals']);
  }

  toggleAddGoal(): void {
    this.showAddGoal = !this.showAddGoal;
    if (this.showAddGoal) {
      setTimeout(() => this.goalInputRef?.nativeElement.focus(), 0);
    } else {
      this.newGoalTitle = '';
    }
  }

  cancelAddGoal(): void {
    this.showAddGoal = false;
    this.newGoalTitle = '';
  }

  submitGoal(): void {
    const title = this.newGoalTitle.trim();
    if (!title) return;
    this.goalsService.addGoal(this.monthKey, title);
    this.newGoalTitle = '';
    this.showAddGoal = false;
  }

  onDeleteGoal(goalId: string): void {
    this.goalsService.removeGoal(this.monthKey, goalId);
  }

  onRenameGoal(goalId: string, title: string): void {
    this.goalsService.renameGoal(this.monthKey, goalId, title);
  }

  onAddTask(event: { goalId: string; title: string }): void {
    this.goalsService.addTask(this.monthKey, event.goalId, event.title);
  }

  onUpdateTask(event: { goalId: string; taskId: string; status: TaskStatus }): void {
    this.goalsService.updateTaskStatus(this.monthKey, event.goalId, event.taskId, event.status);
  }

  onDeleteTask(event: { goalId: string; taskId: string }): void {
    this.goalsService.removeTask(this.monthKey, event.goalId, event.taskId);
  }
}
