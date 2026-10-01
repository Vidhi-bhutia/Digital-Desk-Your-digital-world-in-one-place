import React from 'react';
import AppShell from '../../components/layout/AppShell';
import EmptyState from '../../components/common/EmptyState';
import { 
  Search, 
  CheckSquare, 
  Calendar, 
  Activity, 
  Grid, 
  Settings, 
  User 
} from 'lucide-react';

const createPlaceholderPage = (title, description, icon) => {
  return function PlaceholderComponent() {
    return (
      <AppShell pageTitle={title}>
        <EmptyState
          icon={icon}
          title={`${title} Module`}
          description={`${description} This feature will be implemented in future phases.`}
        />
      </AppShell>
    );
  };
};

export const SearchPage = createPlaceholderPage(
  'Search',
  'Unified Digital Desk and Web Search.',
  Search
);

export const TasksPage = createPlaceholderPage(
  'Tasks',
  'Personal task management and priority lists.',
  CheckSquare
);

export const CalendarPage = createPlaceholderPage(
  'Calendar',
  'Google Calendar integration and scheduling.',
  Calendar
);

export const ActivityPage = createPlaceholderPage(
  'Activity',
  'Unified activity feed across Gmail, GitHub, and calendar.',
  Activity
);

export const IntegrationsPage = createPlaceholderPage(
  'Integrations',
  'Manage connections to Gmail, GitHub, OpenWeather, and external APIs.',
  Grid
);

export const SettingsPage = createPlaceholderPage(
  'Settings',
  'Application preferences, theme configuration, and security settings.',
  Settings
);

export const ProfilePage = createPlaceholderPage(
  'Profile',
  'User account details, avatar customization, and password updates.',
  User
);
