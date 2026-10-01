import React, { useState } from 'react';
import { Plus, ArrowRight, Check, MoreHorizontal } from 'lucide-react';
import Badge from '../common/Badge';

export const MyTasksWidget = ({
  tasks = [],
  counts = {},
  activeTab = 'today',
  onTabChange,
  onToggleTask,
  onOpenAddTask,
  onNavigate,
}) => {
  const tabs = [
    { id: 'today', label: 'Today', count: counts.today || 3 },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming || 2 },
    { id: 'overdue', label: 'Overdue', count: counts.overdue || 2 },
    { id: 'completed', label: 'Completed', count: counts.completed || 4 },
  ];

  const getPriorityVariant = (priority) => {
    if (priority === 'High') return 'danger';
    if (priority === 'Medium') return 'warning';
    return 'success';
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
          My Tasks
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenAddTask}
            style={{
              backgroundColor: 'var(--color-brand)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> Add task
          </button>

          <button
            onClick={() => onNavigate && onNavigate('/tasks')}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-brand)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            View all <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                border: isActive ? '1px solid var(--color-brand-light)' : '1px solid var(--color-border)',
                backgroundColor: isActive ? 'var(--color-brand-subtle)' : 'var(--color-bg)',
                color: isActive ? 'var(--color-brand)' : 'var(--color-text-muted)',
                cursor: 'pointer',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: isActive ? 'var(--color-brand)' : 'var(--color-border)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-muted)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tasks.map((task) => (
          <div
            key={task._id || task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: task.completed ? 'var(--color-bg)' : 'var(--color-surface)',
              border: '1px solid var(--color-border-subtle)',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
              {/* Interactive Checkbox */}
              <button
                onClick={() => onToggleTask && onToggleTask(task)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: task.completed ? 'none' : '2px solid var(--color-border)',
                  backgroundColor: task.completed ? 'var(--color-brand)' : 'transparent',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {task.completed && <Check size={14} strokeWidth={3} />}
              </button>

              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '12px', color: task.priority === 'High' ? 'var(--color-danger)' : 'var(--color-text-muted)', fontWeight: 500 }}>
                {task.dueText}
              </span>

              <Badge variant={getPriorityVariant(task.priority)} size="sm">
                {task.priority}
              </Badge>

              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-subtle)',
                  padding: '2px',
                }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasksWidget;
