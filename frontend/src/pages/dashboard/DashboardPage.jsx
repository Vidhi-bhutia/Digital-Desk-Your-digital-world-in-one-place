import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import HeroHeader from '../../components/dashboard/HeroHeader';
import QuickSummaryCards from '../../components/dashboard/QuickSummaryCards';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import UpNextWidget from '../../components/dashboard/UpNextWidget';
import MyTasksWidget from '../../components/dashboard/MyTasksWidget';
import WeatherWidget from '../../components/dashboard/WeatherWidget';
import MiniCalendarWidget from '../../components/dashboard/MiniCalendarWidget';
import QuickLinksWidget from '../../components/dashboard/QuickLinksWidget';
import AddTaskModal from '../../components/dashboard/AddTaskModal';
import SearchModal from '../../components/dashboard/SearchModal';
import MusicPlayerBar from '../../components/layout/MusicPlayerBar';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTaskTab, setActiveTaskTab] = useState('today');
  const [tasks, setTasks] = useState([]);
  const [taskCounts, setTaskCounts] = useState({ today: 3, upcoming: 2, overdue: 2, completed: 4 });
  const [activities, setActivities] = useState([]);
  const [upNextEvents, setUpNextEvents] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async (filter = activeTaskTab) => {
    try {
      const res = await apiClient(`/tasks?filter=${filter}`);
      if (res && res.success) {
        setTasks(res.tasks || []);
        if (res.counts) setTaskCounts(res.counts);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  }, [activeTaskTab]);

  // Fetch initial dashboard data
  useEffect(() => {
    fetchTasks(activeTaskTab);

    // Fetch Activity Feed
    apiClient('/activity')
      .then(res => { if (res && res.activities) setActivities(res.activities); })
      .catch(() => {});

    // Fetch Up Next / Calendar events
    apiClient('/calendar/events')
      .then(res => { if (res && res.events) setUpNextEvents(res.events); })
      .catch(() => {});

    // Fetch Weather Data
    apiClient('/weather')
      .then(res => { if (res && res.success) setWeatherData(res); })
      .catch(() => {});
  }, [fetchTasks, activeTaskTab]);

  const handleTabChange = (tabId) => {
    setActiveTaskTab(tabId);
    fetchTasks(tabId);
  };

  const handleToggleTask = async (task) => {
    try {
      const newCompleted = !task.completed;
      setTasks(prev => prev.map(t => (t._id === task._id || t.id === task.id ? { ...t, completed: newCompleted } : t)));
      await apiClient(`/tasks/${task._id || task.id}`, {
        method: 'PUT',
        body: { completed: newCompleted },
      });
      fetchTasks(activeTaskTab);
      toast.success(newCompleted ? `Completed task: ${task.title}` : `Reopened task: ${task.title}`);
    } catch (err) {
      fetchTasks(activeTaskTab);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      await apiClient('/tasks', {
        method: 'POST',
        body: taskData,
      });
      fetchTasks(activeTaskTab);
      toast.success('New task created!');
    } catch (err) {
      toast.error('Failed to create task.');
    }
  };

  return (
    <AppShell pageTitle="Home Dashboard" onOpenSearch={() => setIsSearchOpen(true)}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          paddingBottom: '80px', // Extra padding for bottom music player bar
        }}
      >
        {/* Top Hero Landscape Header */}
        <HeroHeader />

        {/* 4 Summary Cards Row */}
        <QuickSummaryCards
          meetingsCount={3}
          emailsCount={12}
          githubCount={8}
          tasksCount={taskCounts.today || 5}
          onNavigate={(path) => navigate(path)}
        />

        {/* Main Dashboard 2-Column Grid */}
        <div
          className="dashboard-main-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Left Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Timeline Widgets 2-Col subgrid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              <ActivityTimeline
                activities={activities}
                onNavigate={(path) => navigate(path)}
              />
              <UpNextWidget
                events={upNextEvents}
                onNavigate={(path) => navigate(path)}
              />
            </div>

            {/* My Tasks Section */}
            <MyTasksWidget
              tasks={tasks}
              counts={taskCounts}
              activeTab={activeTaskTab}
              onTabChange={handleTabChange}
              onToggleTask={handleToggleTask}
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onNavigate={(path) => navigate(path)}
            />
          </div>

          {/* Right Column (Widgets Sidebar) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WeatherWidget weatherData={weatherData} />
            <MiniCalendarWidget />
            <QuickLinksWidget onNavigate={(path) => navigate(path)} />
          </div>
        </div>
      </div>

      {/* Global Fixed Bottom Music Player Bar */}
      <MusicPlayerBar />

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </AppShell>
  );
};

export default DashboardPage;
