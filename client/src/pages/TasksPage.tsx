import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Task, TaskFilter, TaskSort, TaskSortOrder, TasksResponse } from '../types/task';
import {
  CheckSquare,
  Square,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Filter,
  ArrowUpDown,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { TaskModal } from '../components/ui/TaskModal';

export const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [activeSort, setActiveSort] = useState<TaskSort>('dueDate');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Query Tasks
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', activeFilter, activeSort, sortOrder, searchQuery],
    queryFn: async () => {
      const res = await api.get<TasksResponse>('/tasks', {
        params: {
          filter: activeFilter,
          sort: activeSort,
          order: sortOrder,
          search: searchQuery,
        },
      });
      return res.data.data;
    },
    refetchInterval: 10000,
  });

  const tasks = data?.tasks || [];
  const counts = data?.counts || { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await api.post('/tasks', taskData);
      return res.data;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/tasks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/tasks/${id}`);
      return res.data;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/tasks/${id}/complete`);
      return res.data;
    },
    onSuccess: () => {
      invalidateAll();
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['home-tasks'] });
    queryClient.invalidateQueries({ queryKey: ['attention-items'] });
    queryClient.invalidateQueries({ queryKey: ['attention-center'] });
    queryClient.invalidateQueries({ queryKey: ['today-timeline'] });
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Filter tabs definition
  const filterTabs: Array<{ id: TaskFilter; label: string; count: number; badgeColor?: string }> = [
    { id: 'all', label: 'All Tasks', count: counts.all },
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    {
      id: 'overdue',
      label: 'Overdue',
      count: counts.overdue,
      badgeColor: counts.overdue > 0 ? 'bg-rose-500 text-white' : undefined,
    },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                To-Do System
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your tasks, track priorities, and accomplish your goals.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateClick}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-soft-md hover:shadow-indigo-500/25 flex items-center justify-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 2. Controls Bar: Filter Tabs, Search & Sort */}
      <div className="desk-surface p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 border-b border-slate-200/60 dark:border-slate-800/60 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  tab.badgeColor
                    ? tab.badgeColor
                    : activeFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Toolbar: Search Input + Sorting Options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span className="font-semibold text-[11px] uppercase">Sort by:</span>
            </div>
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as TaskSort)}
              className="px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title={`Order: ${sortOrder.toUpperCase()}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Task List Container */}
      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-xs font-medium text-slate-400">Loading tasks...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center text-xs text-rose-500">
            An error occurred while loading tasks.
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          activeFilter === 'overdue' ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  You're all caught up.
                </h3>
                <p className="text-xs text-slate-400 mt-1">No overdue tasks found!</p>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  No tasks yet
                </h3>
                <p className="text-xs text-slate-400 mt-1">Add something you want to get done.</p>
              </div>
              <button
                onClick={handleCreateClick}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-soft-sm flex items-center space-x-2 mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>
          )
        ) : (
          /* Task Items List */
          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const isOverdue =
                !isCompleted &&
                task.dueDate &&
                new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

              const formattedDueDate = task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : null;

              return (
                <div
                  key={task._id}
                  className={`group p-4 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'border-rose-500/40 bg-rose-500/5'
                      : isCompleted
                      ? 'border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 opacity-75'
                      : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#182035] hover:border-indigo-500/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                      <button
                        onClick={() => toggleMutation.mutate(task._id)}
                        disabled={toggleMutation.isPending}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4
                            className={`text-sm font-bold truncate ${
                              isCompleted
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                              task.priority === 'High'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : task.status === 'In Progress'
                                ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {task.status}
                          </span>

                          {/* Overdue Badge */}
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-extrabold flex items-center space-x-1 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Meta: Due Date & Due Time */}
                        <div className="flex items-center space-x-4 text-[11px] text-slate-400 pt-1">
                          {formattedDueDate && (
                            <span
                              className={`flex items-center space-x-1.5 ${
                                isOverdue ? 'text-rose-500 font-bold' : ''
                              }`}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formattedDueDate}</span>
                            </span>
                          )}

                          {task.dueTime && (
                            <span className="flex items-center space-x-1.5">
                              <Clock className="w-3.5 h-3.5 text-indigo-400" />
                              <span>{task.dueTime}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete task "${task.title}"?`)) {
                            deleteMutation.mutate(task._id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        initialTask={editingTask}
        onSave={async (taskData) => {
          if (editingTask) {
            await updateMutation.mutateAsync({ id: editingTask._id, data: taskData });
          } else {
            await createMutation.mutateAsync(taskData);
          }
        }}
      />
    </div>
  );
};
