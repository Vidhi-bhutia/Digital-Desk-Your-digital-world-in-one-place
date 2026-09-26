import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Task, TasksResponse } from '../../types/task';
import { CheckSquare, Square, Plus, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskModal } from '../ui/TaskModal';

export const MyTasksWidget: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tasks
  const { data, isLoading, isError } = useQuery({
    queryKey: ['home-tasks'],
    queryFn: async () => {
      const res = await api.get<TasksResponse>('/tasks', {
        params: { filter: 'all', sort: 'dueDate', order: 'asc' },
      });
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  // Toggle complete mutation
  const toggleMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await api.patch(`/tasks/${taskId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['attention-items'] });
      queryClient.invalidateQueries({ queryKey: ['attention-center'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
    },
  });

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await api.post('/tasks', taskData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['attention-items'] });
      queryClient.invalidateQueries({ queryKey: ['attention-center'] });
      queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
    },
  });

  const tasks = data?.tasks || [];
  const counts = data?.counts || { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 };

  // Top 4 tasks for Home widget: prioritize overdue, then today, then incomplete, then completed
  const displayTasks = [...tasks]
    .sort((a, b) => {
      // Uncompleted tasks first
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return 0;
    })
    .slice(0, 4);

  return (
    <div className="desk-surface p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              MY TASKS
            </h3>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Today: <strong className="text-slate-700 dark:text-slate-200 font-bold">{counts.today}</strong> tasks</span>
              <span>•</span>
              <span className={counts.overdue > 0 ? 'text-rose-500 font-bold' : ''}>
                Overdue: <strong>{counts.overdue}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
            title="Add Task"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1 pl-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="py-8 flex items-center justify-center space-x-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span className="text-xs">Loading tasks...</span>
        </div>
      ) : isError ? (
        <div className="py-6 text-center text-xs text-rose-400">Failed to load tasks.</div>
      ) : displayTasks.length > 0 ? (
        <div className="space-y-1.5">
          {displayTasks.map((task: Task) => {
            const isCompleted = task.status === 'Completed';
            const isOverdue =
              !isCompleted &&
              task.dueDate &&
              new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <div
                key={task._id}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/50 dark:border-slate-800 transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <button
                    onClick={() => toggleMutation.mutate(task._id)}
                    disabled={toggleMutation.isPending}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                  {isOverdue && (
                    <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Overdue</span>
                    </span>
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === 'High'
                        ? 'bg-rose-500/10 text-rose-500'
                        : task.priority === 'Medium'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No tasks yet</p>
          <p className="text-xs text-slate-400">Add something you want to get done.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add your first task</span>
          </button>
        </div>
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (taskData) => {
          await createMutation.mutateAsync(taskData);
        }}
      />
    </div>
  );
};
