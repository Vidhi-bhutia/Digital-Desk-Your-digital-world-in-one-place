import React, { useState, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MusicPlayerBar from '../../components/layout/MusicPlayerBar';
import SearchModal from '../../components/dashboard/SearchModal';
import { apiClient } from '../../services/apiClient';
import { useToast } from '../../context/ToastContext';
import { 
  Github, 
  Mail, 
  Calendar, 
  CloudSun, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink
} from 'lucide-react';

export const IntegrationsPage = () => {
  const toast = useToast();
  const [integrations, setIntegrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);


  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await apiClient('/integrations/status');
      if (res && res.integrations) {
        setIntegrations(res.integrations);
        return res.integrations;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = await fetchStatus();
      const connected = params.get('connected');
      if (connected === 'github' && status?.github?.connected) toast.success(`GitHub authorized as @${status.github.username}.`);
      else if (connected === 'google' && (status?.google?.gmail || status?.google?.calendar)) toast.success(`Google services validated: ${[status.google.gmail && 'Gmail', status.google.calendar && 'Calendar'].filter(Boolean).join(', ')}.`);
      else if (connected) toast.error(`${connected} authorization completed, but provider access could not be validated.`);
      if (params.has('error')) toast.error(`Connection failed: ${params.get('error').replaceAll('_', ' ')}.`);
      if (params.has('connected') || params.has('error')) window.history.replaceState({}, '', window.location.pathname);
    };
    finish();
  }, []);
  const startGitHubOAuth = () => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/github`; };

  return (
    <AppShell pageTitle="Integrations & API Connections" onOpenSearch={() => setIsSearchOpen(true)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', paddingBottom: '80px' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)', marginBottom: '6px' }}>
              Connected Digital Services
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '600px' }}>
              Manage live authorization tokens, OAuth credentials, and sync settings for GitHub, Gmail, Google Calendar, and OpenWeather.
            </p>
          </div>

          <Button variant="outline" icon={RefreshCw} onClick={fetchStatus} isLoading={loading}>
            Sync All Services
          </Button>
        </div>

        {/* Integration Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* GitHub Integration Card */}
          <Card
            title="GitHub Repositories & Events"
            action={<Badge variant={integrations?.github?.connected ? 'success' : 'warning'}>{integrations?.github?.connected ? 'Connected' : 'Not connected'}</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Github size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {integrations?.github?.username ? `@${integrations.github.username}` : 'No GitHub account connected'}
                </div>
                {integrations?.github?.error && <div style={{fontSize:12,color:'var(--color-danger)',marginTop:4}}>{integrations.github.error}</div>}
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Validates your GitHub account and loads accessible repositories and recent GitHub events.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="primary" size="sm" icon={RefreshCw} onClick={startGitHubOAuth}>
                {integrations?.github?.connected ? 'Reconnect GitHub' : 'Connect with GitHub'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={() => integrations?.github?.username && window.open(`https://github.com/${integrations.github.username}`, '_blank')}
              >
                View Profile
              </Button>
            </div>
          </Card>

          {/* Google Services Integration Card */}
          <Card
            title="Google Workspace (Gmail & Calendar)"
            action={<Badge variant={integrations?.google?.connected ? 'success' : 'warning'}>{integrations?.google?.connected ? 'Connected' : 'Not connected'}</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#EFF6FF',
                  color: '#3B82F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mail size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {integrations?.google?.email || 'No Google account connected'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Unified inbox unread counter, Google Meet link launcher, and Google Calendar event sync.
                </div>
                <div style={{fontSize:12,marginTop:6}}>Gmail: {integrations?.google?.gmail ? 'Available' : 'Unavailable'} · Calendar: {integrations?.google?.calendar ? 'Available' : 'Unavailable'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="primary" size="sm" icon={RefreshCw} onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google/connect`; }}>
                Configure Google
              </Button>
              <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => window.open('https://calendar.google.com', '_blank')}>
                Open Calendar
              </Button>
            </div>
          </Card>

          {/* OpenWeather Card */}
          <Card
            title="OpenWeather API"
            action={<Badge variant={integrations?.openweather?.configured ? 'success' : 'warning'}>{integrations?.openweather?.configured ? 'Configured' : 'Not configured'}</Badge>}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CloudSun size={26} />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
                  {integrations?.openweather?.configured ? 'Device or selected location' : 'OPENWEATHER_API_KEY required'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Powers real-time weather forecasts, humidity, wind speeds, and environmental air quality alerts.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <Button variant="outline" size="sm" icon={CheckCircle2}>
                {integrations?.openweather?.configured ? 'API configured' : 'Not configured'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Music Player Bar */}
      <MusicPlayerBar />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </AppShell>
  );
};

export default IntegrationsPage;
