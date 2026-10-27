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
  const [taskCounts, setTaskCounts] = useState({ today: 0, upcoming: 0, overdue: 0, completed: 0 });
  const [activities, setActivities] = useState([]);
  const [upNextEvents, setUpNextEvents] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherError, setWeatherError] = useState('');
  const [githubCount, setGithubCount] = useState(null);
  const [unreadCount, setUnreadCount] = useState(null);
  const [providerErrors, setProviderErrors] = useState({});
  const [githubActivities, setGithubActivities] = useState([]);
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate()+1);
  const todaysMeetings = upNextEvents.filter(e => e.type === 'meeting' && new Date(e.date) >= todayStart && new Date(e.date) < tomorrowStart).length;
  const upcomingEvents = upNextEvents.filter(e => e.date && new Date(e.date) >= new Date()).slice(0,5);
  const todaysActivities = [...githubActivities, ...activities].filter(a => a.timestamp && new Date(a.timestamp) >= todayStart && new Date(a.timestamp) < tomorrowStart).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,6);

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

  useEffect(() => {
    fetchTasks(activeTaskTab);
  }, [fetchTasks, activeTaskTab]);

  useEffect(() => {
    apiClient('/activity').then(res => { if (res?.activities) setActivities(res.activities); }).catch(e => setProviderErrors(x => ({...x, activity: e.message})));
    apiClient('/github/summary').then(res => { setGithubCount(res.summary?.activityRecent ?? 0); setGithubActivities(res.activities || []); }).catch(e => { setGithubCount(null); setProviderErrors(x => ({...x, github: e.message})); });
    apiClient('/gmail/summary').then(res => setUnreadCount(res.summary?.unreadEmails ?? null)).catch(e => { setUnreadCount(null); setProviderErrors(x => ({...x, gmail: e.message})); });

    // Fetch Up Next / Calendar events
    apiClient('/calendar/events')
      .then(res => { if (res && res.events) setUpNextEvents(res.events); })
      .catch(e => setProviderErrors(x => ({...x, calendar: e.message})));

    // Fetch Weather Data
    const locationPermissionAsked = sessionStorage.getItem('digitaldesk-location-requested');
    if (!locationPermissionAsked && navigator.geolocation) {
      sessionStorage.setItem('digitaldesk-location-requested', 'true');
      navigator.geolocation.getCurrentPosition(({ coords }) => apiClient(`/weather?lat=${coords.latitude}&lon=${coords.longitude}`).then(res => setWeatherData(res)).catch(e => setWeatherError(e.message)), e => setWeatherError(e.message || 'Location permission denied.'), { timeout: 8000, maximumAge: 600000 });
    }
  }, []);

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
          meetingsCount={todaysMeetings}
          emailsCount={unreadCount}
          githubCount={githubCount}
          tasksCount={taskCounts.today}
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
                activities={todaysActivities}
                onNavigate={(path) => navigate(path)}
              />
              <UpNextWidget
                events={upcomingEvents}
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
            <WeatherWidget weatherData={weatherData} onLocate={() => {
              if (!navigator.geolocation) { setWeatherError('Geolocation is unavailable in this browser.'); return; }
              navigator.geolocation.getCurrentPosition(({ coords }) => apiClient(`/weather?lat=${coords.latitude}&lon=${coords.longitude}`).then(setWeatherData).catch(e => setWeatherError(e.message)), e => setWeatherError(e.message || 'Location permission denied.'), { timeout: 8000, maximumAge: 600000 });
            }} />
            {weatherError && <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{weatherError}</div>}
            <MiniCalendarWidget events={upNextEvents} />
            <QuickLinksWidget onNavigate={(path) => navigate(path)} />
          </div>
        </div>
        {Object.entries(providerErrors).length > 0 && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{Object.entries(providerErrors).map(([source, error]) => <div key={source}>{source}: {error}</div>)}</div>}
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
