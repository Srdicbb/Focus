import { Injectable, signal, computed } from '@angular/core';
import { format } from 'date-fns';
import { AppDatabase } from '../db/app-db.service';
import { Goal, MonthData, Task, TaskStatus, getMonthProgress, groupGoalsByMonth } from '../../shared/models/goal.model';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private _allMonthsData = signal<Record<string, MonthData>>({});
  readonly allMonthsData = this._allMonthsData.asReadonly();

  readonly isLoading = signal<boolean>(true);

  readonly currentMonthKey = format(new Date(), 'yyyy-MM');

  readonly allMonthKeys = computed(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `${year}-${month}`;
    });
  });

  constructor(private db: AppDatabase) {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadFromDB();
    this.isLoading.set(false);
  }

  private async loadFromDB(): Promise<void> {
    const goals = await this.db.goals.toArray();
    this._allMonthsData.set(groupGoalsByMonth(goals));
  }

  getMonthData(monthKey: string): MonthData | null {
    return this._allMonthsData()[monthKey] ?? null;
  }

  getMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-').map(Number);
    return format(new Date(year, month - 1, 1), 'MMMM yyyy');
  }

  isCurrentMonth(monthKey: string): boolean {
    return monthKey === this.currentMonthKey;
  }

  isPastMonth(monthKey: string): boolean {
    return monthKey < this.currentMonthKey;
  }

  getMonthProgress(monthKey: string) {
    return getMonthProgress(this.getMonthData(monthKey));
  }

  async addGoal(monthKey: string, title: string): Promise<void> {
    const newGoal: Goal = {
      id: generateId(),
      title,
      tasks: [],
      createdAt: new Date(),
      monthKey,
    };
    const current = this._allMonthsData();
    const monthData = current[monthKey] ?? { goals: [], monthKey };
    this._allMonthsData.set({
      ...current,
      [monthKey]: { ...monthData, goals: [...monthData.goals, newGoal] },
    });
    await this.db.goals.put(newGoal);
  }

  async removeGoal(monthKey: string, goalId: string): Promise<void> {
    const current = this._allMonthsData();
    const monthData = current[monthKey];
    if (!monthData) return;
    this._allMonthsData.set({
      ...current,
      [monthKey]: { ...monthData, goals: monthData.goals.filter(g => g.id !== goalId) },
    });
    await this.db.goals.delete(goalId);
  }

  async addTask(monthKey: string, goalId: string, title: string): Promise<void> {
    const newTask: Task = { id: generateId(), title, status: 'pending' };
    await this.applyToGoal(monthKey, goalId, g => ({ ...g, tasks: [...g.tasks, newTask] }));
  }

  async updateTaskStatus(monthKey: string, goalId: string, taskId: string, status: TaskStatus): Promise<void> {
    await this.applyToGoal(monthKey, goalId, g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === taskId ? { ...t, status } : t),
    }));
  }

  async renameGoal(monthKey: string, goalId: string, title: string): Promise<void> {
    await this.applyToGoal(monthKey, goalId, g => ({ ...g, title }));
  }

  async removeTask(monthKey: string, goalId: string, taskId: string): Promise<void> {
    await this.applyToGoal(monthKey, goalId, g => ({
      ...g,
      tasks: g.tasks.filter(t => t.id !== taskId),
    }));
  }

  private async applyToGoal(monthKey: string, goalId: string, transform: (g: Goal) => Goal): Promise<void> {
    const current = this._allMonthsData();
    const monthData = current[monthKey];
    if (!monthData) return;

    const updatedGoals = monthData.goals.map(g => g.id === goalId ? transform(g) : g);
    this._allMonthsData.set({
      ...current,
      [monthKey]: { ...monthData, goals: updatedGoals },
    });

    const updatedGoal = updatedGoals.find(g => g.id === goalId);
    if (updatedGoal) {
      await this.db.goals.put(updatedGoal);
    }
  }
}
