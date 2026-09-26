export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
export type TaskSort = 'dueDate' | 'priority' | 'createdAt';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskCounts {
  all: number;
  today: number;
  upcoming: number;
  overdue: number;
  completed: number;
}

export interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
    counts: TaskCounts;
  };
}
