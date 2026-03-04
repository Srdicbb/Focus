import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Goal, Task, TaskStatus } from '../../../../shared/models/goal.model';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-goal-card',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressBarComponent],
  template: `
    <div class="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

      <!-- Header -->
      <div class="px-5 pt-5 pb-3 space-y-2">
        <div class="flex items-center gap-2">

          <!-- Editable title -->
          <div class="flex-1 min-w-0">
            <div *ngIf="!editingTitle" class="flex items-center gap-1 group">
              <h3 class="font-display font-semibold text-base leading-tight truncate">{{ goal.title }}</h3>
              <button
                (click)="startEditTitle()"
                class="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                title="Rename goal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
            <input
              *ngIf="editingTitle"
              #titleInput
              [(ngModel)]="editTitleValue"
              (keydown.enter)="saveTitle()"
              (keydown.escape)="cancelEditTitle()"
              (blur)="saveTitle()"
              class="w-full font-display font-semibold text-base bg-transparent border-b-2 border-accent outline-none leading-tight"
            />
            <p class="text-xs text-muted-foreground mt-0.5">
              {{ doneTasks }}/{{ goal.tasks.length }} done
              <span *ngIf="failedTasks > 0" class="text-destructive"> · {{ failedTasks }} failed</span>
            </p>
          </div>

          <!-- + task button -->
          <button
            (click)="toggleAddTask()"
            class="p-1.5 rounded-lg transition-colors flex-shrink-0"
            [class.bg-accent]="showInput"
            [class.text-accent-foreground]="showInput"
            [class.text-muted-foreground]="!showInput"
            [class.hover:bg-secondary]="!showInput"
            title="Add task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>

          <!-- Delete goal -->
          <button
            (click)="deleteGoal.emit(goal.id)"
            class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex-shrink-0"
            title="Delete goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>

        <!-- Goal progress bar -->
        <app-progress-bar [value]="progress" size="sm"></app-progress-bar>
      </div>

      <!-- Task list -->
      <div *ngIf="goal.tasks.length > 0" class="px-4 pt-1 pb-4 flex flex-col gap-2">
        <div
          *ngFor="let task of goal.tasks"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
          [ngClass]="{
            'bg-green-100 dark:bg-green-900/30': task.status === 'done',
            'bg-red-100 dark:bg-red-900/30': task.status === 'failed',
            'bg-secondary': task.status === 'pending'
          }"
        >

          <!-- Status icon -->
          <div class="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <svg *ngIf="task.status === 'done'" class="text-success" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
            <svg *ngIf="task.status === 'failed'" class="text-destructive" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <svg *ngIf="task.status === 'pending'" class="text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
          </div>

          <!-- Title -->
          <span
            class="flex-1 min-w-0 text-sm truncate"
            [class.text-success]="task.status === 'done'"
            [class.font-medium]="task.status === 'done'"
            [class.text-destructive]="task.status === 'failed'"
            [class.font-medium]="task.status === 'failed'"
          >{{ task.title }}</span>

          <!-- Actions -->
          <div class="flex items-center gap-0.5 flex-shrink-0">
            <button *ngIf="task.status !== 'done'"
              (click)="setTaskStatus(task, 'done')"
              class="p-1 rounded text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
              title="Mark done">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button *ngIf="task.status !== 'failed'"
              (click)="setTaskStatus(task, 'failed')"
              class="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Mark failed">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <button *ngIf="task.status !== 'pending'"
              (click)="setTaskStatus(task, 'pending')"
              class="p-1 rounded text-muted-foreground hover:bg-secondary transition-colors"
              title="Reset">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.12"/></svg>
            </button>
            <button
              (click)="deleteTask.emit({ goalId: goal.id, taskId: task.id })"
              class="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Delete task">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Inline add-task input -->
      <div *ngIf="showInput" class="px-5 py-3 border-t border-border bg-secondary/30">
        <div class="flex items-center gap-2">
          <input
            #taskInput
            [(ngModel)]="newTaskTitle"
            (keydown.enter)="submitTask()"
            (keydown.escape)="cancelAddTask()"
            placeholder="Task name..."
            class="flex-1 text-sm rounded-lg border border-border bg-background px-3 py-1.5 outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground"
          />
          <button
            (click)="submitTask()"
            [disabled]="!newTaskTitle.trim()"
            class="p-1.5 rounded-lg bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
        </div>
      </div>

    </div>
  `,
})
export class GoalCardComponent {
  @Input() goal!: Goal;
  @Output() deleteGoal = new EventEmitter<string>();
  @Output() renameGoal = new EventEmitter<string>();
  @Output() addTask = new EventEmitter<{ goalId: string; title: string }>();
  @Output() updateTask = new EventEmitter<{ goalId: string; taskId: string; status: TaskStatus }>();
  @Output() deleteTask = new EventEmitter<{ goalId: string; taskId: string }>();

  @ViewChild('taskInput') taskInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('titleInput') titleInputRef?: ElementRef<HTMLInputElement>;

  newTaskTitle = '';
  showInput = false;

  editingTitle = false;
  editTitleValue = '';

  get doneTasks(): number {
    return this.goal.tasks.filter(t => t.status === 'done').length;
  }

  get failedTasks(): number {
    return this.goal.tasks.filter(t => t.status === 'failed').length;
  }

  get progress(): number {
    if (!this.goal.tasks.length) return 0;
    return Math.round((this.doneTasks / this.goal.tasks.length) * 100);
  }

  startEditTitle(): void {
    this.editTitleValue = this.goal.title;
    this.editingTitle = true;
    setTimeout(() => this.titleInputRef?.nativeElement.select(), 0);
  }

  saveTitle(): void {
    if (!this.editingTitle) return;
    const title = this.editTitleValue.trim();
    if (title && title !== this.goal.title) {
      this.renameGoal.emit(title);
    }
    this.editingTitle = false;
  }

  cancelEditTitle(): void {
    this.editingTitle = false;
  }

  toggleAddTask(): void {
    this.showInput = !this.showInput;
    if (this.showInput) {
      setTimeout(() => this.taskInputRef?.nativeElement.focus(), 0);
    } else {
      this.newTaskTitle = '';
    }
  }

  cancelAddTask(): void {
    this.showInput = false;
    this.newTaskTitle = '';
  }

  submitTask(): void {
    const title = this.newTaskTitle.trim();
    if (!title) return;
    this.addTask.emit({ goalId: this.goal.id, title });
    this.newTaskTitle = '';
    setTimeout(() => this.taskInputRef?.nativeElement.focus(), 0);
  }

  setTaskStatus(task: Task, status: TaskStatus): void {
    this.updateTask.emit({ goalId: this.goal.id, taskId: task.id, status });
  }
}
