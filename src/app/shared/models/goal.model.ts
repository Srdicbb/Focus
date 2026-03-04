export type TaskStatus = 'pending' | 'done' | 'failed';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: Date;
  monthKey: string;
}

export interface MonthData {
  goals: Goal[];
  monthKey: string;
}

export interface MonthProgress {
  totalTasks: number;
  doneTasks: number;
  failedTasks: number;
  overallProgress: number;
}

export function getMonthProgress(monthData: MonthData | null): MonthProgress {
  if (!monthData || !monthData.goals.length) {
    return { totalTasks: 0, doneTasks: 0, failedTasks: 0, overallProgress: 0 };
  }
  const allTasks = monthData.goals.flatMap(g => g.tasks);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter(t => t.status === 'done').length;
  const failedTasks = allTasks.filter(t => t.status === 'failed').length;
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  return { totalTasks, doneTasks, failedTasks, overallProgress };
}

export function groupGoalsByMonth(goals: Goal[]): Record<string, MonthData> {
  const result: Record<string, MonthData> = {};
  for (const goal of goals) {
    if (!result[goal.monthKey]) {
      result[goal.monthKey] = { goals: [], monthKey: goal.monthKey };
    }
    result[goal.monthKey].goals.push(goal);
  }
  return result;
}
